import { getUser } from '../lib/env-config.js';

let healthMetrics = {
  uptime: Date.now(),
  requests: 0,
  errors: 0,
  avgResponseTime: 0,
  lastCheck: Date.now()
};

export default async function handler(req, res) {
  const startTime = Date.now();
  healthMetrics.requests++;

  try {
    // Check env config is valid
    let configError = null;
    try {
      const user = getUser();
      if (!user.smtp_host || !user.smtp_user) {
        configError = new Error('SMTP not configured in env');
      }
    } catch (err) {
      configError = err;
    }

    const responseTime = Date.now() - startTime;
    healthMetrics.avgResponseTime = (healthMetrics.avgResponseTime + responseTime) / 2;
    healthMetrics.lastCheck = Date.now();

    const health = {
      status: configError ? 'degraded' : 'healthy',
      timestamp: new Date().toISOString(),
      uptime: Date.now() - healthMetrics.uptime,
      config: {
        status: configError ? 'error' : 'ok',
        error: configError?.message
      },
      metrics: {
        totalRequests: healthMetrics.requests,
        totalErrors: healthMetrics.errors,
        avgResponseTime: `${Math.round(healthMetrics.avgResponseTime)}ms`,
        errorRate: `${((healthMetrics.errors / healthMetrics.requests) * 100).toFixed(2)}%`
      },
      performance: {
        responseTime: `${responseTime}ms`,
        memoryUsage: process.memoryUsage(),
        nodeVersion: process.version
      }
    };

    res.setHeader('Cache-Control', 'no-cache');
    return res.status(configError ? 503 : 200).json(health);

  } catch (error) {
    healthMetrics.errors++;
    return res.status(503).json({
      status: 'unhealthy',
      error: error.message,
      timestamp: new Date().toISOString()
    });
  }
}