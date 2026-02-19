# Quick Start Guide

## 🚀 Get Started in 3 Steps

### Step 1: Get Your API Key

Your API key is your Firebase User ID. Example:
```
5e292193-54fc-49a4-9395-fa7667145400
```

### Step 2: Configure SMTP

Add SMTP settings to your user document in Firebase Firestore:

```javascript
// Go to Firebase Console → Firestore → users → [your-user-id]
{
  smtp: {
    host: "smtp.gmail.com",
    port: 587,
    secure: false,
    user: "your@gmail.com",
    pass: "your-app-password",  // Gmail: Use app-specific password
    fromName: "Your Name"
  }
}
```

### Step 3: Send Your First Email

```bash
curl -X POST https://api-drift-spike.vercel.app/api/send-email \
  -H "x-api-key: YOUR_USER_ID" \
  -H "Content-Type: application/json" \
  -d '{
    "to": "recipient@example.com",
    "subject": "My First Email",
    "html": "<h1>Hello World!</h1><p>This is my first email via DriftSpike API.</p>"
  }'
```

## ✅ Success Response

```json
{
  "success": true,
  "message": "Email sent successfully",
  "user": {
    "id": "your-user-id",
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

## 📊 Check Your Stats

```bash
curl -H "x-api-key: YOUR_USER_ID" \
  https://api-drift-spike.vercel.app/api/get-config
```

## 🎯 Common Use Cases

### Send Email with Attachment

```bash
curl -X POST https://api-drift-spike.vercel.app/api/send-email \
  -H "x-api-key: YOUR_USER_ID" \
  -H "Content-Type: application/json" \
  -d '{
    "to": "user@example.com",
    "subject": "Document Attached",
    "html": "<p>Please find the document attached.</p>",
    "attachments": [{
      "filename": "document.pdf",
      "content": "BASE64_ENCODED_CONTENT",
      "contentType": "application/pdf"
    }]
  }'
```

### Read Unread Messages

```bash
curl -H "x-api-key: YOUR_USER_ID" \
  "https://api-drift-spike.vercel.app/api/read-messages?unreadOnly=true&limit=10"
```

### WebSocket for Real-time Notifications

```javascript
const ws = new WebSocket('wss://api-drift-spike.vercel.app/api/websocket?userId=YOUR_USER_ID');

ws.onmessage = (event) => {
  const data = JSON.parse(event.data);
  if (data.type === 'new_messages') {
    console.log('New emails:', data.messages);
  }
};
```

## 🔧 Gmail Setup

### Enable App Password

1. Go to Google Account Settings
2. Security → 2-Step Verification
3. App passwords → Generate new
4. Use generated password in SMTP config

### SMTP Settings for Gmail

```javascript
{
  smtp: {
    host: "smtp.gmail.com",
    port: 587,
    secure: false,
    user: "your@gmail.com",
    pass: "xxxx xxxx xxxx xxxx",  // 16-character app password
    fromName: "Your Name"
  }
}
```

### IMAP Settings for Gmail

```javascript
{
  imap: {
    host: "imap.gmail.com",
    port: 993,
    secure: true,
    user: "your@gmail.com",
    pass: "xxxx xxxx xxxx xxxx"  // Same app password
  }
}
```

## 💡 Tips

1. **Cache your config** - Don't fetch config on every request
2. **Handle rate limits** - Implement exponential backoff
3. **Use webhooks** - For async email notifications
4. **Monitor health** - Check `/health` endpoint regularly
5. **Upgrade plan** - Get unlimited emails with production plan

## 📚 Next Steps

- Read full documentation: [API_DOCUMENTATION.md](./API_DOCUMENTATION.md)
- Check examples: [examples/](./examples/)
- Monitor health: https://api-drift-spike.vercel.app/api/health

## 🆘 Troubleshooting

### "User not found"
→ Check your API key is correct

### "SMTP connection failed"
→ Verify SMTP credentials in Firestore
→ Use app-specific password for Gmail

### "Rate limit exceeded"
→ Wait 1 minute (starter plan)
→ Upgrade to production plan for 30 req/min

## 📞 Support

- Documentation: [API_DOCUMENTATION.md](./API_DOCUMENTATION.md)
- GitHub: https://github.com/carsupra10/api.DriftSpike
