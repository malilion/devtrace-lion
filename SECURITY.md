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
   - Code generators (cURL, Fetch, Axios, C#, Python, Go, HTTPie, PHP)
   - Exported debug bundles
   - Response diff comparisons

---

## 3. The "Reveal Locally" Rule

When a user clicks **"Reveal Locally"**:
- It switches the visual binding in the local DOM to allow inspection of the raw token.
- A prominent amber alert banner is displayed.
- **Copy actions remain strictly redacted.** Even while revealed on screen, clicking "Copy", "cURL", or "Export Bundle" copies the masked version.

### 3.1 How copy isolation is enforced

The "revealed" state changes **display bindings only**. Copy/export code paths are wired to a separate, always-redacted source so that an active reveal can never leak a secret to the clipboard or a file:

- Header/query/body **display** reads the `displayed*` computeds (which may show raw values while revealed).
- Header/query/body **copy** reads the redacted `record.*` fields directly.
- The shared `JsonViewer` component accepts a dedicated `copyContent` prop that is always bound to the redacted value; its "Copy" button never copies the on-screen (possibly revealed) `content`.
- Code generators always build from the redacted `record`, never from raw memory.

This invariant is locked down by regression tests (`tests/unit/components/*.spec.ts`) that mock the clipboard, toggle reveal on, click every copy control, and assert no raw secret is ever written.

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

Users may extend this list with custom keys in Settings; custom keys are matched with the same recursive, case-insensitive rules.

Multi-value headers (e.g. several `Set-Cookie` entries merged into one comma-joined value) are masked **per segment**, so no individual value can leak while the value count is preserved.

---

## 5. Value-Based Detection (Defense in Depth)

Key-based redaction (§4) is the primary defense. As a **secondary, best-effort layer**, DevTrace Lion also masks values that are credentials *by shape*, even when they appear under an innocuous key (e.g. `{"data": "<a JWT>"}`) or embedded in a free-form body (logs, XML, plain text).

Detected high-confidence patterns include:

- **JWTs** — three base64url segments separated by dots (`eyJ….….…`)
- **Scheme-prefixed credentials** — `Bearer` / `Basic` / `Token` followed by a value
- **Provider key prefixes** — Stripe (`sk_live_` / `sk_test_` / `pk_…`), GitHub (`ghp_`, `gho_`, …), OpenAI (`sk-…`), Google API (`AIza…`), Slack (`xoxb-`, `xoxp-`, …), AWS access keys (`AKIA…`)

Notes and limitations:

- This layer is **conservative on purpose**: it requires a recognizable prefix/structure and a minimum length to avoid corrupting legitimate data. It is *not* a guarantee — novel or unprefixed secret formats may not be recognized. Treat §4 (key-based) as the contract and §5 as an extra safety net.
- When a value-shaped secret is masked in a body with no matching key name, it is surfaced in the UI's protected-fields list under the friendly label `(embedded token)` rather than a fabricated key name.

---

## 6. Reporting Vulnerabilities

If you discover a redaction bypass or security issue, please contact the maintainers via security advisory on GitHub or email `security@malilion.dev`. We will acknowledge receipt within 48 hours.
