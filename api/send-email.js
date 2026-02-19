import { getSmtpTransporter } from '../lib/connection-manager.js';
import { authenticate, getUser } from '../lib/env-config.js';
import { checkRateLimit, releaseRequest, validateEmailRequest } from '../lib/rate-limiter.js';

export default async function handler(req, res) {
  // Set performance headers
  res.setHeader('Cache-Control', 'no-cache, no-store, must-revalidate');
  res.setHeader('X-Content-Type-Options', 'nosniff');
  res.setHeader('X-Frame-Options', 'DENY');
  
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  let startTime = Date.now();
  let userId = 'unknown';
  
  try {
    if (!authenticate(req)) {
      return res.status(401).json({ error: 'Invalid API key' });
    }

    // Validate request body
    const validation = validateEmailRequest(req.body);
    if (!validation.valid) {
      return res.status(400).json({ error: validation.error });
    }

    const { to, subject, html, attachments } = req.body;

    const user = getUser();
    userId = user.id;

    // Rate limiting check
    const rateCheck = checkRateLimit(userId, user.plan_type);
    if (!rateCheck.allowed) {
      return res.status(429).json({ 
        error: rateCheck.error,
        retryAfter: rateCheck.retryAfter
      });
    }

    // Get SMTP transporter from pool
    const transporter = getSmtpTransporter({
      smtp_host: user.smtp_host,
      smtp_port: user.smtp_port,
      smtp_secure: user.smtp_secure,
      smtp_user: user.smtp_user,
      smtp_pass: user.smtp_pass
    });

    // Prepare email options
    const mailOptions = {
      from: `"${user.from_name}" <${user.smtp_user}>`,
      to,
      subject,
      html,
      messageId: `${Date.now()}.${userId}@api-drift-spike.vercel.app`
    };

    // Process attachments efficiently
    if (attachments?.length > 0) {
      mailOptions.attachments = attachments.map(({ filename, content, contentType, encoding = 'base64' }) => ({
        filename,
        content,
        encoding,
        contentType
      }));
    }

    // Send email with timeout
    const emailPromise = transporter.sendMail(mailOptions);
    const timeoutPromise = new Promise((_, reject) => 
      setTimeout(() => reject(new Error('Email timeout')), 30000)
    );
    
    await Promise.race([emailPromise, timeoutPromise]);

    // Release rate limit
    releaseRequest(userId);

    const responseTime = Date.now() - startTime;
    
    return res.status(200).json({
      success: true,
      message: 'Email sent successfully',
      user: {
        id: user.id,
        email: user.email,
        plan: user.plan_type
      },
      performance: {
        responseTime: `${responseTime}ms`
      }
    });

  } catch (error) {
    console.error('[send-email] Error:', error.message, error.stack);
    releaseRequest(userId);
    
    // Enhanced error handling
    const errorResponse = {
      error: 'Email sending failed',
      details: error.message,
      performance: {
        responseTime: `${Date.now() - startTime}ms`
      }
    };

    // Different status codes for different errors
    if (error.message.includes('timeout')) {
      return res.status(408).json(errorResponse);
    } else if (error.message.includes('authentication')) {
      return res.status(401).json(errorResponse);
    } else if (error.message.includes('quota')) {
      return res.status(429).json(errorResponse);
    }
    
    return res.status(500).json(errorResponse);
  }
}