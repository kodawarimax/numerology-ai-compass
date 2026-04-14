const ALLOWED_ORIGINS = [
  'https://kodawarimax.github.io',
  'http://localhost:8080',
  'http://localhost:3000',
];

function corsHeaders(origin) {
  return {
    'Access-Control-Allow-Origin': ALLOWED_ORIGINS.includes(origin) ? origin : '',
    'Access-Control-Allow-Methods': 'POST, OPTIONS',
    'Access-Control-Allow-Headers': 'Content-Type',
    'Access-Control-Max-Age': '86400',
  };
}

// Simple in-memory rate limiter per IP (resets on worker restart)
const rateLimits = new Map();
const RATE_LIMIT_WINDOW = 60000; // 1 minute
const RATE_LIMIT_MAX = 10; // max 10 requests per minute per IP

function checkRateLimit(ip) {
  const now = Date.now();
  const entry = rateLimits.get(ip);
  if (!entry || now - entry.start > RATE_LIMIT_WINDOW) {
    rateLimits.set(ip, { start: now, count: 1 });
    return true;
  }
  entry.count++;
  if (entry.count > RATE_LIMIT_MAX) return false;
  return true;
}

// Cleanup old entries periodically (prevent memory leak)
function cleanupRateLimits() {
  const now = Date.now();
  for (const [ip, entry] of rateLimits) {
    if (now - entry.start > RATE_LIMIT_WINDOW * 2) rateLimits.delete(ip);
  }
}

export default {
  async fetch(request, env) {
    const origin = request.headers.get('Origin') || '';
    const headers = corsHeaders(origin);

    if (request.method === 'OPTIONS') {
      return new Response(null, { status: 204, headers });
    }

    if (request.method !== 'POST') {
      return new Response(JSON.stringify({ error: 'Method not allowed' }), {
        status: 405,
        headers: { ...headers, 'Content-Type': 'application/json' },
      });
    }

    if (!ALLOWED_ORIGINS.includes(origin)) {
      return new Response(JSON.stringify({ error: 'Forbidden' }), {
        status: 403,
        headers: { 'Content-Type': 'application/json' },
      });
    }

    // Rate limiting per IP
    const clientIp = request.headers.get('CF-Connecting-IP') || 'unknown';
    if (!checkRateLimit(clientIp)) {
      cleanupRateLimits();
      return new Response(JSON.stringify({ error: 'Rate limit exceeded. Please wait a moment.' }), {
        status: 429,
        headers: { ...headers, 'Content-Type': 'application/json', 'Retry-After': '60' },
      });
    }

    try {
      const body = await request.text();

      // Validate request body size (max 10MB for images)
      if (body.length > 10 * 1024 * 1024) {
        return new Response(JSON.stringify({ error: 'Request too large' }), {
          status: 413,
          headers: { ...headers, 'Content-Type': 'application/json' },
        });
      }

      const geminiUrl = `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent?key=${env.GEMINI_API_KEY}`;

      const resp = await fetch(geminiUrl, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body,
      });

      const data = await resp.text();
      return new Response(data, {
        status: resp.status,
        headers: { ...headers, 'Content-Type': 'application/json' },
      });
    } catch (e) {
      return new Response(JSON.stringify({ error: e.message }), {
        status: 500,
        headers: { ...headers, 'Content-Type': 'application/json' },
      });
    }
  },
};
