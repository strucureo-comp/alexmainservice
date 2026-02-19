import { getUser } from '../lib/env-config.js';

export default async function handler(req, res) {
  if (req.method !== 'GET') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const adminKey = req.headers['x-admin-key'];
  if (!adminKey || adminKey !== process.env.ADMIN_KEY) {
    return res.status(401).json({ error: 'Unauthorized' });
  }

  try {
    const user = getUser();

    const metrics = {
      timestamp: new Date().toISOString(),
      mode: 'env-config (local)',
      user: {
        email: user.email,
        plan_type: user.plan_type,
        smtp_configured: !!user.smtp_host,
        imap_configured: !!user.imap_host,
      },
      performance: {
        uptime: process.uptime(),
        memoryUsage: process.memoryUsage(),
        nodeVersion: process.version
      }
    };

    res.setHeader('Cache-Control', 'private, max-age=60');
    return res.status(200).json(metrics);

  } catch (error) {
    return res.status(500).json({
      error: 'Failed to fetch metrics',
      details: error.message
    });
  }
}