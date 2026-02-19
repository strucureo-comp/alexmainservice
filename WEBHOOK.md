# Webhook Notifications - Auto-send New Emails

When new emails arrive in your Zoho mailbox, the backend automatically sends a notification to your webhook URL.

## Setup

1. **Configure your webhook URL in `.env.local`:**

```env
WEBHOOK_URL=https://your-server.com/webhook/new-email
WEBHOOK_CHECK_INTERVAL=30  # Check every 30 seconds
```

2. **Restart the server:**

```bash
npm run dev
```

The server will start polling your IMAP mailbox and send webhook notifications.

## Webhook Payload

When new emails arrive, a POST request is sent to your webhook URL:

```json
{
  "event": "new_emails",
  "timestamp": "2026-02-19T15:45:00.000Z",
  "count": 2,
  "emails": [
    {
      "id": "12345",
      "from": "sender@example.com",
      "subject": "Hello World",
      "date": "2026-02-19T15:44:00.000Z",
      "unread": true
    },
    {
      "id": "12346",
      "from": "another@example.com",
      "subject": "Another Email",
      "date": "2026-02-19T15:43:00.000Z",
      "unread": false
    }
  ]
}
```

## Test Webhook

**Check webhook configuration:**

```bash
curl -H "X-API-Key: test-api-key-123" \
  http://localhost:3000/api/webhook
```

**Send a test notification:**

```bash
curl -X POST -H "X-API-Key: test-api-key-123" \
  http://localhost:3000/api/webhook
```

## Example: Local Test Receiver

Run the included test webhook receiver on port 4000:

```bash
node webhook-receiver-test.js
```

Then set `WEBHOOK_URL=http://localhost:4000/webhook/new-email` in `.env.local` and restart the server.

## How It Works

1. Server starts webhook monitor (if `WEBHOOK_URL` is set)
2. Monitor checks IMAP mailbox every N seconds
3. Detects new unread emails or emails from last 5 minutes
4. Sends HTTP POST to your webhook URL with email details
5. Webhook receiver processes the notification

## Notes

- ⚠️ **IMAP must be enabled** in your Zoho Mail account
- Webhook is only sent if the URL is reachable
- Failed webhooks are silently logged (no retry)
- Email ID tracking prevents duplicate notifications
