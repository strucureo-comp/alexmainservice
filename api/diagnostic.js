export default async function handler(req, res) {
  try {
    // Check environment variables
    const envVars = {
      API_KEY: process.env.API_KEY ? '✓ SET' : '✗ MISSING',
      SMTP_HOST: process.env.SMTP_HOST || 'NOT SET',
      SMTP_PORT: process.env.SMTP_PORT || 'NOT SET',
      SMTP_USER: process.env.SMTP_USER ? '✓ SET' : '✗ MISSING',
      SMTP_PASS: process.env.SMTP_PASS ? '✓ SET' : '✗ MISSING',
      IMAP_HOST: process.env.IMAP_HOST || 'NOT SET',
      IMAP_PORT: process.env.IMAP_PORT || 'NOT SET',
      IMAP_USER: process.env.IMAP_USER ? '✓ SET' : '✗ MISSING',
      IMAP_PASS: process.env.IMAP_PASS ? '✓ SET' : '✗ MISSING',
    };

    // Try importing modules
    let moduleStatus = {};
    try {
      await import('nodemailer');
      moduleStatus.nodemailer = '✓ Loaded';
    } catch (e) {
      moduleStatus.nodemailer = `✗ Error: ${e.message}`;
    }

    try {
      await import('dotenv');
      moduleStatus.dotenv = '✓ Loaded';
    } catch (e) {
      moduleStatus.dotenv = `✗ Error: ${e.message}`;
    }

    try {
      await import('imap');
      moduleStatus.imap = '✓ Loaded';
    } catch (e) {
      moduleStatus.imap = `✗ Error: ${e.message}`;
    }

    return res.status(200).json({
      success: true,
      environment: 'Vercel Diagnostic',
      environmentVariables: envVars,
      modules: moduleStatus,
      nodeVersion: process.version,
      platform: process.platform,
      arch: process.arch
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      error: error.message,
      stack: error.stack
    });
  }
}
