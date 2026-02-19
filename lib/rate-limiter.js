import NodeCache from 'node-cache';

const rateLimitCache = new NodeCache({ 
  stdTTL: 3600, // 1 hour window
  checkperiod: 120 
});

// Rate limiting configuration based on pricing tiers
const RATE_LIMITS = {
  starter: {
    requests_per_minute: 1,
    requests_per_hour: 60, // 1 per minute * 60 minutes
    emails_per_month: 1500,
    concurrent_requests: 1,
    plan_name: 'Starter'
  },
  production: {
    requests_per_minute: 30,
    requests_per_hour: 1800, // 30 per minute * 60 minutes
    emails_per_month: Infinity,
    concurrent_requests: 10,
    plan_name: 'Production'
  },
  // Legacy support for existing users
  free: {
    requests_per_minute: 1,
    requests_per_hour: 60,
    emails_per_month: 1500,
    concurrent_requests: 1,
    plan_name: 'Starter'
  },
  premium: {
    requests_per_minute: 30,
    requests_per_hour: 1800,
    emails_per_month: Infinity,
    concurrent_requests: 10,
    plan_name: 'Production'
  }
};

// Track concurrent requests per user
const concurrentRequests = new Map();

export function checkRateLimit(userId, planType = 'starter') {
  const now = Date.now();
  const minuteKey = `rate_minute_${userId}_${Math.floor(now / 60000)}`;
  const hourKey = `rate_hour_${userId}_${Math.floor(now / 3600000)}`;
  const concurrentKey = `concurrent_${userId}`;
  
  const limits = RATE_LIMITS[planType] || RATE_LIMITS.starter;
  
  // Check concurrent requests
  const concurrent = concurrentRequests.get(concurrentKey) || 0;
  if (concurrent >= limits.concurrent_requests) {
    return {
      allowed: false,
      error: `Too many concurrent requests (max ${limits.concurrent_requests} for ${limits.plan_name} plan)`,
      retryAfter: 1,
      limits: limits
    };
  }
  
  // Check per-minute rate limit
  const minuteCount = rateLimitCache.get(minuteKey) || 0;
  if (minuteCount >= limits.requests_per_minute) {
    return {
      allowed: false,
      error: `Rate limit exceeded: ${limits.requests_per_minute} requests per minute for ${limits.plan_name} plan`,
      retryAfter: 60 - (now % 60000) / 1000,
      limits: limits
    };
  }
  
  // Check hourly rate limit
  const hourlyCount = rateLimitCache.get(hourKey) || 0;
  if (hourlyCount >= limits.requests_per_hour) {
    return {
      allowed: false,
      error: `Hourly rate limit exceeded: ${limits.requests_per_hour} requests per hour for ${limits.plan_name} plan`,
      retryAfter: 3600 - (now % 3600000) / 1000,
      limits: limits
    };
  }
  
  // Increment counters
  rateLimitCache.set(minuteKey, minuteCount + 1, 60); // 1 minute TTL
  rateLimitCache.set(hourKey, hourlyCount + 1, 3600); // 1 hour TTL
  concurrentRequests.set(concurrentKey, concurrent + 1);
  
  return { 
    allowed: true, 
    limits: limits,
    usage: {
      minute: minuteCount + 1,
      hour: hourlyCount + 1,
      concurrent: concurrent + 1
    }
  };
}

export function releaseRequest(userId) {
  const concurrentKey = `concurrent_${userId}`;
  const current = concurrentRequests.get(concurrentKey) || 0;
  if (current > 0) {
    concurrentRequests.set(concurrentKey, current - 1);
  }
}

// Input validation with performance optimization
export function validateEmailRequest(body) {
  const { to, subject, html, attachments } = body;
  
  // Fast validation checks
  if (!to || typeof to !== 'string' || to.length > 254) {
    return { valid: false, error: 'Invalid recipient email' };
  }
  
  if (!subject || typeof subject !== 'string' || subject.length > 998) {
    return { valid: false, error: 'Invalid subject' };
  }
  
  if (!html || typeof html !== 'string' || html.length > 1048576) { // 1MB limit
    return { valid: false, error: 'Invalid or too large HTML content' };
  }
  
  // Email regex (optimized)
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (!emailRegex.test(to)) {
    return { valid: false, error: 'Invalid email format' };
  }
  
  // Validate attachments
  if (attachments) {
    if (!Array.isArray(attachments) || attachments.length > 10) {
      return { valid: false, error: 'Invalid attachments (max 10)' };
    }
    
    let totalSize = 0;
    for (const attachment of attachments) {
      if (!attachment.filename || !attachment.content) {
        return { valid: false, error: 'Invalid attachment format' };
      }
      
      // Estimate base64 size (rough calculation)
      totalSize += attachment.content.length * 0.75;
      if (totalSize > 25 * 1024 * 1024) { // 25MB total limit
        return { valid: false, error: 'Attachments too large (max 25MB total)' };
      }
    }
  }
  
  return { valid: true };
}