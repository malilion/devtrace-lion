# DevTrace Lion — Manual QA & DevTools Verification Checklist

This checklist corresponds to Section 9.4 of the `DevTrace Lion` specification.

## Pre-requisites
- Build the extension: `pnpm build` (outputs to `.output/chrome-mv3/`)
- In Chrome: open `chrome://extensions/`, enable Developer Mode, click **Load unpacked**, and select `.output/chrome-mv3/`.
- In Firefox: open `about:debugging#/runtime/this-firefox`, click **Load Temporary Add-on**, and select `.output/firefox-mv2/manifest.json`.

---

## Chrome Verification Checklist

- [ ] **1. DevTools Registration**: Open DevTools on any page (e.g. `https://example.com`). The **DevTrace** panel tab is present.
- [ ] **2. Late Opening Detection**: If DevTools is opened after page load, an empty state notice displays: *"No API requests captured yet. DevTools must be open during page load to capture initial requests"* with a **Reload Page** button.
- [ ] **3. XHR & Fetch Interception**:
  - Send an XHR request (or Fetch request) on the page.
  - The request appears immediately in the DevTrace table with correct Method, URL path, Status code, and Duration.
- [ ] **4. Error & Status Handling**:
  - Trigger a 401 Unauthorized request: displays amber/rose badge, and in the Insights tab shows *"Missing Authentication Header"* or *"Authentication Failed"*.
  - Trigger a 429 Too Many Requests: displays Retry-After duration in Insights.
  - Trigger a 500 Server Error returning HTML: Insights identifies that the response is an HTML server error page.
- [ ] **5. Request Body Handling**:
  - Send a POST request with JSON payload: JSON body is formatted and syntax-highlighted in the Payload tab.
  - Send a binary/streamed body with uncaptured body: UI honestly shows *"Request body was not captured by DevTools (e.g. streaming or binary upload)"*, never faking an empty string.
- [ ] **6. Response Body & Base64 Detection**:
  - Image/binary response: identified as Base64 with size and MIME type displayed; does not render corrupt text.
  - Oversized response (>1MB): truncated notice displayed with byte size info.
- [ ] **7. Secret Redaction & Copy Safety**:
  - Headers containing `Authorization: Bearer <secret>` or `Cookie` are masked with `•••••••••••`.
  - JSON payloads containing `access_token`, `password`, `token`, `secret`, or `session` are masked.
  - **Copy Test**: Click "Copy" or "cURL". Paste into an editor. Verify that **NO raw token or password is ever pasted**.
  - **Reveal Locally Test**: Click "Reveal Locally". The local UI shows the token with a prominent warning banner. Click "Copy" while revealed and paste: **the copied text is still strictly redacted**.
- [ ] **8. Code Generators**:
  - Switch to "Code Gen" tab. Test cURL, Fetch, Axios, and C# HttpClient snippets.
  - Confirm all snippets use properly escaped URLs and redacted credentials.
- [ ] **9. JSON Diff Comparison**:
  - Click "Diff" on toolbar. Select two JSON responses. Additions (`+`), deletions (`-`), and modifications (`~`) are rendered with color-coding.
- [ ] **10. Export & Import**:
  - Click "Export Bundle": downloads `devtrace-debug-bundle.json`.
  - Inspect downloaded JSON: manifest contains privacy statement and audit of redacted keys; no secret tokens exist.
  - Click "Import HAR": select a `.har` or exported bundle. Records load cleanly with redactions applied.
- [ ] **11. Session Memory & Navigation**:
  - Navigate to another page: if "Preserve Log" is OFF, records clear automatically. If ON, records persist across navigation.
  - Close DevTools and reopen: in-memory records are clean, no permanent storage leaks.

---

## Firefox Verification Checklist

- [ ] **1. Firefox Guideline Banner**: A friendly guide displays: *"Firefox note: DevTools requires opening Firefox's native Network tab at least once to initialize network capturing."*
- [ ] **2. Capture Verification**: After opening the native Network tab once, requests are captured in DevTrace without errors.
- [ ] **3. Cross-platform getContent**: `getContent()` Promise resolving to `[content, mimeType]` is parsed correctly.

---

## Standalone Mock Mode Checklist (Playwright & Local Dev)

- [ ] Open `index.html?mock=1` (or load panel directly in a regular browser tab).
- [ ] Sample API requests (GET 200, POST 201, 401 Bearer, 429 Retry-After, binary PNG, etc.) are pre-loaded.
- [ ] Table filtering (Search, Fetch/XHR, 2xx, 4xx, Methods) responds instantly.
- [ ] Theme switcher switches cleanly between Light and Dark mode.
