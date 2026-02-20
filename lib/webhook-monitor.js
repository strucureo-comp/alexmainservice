import { getUser } from './env-config.js';
import { getImapConnection, connectImap, fetchMessages } from './imap-manager.js';
import NodeCache from 'node-cache';

const webhookCache = new NodeCache({ stdTTL: 3600 });
let webhookCheckInterval = null;
const seenEmailIds = new Set();

// Send webhook notification
export async function sendWebhookNotification(emails) {
  const webhookUrl = process.env.WEBHOOK_URL;
  if (!webhookUrl) {
    console.log('No WEBHOOK_URL configured. Skipping notification.');
    return;
  }

  try {
    const response = await fetch(webhookUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'User-Agent': 'Alex'
      },
      body: JSON.stringify({
        event: 'new_emails',
        timestamp: new Date().toISOString(),
        count: emails.length,
        emails: emails.map(e => ({
          id: e.id,
          from: e.from,
          subject: e.subject,
          date: e.date,
          unread: e.unread
        }))
      })
    });

    if (!response.ok) {
      console.error(`Webhook failed: ${response.status} ${response.statusText}`);
      return false;
    }

    console.log(`✓ Webhook sent: ${emails.length} new email(s)`);
    return true;
  } catch (err) {
    console.error('Webhook send error:', err.message);
    return false;
  }
}

// Check for new emails and send webhook
export async function checkNewEmails() {
  try {
    const user = getUser();
    
    if (!user.imap_host || !user.imap_user || !user.imap_pass) {
      console.log('IMAP not configured. Skipping mail check.');
      return;
    }

    const imap = getImapConnection({
      imap_host: user.imap_host,
      imap_port: user.imap_port,
      imap_secure: user.imap_secure,
      imap_user: user.imap_user,
      imap_pass: user.imap_pass
    });

    await connectImap(imap);

    // Fetch recent emails
    const messages = await fetchMessages(imap, {
      mailbox: 'INBOX',
      limit: 20,
      unreadOnly: false
    });

    // Filter for new emails we haven't seen
    const newEmails = messages.filter(m => {
      const emailKey = `${m.id}_${m.date}`;
      if (seenEmailIds.has(emailKey)) {
        return false;
      }
      seenEmailIds.add(emailKey);
      return m.unread || m.date > new Date(Date.now() - 5 * 60 * 1000); // Last 5 mins
    });

    if (newEmails.length > 0) {
      await sendWebhookNotification(newEmails);
    }
  } catch (err) {
    console.error('Mail check error:', err.message);
  }
}

// Start background mail checker
export function startWebhookMonitor(intervalSeconds = 30) {
  if (webhookCheckInterval) {
    console.log('Webhook monitor already running');
    return;
  }

  console.log(`Starting webhook monitor (check every ${intervalSeconds}s)`);
  
  // Initial check
  checkNewEmails();

  // Periodic checks
  webhookCheckInterval = setInterval(() => {
    checkNewEmails();
  }, intervalSeconds * 1000);

  return webhookCheckInterval;
}

// Stop background monitor
export function stopWebhookMonitor() {
  if (webhookCheckInterval) {
    clearInterval(webhookCheckInterval);
    webhookCheckInterval = null;
    console.log('Webhook monitor stopped');
  }
}

// Get webhook config
export function getWebhookConfig() {
  return {
    webhook_url: process.env.WEBHOOK_URL || null,
    check_interval: parseInt(process.env.WEBHOOK_CHECK_INTERVAL || '30', 10),
    enabled: !!process.env.WEBHOOK_URL
  };
}
