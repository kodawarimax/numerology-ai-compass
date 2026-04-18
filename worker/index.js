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

// --- Per-IP rate limiter ---
const ipLimits = new Map();
const IP_WINDOW = 60000;
const IP_MAX = 10;

function checkIpLimit(ip) {
  const now = Date.now();
  const entry = ipLimits.get(ip);
  if (!entry || now - entry.start > IP_WINDOW) {
    ipLimits.set(ip, { start: now, count: 1 });
    return true;
  }
  entry.count++;
  return entry.count <= IP_MAX;
}

// --- Global RPM limiter (protects shared Gemini quota) ---
// Note: Cloudflare Workers have per-isolate memory. Multiple edge locations
// each track their own counters. For a ~100 user/day app this is acceptable.
const globalTimestamps = [];
const GLOBAL_RPM_MAX = 12; // Gemini 2.5 Flash = 15 RPM, keep 3 buffer

function checkGlobalRpm() {
  const now = Date.now();
  // Remove entries older than 60s
  while (globalTimestamps.length > 0 && now - globalTimestamps[0] > 60000) {
    globalTimestamps.shift();
  }
  return globalTimestamps.length < GLOBAL_RPM_MAX;
}

function recordGlobalRequest() {
  globalTimestamps.push(Date.now());
}

// --- Global RPD limiter ---
let dailyCount = 0;
let dailyDate = '';
const DAILY_MAX = 900; // Gemini free tier = 1000 RPD, keep 100 buffer

function checkGlobalRpd() {
  const today = new Date().toISOString().slice(0, 10);
  if (today !== dailyDate) {
    dailyDate = today;
    dailyCount = 0;
  }
  return dailyCount < DAILY_MAX;
}

function recordDailyRequest() {
  dailyCount++;
}

// --- Cleanup stale IP entries ---
function cleanupIpLimits() {
  const now = Date.now();
  for (const [ip, entry] of ipLimits) {
    if (now - entry.start > IP_WINDOW * 2) ipLimits.delete(ip);
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

    // Per-IP rate limit
    const clientIp = request.headers.get('CF-Connecting-IP') || 'unknown';
    if (!checkIpLimit(clientIp)) {
      cleanupIpLimits();
      return new Response(JSON.stringify({
        error: 'リクエスト頻度が高すぎます。1分後に再度お試しください',
        retryAfter: 60,
      }), {
        status: 429,
        headers: { ...headers, 'Content-Type': 'application/json', 'Retry-After': '60' },
      });
    }

    // Global daily limit
    if (!checkGlobalRpd()) {
      return new Response(JSON.stringify({
        error: '本日のAI分析の上限に達しました。明日もう一度お試しください',
        retryAfter: 3600,
      }), {
        status: 429,
        headers: { ...headers, 'Content-Type': 'application/json', 'Retry-After': '3600' },
      });
    }

    // Global RPM limit with burst absorption (wait up to 4s)
    if (!checkGlobalRpm()) {
      await new Promise(r => setTimeout(r, 4000));
      if (!checkGlobalRpm()) {
        return new Response(JSON.stringify({
          error: '現在アクセスが集中しています。30秒後に再度お試しください',
          retryAfter: 30,
        }), {
          status: 429,
          headers: { ...headers, 'Content-Type': 'application/json', 'Retry-After': '30' },
        });
      }
    }

    try {
      const body = await request.text();

      // Validate request body size (max 10MB)
      if (body.length > 10 * 1024 * 1024) {
        return new Response(JSON.stringify({ error: 'リクエストが大きすぎます' }), {
          status: 413,
          headers: { ...headers, 'Content-Type': 'application/json' },
        });
      }

      // Record request for global counters
      recordGlobalRequest();
      recordDailyRequest();

      const geminiUrl = `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent?key=${env.GEMINI_API_KEY}`;

      // Fetch with 25s timeout (within CF Workers limits)
      const controller = new AbortController();
      const timer = setTimeout(() => controller.abort(), 25000);

      const resp = await fetch(geminiUrl, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body,
        signal: controller.signal,
      });

      clearTimeout(timer);

      // Wrap non-OK Gemini responses with structured error
      if (!resp.ok) {
        const errText = await resp.text().catch(() => '');
        return new Response(JSON.stringify({
          error: `AI分析エラー (${resp.status})`,
          retryAfter: resp.status === 429 ? 60 : 0,
          detail: errText.slice(0, 200),
        }), {
          status: resp.status,
          headers: { ...headers, 'Content-Type': 'application/json' },
        });
      }

      const data = await resp.text();
      return new Response(data, {
        status: 200,
        headers: { ...headers, 'Content-Type': 'application/json' },
      });
    } catch (e) {
      const isTimeout = e.name === 'AbortError';
      return new Response(JSON.stringify({
        error: isTimeout
          ? 'AIサーバーの応答がタイムアウトしました。再度お試しください'
          : e.message,
        retryAfter: isTimeout ? 10 : 0,
      }), {
        status: isTimeout ? 504 : 500,
        headers: { ...headers, 'Content-Type': 'application/json' },
      });
    }
  },
};
