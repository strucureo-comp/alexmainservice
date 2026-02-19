import { WebSocketServer } from 'ws';
import { authenticate, getUser } from '../lib/env-config.js';
import { getImapConnection, connectImap, listenForNewMessages, registerWebSocket, unregisterWebSocket, notifyUser } from '../lib/imap-manager.js';

// This will be initialized once
let wss = null;
const userImapListeners = new Map();

export default async function handler(req, res) {
  // Upgrade HTTP connection to WebSocket
  if (req.headers.upgrade !== 'websocket') {
    return res.status(426).json({ error: 'Upgrade Required' });
  }

  // Initialize WebSocket server if not already done
  if (!wss) {
    wss = new WebSocketServer({ noServer: true });
    
    wss.on('connection', async (ws, request) => {
      console.log('New WebSocket connection');

      // Authenticate via query param or header
      const url = new URL(request.url, `http://${request.headers.host}`);
      const apiKey = url.searchParams.get('apiKey') || request.headers['x-api-key'];

      if (!apiKey || apiKey !== process.env.API_KEY) {
        ws.send(JSON.stringify({ error: 'Invalid API key' }));
        ws.close();
        return;
      }

      try {
        const user = getUser();
        const userId = user.id;

        if (!user.imap_host || !user.imap_user || !user.imap_pass) {
          ws.send(JSON.stringify({ error: 'IMAP not configured' }));
          ws.close();
          return;
        }

        // Register WebSocket connection
        registerWebSocket(userId, ws);

        // Send connection success message
        ws.send(JSON.stringify({
          type: 'connected',
          message: 'WebSocket connected successfully',
          userId: userId
        }));

        // Set up IMAP listener if not already listening
        if (!userImapListeners.has(userId)) {
          const imap = getImapConnection({
            imap_host: user.imap_host,
            imap_port: user.imap_port,
            imap_secure: user.imap_secure,
            imap_user: user.imap_user,
            imap_pass: user.imap_pass
          });

          await connectImap(imap);

          // Listen for new messages
          listenForNewMessages(imap, userId, (uid, messages) => {
            notifyUser(uid, {
              type: 'new_messages',
              count: messages.length,
              messages: messages,
              timestamp: new Date().toISOString()
            });
          });

          userImapListeners.set(userId, imap);
        }

        // Handle incoming messages from client
        ws.on('message', (data) => {
          try {
            const message = JSON.parse(data.toString());
            
            if (message.type === 'ping') {
              ws.send(JSON.stringify({ type: 'pong', timestamp: Date.now() }));
            }
          } catch (err) {
            console.error('Error parsing message:', err);
          }
        });

        // Handle disconnection
        ws.on('close', () => {
          console.log('WebSocket disconnected');
          unregisterWebSocket(userId, ws);
          
          // If no more connections for this user, stop IMAP listener
          // (Optional: you might want to keep it running)
        });

        ws.on('error', (error) => {
          console.error('WebSocket error:', error);
          unregisterWebSocket(userId, ws);
        });

      } catch (error) {
        console.error('WebSocket setup error:', error);
        ws.send(JSON.stringify({ error: 'Setup failed', details: error.message }));
        ws.close();
      }
    });
  }

  // Upgrade the connection
  wss.handleUpgrade(req, req.socket, Buffer.alloc(0), (ws) => {
    wss.emit('connection', ws, req);
  });
}