import http from 'http';

const PORT = 4000;

const server = http.createServer((req, res) => {
  res.setHeader('Content-Type', 'application/json');
  
  if (req.method === 'POST' && req.url === '/webhook/new-email') {
    let body = '';
    req.on('data', chunk => body += chunk);
    req.on('end', () => {
      try {
        const data = JSON.parse(body);
        console.log('\n🔔 WEBHOOK RECEIVED:');
        console.log(`   Event: ${data.event}`);
        console.log(`   Time: ${data.timestamp}`);
        console.log(`   New emails: ${data.count}`);
        if (data.emails && data.emails.length > 0) {
          console.log(`   From: ${data.emails[0].from}`);
          console.log(`   Subject: ${data.emails[0].subject}`);
        }
        console.log('');
        
        res.writeHead(200);
        res.end(JSON.stringify({ success: true, received: data.count }));
      } catch (err) {
        res.writeHead(400);
        res.end(JSON.stringify({ error: 'Invalid JSON' }));
      }
    });
    return;
  }

  res.writeHead(404);
  res.end(JSON.stringify({ error: 'Not found' }));
});

server.listen(PORT, () => {
  console.log(`\n📨 Webhook Receiver running at http://localhost:${PORT}/webhook/new-email\n`);
});
