/**
 * Lightweight local mock API server for manual QA and E2E testing.
 * Provides endpoints specified in §9.5:
 * GET  /200, /400, /401, /403, /404, /422, /429, /500
 * POST /echo (returns submitted payload)
 * GET  /binary (returns 1x1 transparent PNG)
 * GET  /slow (simulates 3 second network latency)
 */
import http from 'node:http';

const PORT = Number(process.env.PORT) || 3099;

// 1x1 transparent PNG binary
const TRANSPARENT_PNG = Buffer.from(
  'iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mNk+M9QDwADhgGAWjR9awAAAABJRU5ErkJggg==',
  'base64'
);

const server = http.createServer(async (req, res) => {
  // CORS headers for easy local testing
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', '*');

  if (req.method === 'OPTIONS') {
    res.writeHead(204);
    res.end();
    return;
  }

  const url = new URL(req.url || '/', `http://localhost:${PORT}`);
  const pathname = url.pathname;

  // Slow response (3 seconds delay)
  if (pathname === '/slow') {
    setTimeout(() => {
      res.writeHead(200, { 'Content-Type': 'application/json' });
      res.end(JSON.stringify({ status: 'ok', delayMs: 3000, timestamp: Date.now() }));
    }, 3000);
    return;
  }

  // Binary response (PNG)
  if (pathname === '/binary') {
    res.writeHead(200, {
      'Content-Type': 'image/png',
      'Content-Length': TRANSPARENT_PNG.length.toString(),
    });
    res.end(TRANSPARENT_PNG);
    return;
  }

  // POST /echo
  if (pathname === '/echo' && req.method === 'POST') {
    let body = '';
    req.on('data', (chunk) => {
      body += chunk;
    });
    req.on('end', () => {
      res.writeHead(200, { 'Content-Type': 'application/json' });
      res.end(
        JSON.stringify({
          receivedHeaders: req.headers,
          receivedBody: body,
          contentType: req.headers['content-type'],
        })
      );
    });
    return;
  }

  // Status code endpoints
  switch (pathname) {
    case '/200':
      res.writeHead(200, { 'Content-Type': 'application/json' });
      res.end(JSON.stringify({ message: 'Success', users: ['alice', 'bob'] }));
      break;

    case '/400':
      res.writeHead(400, { 'Content-Type': 'application/json' });
      res.end(JSON.stringify({ error: 'bad_request', message: 'Payload syntax malformed' }));
      break;

    case '/401':
      res.writeHead(401, {
        'Content-Type': 'application/json',
        'WWW-Authenticate': 'Bearer error="invalid_token"',
      });
      res.end(JSON.stringify({ error: 'unauthorized', message: 'Token missing or expired' }));
      break;

    case '/403':
      res.writeHead(403, { 'Content-Type': 'application/json' });
      res.end(JSON.stringify({ error: 'forbidden', message: 'Insufficient privileges' }));
      break;

    case '/404':
      res.writeHead(404, { 'Content-Type': 'application/json' });
      res.end(JSON.stringify({ error: 'not_found', path: pathname }));
      break;

    case '/422':
      res.writeHead(422, { 'Content-Type': 'application/json' });
      res.end(
        JSON.stringify({
          error: 'validation_failed',
          fields: { email: 'Must be a valid email', age: 'Must be >= 18' },
        })
      );
      break;

    case '/429':
      res.writeHead(429, {
        'Content-Type': 'application/json',
        'Retry-After': '60',
      });
      res.end(JSON.stringify({ error: 'rate_limited', retryAfterSeconds: 60 }));
      break;

    case '/500':
      res.writeHead(500, { 'Content-Type': 'text/html; charset=utf-8' });
      res.end('<html><body><h1>500 Internal Server Error</h1><p>Unhandled exception occurred.</p></body></html>');
      break;

    default:
      res.writeHead(200, { 'Content-Type': 'application/json' });
      res.end(JSON.stringify({ endpoints: ['/200', '/400', '/401', '/403', '/404', '/422', '/429', '/500', '/echo', '/binary', '/slow'] }));
      break;
  }
});

if (process.env.NODE_ENV !== 'test') {
  server.listen(PORT, () => {
    console.log(`[Mock API Server] Running at http://localhost:${PORT}`);
  });
}

export default server;
