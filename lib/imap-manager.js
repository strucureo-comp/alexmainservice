import Imap from 'imap';
import { simpleParser } from 'mailparser';
import NodeCache from 'node-cache';

// IMAP connection pool
const imapPool = new Map();
const messageCache = new NodeCache({ 
  stdTTL: 600, // 10 minutes cache
  checkperiod: 120 
});

// Active WebSocket connections for real-time updates
const activeConnections = new Map();

export function getImapConnection(imapConfig) {
  const key = `${imapConfig.imap_host}_${imapConfig.imap_user}`;
  
  if (!imapPool.has(key)) {
    const imap = new Imap({
      user: imapConfig.imap_user,
      password: imapConfig.imap_pass,
      host: imapConfig.imap_host,
      port: imapConfig.imap_port || 993,
      tls: imapConfig.imap_secure !== false,
      tlsOptions: { rejectUnauthorized: false },
      keepalive: {
        interval: 10000,
        idleInterval: 300000,
        forceNoop: true
      }
    });
    
    imapPool.set(key, imap);
  }
  
  return imapPool.get(key);
}

export async function connectImap(imap) {
  return new Promise((resolve, reject) => {
    if (imap.state === 'authenticated') {
      resolve(imap);
      return;
    }
    
    imap.once('ready', () => resolve(imap));
    imap.once('error', reject);
    
    if (imap.state === 'disconnected') {
      imap.connect();
    }
  });
}

export async function fetchMessages(imap, options = {}) {
  const {
    mailbox = 'INBOX',
    limit = 50,
    unreadOnly = false,
    since = null
  } = options;

  return new Promise((resolve, reject) => {
    imap.openBox(mailbox, false, (err, box) => {
      if (err) {
        reject(err);
        return;
      }

      // Build search criteria
      let searchCriteria = ['ALL'];
      if (unreadOnly) {
        searchCriteria = ['UNSEEN'];
      }
      if (since) {
        searchCriteria = [['SINCE', since]];
      }

      imap.search(searchCriteria, (err, results) => {
        if (err) {
          reject(err);
          return;
        }

        if (!results || results.length === 0) {
          resolve([]);
          return;
        }

        // Get latest messages (limit)
        const messageIds = results.slice(-limit);
        const messages = [];

        const fetch = imap.fetch(messageIds, {
          bodies: '',
          struct: true
        });

        fetch.on('message', (msg, seqno) => {
          let buffer = '';
          let attributes = null;

          msg.on('body', (stream) => {
            stream.on('data', (chunk) => {
              buffer += chunk.toString('utf8');
            });
          });

          msg.once('attributes', (attrs) => {
            attributes = attrs;
          });

          msg.once('end', () => {
            simpleParser(buffer, (err, parsed) => {
              if (err) {
                console.error('Parse error:', err);
                return;
              }

              messages.push({
                id: attributes.uid,
                seqno: seqno,
                flags: attributes.flags,
                date: parsed.date,
                from: parsed.from?.text || '',
                to: parsed.to?.text || '',
                subject: parsed.subject || '',
                text: parsed.text || '',
                html: parsed.html || '',
                attachments: parsed.attachments?.map(att => ({
                  filename: att.filename,
                  contentType: att.contentType,
                  size: att.size
                })) || [],
                unread: !attributes.flags.includes('\\Seen')
              });
            });
          });
        });

        fetch.once('error', reject);

        fetch.once('end', () => {
          setTimeout(() => resolve(messages), 500);
        });
      });
    });
  });
}

export async function markAsRead(imap, messageId) {
  return new Promise((resolve, reject) => {
    imap.openBox('INBOX', false, (err) => {
      if (err) {
        reject(err);
        return;
      }

      imap.addFlags(messageId, ['\\Seen'], (err) => {
        if (err) {
          reject(err);
          return;
        }
        resolve(true);
      });
    });
  });
}

export async function deleteMessage(imap, messageId) {
  return new Promise((resolve, reject) => {
    imap.openBox('INBOX', false, (err) => {
      if (err) {
        reject(err);
        return;
      }

      imap.addFlags(messageId, ['\\Deleted'], (err) => {
        if (err) {
          reject(err);
          return;
        }

        imap.expunge((err) => {
          if (err) {
            reject(err);
            return;
          }
          resolve(true);
        });
      });
    });
  });
}

// Listen for new messages (for WebSocket notifications)
export function listenForNewMessages(imap, userId, callback) {
  imap.openBox('INBOX', false, (err) => {
    if (err) {
      console.error('Error opening inbox:', err);
      return;
    }

    imap.on('mail', (numNewMsgs) => {
      console.log(`New mail detected: ${numNewMsgs} messages`);
      
      // Fetch the new messages
      fetchMessages(imap, { limit: numNewMsgs, unreadOnly: true })
        .then(messages => {
          callback(userId, messages);
        })
        .catch(err => {
          console.error('Error fetching new messages:', err);
        });
    });
  });
}

// WebSocket connection management
export function registerWebSocket(userId, ws) {
  if (!activeConnections.has(userId)) {
    activeConnections.set(userId, new Set());
  }
  activeConnections.get(userId).add(ws);
}

export function unregisterWebSocket(userId, ws) {
  if (activeConnections.has(userId)) {
    activeConnections.get(userId).delete(ws);
    if (activeConnections.get(userId).size === 0) {
      activeConnections.delete(userId);
    }
  }
}

export function notifyUser(userId, message) {
  if (activeConnections.has(userId)) {
    const connections = activeConnections.get(userId);
    connections.forEach(ws => {
      if (ws.readyState === 1) { // WebSocket.OPEN
        ws.send(JSON.stringify(message));
      }
    });
  }
}

// Cache operations
export const getCachedMessages = (key) => messageCache.get(key);
export const setCachedMessages = (key, value, ttl = 600) => messageCache.set(key, value, ttl);
export const clearMessageCache = (key) => messageCache.del(key);