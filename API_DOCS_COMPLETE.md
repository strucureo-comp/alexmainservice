# DriftSpike Email API - Complete Documentation

## 🚀 Base URL

```
Production: https://alexmainservice.vercel.app
Local Dev: http://localhost:3000
```

## 🔐 Authentication

All API requests require the `x-api-key` header with your API key.

```bash
curl -H "x-api-key: test-api-key-123" https://alexmainservice.vercel.app/api/health
```

**Default API Key (Development):** `test-api-key-123`

---

## 📊 Available Endpoints

| Method | Endpoint | Description | Auth Required |
|--------|----------|-------------|---|
| GET | `/api/health` | Health check & system status | No |
| GET | `/api/diagnostic` | Environment & module diagnostics | No |
| POST | `/api/send-email` | Send email via SMTP | Yes |
| GET | `/api/read-messages` | Read emails via IMAP | Yes |
| POST | `/api/mark-read` | Mark email as read | Yes |
| GET | `/api/get-config` | Get user configuration | Yes |
| POST | `/api/webhook` | Test webhook endpoint | Yes |
| GET | `/api/metrics` | Admin metrics | Yes |

---

## 1️⃣ Health Check

Check if the API is running and healthy.

**Endpoint:** `GET /api/health`

**Headers:**
```
x-api-key: test-api-key-123 (optional)
```

**Response (200 OK):**
```json
{
  "status": "healthy",
  "timestamp": "2026-02-19T17:12:14.754Z",
  "uptime": 16167,
  "config": {
    "status": "ok"
  },
  "metrics": {
    "totalRequests": 1,
    "totalErrors": 0,
    "avgResponseTime": "0ms",
    "errorRate": "0.00%"
  },
  "performance": {
    "responseTime": "0ms",
    "memoryUsage": {
      "rss": 58228736,
      "heapTotal": 11071488,
      "heapUsed": 6648144,
      "external": 2528248,
      "arrayBuffers": 16915
    },
    "nodeVersion": "v24.13.0"
  }
}
```

**Example:**
```bash
curl -X GET https://alexmainservice.vercel.app/api/health \
  -H "x-api-key: test-api-key-123"
```

---

## 2️⃣ Diagnostic Endpoint

Check environment variables and module availability on Vercel.

**Endpoint:** `GET /api/diagnostic`

**Response (200 OK):**
```json
{
  "success": true,
  "environment": "Vercel Diagnostic",
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

**Example:**
```bash
curl https://alexmainservice.vercel.app/api/diagnostic
```

---

## 3️⃣ Send Email

Send an email using Titan Mail SMTP.

**Endpoint:** `POST /api/send-email`

**Headers:**
```
x-api-key: test-api-key-123
Content-Type: application/json
```

**Request Body:**
```json
{
  "to": "recipient@gmail.com",
  "subject": "Email Subject",
  "html": "<h1>Hello</h1><p>This is your email</p>",
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

**Required Fields:**
- `to` - Recipient email address
- `subject` - Email subject (max 998 characters)
- `html` - HTML email content (max 1MB)

**Optional Fields:**
- `attachments` - Array of file attachments (max 10 files)

**Response (200 OK):**
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

**Response (400 Bad Request):**
```json
{
  "error": "Invalid recipient email",
  "performance": {
    "responseTime": "5ms"
  }
}
```

**Response (429 Too Many Requests):**
```json
{
  "error": "Rate limit exceeded",
  "retryAfter": 60,
  "performance": {
    "responseTime": "1ms"
  }
}
```

**Example - Basic Email:**
```bash
curl -X POST https://alexmainservice.vercel.app/api/send-email \
  -H "x-api-key: test-api-key-123" \
  -H "Content-Type: application/json" \
  -d '{
    "to": "user@example.com",
    "subject": "Hello World",
    "html": "<h1>Welcome!</h1><p>This is a test email.</p>"
  }'
```

**Example - With Attachment:**
```bash
curl -X POST https://alexmainservice.vercel.app/api/send-email \
  -H "x-api-key: test-api-key-123" \
  -H "Content-Type: application/json" \
  -d '{
    "to": "user@example.com",
    "subject": "Document Attached",
    "html": "<p>Please see attached document</p>",
    "attachments": [
      {
        "filename": "invoice.pdf",
        "content": "JVBERi0xLjQKJeLj...",
        "contentType": "application/pdf",
        "encoding": "base64"
      }
    ]
  }'
```

---

## 4️⃣ Read Messages (IMAP)

Read emails from your Titan Mail inbox.

**Endpoint:** `GET /api/read-messages`

**Headers:**
```
x-api-key: test-api-key-123
```

**Query Parameters:**
- `limit` (optional) - Number of messages (default: 50, max: 100)
- `unreadOnly` (optional) - Only unread messages (true/false)
- `mailbox` (optional) - Mailbox name (default: INBOX)

**Response (200 OK):**
```json
{
  "success": true,
  "messages": [
    {
      "id": 1,
      "seqno": 1,
      "flags": [
        "\\Seen"
      ],
      "date": "2026-02-19T16:40:21.000Z",
      "from": "\"Aathish\" <aathishpirate@gmail.com>",
      "to": "alex@strucureo.com",
      "subject": "hi",
      "text": "hi\n",
      "html": "<div dir=\"ltr\">hi<div><br></div></div>\n",
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

**Example - All Messages:**
```bash
curl -X GET https://alexmainservice.vercel.app/api/read-messages \
  -H "x-api-key: test-api-key-123"
```

**Example - Unread Messages Only:**
```bash
curl -X GET "https://alexmainservice.vercel.app/api/read-messages?unreadOnly=true&limit=10" \
  -H "x-api-key: test-api-key-123"
```

**Example - Specific Mailbox:**
```bash
curl -X GET "https://alexmainservice.vercel.app/api/read-messages?mailbox=Sent" \
  -H "x-api-key: test-api-key-123"
```

---

## 5️⃣ Mark Message as Read

Mark an email as read via IMAP.

**Endpoint:** `POST /api/mark-read`

**Headers:**
```
x-api-key: test-api-key-123
Content-Type: application/json
```

**Request Body:**
```json
{
  "messageId": 1
}
```

**Response (200 OK):**
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

**Example:**
```bash
curl -X POST https://alexmainservice.vercel.app/api/mark-read \
  -H "x-api-key: test-api-key-123" \
  -H "Content-Type: application/json" \
  -d '{"messageId": 1}'
```

---

## 6️⃣ Get Configuration

Retrieve your account configuration.

**Endpoint:** `GET /api/get-config`

**Headers:**
```
x-api-key: test-api-key-123
```

**Response (200 OK):**
```json
{
  "success": true,
  "config": {
    "id": "env-user",
    "email": "alex@strucureo.com",
    "smtp": {
      "host": "smtp.titan.email",
      "port": 465,
      "secure": true,
      "user": "alex@strucureo.com"
    },
    "imap": {
      "host": "imap.titan.email",
      "port": 993,
      "secure": true,
      "user": "alex@strucureo.com"
    },
    "from_name": "DriftSpike",
    "plan_type": "production"
  },
  "performance": {
    "responseTime": "5ms"
  }
}
```

**Example:**
```bash
curl -X GET https://alexmainservice.vercel.app/api/get-config \
  -H "x-api-key: test-api-key-123"
```

---

## 7️⃣ Webhook Configuration

Configure and test webhooks for automatic notifications.

**Endpoint:** `GET /api/webhook` (Get config)  
**Endpoint:** `POST /api/webhook` (Send test)

**Headers:**
```
x-api-key: test-api-key-123
Content-Type: application/json
```

**GET Response:**
```json
{
  "success": true,
  "webhook": {
    "url": "http://localhost:4000/webhook/new-email",
    "checkInterval": 30,
    "enabled": true
  },
  "performance": {
    "responseTime": "2ms"
  }
}
```

**POST Request Body (Test Webhook):**
```json
{
  "test": true
}
```

**POST Response:**
```json
{
  "success": true,
  "message": "Webhook test sent",
  "performance": {
    "responseTime": "1250ms"
  }
}
```

**Example - Get Webhook Config:**
```bash
curl -X GET https://alexmainservice.vercel.app/api/webhook \
  -H "x-api-key: test-api-key-123"
```

**Example - Send Test Webhook:**
```bash
curl -X POST https://alexmainservice.vercel.app/api/webhook \
  -H "x-api-key: test-api-key-123" \
  -H "Content-Type: application/json" \
  -d '{"test": true}'
```

---

## 8️⃣ Metrics (Admin)

Get system metrics and analytics.

**Endpoint:** `GET /api/metrics`

**Headers:**
```
x-api-key: test-api-key-123
```

**Response (200 OK):**
```json
{
  "success": true,
  "timestamp": "2026-02-19T17:12:14.754Z",
  "uptime": 16167,
  "metrics": {
    "totalRequests": 50,
    "totalErrors": 0,
    "avgResponseTime": "234ms",
    "errorRate": "0.00%"
  },
  "performance": {
    "responseTime": "1ms",
    "memoryUsage": {
      "rss": 58228736,
      "heapTotal": 11071488,
      "heapUsed": 6648144
    }
  }
}
```

**Example:**
```bash
curl -X GET https://alexmainservice.vercel.app/api/metrics \
  -H "x-api-key: test-api-key-123"
```

---

## 🛠️ Configuration Details

### Titan Mail Configuration

**Current Settings:**
```
SMTP Host: smtp.titan.email
SMTP Port: 465
SMTP Secure: true (SSL/TLS)
IMAP Host: imap.titan.email
IMAP Port: 993
IMAP Secure: true (SSL/TLS)
Email: alex@strucureo.com
Authentication: Basic Auth (Email + Password)
```

### Environment Variables Required

```bash
# API Security
API_KEY=test-api-key-123
ADMIN_KEY=your-admin-key-here

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

# Webhook Notifications
WEBHOOK_URL=http://localhost:4000/webhook/new-email
WEBHOOK_CHECK_INTERVAL=30

# Additional
FROM_NAME=DriftSpike
USER_EMAIL=alex@strucureo.com
PLAN_TYPE=production
PORT=3000
```

---

## 📋 Error Codes

| Code | Error | Description |
|------|-------|-------------|
| 200 | Success | Request successful |
| 400 | Bad Request | Invalid parameters or missing fields |
| 401 | Unauthorized | Invalid or missing API key |
| 405 | Method Not Allowed | Wrong HTTP method |
| 429 | Rate Limit Exceeded | Too many requests |
| 500 | Internal Server Error | Server error |
| 503 | Service Unavailable | Service down |

**Error Response Format:**
```json
{
  "error": "Error message",
  "details": "Additional error details",
  "performance": {
    "responseTime": "5ms"
  }
}
```

---

## 🚦 Rate Limiting

**Current Limits (Production):**
- Requests per minute: Unlimited (no limit on production plan)
- Monthly emails: Unlimited
- Concurrent connections: 10
- Request timeout: 30 seconds

**Rate Limit Headers (if applicable):**
```
X-RateLimit-Limit: 30
X-RateLimit-Remaining: 29
X-RateLimit-Reset: 1707734460
```

**When Rate Limited (429 Response):**
```json
{
  "error": "Rate limit exceeded",
  "retryAfter": 60
}
```

---

## 💻 Code Examples

### JavaScript/Node.js

```javascript
const fetch = require('node-fetch');

// Send Email
async function sendEmail() {
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
  console.log(data);
}

// Read Messages
async function readMessages() {
  const response = await fetch('https://alexmainservice.vercel.app/api/read-messages', {
    headers: {
      'x-api-key': 'test-api-key-123'
    }
  });

  const data = await response.json();
  console.log(`Found ${data.count} messages`);
  data.messages.forEach(msg => {
    console.log(`From: ${msg.from}, Subject: ${msg.subject}`);
  });
}

sendEmail();
readMessages();
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
        'subject': 'Hello from Python',
        'html': '<h1>Welcome!</h1>'
    }
)

print(response.json())

# Read Messages
response = requests.get(
    'https://alexmainservice.vercel.app/api/read-messages',
    headers={'x-api-key': 'test-api-key-123'}
)

data = response.json()
for message in data['messages']:
    print(f"From: {message['from']}, Subject: {message['subject']}")
```

### cURL

```bash
# Health Check
curl https://alexmainservice.vercel.app/api/health

# Send Email
curl -X POST https://alexmainservice.vercel.app/api/send-email \
  -H "x-api-key: test-api-key-123" \
  -H "Content-Type: application/json" \
  -d '{
    "to": "user@example.com",
    "subject": "Hello",
    "html": "<h1>Welcome!</h1>"
  }'

# Read Messages
curl -X GET https://alexmainservice.vercel.app/api/read-messages \
  -H "x-api-key: test-api-key-123"

# Get Config
curl -X GET https://alexmainservice.vercel.app/api/get-config \
  -H "x-api-key: test-api-key-123"

# Metrics
curl -X GET https://alexmainservice.vercel.app/api/metrics \
  -H "x-api-key: test-api-key-123"
```

### PHP

```php
<?php
// Send Email
$ch = curl_init('https://alexmainservice.vercel.app/api/send-email');

curl_setopt_array($ch, [
    CURLOPT_POST => 1,
    CURLOPT_POSTFIELDS => json_encode([
        'to' => 'user@example.com',
        'subject' => 'Hello from PHP',
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

echo json_decode($response);
?>
```

---

## 🔒 Security Best Practices

1. **Never expose API key in client code** - Use server-side proxy
2. **Use environment variables** - Store credentials securely
3. **Enable HTTPS only** - All production requests use HTTPS
4. **Rotate credentials regularly** - Change passwords periodically
5. **Validate email addresses** - Check format before sending
6. **Handle errors gracefully** - Don't expose sensitive error details
7. **Use timeouts** - Set connection timeouts to prevent hanging
8. **Monitor rate limits** - Track API usage
9. **Implement retry logic** - Use exponential backoff
10. **Log audit trail** - Track all email activities

---

## 📊 Deployment Status

**✅ Current Status: PRODUCTION LIVE**

| Component | Status | Details |
|-----------|--------|---------|
| **API Server** | ✅ Live | Vercel Serverless |
| **SMTP (Sending)** | ✅ Working | Titan Mail 465 |
| **IMAP (Reading)** | ✅ Working | Titan Mail 993 |
| **Health Check** | ✅ Healthy | 0% error rate |
| **Email Account** | ✅ Active | alex@strucureo.com |
| **Repository** | ✅ Updated | GitHub synced |

---

## 📞 Support & Troubleshooting

### Common Issues

**"Invalid API Key"**
- Check `x-api-key` header is correct
- Verify environment variables on Vercel

**"SMTP Connection Failed"**
- Verify Titan Mail credentials
- Check port 465 is accessible
- Ensure SMTP_SECURE is set to true

**"IMAP Auth Failed"**
- Verify IMAP credentials match SMTP
- Check port 993 is accessible
- Ensure IMAP_SECURE is set to true

**"Rate Limited"**
- Wait for reset time (check X-RateLimit-Reset header)
- Implement exponential backoff retry logic

**"Module Not Found"**
- Check diagnostic endpoint
- Verify package-lock.json is committed
- Force Vercel rebuild

### Debug Endpoints

```bash
# Check health and config
curl https://alexmainservice.vercel.app/api/health

# Check environment and modules
curl https://alexmainservice.vercel.app/api/diagnostic

# Get detailed metrics
curl -H "x-api-key: test-api-key-123" \
  https://alexmainservice.vercel.app/api/metrics
```

---

## 📚 Additional Resources

- **GitHub Repository:** https://github.com/strucureo-comp/alexmainservice
- **Local Development:** http://localhost:3000 (when running `npm run dev`)
- **Production URL:** https://alexmainservice.vercel.app
- **Vercel Dashboard:** https://vercel.com/projects

---

## 🎯 Quick Start Summary

1. **Send Email:**
   ```bash
   curl -X POST https://alexmainservice.vercel.app/api/send-email \
     -H "x-api-key: test-api-key-123" \
     -H "Content-Type: application/json" \
     -d '{"to":"user@example.com","subject":"Test","html":"<p>Hi!</p>"}'
   ```

2. **Read Inbox:**
   ```bash
   curl https://alexmainservice.vercel.app/api/read-messages \
     -H "x-api-key: test-api-key-123"
   ```

3. **Check Status:**
   ```bash
   curl https://alexmainservice.vercel.app/api/health
   ```

---

**Last Updated:** February 19, 2026  
**Version:** 3.0.0 (Titan Mail Edition)  
**Status:** ✅ Production Ready
