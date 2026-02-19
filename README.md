# DriftSpike Email API

Environment-based email API with SMTP/IMAP support for Zoho Mail (or any email provider). No database required - everything runs locally with credentials stored in `.env.local`.

## Quick Start

1. **Install dependencies:**
```bash
npm install
```

2. **Configure `.env.local`:**
```bash
# Zoho Mail SMTP (sending emails)
SMTP_HOST=smtp.zoho.in
SMTP_PORT=465
SMTP_SECURE=true
SMTP_USER=your-email@zoho.com
SMTP_PASS=your-password

# Zoho Mail IMAP (reading emails)
IMAP_HOST=imap.zoho.in
IMAP_PORT=993
IMAP_SECURE=true
IMAP_USER=your-email@zoho.com
IMAP_PASS=your-password

# API Security
API_KEY=your-api-key

# Optional: Webhook notifications
WEBHOOK_URL=https://your-server.com/webhook/emails
WEBHOOK_CHECK_INTERVAL=30
```

3. **Start the server:**
```bash
npm run dev
```

Server runs on `http://localhost:3000`

## API Endpoints

### Health Check
```bash
GET /health
```
Check if server and config are healthy.

### Get Configuration
```bash
GET /api/get-config
Headers: X-API-Key: your-api-key
```
Returns SMTP/IMAP configuration and limits.

### Send Email
```bash
POST /api/send-email
Headers: X-API-Key: your-api-key
Content-Type: application/json

{
  "to": "recipient@example.com",
  "subject": "Hello",
  "html": "<p>Message body</p>",
  "attachments": [
    {
      "filename": "doc.pdf",
      "content": "base64-encoded-content",
      "contentType": "application/pdf"
    }
  ]
}
```

### Read Emails (IMAP)
```bash
GET /api/read-messages?limit=50&mailbox=INBOX&unreadOnly=false
Headers: X-API-Key: your-api-key
```
Fetch emails from IMAP mailbox.

### Mark Email as Read
```bash
POST /api/mark-read
Headers: X-API-Key: your-api-key
Content-Type: application/json

{
  "messageId": "123"
}
```

### Metrics
```bash
GET /api/metrics
Headers: X-Admin-Key: your-admin-key
```
View API usage and info.

### Webhook Config
```bash
GET /api/webhook
Headers: X-API-Key: your-api-key
```
Get webhook configuration.

```bash
POST /api/webhook
Headers: X-API-Key: your-api-key
```
Send a test webhook notification.

## Webhook Notifications

When `WEBHOOK_URL` is set, the server automatically monitors your mailbox and sends notifications when new emails arrive.

See [WEBHOOK.md](WEBHOOK.md) for detailed setup instructions.

## Environment Variables

| Variable | Required | Example |
|----------|----------|---------|
| `API_KEY` | Yes | `abc123` |
| `ADMIN_KEY` | No | `admin-secret` |
| `SMTP_HOST` | Yes | `smtp.zoho.in` |
| `SMTP_PORT` | Yes | `465` |
| `SMTP_SECURE` | Yes | `true` |
| `SMTP_USER` | Yes | `user@zoho.com` |
| `SMTP_PASS` | Yes | `password` |
| `IMAP_HOST` | No | `imap.zoho.in` |
| `IMAP_PORT` | No | `993` |
| `IMAP_SECURE` | No | `true` |
| `IMAP_USER` | No | `user@zoho.com` |
| `IMAP_PASS` | No | `password` |
| `WEBHOOK_URL` | No | `https://your-server.com/webhook` |
| `WEBHOOK_CHECK_INTERVAL` | No | `30` |
| `PORT` | No | `3000` |

## Features

✅ **Simple email sending** via SMTP  
✅ **Read emails** via IMAP  
✅ **Automatic webhooks** for new mail  
✅ **No database** - env-based config  
✅ **Rate limiting** built-in  
✅ **Connection pooling** for performance  
✅ **API key authentication**  
✅ **Local development** support  

## Examples

**Send email:**
```bash
curl -X POST \
  -H "X-API-Key: your-api-key" \
  -H "Content-Type: application/json" \
  -d '{
    "to": "test@example.com",
    "subject": "Test",
    "html": "<p>Hello!</p>"
  }' \
  http://localhost:3000/api/send-email
```

**Fetch inbox:**
```bash
curl -H "X-API-Key: your-api-key" \
  "http://localhost:3000/api/read-messages?limit=10"
```

**Test webhook:**
```bash
curl -X POST \
  -H "X-API-Key: your-api-key" \
  http://localhost:3000/api/webhook
```

## Zoho Mail Setup

1. Enable IMAP/SMTP in Zoho Mail settings
2. Use app password if 2FA is enabled
3. Add IP whitelist if required

**SMTP Settings:**
- Host: `smtp.zoho.in`
- Port: `465` (SSL) or `587` (TLS)
- Username: Your Zoho email
- Password: Your password or app-specific password

**IMAP Settings:**
- Host: `imap.zoho.in`
- Port: `993` (SSL)
- Username: Your Zoho email
- Password: Your password or app-specific password

## Architecture

```
server.js (Express-like HTTP server)
  ├─ api/
  │  ├─ health.js (health check)
  │  ├─ send-email.js (SMTP)
  │  ├─ read-messages.js (IMAP)
  │  ├─ mark-read.js (IMAP)
  │  ├─ get-config.js (config)
  │  ├─ metrics.js (stats)
  │  └─ webhook.js (webhooks)
  └─ lib/
     ├─ env-config.js (environment loader)
     ├─ connection-manager.js (SMTP pooling)
     ├─ imap-manager.js (IMAP operations)
     ├─ rate-limiter.js (rate limiting)
     └─ webhook-monitor.js (auto notifications)
```

## Deployment

Deploy to Vercel, Railway, or any Node.js host:

```bash
git push heroku main  # Or your deployment platform
```

Set environment variables in your hosting platform dashboard.

## License

MIT
