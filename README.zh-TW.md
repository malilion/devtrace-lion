<p align="center">
  <img src="assets/logo.png" alt="DevTrace Lion Logo" width="160" />
</p>

<h1 align="center">DevTrace Lion 🦁</h1>

<p align="center">
  <strong>瀏覽器 DevTools 內的隱私優先 API 除錯助手。零權限・純本機運算・機密預設遮蔽。</strong>
</p>

<p align="center">
  <a href="https://github.com/malilion/devtrace-lion/actions/workflows/ci.yml">
    <img src="https://github.com/malilion/devtrace-lion/actions/workflows/ci.yml/badge.svg" alt="CI 狀態" />
  </a>
  <a href="LICENSE">
    <img src="https://img.shields.io/badge/License-MIT-blue.svg" alt="授權條款: MIT" />
  </a>
  <img src="https://img.shields.io/badge/權限需求-零權限%20(Zero)-emerald.svg" alt="零權限" />
  <img src="https://img.shields.io/badge/儲存空間-僅限記憶體-blue.svg" alt="僅限記憶體" />
  <img src="https://img.shields.io/badge/Chrome%20MV3-已就緒-success.svg" alt="Chrome MV3" />
  <img src="https://img.shields.io/badge/Firefox-支援-orange.svg" alt="Firefox" />
</p>

<p align="center">
  <a href="#-快速開始">快速開始</a> •
  <a href="#-核心功能與用法說明">功能與用法說明</a> •
  <a href="#-8-大語言程式碼產生器">程式碼產生器</a> •
  <a href="#-資安模型與機密遮蔽">資安與遮蔽模型</a> •
  <a href="#-獨立-mock-測試模式">Mock 模式</a> •
  <a href="README.md">English Documentation</a>
</p>

---

## 📖 專案介紹

現代瀏覽器 DevTools 的 Network 面板常充斥著數百個靜態資源（JavaScript、CSS、字型、圖片、分析追蹤腳本等）。要從中找出那次出錯的 API 請求，宛如大海撈針。此外，工程師在將 cURL 指令或 HAR 記錄分享給同事或回報 Issue 時，經常不小心洩漏了極度機密的 `Authorization: Bearer` Token、Session Cookie 或 API Key。

**DevTrace Lion** 是一款以「隱私優先」與「開發體驗」為核心的瀏覽器擴充功能，直接嵌入 Chrome 與 Firefox DevTools 之中：
- 🎯 **專注 API**：過濾所有靜態資源雜訊，僅呈現 Fetch 與 XHR 請求。
- 🛡️ **零擴充權限（Zero Permissions）**：Manifest 宣告 `permissions: []`，僅透過 DevTools 原生 `devtools_page` 讀取開發者正在除錯的資訊，安全透明。
- 🔒 **入庫前自動遮蔽（Pre-Store Redaction）**：機密資料在進入記憶體之前就已完成遮蔽，不論是一鍵複製、程式碼產生或匯出檔案，**絕對不會外洩真實 Token**。
- 📋 **8 種語言程式碼產生器**：一鍵產生 cURL、Fetch、Axios、C# HttpClient、Python requests、Go net/http、HTTPie、PHP cURL。
- ⚖️ **JSON 回應比對（Response Diff）**：選取兩個請求即可精確對比 JSON 結構差異（新增、刪除、數值變更）。
- 💡 **純本地規則診斷（Status Insights）**：不串接任何外部 LLM，本機直接診斷 401（未帶認證 vs 憑證過期）、429（Retry-After 秒數計算）、500+（HTML 崩潰頁偵測）與 CORS Preflight 失敗原因。
- 💻 **100% 本機運算**：無雲端伺服器、無追蹤分析、無資料落地，關閉 DevTools 即自動從 RAM 釋放。

---

## 🎯 這個套件的用途與解決的痛點 (Use Cases & Problem Solved)

在日常軟體開發與維運中，前端工程師、後端工程師、QA 測試員與資安人員經常需要檢查瀏覽器發出的 API 請求。**DevTrace Lion 正是為了解決以下 7 大真實痛點而生：**

```
┌───────────────────────────────────┬────────────────────────────────────────────────────────┐
│ 常見除錯痛點                      │ DevTrace Lion 的解決方式與用途                         │
├───────────────────────────────────┼────────────────────────────────────────────────────────┤
│ 1. 傳統 Network 面板太雜          │ 專注 API：一鍵只看 Fetch/XHR，雜訊歸零                 │
│ 2. 複製 cURL/截圖不慎外洩 Token   │ 預設自動遮蔽：剪貼簿與產生代碼 100% 安全脫敏           │
│ 3. 跨語言團隊難以快速重現請求     │ 8 大語言 Code Gen：cURL, C#, Python, Go, PHP, Axios 等 │
│ 4. API 改版升級難以快速驗證差異   │ 內建 JSON Diff：秒看新舊版本 Response 增刪改欄位       │
│ 5. HTTP 錯誤碼看不出根本原因      │ 本地智能診斷：秒懂 401 缺標頭、429 等待秒數、500 HTML  │
│ 6. QA 回報 Bug 時打包 HAR 易外洩  │ 安全除錯包：匯出已洗清機密的 Debug Bundle 供離線分析   │
│ 7. 企業 IT 嚴管瀏覽器擴充套件權限 │ 零權限架構：不申請任何 Permission，純本機記憶體運作    │
└───────────────────────────────────┴────────────────────────────────────────────────────────┘
```

### 具體應用場景範例：

1. **🚀 前後端聯調（API Integration & Debugging）**
   - **痛點**：頁面載入時幾百個靜態資源混在一起，很難快速找到剛剛點擊按鈕打出的特定 API。
   - **用途**：DevTrace Lion 自動過濾圖片、CSS 與追蹤代碼，直覺呈現 Method、路徑、回應狀態與耗時，並支援全文檢索與 2xx/4xx/5xx 分組。

2. **🛡️ 避免 Token 洩漏（Security & Copy Safety）**
   - **痛點**：前端遇到 401/500，隨手把 cURL 指令貼到 Slack/Teams/GitHub Issue 問後端，不小心將自己真實的 `Authorization: Bearer <JWT>` 或敏感密碼公開出去。
   - **用途**：DevTrace Lion 在資料進入儲存庫前自動將機密遮蔽為 `•••••••••••`。您複製的 cURL、Fetch 或任何程式碼，一律保證是安全脫敏版本！

3. **🔁 跨語言團隊 Bug 重現（Bug Reproduction）**
   - **痛點**：前端回報錯誤，後端工程師（使用 C#、Python、Go 或 PHP）要求提供重現腳本。
   - **用途**：在「Code Gen」分頁一鍵切換 8 種語言（cURL, Fetch, Axios, C# HttpClient, Python requests, Go net/http, HTTPie, PHP cURL），複製貼上即可在後端 IDE 或終端機中立即發出相同請求。

4. **⚖️ API 改版與回歸測試（Regression & Schema Diff）**
   - **痛點**：後端宣布「新版 API 上線，只動了一個欄位」，前端需要肉眼逐行對比舊版與新版的回傳 JSON。
   - **用途**：使用內建的「⚡ Diff」功能，挑選請求 A 與請求 B，系統瞬間用綠色標出新增欄位、紅色標出遺失欄位、黃色標出數值變動。

5. **💡 快速定位錯誤原因（Diagnostic Insights）**
   - **痛點**：遇到 401 不知道是忘記帶認證還是 Token 過期；遇到 429 不知道要等多久；遇到 500 不知道伺服器回覆的是不是 HTML 崩潰頁。
   - **用途**：內建非 AI 的純本地診斷規則，自動檢查 Request Headers 與 Response Headers，直接給出明確排錯行動指引。

6. **💼 企業內網與高資安環境開發（Zero-Permissions & Compliance）**
   - **痛點**：許多企業禁止安裝要求 `<all_urls>`、`webRequest` 或具備後台連線的外掛。
   - **用途**：DevTrace Lion **不要求任何瀏覽器權限**，所有資料僅暫存於當前 DevTools 視窗的記憶體中，關閉即釋放，完全符合企業最高資安合規。

---

## 🚀 快速開始

### 1. 安裝方式

#### 方式 A：以開發者模式載入 Chrome
1. 下載專案並建置：
   ```bash
   git clone https://github.com/malilion/devtrace-lion.git
   cd devtrace-lion
   pnpm install
   pnpm build
   ```
2. 開啟 Chrome 瀏覽器，進入擴充功能管理頁 `chrome://extensions/`。
3. 開啟右上角的**「開發人員模式」**（Developer mode）。
4. 點擊左上角**「載入未封裝項目」**，選擇專案中的 `.output/chrome-mv3` 目錄。

#### 方式 B：載入至 Firefox
1. 建置 Firefox 版本：
   ```bash
   pnpm build:firefox
   ```
2. 開啟 Firefox，進入 `about:debugging#/runtime/this-firefox`。
3. 點擊**「載入暫時附加元件」**，選擇 `.output/firefox-mv2/manifest.json`。

---

### 2. 如何在 DevTools 中使用

1. 開啟任意網頁或您正在開發的 Web 應用程式。
2. 按下 `F12`（或 Mac 上的 `Cmd + Option + I`）開啟開發者工具（DevTools）。
3. 在 DevTools 頂部面板標籤頁中，點擊 **DevTrace**（位於 Elements、Console、Network 旁）。
4. 操作頁面發送請求，API 呼叫便會以乾淨的表格即時呈現：

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
> **頁面載入後才開啟 DevTools？**
> 瀏覽器限制只有在 DevTools 開啟時才能攔截網路請求。若您在頁面發出初始請求後才打開 DevTools，DevTrace 會提示「No API requests captured yet」，點擊藍色的**「Reload Page」**按鈕即可重新載入頁面並完整擷取！

---

## 🔍 核心功能與用法說明

### 1. 即時搜尋與篩選
- **全文搜尋**：頂部搜尋列支援對 URL 路徑、Query 參數、請求 Body 與回應 Body 進行即時模糊比對。
- **HTTP Method 篩選**：下拉快速切換 `GET`、`POST`、`PUT`、`PATCH`、`DELETE`。
- **狀態碼類別膠囊**：依 `All`、`2xx`（成功）、`3xx`（重新導向）、`4xx`（用戶端錯誤）、`5xx`（伺服器錯誤）快速分組。
- **Fetch/XHR Only**：一鍵過濾非 Fetch/XHR 類型請求。

### 2. 詳盡的請求詳情面板（Request Detail）
在列表中點擊任何請求，即可展開右側詳情檢視，包含 7 大標籤頁：

| 分頁 | 功能介紹 |
|---|---|
| **Overview** | 檢視完整 URL、HTTP Method、狀態碼、回應耗時、時間戳記、以及自動解析好的 Query 參數表格。 |
| **Headers** | 請求標頭（Request Headers）與回應標頭（Response Headers），附帶一鍵複製與遮蔽欄位計數。 |
| **Payload** | 格式化的 JSON 請求內文。若遇到二進位串流或未被瀏覽器捕捉的 Payload，系統會誠實顯示 *"Not captured by DevTools"*，絕不偽造空白字串。 |
| **Response** | 語法高亮且可摺疊縮排的 JSON 樹狀檢視。二進位回應（如 PNG 圖片）自動識別為 Base64 並標明大小；超大 Response（>1MB）自動截斷並附註警示。 |
| **Timing** | 視覺化時間軸瀑布圖（Waterfall），詳細拆解 DNS 查詢、連線建立、SSL 握手、資料傳輸與等待首字節（TTFB）。 |
| **Code Gen** | 一鍵產出 8 大語言的重現程式碼。 |
| **Insights** | 本機規則診斷分析與排錯建議。 |

---

### 🔒 3. 資安模型與機密遮蔽（Pre-Store Redaction）

DevTrace Lion 採用**「入庫前遮蔽」**架構（`lib/security/redact-secrets.ts`）：

```
網路請求 ──► redactSecrets() ──► Pinia Store (已遮蔽安全資料) ──► 表格顯示、複製與匯出
                  │
                  ▼
          隔離的私有暫存區 (僅供 DOM 畫面本地預覽)
```

1. **預設保護清單（不分大小寫）**：
   - `authorization`、`proxy-authorization`、`cookie`、`set-cookie`、`x-api-key`、`api-key`、`apikey`、`x-auth-token`、`token`、`access_token`、`refresh_token`、`password`、`secret`、`client_secret`、`session` 等。
2. **複製安全保證（Copy-Safe Guarantee）**：
   - 點擊「Copy」、「cURL」或「匯出除錯包」，產出的字串一律為遮蔽後的版本（如 `Authorization: Bearer •••••••••••`）。
3. **本地查看（Reveal Locally）**：
   - 除錯時若想確認實際 Token，可點擊頂部的**「👁️ Reveal Locally」**。
   - 介面會以顯眼的橘黃色警示條提示目前處於本地預覽模式。
   - **即使在預覽模式下點擊複製，剪貼簿也一律只會複製遮蔽後的字串**，絕不外洩機密！
4. **自訂遮蔽關鍵字**：
   - 點擊右上角**設定（⚙️）**，可自訂新增企業內部專屬的 Token 標頭名稱（如 `x-mycorp-token`）。

---

### 💻 4. 8 大語言程式碼產生器

選取任何請求，切換至 **Code Gen** 分頁，即刻複製相應語言程式碼：

- **cURL**：自動轉義 Shell 引號，支援 `-X METHOD` 與 `--data-raw`
- **Fetch**：現代化 async/await ES 模組
- **Axios**：簡潔的 `axios.get / post`
- **C# HttpClient**：標準 C# `HttpRequestMessage` 與 `StringContent`
- **Python requests**：自動判斷 `json=payload` 與 `data=data`
- **Go net/http**：標準 `strings.NewReader` 與 Header 注入
- **HTTPie**：排版清晰的終端機指令
- **PHP cURL**：`curl_init` 與 `curl_setopt_array`

---

### ⚖️ 5. JSON 回應結構比對（Response Diff）

1. 點擊頂部導覽列的 **"⚡ Diff"** 按鈕。
2. 選取**基準請求（Base Request A）**與**比對請求（Compared Request B）**。
3. 引擎立即計算並標色呈現：
   - `+ Added`（綠色）：B 存在但 A 沒有的欄位
   - `- Removed`（紅色）：A 存在但 B 遺失的欄位
   - `~ Modified`（黃色）：兩者數值發生變更的欄位
4. 頂部統計指標（如 `+2 added, -1 removed, ~1 modified`）讓 API 回應差異一目了然。

---

### 💡 6. 純本地規則診斷（Status Insights）

當請求發生非預期狀態時，切換至 **Insights** 分頁即可獲得即時建議：

- **401 Unauthorized**：
  - 未帶標頭：明確指出「此請求完全沒有附帶 Authorization 或 API-Key 標頭」。
  - 有帶標頭：指出「標頭有發送，但被伺服器拒絕或憑證已過期」。
- **429 Too Many Requests**：
  - 自動擷取 `Retry-After` 回應標頭並換算秒數（如「伺服器觸發限流，請等待 60 秒後再試」）。
- **500 Internal Server Error**：
  - 偵測回應內容是否為 HTML：「回應為 HTML 格式，可能為 Nginx / Cloudflare 代理層或 Web 框架預設崩潰頁」。
- **Status 0**：
  - 診斷 CORS Preflight 失敗、自簽憑證問題或網路中斷。

---

### 📦 7. 安全除錯包匯出與 HAR 匯入

- **匯出安全除錯包（📤 Export Bundle）**：
  - 下載 `devtrace-debug-bundle.json`。
  - 匯出前進行二次機密洗清，並在檔案清單中附帶隱私宣告與遮蔽欄位清單。
  - 可放心分享給後端團隊、同事或外部支援，不必擔心憑證洩漏。
- **匯入 HAR 記錄（📥 Import HAR）**：
  - 可載入標準 `.har` 檔或 DevTrace 除錯包進行離線分析，載入時自動套用遮蔽保護。

---

## 🧪 獨立 Mock 測試模式

本專案支援獨立 Mock 模式，**無需啟動 DevTools 也能完整預覽與測試 UI**：

```bash
# 啟動開發伺服器
pnpm dev
```
瀏覽器直接開啟：
```text
http://localhost:3000/panel.html?mock=1
```
系統會自動載入預置的測試資料（GET 200、POST 201、401 Bearer、429 Retry-After、二進位 PNG 等），便於 UI 調整、截圖與自動化測試。

---

## 🛠️ 開發指令與測試

```bash
# 安裝相依套件
pnpm install

# 嚴格 TypeScript 型別檢查
pnpm typecheck

# 執行單元與元件測試 (54 項測試)
pnpm test

# 執行 ESLint 語法檢查
pnpm lint

# 建置 Chrome MV3 擴充功能 (.output/chrome-mv3)
pnpm build

# 建置 Firefox MV2 擴充功能 (.output/firefox-mv2)
pnpm build:firefox

# 啟動本地 Mock API 測試伺服器
npx tsx tests/mock-api/server.ts
```

---

## 🔒 隱私與資安承諾

1. **零權限申請**：不要求 `<all_urls>`、`webRequest`、`cookies` 或瀏覽歷史。
2. **純記憶體生命週期**：所有擷取的請求只存在於當前 DevTools 視窗的 RAM 中，關閉視窗即刻釋放。
3. **無外部網路發送**：無 Google Analytics、無追蹤像素、無外部字型 CDN、無第三方 LLM 連線。
4. **剪貼簿保證安全**：複製出來的字串永遠只會是遮蔽後的版本。

請參閱 [SECURITY.md](SECURITY.md) 與 [PRIVACY.md](PRIVACY.md)。

---

## 🤝 參與貢獻

歡迎提交 Issue 與 Pull Request！詳細貢獻指引請見 [CONTRIBUTING.md](CONTRIBUTING.md)。

---

## 📄 開源授權

DevTrace Lion 採用 [MIT License](LICENSE) 授權開源。  
本專案為 **Malilion Browser Tools** 系列作品之一。
