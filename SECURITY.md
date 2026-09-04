# Security Policy & Redaction Architecture

Trust is the foundational premise of DevTrace Lion. Developers inspect sensitive internal APIs, session cookies, and authorization tokens every day. This document explicitly outlines our security boundaries, the pre-store redaction model, and guarantees against data leakage.

---

## 1. Zero-Permission Manifest

DevTrace Lion declares **zero permissions** in its extension manifest:

```json
{
  "manifest_version": 3,
  "devtools_page": "devtools.html",
  "permissions": []
}
```

- We do **NOT** request `<all_urls>`, `webRequest`, `cookies`, `storage`, `tabs`, `history`, or `bookmarks`.
- Access to network entries is granted strictly through the browser's native `chrome.devtools.network` API when DevTools is opened by the developer.

---

## 2. Pre-Store Redaction Model (Safety by Construction)

Most debugging extensions redact data in the UI layer during rendering. This creates severe vulnerability vectors: if a copy button, export function, or diff algorithm reads the raw record, secrets are accidentally leaked.

**DevTrace Lion implements pre-store redaction:**

1. **Before Entry into Store**: When `chrome.devtools.network.onRequestFinished` fires, the raw HAR entry is processed by `redactSecrets()`.
2. **Safe Primary Record**: All sensitive headers (e.g. `Authorization`, `Cookie`) and sensitive JSON body properties (e.g. `access_token`, `password`, `api_key`) are masked with `•••••••••••` immediately.
3. **Isolated Raw Memory**: The unredacted values are stored in a dedicated, isolated private Map that is *never* accessed by:
   - Clipboard copy actions
   - Code generators (cURL, Fetch, Axios, C#)
   - Exported debug bundles
   - Response diff comparisons

---

## 3. The "Reveal Locally" Rule

When a user clicks **"Reveal Locally"**:
- It switches the visual binding in the local DOM to allow inspection of the raw token.
- A prominent amber alert banner is displayed.
- **Copy actions remain strictly redacted.** Even while revealed on screen, clicking "Copy", "cURL", or "Export Bundle" copies the masked version.

---

## 4. Default Protected Keys

The following keys are matched recursively and case-insensitively across headers, form parameters, and JSON payloads:

- `authorization`
- `proxy-authorization`
- `cookie`
- `set-cookie`
- `x-api-key`, `api-key`, `apikey`
- `x-auth-token`, `token`
- `access_token`, `refresh_token`, `id_token`
- `password`, `passwd`
- `secret`, `client_secret`, `private_key`
- `session`, `sessionid`

---

## 5. Reporting Vulnerabilities

If you discover a redaction bypass or security issue, please contact the maintainers via security advisory on GitHub or email `security@malilion.dev`. We will acknowledge receipt within 48 hours.
