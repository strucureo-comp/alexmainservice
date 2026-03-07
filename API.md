# Alex Email API Documentation

> Environment-based Email API with SMTP/IMAP support for Titan Mail (or any email provider).

---

## Base URL

| Environment | URL |
|------------|-----|
| Production | `https://alexmainservice.vercel.app` |
| Local Dev | `http://localhost:3000` |

---

## Authentication

All API requests (except health check) require the `x-api-key` header:

```bash
-H "x-api-key: test-api-key-123"
```

**Default API Key (Development):** `test-api-key-123`

---

## Endpoints Overview

| Method | Endpoint | Description | Auth |
|--------|----------|-------------|------|
| GET | `/api/health` | Health check & system status | No |
| GET | `/api/diagnostic` | Environment & module diagnostics | No |
| GET | `/api/get-config` | Get user configuration & limits | Yes |
| POST | `/api/send-email` | Send email via SMTP | Yes |
| GET | `/api/read-messages` | Read emails via IMAP | Yes |
| POST | `/api/mark-read` | Mark email as read | Yes |
| GET | `/api/metrics` | System metrics | Yes (Admin) |
| GET | `/api/webhook` | Get webhook config | Yes |
| POST | `/api/webhook` | Test webhook | Yes |

---

## 1. Health Check

Check API health and system status.

```bash
GET /api/health
```

**Response:**
```json
{
  "status": "healthy",
  "timestamp": "2026-02-19T17:12:14.754Z",
  "uptime": 16167,
  "config": { "status": "ok" },
  "metrics": {
    "totalRequests": 1,
    "totalErrors": 0,
    "avgResponseTime": "0ms",
    "errorRate": "0.00%"
  },
  "performance": {
    "responseTime": "0ms",
    "memoryUsage": {},
    "nodeVersion": "v24.13.0"
  }
}
```

---

## 2. Send Email

Send an email via SMTP.

```bash
POST /api/send-email
```

**Headers:**
```
x-api-key: test-api-key-123
Content-Type: application/json
```

**Request Body:**
```json
{
  "to": "recipient@example.com",
  "subject": "Email Subject",
  "html": "<h1>Hello</h1><p>Your message</p>",
  "attachments": [
    {
      "filename": "document.pdf",
      "content": "base64_encoded_content",
      "contentType": "application/pdf",
      "encoding": "base64"
    }
  ]
}
```

**Response:**
```json
{
  "success": true,
  "message": "Email sent successfully",
  "user": {
    "id": "env-user",
    "email": "alex@strucureo.com",
    "plan": "production"
  },
  "performance": {
    "responseTime": "2425ms"
  }
}
```

---

## 3. Read Messages

Read emails from inbox via IMAP.

```bash
GET /api/read-messages
```

**Query Parameters:**

| Param | Type | Default | Description |
|-------|------|---------|-------------|
| `limit` | number | 50 | Max messages (max: 100) |
| `unreadOnly` | boolean | false | Only unread messages |
| `mailbox` | string | INBOX | Mailbox name |

**Response:**
```json
{
  "success": true,
  "messages": [
    {
      "id": 1,
      "seqno": 1,
      "flags": ["\\Seen"],
      "date": "2026-02-19T16:40:21.000Z",
      "from": "sender@example.com",
      "to": "alex@strucureo.com",
      "subject": "Hello",
      "text": "Message body",
      "html": "<p>Message body</p>",
      "attachments": [],
      "unread": false
    }
  ],
  "count": 1,
  "mailbox": "INBOX",
  "performance": {
    "responseTime": "1417ms",
    "cached": true
  }
}
```

---

## 4. Mark as Read

Mark an email as read via IMAP.

```bash
POST /api/mark-read
```

**Request Body:**
```json
{
  "messageId": 1
}
```

**Response:**
```json
{
  "success": true,
  "message": "Message marked as read",
  "messageId": 1,
  "performance": {
    "responseTime": "156ms"
  }
}
```

---

## 5. Get Configuration

Retrieve user account configuration.

```bash
GET /api/get-config
```

**Response:**
```json
{
  "user": {
    "id": "env-user",
    "email": "alex@strucureo.com",
    "plan_type": "production",
    "emails_sent_this_month": 150
  },
  "smtp_config": {
    "smtp_host": "smtp.titan.email",
    "smtp_port": 465,
    "smtp_secure": true,
    "smtp_user": "alex@strucureo.com",
    "from_name": "Alex"
  },
  "imap_config": {
    "imap_host": "imap.titan.email",
    "imap_port": 993,
    "imap_secure": true,
    "imap_user": "alex@strucureo.com"
  },
  "limits": {
    "monthly_emails": "unlimited",
    "requests_per_minute": 30,
    "requests_per_hour": 1800
  },
  "performance": {
    "responseTime": "5ms"
  }
}
```

---

## 6. Webhook

### Get Webhook Config

```bash
GET /api/webhook
```

**Response:**
```json
{
  "webhook_config": {
    "url": "http://localhost:4000/webhook/new-email",
    "checkInterval": 30,
    "enabled": true
  },
  "message": "Set WEBHOOK_URL env var to enable webhook notifications"
}
```

### Test Webhook

```bash
POST /api/webhook
```

**Request Body:**
```json
{
  "test": true
}
```

**Response:**
```json
{
  "success": true,
  "message": "Test webhook sent successfully"
}
```

---

## 7. Metrics

Get system metrics (requires admin key).

```bash
GET /api/metrics
```

**Headers:**
```
x-admin-key: YOUR_ADMIN_KEY
```

**Response:**
```json
{
  "timestamp": "2026-02-19T17:12:14.754Z",
  "mode": "env-config (local)",
  "user": {
    "email": "alex@strucureo.com",
    "plan_type": "production",
    "smtp_configured": true,
    "imap_configured": true
  },
  "performance": {
    "uptime": 16167,
    "memoryUsage": {},
    "nodeVersion": "v24.13.0"
  }
}
```

---

## 8. Diagnostic

Check environment variables and module availability.

```bash
GET /api/diagnostic
```

**Response:**
```json
{
  "success": true,
  "environmentVariables": {
    "API_KEY": "✓ SET",
    "SMTP_HOST": "smtp.titan.email",
    "SMTP_PORT": "465",
    "SMTP_USER": "✓ SET",
    "SMTP_PASS": "✓ SET",
    "IMAP_HOST": "imap.titan.email",
    "IMAP_PORT": "993",
    "IMAP_USER": "✓ SET",
    "IMAP_PASS": "✓ SET"
  },
  "modules": {
    "nodemailer": "✓ Loaded",
    "dotenv": "✓ Loaded",
    "imap": "✓ Loaded"
  },
  "nodeVersion": "v24.13.0",
  "platform": "linux",
  "arch": "x64"
}
```

---

## Error Codes

| Code | Error | Description |
|------|-------|-------------|
| 200 | OK | Success |
| 400 | Bad Request | Invalid parameters |
| 401 | Unauthorized | Invalid/missing API key |
| 405 | Method Not Allowed | Wrong HTTP method |
| 429 | Rate Limit Exceeded | Too many requests |
| 500 | Internal Server Error | Server error |
| 503 | Service Unavailable | Config error |

**Error Response:**
```json
{
  "error": "Error message",
  "details": "Additional details",
  "performance": {
    "responseTime": "5ms"
  }
}
```

---

## Code Examples

### cURL

**Send Email:**
```bash
curl -X POST https://alexmainservice.vercel.app/api/send-email \
  -H "x-api-key: test-api-key-123" \
  -H "Content-Type: application/json" \
  -d '{
    "to": "user@example.com",
    "subject": "Hello",
    "html": "<h1>Welcome!</h1>"
  }'
```

**Read Messages:**
```bash
curl https://alexmainservice.vercel.app/api/read-messages \
  -H "x-api-key: test-api-key-123"
```

### JavaScript

```javascript
// Send Email
const response = await fetch('https://alexmainservice.vercel.app/api/send-email', {
  method: 'POST',
  headers: {
    'x-api-key': 'test-api-key-123',
    'Content-Type': 'application/json'
  },
  body: JSON.stringify({
    to: 'user@example.com',
    subject: 'Hello',
    html: '<h1>Welcome!</h1>'
  })
});

const data = await response.json();

// Read Messages
const response = await fetch('https://alexmainservice.vercel.app/api/read-messages', {
  headers: { 'x-api-key': 'test-api-key-123' }
});

const { messages } = await response.json();
```

### Python

```python
import requests

# Send Email
response = requests.post(
    'https://alexmainservice.vercel.app/api/send-email',
    headers={'x-api-key': 'test-api-key-123'},
    json={
        'to': 'user@example.com',
        'subject': 'Hello',
        'html': '<h1>Welcome!</h1>'
    }
)

print(response.json())

# Read Messages
response = requests.get(
    'https://alexmainservice.vercel.app/api/read-messages',
    headers={'x-api-key': 'test-api-key-123'}
)

for message in response.json()['messages']:
    print(f"From: {message['from']}, Subject: {message['subject']}")
```

### PHP

```php
<?php
$ch = curl_init('https://alexmainservice.vercel.app/api/send-email');

curl_setopt_array($ch, [
    CURLOPT_POST => 1,
    CURLOPT_POSTFIELDS => json_encode([
        'to' => 'user@example.com',
        'subject' => 'Hello',
        'html' => '<h1>Welcome!</h1>'
    ]),
    CURLOPT_HTTPHEADER => [
        'x-api-key: test-api-key-123',
        'Content-Type: application/json'
    ],
    CURLOPT_RETURNTRANSFER => true
]);

$response = curl_exec($ch);
curl_close($ch);

print_r(json_decode($response));
?>
```

---

## Environment Variables

Copy to `.env.local`:

```bash
# API Security
API_KEY=test-api-key-123
ADMIN_KEY=your-admin-key

# SMTP Configuration
SMTP_HOST=smtp.titan.email
SMTP_PORT=465
SMTP_SECURE=true
SMTP_USER=alex@strucureo.com
SMTP_PASS=your_password

# IMAP Configuration
IMAP_HOST=imap.titan.email
IMAP_PORT=993
IMAP_SECURE=true
IMAP_USER=alex@strucureo.com
IMAP_PASS=your_password

# Webhook (Optional)
WEBHOOK_URL=http://localhost:4000/webhook/new-email
WEBHOOK_CHECK_INTERVAL=30

# App Settings
FROM_NAME=Alex
USER_EMAIL=alex@strucureo.com
PLAN_TYPE=production
PORT=3000
```

---

## Quick Start

1. **Install dependencies:**
   ```bash
   npm install
   ```

2. **Configure `.env.local`** (see above)

3. **Start server:**
   ```bash
   npm run dev
   ```

4. **Test:**
   ```bash
   curl http://localhost:3000/api/health
   ```

---

## Status

| Component | Status |
|-----------|--------|
| API Server | ✅ Live |
| SMTP | ✅ Working |
| IMAP | ✅ Working |
| Health Check | ✅ Healthy |

---

**Version:** 3.0.0  
**Last Updated:** February 19, 2026
