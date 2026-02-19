import { config } from 'dotenv';
import { existsSync } from 'fs';

// Load .env.local first (for local development), then .env as fallback
// On Vercel, these files won't exist - env vars come from Vercel dashboard
try {
  if (existsSync('.env.local')) {
    config({ path: '.env.local' });
  } else if (existsSync('.env')) {
    config();
  }
} catch (err) {
  // Silently fail - on Vercel, env vars come from dashboard
  console.warn('Note: .env file loading skipped (expected on serverless platforms)');
}

// Load SMTP/IMAP credentials from environment variables
function getEnvConfig() {
  const config = {
    // API auth
    api_key: process.env.API_KEY,
    admin_key: process.env.ADMIN_KEY,

    // User identity
    user_email: process.env.USER_EMAIL || process.env.SMTP_USER,
    plan_type: process.env.PLAN_TYPE || 'production',

    // SMTP config
    smtp_host: process.env.SMTP_HOST,
    smtp_port: parseInt(process.env.SMTP_PORT || '587', 10),
    smtp_secure: process.env.SMTP_SECURE === 'true',
    smtp_user: process.env.SMTP_USER,
    smtp_pass: process.env.SMTP_PASS,
    from_name: process.env.FROM_NAME || 'DriftSpike',

    // IMAP config
    imap_host: process.env.IMAP_HOST,
    imap_port: parseInt(process.env.IMAP_PORT || '993', 10),
    imap_secure: process.env.IMAP_SECURE !== 'false',
    imap_user: process.env.IMAP_USER,
    imap_pass: process.env.IMAP_PASS,
  };

  return config;
}

// Validate required env vars
export function validateConfig(requiredFields = []) {
  const config = getEnvConfig();
  const missing = requiredFields.filter(f => !config[f]);
  if (missing.length > 0) {
    throw new Error(`Missing required env vars: ${missing.join(', ')}`);
  }
  return config;
}

// Get user object (mimics the old DB-based user shape)
export function getUser() {
  const config = getEnvConfig();
  return {
    id: 'env-user',
    email: config.user_email,
    plan_type: config.plan_type,
    emails_sent_this_month: 0,
    total_emails_sent: 0,
    smtp_host: config.smtp_host,
    smtp_port: config.smtp_port,
    smtp_secure: config.smtp_secure,
    smtp_user: config.smtp_user,
    smtp_pass: config.smtp_pass,
    from_name: config.from_name,
    imap_host: config.imap_host,
    imap_port: config.imap_port,
    imap_secure: config.imap_secure,
    imap_user: config.imap_user,
    imap_pass: config.imap_pass,
  };
}

// Authenticate request via API_KEY header
export function authenticate(req) {
  const apiKey = req.headers['x-api-key'];
  const expectedKey = process.env.API_KEY;
  if (!expectedKey) {
    throw new Error('API_KEY not set in environment');
  }
  if (!apiKey || apiKey !== expectedKey) {
    return false;
  }
  return true;
}

export default getEnvConfig;
