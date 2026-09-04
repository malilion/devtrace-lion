<p align="center">
  <img src="assets/logo.png" alt="DevTrace Lion Logo" width="160" />
</p>

<h1 align="center">DevTrace Lion 🦁</h1>

<p align="center">
  <strong>API debugging inside DevTools. Zero permissions. Local-first. Secrets redacted by default.</strong>
</p>

<p align="center">
  <a href="https://github.com/malilion/devtrace-lion/actions/workflows/ci.yml">
    <img src="https://github.com/malilion/devtrace-lion/actions/workflows/ci.yml/badge.svg" alt="CI Status" />
  </a>
  <a href="LICENSE">
    <img src="https://img.shields.io/badge/License-MIT-blue.svg" alt="License: MIT" />
  </a>
  <img src="https://img.shields.io/badge/Permissions-Zero%20Required-emerald.svg" alt="Zero Permissions" />
  <img src="https://img.shields.io/badge/Storage-Session%20Memory%20Only-blue.svg" alt="Session Memory Only" />
  <img src="https://img.shields.io/badge/Chrome%20MV3-Ready-success.svg" alt="Chrome MV3" />
  <img src="https://img.shields.io/badge/Firefox-Supported-orange.svg" alt="Firefox" />
</p>

<p align="center">
  <a href="#-quick-start">Quick Start</a> •
  <a href="#-features--how-to-use">Features & Usage</a> •
  <a href="#-code-generators">Code Generators</a> •
  <a href="#-security--secret-redaction">Security Model</a> •
  <a href="#-standalone-mock-mode">Mock Mode</a> •
  <a href="README.zh-TW.md">繁體中文說明文件</a>
</p>

---

## 📖 Introduction

Modern browser DevTools Network panels are cluttered with hundreds of static assets—scripts, stylesheets, fonts, tracking pixels, and images. Finding the single failing REST API call often feels like finding a needle in a haystack. Furthermore, sharing cURL snippets or HAR recordings with teammates frequently leads to accidental leakage of sensitive `Authorization: Bearer` tokens, session cookies, and API keys.

**DevTrace Lion** is a developer-centric extension that adds a dedicated **DevTrace** panel directly inside Chrome and Firefox DevTools:
- 🎯 **Pure API Focus**: Isolates Fetch & XHR requests into a clean, searchable interface.
- 🛡️ **Zero Permissions**: Requires `permissions: []` in its manifest. It operates strictly within the native `devtools_page` API.
- 🔒 **Secrets Redacted Before Storage**: Masks authorization headers, tokens, cookies, and JSON passwords before data enters memory. Copying or exporting is safe by default.
- 📋 **8 Code Generators**: Instantly generate production-ready snippets for cURL, Fetch, Axios, C# HttpClient, Python, Go, HTTPie, and PHP.
- ⚖️ **JSON Response Diff**: Compare responses from two requests to spot schema changes, status shifts, or regression bugs.
- 💡 **Rule-Based Insights**: Local diagnosis for HTTP errors (401, 429, 500, CORS) without calling external AI/LLM services.
- 💻 **100% Local-First**: Zero cloud backends, zero telemetry, zero persistent tracking.

---

## 🎯 Purpose & Real-World Use Cases (Problems Solved)

In day-to-day software development, frontend engineers, backend developers, QA testers, and security teams constantly inspect HTTP API calls. **DevTrace Lion was engineered to solve these 7 specific developer pain points:**

```
┌────────────────────────────────────┬────────────────────────────────────────────────────────────┐
│ Developer Pain Point               │ DevTrace Lion's Purpose & Solution                         │
├────────────────────────────────────┼────────────────────────────────────────────────────────────┤
│ 1. Network panel noise & clutter   │ API Isolation: Isolates Fetch/XHR with zero asset noise   │
│ 2. Accidental token/secret leaks   │ Pre-Store Redaction: 100% safe clipboard copy & export     │
│ 3. Polyglot bug reproduction       │ 8 Code Generators: cURL, C#, Python, Go, PHP, Axios, etc.  │
│ 4. API regression & schema drift   │ Built-in JSON Diff: Instant added/removed/modified view   │
│ 5. Ambiguous HTTP error codes      │ Rule-Based Insights: Diagnose 401s, 429 delays, 500 HTML   │
│ 6. Sharing sensitive HAR bug logs  │ Sanitized Bundles: Export de-identified debug logs         │
│ 7. Strict corporate IT policies    │ Zero Permissions: Manifest has permissions: [], zero risk  │
└────────────────────────────────────┴────────────────────────────────────────────────────────────┘
```

### Typical Developer Scenarios:

1. **🚀 API Integration & Debugging (Noise Elimination)**
   - **Problem**: Opening a web app triggers 300+ requests (images, CSS, tracking scripts). Finding your `/api/cart/checkout` call is exhausting.
   - **Purpose**: DevTrace Lion ignores static assets and tracks only Fetch/XHR requests with instant fuzzy search and status grouping.

2. **🛡️ Safe Team Sharing (Zero Token Leaks)**
   - **Problem**: When asking a backend colleague *"Why is this endpoint failing?"*, pasting a raw cURL command into Slack or GitHub Issues often leaks your personal `Authorization: Bearer <JWT>` or session cookies.
   - **Purpose**: DevTrace Lion masks sensitive tokens as `•••••••••••` before storing them. Anything you copy or export is safe by default.

3. **🔁 Polyglot Bug Reproduction**
   - **Problem**: Frontend files an issue, and the backend engineer asks: *"Can you give me a Python/C#/Go snippet to test this locally?"*
   - **Purpose**: Switch to the **Code Gen** tab and copy idiomatic code in 8 languages with one click.

4. **⚖️ API Schema Diff & Regression Testing**
   - **Problem**: Backend refactors an endpoint and says: *"It's completely backward compatible."* How do you verify without writing custom scripts?
   - **Purpose**: Use **"⚡ Diff"** to pick Request A and Request B. DevTrace Lion highlights added fields in green, removed fields in red, and modified values in yellow.

5. **💡 Instant Diagnostic Advice**
   - **Problem**: Receiving 401: Did the client omit the header or did the token expire? Receiving 429: How many seconds should the client back off? Receiving 500: Did the server return JSON or a default Nginx crash HTML?
   - **Purpose**: Built-in, zero-latency diagnostic rules inspect headers and bodies to suggest immediate next steps.

6. **💼 Enterprise & High-Security Compliance**
   - **Problem**: Strict IT environments prohibit browser extensions requesting `<all_urls>` or reading browsing histories.
   - **Purpose**: DevTrace Lion declares **zero permissions**, processes data entirely in RAM, and discards all records when DevTools closes.

---

## 🚀 Quick Start

### 1. Installation

#### Option A: Load Unpacked into Chrome (Developer Mode)
1. Clone the repository and build:
   ```bash
   git clone https://github.com/malilion/devtrace-lion.git
   cd devtrace-lion
   pnpm install
   pnpm build
   ```
2. Open Chrome and navigate to `chrome://extensions/`.
3. Enable **Developer mode** (toggle in the top-right corner).
4. Click **Load unpacked** and select the `.output/chrome-mv3` folder.

#### Option B: Load Temporary Add-on in Firefox
1. Build for Firefox:
   ```bash
   pnpm build:firefox
   ```
2. Open Firefox and go to `about:debugging#/runtime/this-firefox`.
3. Click **Load Temporary Add-on** and select `.output/firefox-mv2/manifest.json`.

---

### 2. How to Use DevTrace in DevTools

1. Navigate to any web application (e.g., your local development server or an API client).
2. Press `F12` (or `Cmd + Option + I` on macOS) to open Browser DevTools.
3. In the top DevTools panel tabs, click **DevTrace** (next to Elements, Console, Network).
4. Interact with the page. API requests will appear in real time:

```text
┌────────┬────────────────────────────────────────────┬──────┬─────────┬──────────┐
│ Status │ Method │ Path / URL                        │ Time │ Size    │ Security │
├────────┼────────────────────────────────────────────┼──────┼─────────┼──────────┤
│ 200 OK │ GET    │ /api/v1/users?page=1              │ 85ms │ 1.4 KB  │ —        │
│ 201    │ POST   │ /api/v1/auth/login                │ 210ms│ 820 B   │ 🔒 3     │
│ 401    │ GET    │ /api/v1/profile/me                │ 64ms │ 140 B   │ 🔒 1     │
│ 500    │ POST   │ /api/v1/orders/checkout           │ 320ms│ 4.2 KB  │ 🔒 2     │
└────────┴────────────────────────────────────────────┴──────┴─────────┴──────────┘
```

> [!TIP]
> **Opened DevTools after page load?**
> Browsers only stream network events to DevTools while DevTools is open. If you opened DevTools after initial requests fired, simply click the blue **"Reload Page"** button in DevTrace to capture the complete sequence.

---

## 🔍 Features & How to Use

### 1. Real-Time Filtering & Search
- **Full-Text Search**: Filter by URL pathname, query parameters, request body content, or response body text in real time.
- **Method Filters**: Filter specifically by `GET`, `POST`, `PUT`, `PATCH`, `DELETE`, or view all.
- **Status Pills**: Group by HTTP class: `All`, `2xx` (Success), `3xx` (Redirects), `4xx` (Client Errors), `5xx` (Server Errors).
- **Fetch/XHR Only**: Click the **Fetch/XHR Only** toggle to hide non-API traffic.

### 2. Comprehensive Request Detail Viewer
Click any request row in the table to open the detailed inspection panel with 7 tabs:

| Tab | What it provides |
|---|---|
| **Overview** | Full URL, HTTP method, status code, latency duration, timestamp, and parsed Query Parameters table. |
| **Headers** | Request & Response headers with redaction badges and one-click copy. |
| **Payload** | Formatted JSON request body. If the body was binary or streaming, DevTrace honestly indicates *"Not captured by DevTools"* instead of showing fake empty strings. |
| **Response** | Syntax-highlighted, formatted JSON tree with expandable keys. Handles Base64 binary responses (PNG, files) and flags truncated responses (>1MB). |
| **Timing** | Visual waterfall chart breaking down DNS lookup, initial TCP connection, SSL handshake, request transmission, and Time to First Byte (TTFB). |
| **Code Gen** | Instant copy-paste code snippets in 8 languages. |
| **Insights** | Rule-based HTTP diagnostic advice. |

---

### 🔒 3. Secret Redaction & Copy Safety

DevTrace Lion enforces **Pre-Store Redaction** (`lib/security/redact-secrets.ts`):

```
Network Request ──► redactSecrets() ──► Pinia Store (Redacted) ──► UI Table & Clipboard
                           │
                           ▼
                    Isolated Raw Memory (Local DOM preview only)
```

1. **Default Protected Keys**:
   - Headers & JSON keys matching: `authorization`, `proxy-authorization`, `cookie`, `set-cookie`, `x-api-key`, `api-key`, `apikey`, `x-auth-token`, `token`, `access_token`, `refresh_token`, `password`, `secret`, `client_secret`, `session`, etc.
2. **Safe Clipboard Guarantee**:
   - Clicking **"Copy"**, **"Copy cURL"**, or exporting data will **always** copy the redacted version (`Bearer •••••••••••`).
3. **Reveal Locally Toggle**:
   - Need to inspect your raw token during debugging? Click **"👁️ Reveal Locally"**.
   - An amber warning banner appears, and raw values are temporarily displayed in the DOM.
   - Even while revealed, **all copy actions remain strictly sanitized**. Your clipboard is never poisoned with raw tokens.
4. **Custom Redaction Keys**:
   - Have proprietary organizational header keys (e.g. `x-company-auth-token`)? Open **Settings (⚙️)** and add them to the custom redaction list.

---

### 💻 4. Multi-Language Code Generators

Select any captured request, switch to the **Code Gen** tab, and copy production-ready code in your preferred language:

<details>
<summary><strong>1. cURL</strong></summary>

```bash
curl 'https://api.example.com/v1/auth/login' \
  -X POST \
  -H 'content-type: application/json' \
  -H 'authorization: Bearer •••••••••••' \
  --data-raw '{"username":"lion_dev","password":"•••••••••••"}'
```
</details>

<details>
<summary><strong>2. JavaScript / TypeScript Fetch</strong></summary>

```ts
const response = await fetch('https://api.example.com/v1/auth/login', {
  "method": "POST",
  "headers": {
    "content-type": "application/json",
    "authorization": "Bearer •••••••••••"
  },
  "body": JSON.stringify({
    "username": "lion_dev",
    "password": "•••••••••••"
  })
});
const data = await response.json();
console.log(data);
```
</details>

<details>
<summary><strong>3. Axios</strong></summary>

```ts
import axios from 'axios';

const response = await axios.post(
  'https://api.example.com/v1/auth/login',
  {
    "username": "lion_dev",
    "password": "•••••••••••"
  },
  {
    "headers": {
      "content-type": "application/json",
      "authorization": "Bearer •••••••••••"
    }
  }
);
console.log(response.data);
```
</details>

<details>
<summary><strong>4. C# HttpClient</strong></summary>

```csharp
using System;
using System.Net.Http;
using System.Text;
using System.Threading.Tasks;

using var client = new HttpClient();
using var request = new HttpRequestMessage(new HttpMethod("POST"), "https://api.example.com/v1/auth/login");
request.Headers.TryAddWithoutValidation("authorization", "Bearer •••••••••••");
request.Content = new StringContent(@"{""username"":""lion_dev"",""password"":""•••••••••••""}", Encoding.UTF8, "application/json");
var response = await client.SendAsync(request);
var body = await response.Content.ReadAsStringAsync();
Console.WriteLine(body);
```
</details>

<details>
<summary><strong>5. Python requests</strong></summary>

```python
import requests

headers = {
    "content-type": "application/json",
    "authorization": "Bearer •••••••••••"
}
payload = {
    "username": "lion_dev",
    "password": "•••••••••••"
}

response = requests.post("https://api.example.com/v1/auth/login", headers=headers, json=payload)
print(response.status_code)
print(response.text)
```
</details>

<details>
<summary><strong>6. Go net/http</strong></summary>

```go
package main

import (
    "fmt"
    "io"
    "net/http"
    "strings"
)

func main() {
    client := &http.Client{}
    payload := strings.NewReader(`{"username":"lion_dev","password":"•••••••••••"}`)
    req, err := http.NewRequest("POST", "https://api.example.com/v1/auth/login", payload)
    if err != nil {
        panic(err)
    }
    req.Header.Set("authorization", "Bearer •••••••••••")

    resp, err := client.Do(req)
    if err != nil {
        panic(err)
    }
    defer resp.Body.Close()

    bodyText, err := io.ReadAll(resp.Body)
    if err != nil {
        panic(err)
    }
    fmt.Println(string(bodyText))
}
```
</details>

<details>
<summary><strong>7. HTTPie</strong></summary>

```bash
http POST 'https://api.example.com/v1/auth/login' \
  'authorization:Bearer •••••••••••' \
  username='lion_dev' \
  password='•••••••••••'
```
</details>

<details>
<summary><strong>8. PHP cURL</strong></summary>

```php
<?php

$curl = curl_init();
curl_setopt_array($curl, [
    CURLOPT_URL => "https://api.example.com/v1/auth/login",
    CURLOPT_RETURNTRANSFER => true,
    CURLOPT_CUSTOMREQUEST => "POST",
    CURLOPT_HTTPHEADER => [
        "authorization: Bearer •••••••••••",
    ],
    CURLOPT_POSTFIELDS => "{\"username\":\"lion_dev\",\"password\":\"•••••••••••\"}",
]);

$response = curl_exec($curl);
$err = curl_error($curl);
curl_close($curl);

if ($err) {
    echo "cURL Error #:" . $err;
} else {
    echo $response;
}
```
</details>

---

### ⚖️ 5. Response Diff Comparison

1. Click **"⚡ Diff"** on the top navigation bar.
2. Select **Base Request (A)** and **Compared Request (B)**.
3. The structural diff engine immediately calculates:
   - `+ Added`: Properties present in B but not in A.
   - `- Removed`: Properties present in A but missing from B.
   - `~ Modified`: Properties where values changed between A and B.
4. Summary counters (`+2 added, -1 removed, ~3 modified`) give an instant snapshot of API response differences.

---

### 💡 6. Rule-Based Error Insights

When an API call fails, switch to the **Insights** tab for instant diagnosis:

- **401 Unauthorized**:
  - *No header present*: Flags `"This request did not include any Authorization or API-Key header."`
  - *Header present*: Flags `"Authorization header was sent, but rejected or expired."`
- **429 Too Many Requests**:
  - Reads `Retry-After` header and converts it to human-readable seconds (`"Rate limit active. Wait 60 seconds."`).
- **500 Internal Server Error**:
  - Checks if response is HTML: Flags `"Response is HTML: Likely a proxy (Nginx/Cloudflare) or web framework default crash page."`
- **Status 0**:
  - Explains CORS preflight failures, missing `Access-Control-Allow-Origin`, self-signed certificates, or network disconnection.

---

### 📦 7. Sanitized Bundle Export & HAR Import

- **Export Sanitized Bundle (📤)**:
  - Downloads `devtrace-debug-bundle.json`.
  - Runs a fail-safe second redaction pass.
  - Generates a signed privacy audit manifest detailing which fields were protected.
  - Safe to share with coworkers, backend teams, or customer support without exposing authentication tokens.
- **Import HAR (📥)**:
  - Drag-and-drop or select any `.har` or DevTrace bundle file to review requests offline.
  - Automatically sanitizes sensitive tokens upon import.

---

## 🧪 Standalone Mock Mode

DevTrace Lion includes a standalone mock mode that runs without opening browser DevTools:

```bash
# Start dev server
pnpm dev
```
Then open:
```text
http://localhost:3000/panel.html?mock=1
```
This loads pre-configured mock fixtures (GET 200, POST 201, 401 Bearer, 429 Retry-After, binary PNG, etc.) to make UI testing, screenshot creation, and Playwright automation effortless.

---

## 🛠️ Development & Testing

```bash
# Install dependencies
pnpm install

# Run strict type checking
pnpm typecheck

# Run unit and component test suite (54 tests)
pnpm test

# Run code linter
pnpm lint

# Build extension for Chrome MV3 (.output/chrome-mv3)
pnpm build

# Build extension for Firefox (.output/firefox-mv2)
pnpm build:firefox

# Run local mock test server
npx tsx tests/mock-api/server.ts
```

---

## 🔒 Security & Privacy Manifesto

1. **Zero Permissions**: No `<all_urls>`, no `webRequest`, no `cookies`, no `history`.
2. **Volatile RAM Only**: Responses are kept in RAM during the DevTools session and cleared upon close.
3. **No External Network Calls**: Zero telemetry, no Google Analytics, no remote font CDNs, no external LLM dependencies.
4. **Copy Safety Guarantee**: Copying headers, payloads, or code snippets *always* produces redacted text.

Read our complete [SECURITY.md](SECURITY.md) and [PRIVACY.md](PRIVACY.md).

---

## 🤝 Contributing

Contributions are welcome! Please check out [CONTRIBUTING.md](CONTRIBUTING.md) for guidelines, development workflows, and a list of **Good First Issues** (e.g. adding new language generators or status insight rules).

---

## 📄 License

DevTrace Lion is open-source software licensed under the [MIT License](LICENSE).  
Part of the **Malilion Browser Tools** ecosystem.
