<p align="center">
  <img src="assets/store/promo-marquee.jpg" alt="DevTrace Lion 跑馬燈橫幅" width="100%" style="border-radius: 12px; box-shadow: 0 10px 30px rgba(0,0,0,0.3);" />
</p>

<p align="center">
  <img src="assets/logo.png" alt="DevTrace Lion Logo" width="130" />
</p>

<h1 align="center">DevTrace Lion 🦁</h1>

<p align="center">
  <strong>瀏覽器 DevTools 內的 API 除錯助手・零權限・純本機運算・機密自動遮蔽・8 國語言代碼產生</strong>
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
  <a href="#-一分鐘看懂-devtrace-lion">一分鐘看懂</a> •
  <a href="#-圖文核心功能導覽">功能導覽</a> •
  <a href="#-8-大語言代碼產生器">代碼產生器</a> •
  <a href="#-30-秒快速上手">安裝步驟</a> •
  <a href="#-資安與隱私宣言">資安保護</a> •
  <a href="README.md">English Documentation</a>
</p>

---

## ⚡ 一分鐘看懂 DevTrace Lion

在網頁開發中，我們每天都要打開瀏覽器的 **Network 面板**。但你有沒有遇過以下困擾？

* ❌ **找不到要看的 API**：頁面一重整，湧進 300 多個 CSS、字型、圖片、廣告和分析追蹤代碼，想找的那次 API 呼叫宛如大海撈針。
* ❌ **隨手複製 cURL 卻洩漏金鑰**：複製請求指令貼到 Slack/Teams 詢問同事，不小心把自己的真實 `Authorization: Bearer <JWT>`、Session Cookie 或敏感密碼公開出去了。
* ❌ **後端同事說「給我重現指令」**：前端找後端 Debug，對方用 Python、C# 或 Go，你得手動轉換 Headers 和 JSON Payload 格式。
* ❌ **API 改版改了什麼看不出來**：後端說「新版只動了一個欄位」，只能用肉眼逐行比對 JSON。

---

### 👉 DevTrace Lion 是怎麼幫你解決的？

1. 🎯 **雜訊全部消失**：自動過濾靜態檔案，只專注呈現 **Fetch / XHR (REST API)** 請求。
2. 🛡️ **進記憶體前就自動遮蔽**：不管是 `Authorization`、Cookie、密碼還是金鑰，一律自動遮蔽為 `•••••••••••`。你複製出去的 cURL、代碼或檔案 **保證 100% 不外洩機密**！
3. 📋 **一鍵轉 8 國語言代碼**：cURL、Fetch、Axios、C#、Python、Go、HTTPie、PHP 秒速切換，直接複製交給後端重現問題。
4. ⚖️ **內建 JSON 比對（Diff）**：任選兩筆請求，綠色（新增）、紅色（刪除）、黃色（修改）清清楚楚。
5. 💡 **智能錯誤原因診斷**：遇到 401、429、500 不用盲猜，本地即刻提供排錯行動建議。
6. 🔒 **真正的零權限（Zero Permissions）**：Manifest 宣告 `permissions: []`，不讀取瀏覽紀錄、不偷傳資料、關閉視窗即自動釋放，公司資安政策 100% 合規！

---

## 📸 圖文核心功能導覽

### 1. 專屬 API 除錯面板 ＆ 自動機密遮蔽 (Pre-Store Redaction)
> 打開 DevTools 即可看到獨立的 **DevTrace** 分頁。API 請求依狀態碼清晰分類，敏感的認證資訊一律自動以醒目的金色鎖頭與星號遮蔽。

<p align="center">
  <img src="assets/screenshots/1-overview.jpg" alt="DevTrace Lion 總覽面板與安全標頭" width="100%" style="border-radius: 8px; border: 1px solid rgba(255,255,255,0.1);" />
</p>

* **自動遮蔽範圍**：
  * **Headers**：`Authorization`、`Cookie`、`Set-Cookie`、`X-Api-Key` 等。
  * **Payload & Response**：JSON 內部的 `password`、`token`、`access_token`、`secret` 等。
  * **URL Query 參數**：網址列中的 `?token=...`、`?apiKey=...` 也會被安全重寫遮蔽。
* **自訂金鑰**：可以在右上角「設定 (⚙️)」中加入公司專屬的機密欄位名稱。

---

### 2. 8 大主流語言程式碼產生器 (Multi-Language Code Gen)
> 點擊任何請求，切換到「**Code Gen**」分頁，即可複製標準且開箱即用的程式碼，支援語法高亮與一鍵複製。

<p align="center">
  <img src="assets/screenshots/2-codegen.jpg" alt="8 大語言代碼產生器" width="100%" style="border-radius: 8px; border: 1px solid rgba(255,255,255,0.1);" />
</p>

* **支援語系**：
  1. **cURL**（Bash / 終端機）
  2. **JavaScript / TypeScript**（原生 `fetch`）
  3. **Axios**（前端通用）
  4. **C#**（`HttpClient`）
  5. **Python**（`requests`）
  6. **Go**（`net/http`）
  7. **HTTPie**（現代化 CLI）
  8. **PHP**（原生 `cURL`）
* 自動過濾 `:authority`、`:method`、`:path` 等 HTTP/2 / HTTP/3 偽標頭（Pseudo-headers），確保產生的指令可直接在終端機或 IDE 中執行。

---

### 3. 視覺化 JSON 回應比對 (Response Diff)
> 點擊頂部導航列的「**⚡ Diff**」按鈕，挑選基準請求 (A) 與比對請求 (B)，系統會進行遞迴結構比對。

<p align="center">
  <img src="assets/screenshots/3-diff.jpg" alt="視覺化 JSON 回應比對" width="100%" style="border-radius: 8px; border: 1px solid rgba(255,255,255,0.1);" />
</p>

* **`+ Added`（綠色）**：比對組新增的欄位或屬性。
* **`- Removed`（紅色）**：比對組遺失或被刪除的欄位。
* **`~ Modified`（黃色）**：同一欄位但值發生變更。
* 頂部提供匯總計數器（如 `+2 added, -2 removed, ~0 modified`），API 改版差異一秒掌握。

---

### 4. 智能狀態碼診斷 (Status Insights)
> 當 API 出現 4xx 或 5xx 錯誤時，切換到「**Insights**」分頁，系統會由純本地規則引擎即時分析可能原因與解決方案。

<p align="center">
  <img src="assets/screenshots/4-insights.jpg" alt="智慧狀態碼診斷" width="100%" style="border-radius: 8px; border: 1px solid rgba(255,255,255,0.1);" />
</p>

* **401 Unauthorized**：精準分辨是「未攜帶認證標頭」還是「攜帶了憑證但過期或被拒」，並給出具體檢查清單。
* **429 Too Many Requests**：自動解析 `Retry-After` Header，精確告知需要等待多少秒。
* **500 Internal Server Error**：自動偵測回應是否為 HTML 格式（例如 Nginx / Cloudflare 502/504 預設崩潰頁）。
* **Status 0**：自動分析是否為 CORS 跨網域預檢失敗、SSL 自簽名證書無效或網路斷線。

---

### 5. 本機安全暫時解鎖 (Reveal Locally)
> 如果您自己在開發中確實需要查看原始 Token，可以點擊「**👁️ Reveal Locally**」。

<p align="center">
  <img src="assets/screenshots/5-reveal.jpg" alt="本機安全暫時解鎖" width="100%" style="border-radius: 8px; border: 1px solid rgba(255,255,255,0.1);" />
</p>

* **安全雙保險機制**：
  * 畫面頂部會出現醒目的黃色警告橫幅，提醒目前處於暫時查看狀態。
  * **資安承諾**：即使畫面上暫時解鎖了，此時點擊「Copy」、「cURL」或「匯出除錯包」，**產出的字串依然維持完全遮蔽**！未脫敏資料只存在於內存獨立 Map 中，絕不滲透到外銷路徑。

---

## 🚀 30 秒快速上手

### 步驟 1：取得專案並編譯
```bash
# 複製倉庫
git clone https://github.com/malilion/devtrace-lion.git
cd devtrace-lion

# 安裝依賴 (使用 pnpm)
pnpm install

# 編譯 Chrome MV3 擴充套件
pnpm build
```
*(編譯完成的檔案會輸出於 `.output/chrome-mv3` 目錄中)*

---

### 步驟 2：在瀏覽器中載入

#### 👉 Chrome / Edge / Brave 瀏覽器：
1. 打開瀏覽器，在網址列輸入 `chrome://extensions/`
2. 將右上角的「**開發人員模式 (Developer mode)**」切換開關打開。
3. 點擊左上角的「**載入未封裝項目 (Load unpacked)**」。
4. 選擇專案目錄中的 **`.output/chrome-mv3`** 資料夾。

#### 👉 Firefox 瀏覽器：
1. 執行 `pnpm build:firefox` 編譯 Firefox 版本。
2. 網址列輸入 `about:debugging#/runtime/this-firefox`。
3. 點擊「**載入暫時性附加元件 (Load Temporary Add-on)**」，選擇 `.output/firefox-mv2/manifest.json`。

---

### 步驟 3：開始使用！
1. 按下 `F12`（Mac 上為 `Cmd + Option + I`）開啟開發者工具。
2. 在頂部面板分頁中找到 **「DevTrace」**（找不到時可點擊 `>>` 展開選單）。
3. 重新整理網頁或點擊頁面上的任何按鈕，開始享受乾淨、安全的 API 偵錯體驗！

---

## 🧪 獨立 Mock 測試模式 (Standalone Mode)

如果您不想開啟 DevTools，想直接在一般網頁分頁中快速預覽或做自動化測試：

```bash
# 啟動本地開發伺服器
pnpm dev
```
打開瀏覽器訪問：
```text
http://localhost:3000/panel.html?mock=1
```
系統會自動載入預置的各類測試請求（GET 200、POST 201、401 Bearer、429 Retry-After、二進位 PNG 等），方便 UI 調整與展示。

---

## ⌨️ 常用快捷鍵 (Keyboard Shortcuts)

| 快捷鍵 | 功能說明 |
| :---: | :--- |
| `/` | 游標快速聚焦到搜尋欄，立即輸入篩選路徑或網址 |
| `c` | 快速將選中的請求複製為脫敏後的安全 **cURL 指令** |
| `d` | 快速開啟 **JSON Diff** 比較視窗 |
| `x` | 清空目前的請求清單（與清除按鈕功能相同） |
| `Esc` | 關閉開啟的彈出視窗（設定、Diff 比對等） |

---

## 🔒 資安與隱私宣言 (Security Manifesto)

1. **零擴充權限（Zero Permissions）**：不申請 `<all_urls>`、不讀取瀏覽紀錄、不偷傳 Cookies。
2. **純記憶體運作（Volatile Memory Only）**：所有封包僅保存在目前 DevTools 視窗的 RAM 之中，關閉開發者工具即自動銷毀。
3. **絕無外部呼叫（Zero Telemetry）**：沒有 Google Analytics、沒有任何追蹤代碼、不用任何雲端 API。
4. **剪貼簿安全保證（Copy-Safe Guarantee）**：一鍵複製或匯出時，所有金鑰必定以 `•••••••••••` 遮蔽，保護您的團隊資安。

詳細安全與隱私政策請參閱 [SECURITY.md](SECURITY.md) 與 [PRIVACY.md](PRIVACY.md)。

---

## 🛠️ 開發與測試指令

```bash
# 執行 TypeScript 嚴格型別檢查
pnpm typecheck

# 執行全套 54 項單元與元件測試
pnpm test

# 執行 ESLint 語法檢查
pnpm lint

# 重新自動截取 Chrome 線上商店規格截圖與宣傳圖塊
pnpm assets:store
```

---

## 🤝 參與貢獻 (Contributing)

歡迎任何形式的貢獻！無論是回報問題、提出建議、新增語言產生器或補充診斷規則，請參考 [CONTRIBUTING.md](CONTRIBUTING.md)。

---

## 📄 授權條款 (License)

DevTrace Lion 採用 [MIT 授權條款](LICENSE) 開源。  
Part of the **Malilion Browser Tools** ecosystem.
