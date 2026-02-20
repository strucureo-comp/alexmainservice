import { authenticate } from '../lib/env-config.js';
import { getWebhookConfig, sendWebhookNotification } from '../lib/webhook-monitor.js';

export default async function handler(req, res) {
  res.setHeader('Cache-Control', 'no-cache, no-store, must-revalidate');
  
  if (!authenticate(req)) {
    return res.status(401).json({ error: 'Invalid API key' });
  }

  if (req.method === 'GET') {
    // Get webhook config
    try {
      const config = getWebhookConfig();
      return res.status(200).json({
        webhook_config: config,
        message: 'Set WEBHOOK_URL env var to enable webhook notifications'
      });
    } catch (err) {
      return res.status(500).json({ error: err.message });
    }
  }

  if (req.method === 'POST') {
    // Test webhook by sending a test notification
    try {
      const testEmail = {
        id: 'test-123',
        from: 'test@example.com',
        subject: 'Test email from Alex',
        date: new Date(),
        unread: true
      };

      const success = await sendWebhookNotification([testEmail]);
      
      return res.status(success ? 200 : 500).json({
        success,
        message: success ? 'Test webhook sent successfully' : 'Webhook send failed',
        webhook_url: process.env.WEBHOOK_URL ? '***' : 'not configured'
      });
    } catch (err) {
      return res.status(500).json({ error: err.message });
    }
  }

  return res.status(405).json({ error: 'Method not allowed' });
}
