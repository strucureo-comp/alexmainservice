import nodemailer from 'nodemailer';
import NodeCache from 'node-cache';

// Global connection pools
const smtpPool = new Map();
const cache = new NodeCache({ 
  stdTTL: 300,
  checkperiod: 60,
  useClones: false
});

// SMTP connection pooling with reuse
export function getSmtpTransporter(smtpConfig) {
  const key = `${smtpConfig.smtp_host}_${smtpConfig.smtp_port}_${smtpConfig.smtp_user}`;
  
  if (!smtpPool.has(key)) {
    const transporter = nodemailer.createTransport({
      host: smtpConfig.smtp_host,
      port: smtpConfig.smtp_port,
      secure: smtpConfig.smtp_secure,
      auth: {
        user: smtpConfig.smtp_user,
        pass: smtpConfig.smtp_pass
      },
      pool: true,
      maxConnections: 10,
      maxMessages: 100,
      rateLimit: 50,
      rateDelta: 1000,
      connectionTimeout: 60000,
      greetingTimeout: 30000,
      socketTimeout: 60000
    });
    
    smtpPool.set(key, transporter);
  }
  
  return smtpPool.get(key);
}

// Cache operations
export const cacheGet = (key) => cache.get(key);
export const cacheSet = (key, value, ttl = 300) => cache.set(key, value, ttl);
export const cacheDel = (key) => cache.del(key);

// Cleanup function for graceful shutdown
export function cleanup() {
  for (const [key, transporter] of smtpPool) {
    transporter.close();
  }
  smtpPool.clear();
  cache.flushAll();
}