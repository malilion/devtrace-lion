import http from 'node:http';
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import puppeteer from 'puppeteer-core';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const rootDir = path.resolve(__dirname, '..');
const outputDir = path.resolve(rootDir, '.output/chrome-mv3');
const storeAssetsDir = path.resolve(rootDir, 'store-assets');

if (!fs.existsSync(storeAssetsDir)) {
  fs.mkdirSync(storeAssetsDir, { recursive: true });
}

// 1. Simple static HTTP server for .output/chrome-mv3
const mimeTypes = {
  '.html': 'text/html; charset=utf-8',
  '.js': 'application/javascript; charset=utf-8',
  '.css': 'text/css; charset=utf-8',
  '.png': 'image/png',
  '.jpg': 'image/jpeg',
  '.jpeg': 'image/jpeg',
  '.json': 'application/json',
  '.svg': 'image/svg+xml',
};

const server = http.createServer((req, res) => {
  let reqPath = req.url.split('?')[0];
  if (reqPath === '/' || reqPath === '') reqPath = '/panel.html';
  const filePath = path.join(outputDir, reqPath);

  if (fs.existsSync(filePath) && fs.statSync(filePath).isFile()) {
    const ext = path.extname(filePath).toLowerCase();
    res.writeHead(200, { 'Content-Type': mimeTypes[ext] || 'application/octet-stream' });
    fs.createReadStream(filePath).pipe(res);
  } else {
    res.writeHead(404, { 'Content-Type': 'text/plain' });
    res.end('Not found');
  }
});

await new Promise((resolve) => server.listen(8765, resolve));
console.log('Static server listening on http://localhost:8765');

const browser = await puppeteer.launch({
  executablePath: '/Applications/Google Chrome.app/Contents/MacOS/Google Chrome',
  headless: true,
  args: ['--no-sandbox', '--disable-setuid-sandbox', '--force-device-scale-factor=1']
});

try {
  const page = await browser.newPage();
  await page.setViewport({ width: 1280, height: 800 });

  // Load standalone panel with mock data
  await page.goto('http://localhost:8765/panel.html?mock=1', { waitUntil: 'networkidle0' });
  await new Promise(r => setTimeout(r, 1200));

  // Enable Dark Theme
  await page.evaluate(() => {
    document.documentElement.classList.add('dark');
  });
  await new Promise(r => setTimeout(r, 300));

  // Function to click a row in RequestTable
  async function selectRowByUrl(urlSnippet) {
    return await page.evaluate((snippet) => {
      const rows = Array.from(document.querySelectorAll('tbody tr'));
      for (const row of rows) {
        if (row.textContent.includes(snippet)) {
          row.click();
          return true;
        }
      }
      return false;
    }, urlSnippet);
  }

  // Function to click detail tab
  async function switchDetailTab(tabName) {
    return await page.evaluate((name) => {
      const buttons = Array.from(document.querySelectorAll('button'));
      const target = buttons.find(b => {
        const text = b.textContent.trim().toLowerCase();
        return text.startsWith(name.toLowerCase());
      });
      if (target) {
        target.click();
        return true;
      }
      return false;
    }, tabName);
  }

  // --- SCREENSHOT 1: Headers Tab with Redacted Secrets (1280x800) ---
  console.log('Capturing Screenshot 1: Overview & Protected Headers (1280x800)...');
  await selectRowByUrl('/v1/profile/me');
  await new Promise(r => setTimeout(r, 400));
  await switchDetailTab('Headers');
  await new Promise(r => setTimeout(r, 400));
  await page.screenshot({
    path: path.join(storeAssetsDir, 'screenshot-1-overview.jpg'),
    type: 'jpeg',
    quality: 95
  });

  // --- SCREENSHOT 2: Code Gen Tab (1280x800) ---
  console.log('Capturing Screenshot 2: Multi-Language Code Gen (1280x800)...');
  await switchDetailTab('Code Gen');
  await new Promise(r => setTimeout(r, 400));
  await page.screenshot({
    path: path.join(storeAssetsDir, 'screenshot-2-codegen.jpg'),
    type: 'jpeg',
    quality: 95
  });

  // --- SCREENSHOT 3: JSON Diff Modal (1280x800) ---
  console.log('Capturing Screenshot 3: Response Diff (1280x800)...');
  await page.evaluate(() => {
    const buttons = Array.from(document.querySelectorAll('button'));
    const diffBtn = buttons.find(b => b.textContent.includes('Diff'));
    if (diffBtn) diffBtn.click();
  });
  await new Promise(r => setTimeout(r, 600));
  await page.screenshot({
    path: path.join(storeAssetsDir, 'screenshot-3-diff.jpg'),
    type: 'jpeg',
    quality: 95
  });

  // Close Diff Modal via the Close button inside the modal
  await page.evaluate(() => {
    const buttons = Array.from(document.querySelectorAll('button'));
    const closeBtn = buttons.find(b => b.textContent.trim() === 'Close');
    if (closeBtn) closeBtn.click();
  });
  await new Promise(r => setTimeout(r, 500));

  // --- SCREENSHOT 4: Status Insights Tab (1280x800) ---
  console.log('Capturing Screenshot 4: Status Insights (1280x800)...');
  await selectRowByUrl('/v1/profile/me');
  await new Promise(r => setTimeout(r, 400));
  await switchDetailTab('Insights');
  await new Promise(r => setTimeout(r, 500));
  await page.screenshot({
    path: path.join(storeAssetsDir, 'screenshot-4-insights.jpg'),
    type: 'jpeg',
    quality: 95
  });

  // --- SCREENSHOT 5: Local Reveal & Safe Redaction (1280x800) ---
  console.log('Capturing Screenshot 5: Reveal Locally & Redaction Banner (1280x800)...');
  await selectRowByUrl('/v1/auth/register');
  await new Promise(r => setTimeout(r, 400));
  await switchDetailTab('Payload');
  await new Promise(r => setTimeout(r, 400));
  // Click Reveal Locally button
  await page.evaluate(() => {
    const buttons = Array.from(document.querySelectorAll('button'));
    const revealBtn = buttons.find(b => b.textContent.includes('Reveal Locally'));
    if (revealBtn) revealBtn.click();
  });
  await new Promise(r => setTimeout(r, 500));
  await page.screenshot({
    path: path.join(storeAssetsDir, 'screenshot-5-reveal.jpg'),
    type: 'jpeg',
    quality: 95
  });

  console.log('Generating Small Promo Tile (440x280)...');
  const logoBase64 = fs.readFileSync(path.join(rootDir, 'public/logo.png')).toString('base64');
  const promoSmallHtml = `
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <style>
    * { margin: 0; padding: 0; box-sizing: border-box; }
    body {
      width: 440px;
      height: 280px;
      background: radial-gradient(circle at 50% 30%, #1e293b 0%, #090d16 100%);
      font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, "Helvetica Neue", sans-serif;
      color: #f8fafc;
      display: flex;
      flex-direction: column;
      align-items: center;
      justify-content: center;
      text-align: center;
      position: relative;
      overflow: hidden;
      border: 1px solid rgba(255,255,255,0.08);
    }
    .grid-bg {
      position: absolute;
      inset: 0;
      background-image: linear-gradient(rgba(255,255,255,0.03) 1px, transparent 1px),
                        linear-gradient(90deg, rgba(255,255,255,0.03) 1px, transparent 1px);
      background-size: 20px 20px;
      pointer-events: none;
    }
    .glow {
      position: absolute;
      top: 15%;
      width: 160px;
      height: 160px;
      background: radial-gradient(circle, rgba(245, 158, 11, 0.25) 0%, transparent 70%);
      border-radius: 50%;
      pointer-events: none;
      filter: blur(20px);
    }
    .logo-box {
      position: relative;
      width: 72px;
      height: 72px;
      margin-bottom: 12px;
      border-radius: 18px;
      box-shadow: 0 10px 25px -5px rgba(0,0,0,0.5), 0 0 0 1px rgba(251, 191, 36, 0.3);
      overflow: hidden;
      background: #000;
    }
    .logo-box img {
      width: 100%;
      height: 100%;
      object-fit: cover;
    }
    .title {
      font-size: 24px;
      font-weight: 800;
      letter-spacing: -0.5px;
      background: linear-gradient(135deg, #ffffff 30%, #fbbf24 100%);
      -webkit-background-clip: text;
      -webkit-text-fill-color: transparent;
      margin-bottom: 4px;
    }
    .subtitle {
      font-size: 12px;
      color: #94a3b8;
      font-weight: 500;
      margin-bottom: 14px;
      letter-spacing: 0.3px;
    }
    .badges {
      display: flex;
      gap: 6px;
    }
    .badge {
      font-size: 10px;
      font-weight: 600;
      padding: 3px 8px;
      border-radius: 12px;
      background: rgba(255,255,255,0.06);
      border: 1px solid rgba(255,255,255,0.1);
      color: #cbd5e1;
    }
    .badge-primary {
      background: rgba(16, 185, 129, 0.15);
      border-color: rgba(16, 185, 129, 0.3);
      color: #34d399;
    }
  </style>
</head>
<body>
  <div class="grid-bg"></div>
  <div class="glow"></div>
  <div class="logo-box">
    <img src="data:image/png;base64,${logoBase64}" alt="Logo" />
  </div>
  <div class="title">DevTrace Lion</div>
  <div class="subtitle">API Debugging inside DevTools</div>
  <div class="badges">
    <span class="badge badge-primary">🛡️ Zero Permissions</span>
    <span class="badge">🔒 Secrets Redacted</span>
    <span class="badge">⚡ Local-First</span>
  </div>
</body>
</html>
`;

  await page.setViewport({ width: 440, height: 280 });
  await page.setContent(promoSmallHtml);
  await page.screenshot({
    path: path.join(storeAssetsDir, 'promo-small-440x280.jpg'),
    type: 'jpeg',
    quality: 98
  });

  console.log('Generating Marquee Promo Tile (1400x560)...');
  const promoMarqueeHtml = `
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <style>
    * { margin: 0; padding: 0; box-sizing: border-box; }
    body {
      width: 1400px;
      height: 560px;
      background: radial-gradient(circle at 25% 40%, #1e293b 0%, #090d16 100%);
      font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, "Helvetica Neue", sans-serif;
      color: #f8fafc;
      display: flex;
      align-items: center;
      justify-content: space-between;
      padding: 0 80px;
      position: relative;
      overflow: hidden;
    }
    .grid-bg {
      position: absolute;
      inset: 0;
      background-image: linear-gradient(rgba(255,255,255,0.03) 1px, transparent 1px),
                        linear-gradient(90deg, rgba(255,255,255,0.03) 1px, transparent 1px);
      background-size: 32px 32px;
      pointer-events: none;
    }
    .glow-left {
      position: absolute;
      left: 10%;
      top: 25%;
      width: 400px;
      height: 400px;
      background: radial-gradient(circle, rgba(245, 158, 11, 0.2) 0%, transparent 70%);
      filter: blur(60px);
      pointer-events: none;
    }
    .glow-right {
      position: absolute;
      right: 5%;
      top: 30%;
      width: 350px;
      height: 350px;
      background: radial-gradient(circle, rgba(59, 130, 246, 0.15) 0%, transparent 70%);
      filter: blur(60px);
      pointer-events: none;
    }
    .left-content {
      max-width: 600px;
      z-index: 1;
    }
    .brand-row {
      display: flex;
      align-items: center;
      gap: 16px;
      margin-bottom: 24px;
    }
    .logo-box {
      width: 80px;
      height: 80px;
      border-radius: 20px;
      box-shadow: 0 12px 30px -5px rgba(0,0,0,0.6), 0 0 0 2px rgba(251, 191, 36, 0.4);
      overflow: hidden;
      background: #000;
      flex-shrink: 0;
    }
    .logo-box img {
      width: 100%;
      height: 100%;
      object-fit: cover;
    }
    .brand-text {
      display: flex;
      flex-direction: column;
    }
    .brand-title {
      font-size: 38px;
      font-weight: 800;
      letter-spacing: -0.5px;
      background: linear-gradient(135deg, #ffffff 40%, #fbbf24 100%);
      -webkit-background-clip: text;
      -webkit-text-fill-color: transparent;
      line-height: 1.1;
    }
    .brand-version {
      font-size: 13px;
      font-family: monospace;
      color: #94a3b8;
      margin-top: 4px;
    }
    .headline {
      font-size: 26px;
      font-weight: 700;
      color: #f1f5f9;
      line-height: 1.3;
      margin-bottom: 12px;
      letter-spacing: -0.3px;
    }
    .subline {
      font-size: 16px;
      color: #94a3b8;
      line-height: 1.5;
      margin-bottom: 28px;
    }
    .feature-list {
      display: grid;
      grid-template-columns: 1fr 1fr;
      gap: 12px;
    }
    .feature-item {
      display: flex;
      align-items: center;
      gap: 8px;
      font-size: 14px;
      font-weight: 600;
      color: #e2e8f0;
      background: rgba(255,255,255,0.05);
      border: 1px solid rgba(255,255,255,0.08);
      padding: 8px 14px;
      border-radius: 10px;
    }
    .right-preview {
      z-index: 1;
      width: 540px;
      height: 380px;
      background: #111827;
      border: 1px solid rgba(255,255,255,0.12);
      border-radius: 16px;
      box-shadow: 0 25px 50px -12px rgba(0,0,0,0.7), 0 0 0 1px rgba(255,255,255,0.05);
      overflow: hidden;
      display: flex;
      flex-direction: column;
    }
    .window-header {
      background: #1f2937;
      padding: 10px 14px;
      display: flex;
      align-items: center;
      gap: 8px;
      border-bottom: 1px solid rgba(255,255,255,0.08);
    }
    .dot {
      width: 10px;
      height: 10px;
      border-radius: 50%;
    }
    .dot-red { background: #ef4444; }
    .dot-yellow { background: #f59e0b; }
    .dot-green { background: #10b981; }
    .window-title {
      font-size: 12px;
      color: #9ca3af;
      margin-left: 8px;
      font-family: monospace;
    }
    .preview-body {
      flex: 1;
      padding: 16px;
      font-family: monospace;
      font-size: 12px;
      display: flex;
      flex-direction: column;
      gap: 10px;
      background: #0f172a;
    }
    .req-item {
      display: flex;
      align-items: center;
      justify-content: space-between;
      padding: 8px 12px;
      background: rgba(255,255,255,0.03);
      border-radius: 6px;
      border-left: 3px solid #3b82f6;
    }
    .req-item.status-401 {
      border-left-color: #f59e0b;
      background: rgba(245, 158, 11, 0.08);
    }
    .method-get { color: #60a5fa; font-weight: bold; }
    .method-post { color: #34d399; font-weight: bold; }
    .status-badge {
      padding: 2px 6px;
      border-radius: 4px;
      font-size: 11px;
      font-weight: bold;
    }
    .status-200 { background: rgba(16, 185, 129, 0.2); color: #34d399; }
    .status-401 { background: rgba(245, 158, 11, 0.2); color: #fbbf24; }
    .detail-card {
      margin-top: 6px;
      background: #1e293b;
      border-radius: 8px;
      padding: 12px;
      border: 1px solid rgba(255,255,255,0.06);
    }
    .header-key { color: #93c5fd; }
    .header-mask { color: #fbbf24; font-weight: bold; }
  </style>
</head>
<body>
  <div class="grid-bg"></div>
  <div class="glow-left"></div>
  <div class="glow-right"></div>

  <div class="left-content">
    <div class="brand-row">
      <div class="logo-box">
        <img src="data:image/png;base64,${logoBase64}" alt="DevTrace Lion" />
      </div>
      <div class="brand-text">
        <div class="brand-title">DevTrace Lion</div>
        <div class="brand-version">v1.0.0 • Local-First DevTools Extension</div>
      </div>
    </div>

    <div class="headline">API Debugging inside DevTools.<br>Zero Permissions. Secrets Redacted.</div>
    <div class="subline">Focus on API payloads, headers, timings, and error insights without sifting through hundreds of static assets.</div>

    <div class="feature-list">
      <div class="feature-item">🛡️ Zero Permissions Required</div>
      <div class="feature-item">🔒 Pre-Store Secret Redaction</div>
      <div class="feature-item">⚡ 8 Code Generators (cURL, Python...)</div>
      <div class="feature-item">⚖️ Visual JSON Response Diff</div>
    </div>
  </div>

  <div class="right-preview">
    <div class="window-header">
      <div class="dot dot-red"></div>
      <div class="dot dot-yellow"></div>
      <div class="dot dot-green"></div>
      <span class="window-title">Chrome DevTools — DevTrace Lion</span>
    </div>
    <div class="preview-body">
      <div class="req-item">
        <div><span class="method-post">POST</span> /api/v1/auth/login</div>
        <span class="status-badge status-200">200 OK</span>
      </div>
      <div class="req-item status-401">
        <div><span class="method-get">GET</span> /api/v1/user/profile</div>
        <span class="status-badge status-401">401 Unauthorized</span>
      </div>
      <div class="detail-card">
        <div style="color: #64748b; font-size: 11px; margin-bottom: 6px; text-transform: uppercase;">Protected Request Headers</div>
        <div style="margin-bottom: 4px;"><span class="header-key">authorization:</span> <span class="header-mask">Bearer •••••••••••</span></div>
        <div><span class="header-key">x-api-key:</span> <span class="header-mask">•••••••••••</span></div>
        <div style="margin-top: 8px; font-size: 11px; color: #10b981;">✓ Safe to Copy &amp; Export without token leaks</div>
      </div>
    </div>
  </div>
</body>
</html>
`;

  await page.setViewport({ width: 1400, height: 560 });
  await page.setContent(promoMarqueeHtml);
  await page.screenshot({
    path: path.join(storeAssetsDir, 'promo-marquee-1400x560.jpg'),
    type: 'jpeg',
    quality: 98
  });

  console.log('All store assets successfully created in store-assets/ !');

} finally {
  await browser.close();
  server.close();
}
