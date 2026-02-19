import { authenticate, getUser } from '../lib/env-config.js';

export default async function handler(req, res) {
  res.setHeader('Cache-Control', 'public, max-age=300');
  res.setHeader('X-Content-Type-Options', 'nosniff');
  
  if (req.method !== 'GET') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const startTime = Date.now();

  try {
    if (!authenticate(req)) {
      return res.status(401).json({ error: 'Invalid API key' });
    }

    const user = getUser();

    const response = {
      user: {
        id: user.id,
        email: user.email,
        plan_type: user.plan_type,
        emails_sent_this_month: user.emails_sent_this_month,
      },
      smtp_config: {
        smtp_host: user.smtp_host,
        smtp_port: user.smtp_port,
        smtp_secure: user.smtp_secure,
        smtp_user: user.smtp_user,
        from_name: user.from_name
      },
      imap_config: {
        imap_host: user.imap_host,
        imap_port: user.imap_port,
        imap_secure: user.imap_secure,
        imap_user: user.imap_user,
      },
      limits: {
        monthly_emails: 'unlimited',
        requests_per_minute: 30,
        requests_per_hour: 1800
      }
    };

    return res.status(200).json({
      ...response,
      performance: {
        responseTime: `${Date.now() - startTime}ms`
      }
    });

  } catch (error) {
    return res.status(500).json({
      error: 'Internal server error',
      details: error.message,
      performance: {
        responseTime: `${Date.now() - startTime}ms`
      }
    });
  }
}