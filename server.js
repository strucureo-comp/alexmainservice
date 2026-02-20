import { config } from 'dotenv';
import { existsSync } from 'fs';

// Load .env.local first, then .env as fallback
if (existsSync('.env.local')) {
  config({ path: '.env.local' });
} else {
  config();
}

import http from 'http';
import { URL } from 'url';

// Dynamic import of handlers
const handlers = {
  '/api/health': (await import('./api/health.js')).default,
  '/api/send-email': (await import('./api/send-email.js')).default,
  '/api/read-messages': (await import('./api/read-messages.js')).default,
  '/api/mark-read': (await import('./api/mark-read.js')).default,
  '/api/get-config': (await import('./api/get-config.js')).default,
  '/api/metrics': (await import('./api/metrics.js')).default,
  '/api/webhook': (await import('./api/webhook.js')).default,
  '/api/diagnostic': (await import('./api/diagnostic.js')).default,
};

// Rewrites (same as vercel.json)
const rewrites = {
  '/health': '/api/health',
  '/metrics': '/api/metrics',
};

const PORT = process.env.PORT || 3000;

const server = http.createServer(async (req, res) => {
  // Parse URL
  const parsedUrl = new URL(req.url, `http://localhost:${PORT}`);
  let pathname = parsedUrl.pathname;

  // Apply rewrites
  if (rewrites[pathname]) {
    pathname = rewrites[pathname];
  }

  // CORS headers
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, x-api-key, x-admin-key');

  if (req.method === 'OPTIONS') {
    res.writeHead(204);
    res.end();
    return;
  }

  // Find handler
  const handler = handlers[pathname];
  if (!handler) {
    res.writeHead(404, { 'Content-Type': 'application/json' });
    res.end(JSON.stringify({ error: 'Not found', path: pathname }));
    return;
  }

  // Parse body for POST/PUT
  let body = '';
  if (req.method === 'POST' || req.method === 'PUT') {
    await new Promise((resolve) => {
      req.on('data', chunk => body += chunk);
      req.on('end', resolve);
    });
    try {
      req.body = JSON.parse(body);
    } catch {
      req.body = {};
    }
  }

  // Parse query params
  req.query = Object.fromEntries(parsedUrl.searchParams);

  // Wrap res.json and res.status for Express-like API
  res.status = (code) => {
    res.statusCode = code;
    return res;
  };
  res.json = (data) => {
    res.setHeader('Content-Type', 'application/json');
    res.end(JSON.stringify(data));
  };

  try {
    await handler(req, res);
  } catch (err) {
    console.error(`Error handling ${pathname}:`, err);
    res.writeHead(500, { 'Content-Type': 'application/json' });
    res.end(JSON.stringify({ error: 'Internal server error', details: err.message }));
  }
});

server.listen(PORT, async () => {
  console.log(`\n  Alex API running at http://localhost:${PORT}\n`);
  console.log('  Routes:');
  console.log('    GET  /health           - Health check');
  console.log('    GET  /api/get-config   - Get config');
  console.log('    POST /api/send-email   - Send email');
  console.log('    GET  /api/read-messages - Read emails (IMAP)');
  console.log('    POST /api/mark-read    - Mark message as read');
  console.log('    GET  /api/webhook      - Get webhook config');
  console.log('    POST /api/webhook      - Test webhook');
  console.log('    GET  /metrics          - Admin metrics');
  console.log(`\n  API Key: ${process.env.API_KEY || '(not set)'}`);
  
  // Start webhook monitor if configured
  if (process.env.WEBHOOK_URL) {
    const { startWebhookMonitor } = await import('./lib/webhook-monitor.js');
    const interval = parseInt(process.env.WEBHOOK_CHECK_INTERVAL || '30', 10);
    startWebhookMonitor(interval);
    console.log(`\n  Webhook Monitor: ACTIVE`);
    console.log(`  Webhook URL: ${process.env.WEBHOOK_URL}`);
    console.log(`  Check interval: ${interval}s\n`);
  } else {
    console.log(`\n  Webhook Monitor: DISABLED (set WEBHOOK_URL to enable)\n`);
  }
});
