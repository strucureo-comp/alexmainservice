# Alex Email API - Complete Documentation

## Base URL

```
Production: https://api-drift-spike.vercel.app/api
```

## Authentication

All API requests require authentication using your API key (Firebase User ID) in the `x-api-key` header.

```bash
-H "x-api-key: YOUR_USER_ID"
```

---

## Endpoints

### 1. Send Email

Send an email using your configured SMTP settings.

**Endpoint:** `POST /send-email`

**Headers:**
```
x-api-key: YOUR_USER_ID
Content-Type: application/json
```

**Request Body:**
```json
{
  "to": "recipient@example.com",
  "subject": "Email Subject",
  "html": "<h1>HTML Content</h1><p>Your email body</p>",
  "attachments": [  // Optional
    {
      "filename": "document.pdf",
      "content": "base64_encoded_content",
      "contentType": "application/pdf",
      "encoding": "base64"
    }
  ]
}
```

**Response (Success):**
```json
{
  "success": true,
  "message": "Email sent successfully",
  "user": {
    "id": "user-id",
    "email": "your@email.com",
    "plan": "starter",
    "emails_sent": 1
  },
  "performance": {
    "responseTime": "87ms",
    "cached": true
  }
}
```

**Response (Error):**
```json
{
  "error": "Email sending failed",
  "details": "SMTP connection timeout",
  "performance": {
    "responseTime": "5000ms"
  }
}
```

**Example:**
```bash
curl -X POST https://api-drift-spike.vercel.app/api/send-email \
  -H "x-api-key: 5e292193-54fc-49a4-9395-fa7667145400" \
  -H "Content-Type: application/json" \
  -d '{
    "to": "user@example.com",
    "subject": "Hello World",
    "html": "<h1>Welcome!</h1><p>This is a test email.</p>"
  }'
```

---

### 2. Get Configuration

Retrieve your account configuration, usage statistics, and limits.

**Endpoint:** `GET /get-config`

**Headers:**
```
x-api-key: YOUR_USER_ID
```

**Response:**
```json
{
  "user": {
    "id": "user-id",
    "email": "your@email.com",
    "plan_type": "starter",
    "emails_sent_this_month": 150,
    "created_at": "2026-01-15T10:30:00Z"
  },
  "smtp_config": {
    "smtp_host": "smtp.gmail.com",
    "smtp_port": 587,
    "smtp_secure": false,
    "smtp_user": "your@gmail.com",
    "from_name": "Your Name"
  },
  "limits": {
    "monthly_emails": 1500,
    "remaining_emails": 1350,
    "requests_per_minute": 1,
    "requests_per_hour": 60
  },
  "performance": {
    "responseTime": "45ms",
    "cached": true
  }
}
```

**Example:**
```bash
curl -H "x-api-key: 5e292193-54fc-49a4-9395-fa7667145400" \
  https://api-drift-spike.vercel.app/api/get-config
```

---

### 3. Read Messages (IMAP)

Read emails from your inbox via IMAP.

**Endpoint:** `GET /read-messages`

**Headers:**
```
x-api-key: YOUR_USER_ID
```

**Query Parameters:**
- `limit` (optional) - Number of messages to fetch (default: 50, max: 100)
- `unreadOnly` (optional) - Only fetch unread messages (default: false)
- `mailbox` (optional) - Mailbox to read from (default: INBOX)

**Response:**
```json
{
  "success": true,
  "messages": [
    {
      "uid": 12345,
      "from": "sender@example.com",
      "to": "you@example.com",
      "subject": "Important Message",
      "date": "2026-02-12T10:30:00Z",
      "text": "Plain text content",
      "html": "<p>HTML content</p>",
      "flags": ["\\Seen"],
      "attachments": []
    }
  ],
  "count": 1,
  "mailbox": "INBOX",
  "performance": {
    "responseTime": "234ms",
    "cached": false
  }
}
```

**Example:**
```bash
curl -H "x-api-key: 5e292193-54fc-49a4-9395-fa7667145400" \
  "https://api-drift-spike.vercel.app/api/read-messages?limit=10&unreadOnly=true"
```

---

### 4. Mark Message as Read

Mark an email message as read.

**Endpoint:** `POST /mark-read`

**Headers:**
```
x-api-key: YOUR_USER_ID
Content-Type: application/json
```

**Request Body:**
```json
{
  "messageId": 12345
}
```

**Response:**
```json
{
  "success": true,
  "message": "Message marked as read",
  "messageId": 12345,
  "performance": {
    "responseTime": "156ms"
  }
}
```

**Example:**
```bash
curl -X POST https://api-drift-spike.vercel.app/api/mark-read \
  -H "x-api-key: 5e292193-54fc-49a4-9395-fa7667145400" \
  -H "Content-Type: application/json" \
  -d '{"messageId": 12345}'
```

---

### 5. WebSocket (Real-time Notifications)

Connect to WebSocket for real-time email notifications.

**Endpoint:** `GET /websocket`

**Query Parameters:**
- `userId` - Your user ID (alternative to x-api-key header)

**Headers (Alternative):**
```
x-api-key: YOUR_USER_ID
```

**Connection:**
```javascript
const ws = new WebSocket('wss://api-drift-spike.vercel.app/api/websocket?userId=YOUR_USER_ID');

ws.onopen = () => {
  console.log('Connected to WebSocket');
};

ws.onmessage = (event) => {
  const data = JSON.parse(event.data);
  console.log('New message:', data);
};

// Send ping to keep connection alive
setInterval(() => {
  ws.send(JSON.stringify({ type: 'ping' }));
}, 30000);
```

**Messages Received:**
```json
{
  "type": "connected",
  "message": "WebSocket connected successfully",
  "userId": "your-user-id"
}
```

```json
{
  "type": "new_messages",
  "count": 1,
  "messages": [...],
  "timestamp": "2026-02-12T10:30:00Z"
}
```

```json
{
  "type": "pong",
  "timestamp": 1707734400000
}
```

---

### 6. Health Check

Check API health and performance metrics.

**Endpoint:** `GET /health`

**Response:**
```json
{
  "status": "healthy",
  "timestamp": "2026-02-12T10:30:00Z",
  "uptime": 3600000,
  "database": {
    "status": "connected",
    "responseTime": "12ms"
  },
  "metrics": {
    "totalRequests": 1000,
    "totalErrors": 2,
    "avgResponseTime": "156ms",
    "errorRate": "0.20%"
  },
  "performance": {
    "responseTime": "5ms",
    "memoryUsage": {
      "rss": 52428800,
      "heapTotal": 20971520,
      "heapUsed": 15728640
    },
    "nodeVersion": "v22.15.1"
  }
}
```

**Example:**
```bash
curl https://api-drift-spike.vercel.app/api/health
```

---

### 7. Metrics (Admin Only)

Get detailed performance metrics and analytics.

**Endpoint:** `GET /metrics`

**Headers:**
```
x-admin-key: YOUR_ADMIN_KEY
```

**Response:**
```json
{
  "timestamp": "2026-02-12T10:30:00Z",
  "users": {
    "total": 100,
    "production": 20,
    "premium": 5,
    "starter": 75,
    "productionPercentage": "25.00"
  },
  "emails": {
    "last24Hours": 5000,
    "avgResponseTime": "156ms",
    "successRate": "99.80%",
    "totalSent": 1000000
  },
  "performance": {
    "avgResponseTime": "156ms",
    "uptime": 3600,
    "memoryUsage": {...},
    "nodeVersion": "v22.15.1"
  },
  "topUsers": [
    {
      "plan": "production",
      "monthlyEmails": 50000,
      "totalEmails": 500000
    }
  ]
}
```

**Example:**
```bash
curl -H "x-admin-key: YOUR_ADMIN_KEY" \
  https://api-drift-spike.vercel.app/api/metrics
```

---

## Rate Limits

### Starter Plan (Free)
- **Requests:** 1 per minute
- **Monthly Emails:** 1,500
- **Concurrent Requests:** 1

### Production Plan ($50/month)
- **Requests:** 30 per minute
- **Monthly Emails:** Unlimited
- **Concurrent Requests:** 10

### Rate Limit Headers

Responses include rate limit information:
```
X-RateLimit-Limit: 30
X-RateLimit-Remaining: 29
X-RateLimit-Reset: 1707734460
```

### Rate Limit Exceeded Response
```json
{
  "error": "Rate limit exceeded",
  "retryAfter": 60
}
```

---

## Error Codes

| Code | Description |
|------|-------------|
| 400 | Bad Request - Invalid parameters or missing required fields |
| 401 | Unauthorized - Invalid or missing API key |
| 404 | Not Found - User or resource not found |
| 408 | Request Timeout - Email sending timeout |
| 429 | Too Many Requests - Rate limit exceeded |
| 500 | Internal Server Error - Server-side error |
| 503 | Service Unavailable - Database or service down |

---

## Data Structures

### User Document (Firestore)

```javascript
{
  id: "user-uuid",
  email: "user@example.com",
  planType: "starter" | "production" | "premium",
  emailsSentThisMonth: 0,
  totalEmailsSent: 0,
  totalEmailsRead: 0,
  smtp: {
    host: "smtp.gmail.com",
    port: 587,
    secure: false,
    user: "user@gmail.com",
    pass: "app-password",
    fromName: "Company Name"
  },
  imap: {
    host: "imap.gmail.com",
    port: 993,
    secure: true,
    user: "user@gmail.com",
    pass: "app-password"
  },
  createdAt: "2026-01-15T10:30:00Z",
  updatedAt: "2026-02-12T10:30:00Z",
  lastEmailSent: "2026-02-12T10:30:00Z",
  lastEmailRead: null
}
```

---

## Code Examples

### JavaScript / Node.js

```javascript
const fetch = require('node-fetch');

async function sendEmail() {
  const response = await fetch('https://api-drift-spike.vercel.app/api/send-email', {
    method: 'POST',
    headers: {
      'x-api-key': 'YOUR_USER_ID',
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({
      to: 'user@example.com',
      subject: 'Hello from Node.js',
      html: '<h1>Welcome!</h1>'
    })
  });

  const data = await response.json();
  console.log(data);
}

sendEmail();
```

### Python

```python
import requests

response = requests.post(
    'https://api-drift-spike.vercel.app/api/send-email',
    headers={'x-api-key': 'YOUR_USER_ID'},
    json={
        'to': 'user@example.com',
        'subject': 'Hello from Python',
        'html': '<h1>Welcome!</h1>'
    }
)

print(response.json())
```

### cURL

```bash
curl -X POST https://api-drift-spike.vercel.app/api/send-email \
  -H "x-api-key: YOUR_USER_ID" \
  -H "Content-Type: application/json" \
  -d '{
    "to": "user@example.com",
    "subject": "Hello from cURL",
    "html": "<h1>Welcome!</h1>"
  }'
```

### PHP

```php
<?php
$ch = curl_init('https://api-drift-spike.vercel.app/api/send-email');

curl_setopt($ch, CURLOPT_POST, 1);
curl_setopt($ch, CURLOPT_POSTFIELDS, json_encode([
    'to' => 'user@example.com',
    'subject' => 'Hello from PHP',
    'html' => '<h1>Welcome!</h1>'
]));
curl_setopt($ch, CURLOPT_HTTPHEADER, [
    'x-api-key: YOUR_USER_ID',
    'Content-Type: application/json'
]);
curl_setopt($ch, CURLOPT_RETURNTRANSFER, true);

$response = curl_exec($ch);
curl_close($ch);

print_r(json_decode($response));
?>
```

---

## Setup Guide

### 1. Get Your API Key

Your API key is your Firebase User ID. You can find it in:
- Firebase Console → Firestore → users collection
- Or create a new user document

### 2. Configure SMTP Settings

Update your user document in Firestore with SMTP credentials:

```javascript
{
  smtp: {
    host: "smtp.gmail.com",
    port: 587,
    secure: false,
    user: "your-email@gmail.com",
    pass: "your-app-password",  // Use app-specific password for Gmail
    fromName: "Your Name"
  }
}
```

### 3. Configure IMAP (Optional)

For email reading functionality:

```javascript
{
  imap: {
    host: "imap.gmail.com",
    port: 993,
    secure: true,
    user: "your-email@gmail.com",
    pass: "your-app-password"
  }
}
```

### 4. Test Your Setup

```bash
curl -H "x-api-key: YOUR_USER_ID" \
  https://api-drift-spike.vercel.app/api/get-config
```

---

## Best Practices

### 1. Error Handling

Always handle errors gracefully:

```javascript
try {
  const response = await fetch(url, options);
  const data = await response.json();
  
  if (!response.ok) {
    throw new Error(data.error || 'Request failed');
  }
  
  return data;
} catch (error) {
  console.error('API Error:', error.message);
  // Handle error appropriately
}
```

### 2. Rate Limiting

Implement exponential backoff for rate limit errors:

```javascript
async function sendWithRetry(data, maxRetries = 3) {
  for (let i = 0; i < maxRetries; i++) {
    try {
      return await sendEmail(data);
    } catch (error) {
      if (error.status === 429 && i < maxRetries - 1) {
        const delay = Math.pow(2, i) * 1000;
        await new Promise(resolve => setTimeout(resolve, delay));
        continue;
      }
      throw error;
    }
  }
}
```

### 3. Caching

Cache user configuration to reduce API calls:

```javascript
const configCache = new Map();

async function getConfig(userId) {
  if (configCache.has(userId)) {
    return configCache.get(userId);
  }
  
  const config = await fetchConfig(userId);
  configCache.set(userId, config);
  
  // Clear cache after 5 minutes
  setTimeout(() => configCache.delete(userId), 5 * 60 * 1000);
  
  return config;
}
```

### 4. Security

- Never expose your API key in client-side code
- Use environment variables for API keys
- Implement server-side proxy for client requests
- Rotate API keys periodically

---

## Support

For issues or questions:
- Check this documentation
- Review API response error messages
- Check Firebase Firestore for data
- Monitor Vercel logs for backend errors

---

## Changelog

### v2.0.0 (2026-02-12)
- Migrated from Supabase to Firebase Firestore
- Added IMAP email reading
- Added WebSocket real-time notifications
- Improved rate limiting
- Enhanced caching
- Better error handling

### v1.0.0 (2025-12-29)
- Initial release
- Email sending via SMTP
- Rate limiting
- Basic analytics
