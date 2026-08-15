# ⚡ TempMail Pro — Disposable Temporary Email System

A temporary disposable email web application with **legitimate business `.com` domains**, **multi-inbox tabs**, **permanent lock vault for long-term email use**, **smart OTP & verification code extraction**, and **rich sandboxed HTML email preview**.

![TempMail Pro Preview](https://images.unsplash.com/photo-1557200134-90327ee9fafa?w=1200&auto=format&fit=crop&q=80)

---

## 🌟 Key Features

### 1. 🛡️ Legit Corporate Domains & High Stealth Rating
- Powered by free public API integrations (**Mail.gw** and **Mail.tm**) providing clean, active `.com` business domains (e.g. `raleigh-construction.com`, `questtechsystems.com`, `pastryofistanbul.com`, `oakon.com`, `teihu.com`, `emalupe.com`).
- **High Bypass Score (96%–99%)**: Corporate domains look authentic and bypass strict disposable email blacklists on websites, SaaS signups, and social media platforms.

### 2. 🔒 Permanent Mailbox Lock & Long-Term Vault
- **Lock / Pin Inboxes**: Lock any temporary email address with 1 click to prevent auto-cleanup or accidental deletion.
- **Custom Labels & Notes**: Attach custom tags (e.g. `Netflix Trial`, `AWS Dev Test`, `GitHub Account`) to remember what each address was used for.
- **Backup & Restore**: Export your locked accounts as JSON backups and import them anytime on any device.

### 3. 📑 Multi-Inbox Concurrent Tabs
- Manage up to **10 active disposable email addresses simultaneously** in tabs without losing inbox messages.
- Real-time unread badges and quick tab switching with zero page reloads.

### 4. ⚡ Smart OTP & Verification Code Extractor
- Automatically scans incoming emails and detects 4, 6, 8-digit verification codes (OTP, security PINs, confirmation links).
- Displays a glowing **"⚡ Verification Code Detected: [ 123456 ] (Copy Code)"** banner with 1-click clipboard copy and celebratory confetti feedback.

### 5. 📧 Rich Email Reader & Privacy Sandbox
- **Sandboxed Iframe**: Renders complex HTML emails securely while blocking malicious scripts.
- **Privacy Shield**: Toggle external images to protect your IP address from email tracking pixels.
- **Plain Text & RFC822 Headers View**: Inspect raw email headers, SPF/DKIM data, and source.
- **1-Click Attachments Download**: Download files and attachments directly through the proxy.
- **Actions**: Download as `.eml`, Print, Copy body text, or Delete.

### 6. ⏱️ Live Polling & Sound Alerts
- Configurable auto-refresh countdown with an animated circular progress ring.
- Harmonic notification chimes generated via the browser Web Audio API (no external mp3 files needed).
- Dynamic browser tab title with unread counter `(1) New Email - TempMail Pro`.

### 7. 📱 Mobile Companion & QR Code
- Instant QR Code modal so you can scan with a smartphone camera and copy or view emails on the go.

### 8. 🎨 4 Modern Glassmorphism Themes
- **Cyber Dark** (Default neon indigo & cyan aura)
- **OLED Black** (True pitch black `#000000` with emerald accents)
- **Sunset Violet** (Deep purple aura)
- **Clean Light** (Modern SaaS light mode)

---

## ⚡ Quick Start

### 1. Install Dependencies
```bash
npm run install:all
```

### 2. Start Development Server
```bash
npm run dev
```

- **Frontend App**: `http://localhost:3000`
- **Backend API**: `http://localhost:5000`

---

## 🛠️ Tech Stack & Architecture

```
                      [Browser Client]
                      (React 18 + Vite)
                             │
                             │ (Proxy: /api)
                             ▼
                   [Express Proxy Server]
                        (Port :5000)
                   ┌─────────┴─────────┐
                   ▼                   ▼
            [Mail.gw API]        [Mail.tm API]
          (Corporate .COM)      (High Delivery)
```

- **Frontend**: React 18, Vite, Lucide-React, DOMPurify, Canvas Confetti, QRCode, Web Audio API.
- **Backend**: Node.js, Express, CORS, Dotenv.
- **Free Public APIs**: Mail.gw, Mail.tm (Zero API keys required, 100% free).

---

## 📡 API Endpoints

| Endpoint | Method | Description |
|---|---|---|
| `/api/domains` | `GET` | Fetches active business domains with stealth scores |
| `/api/mailbox/create` | `POST` | Creates a new mailbox and returns auth token |
| `/api/mailbox/login` | `POST` | Re-authenticates a saved/locked mailbox |
| `/api/mailbox/messages` | `GET` | Retrieves inbox messages for active token |
| `/api/mailbox/messages/:id` | `GET` | Retrieves full email body, HTML, and attachments |
| `/api/mailbox/attachment` | `GET` | Proxies file attachment downloads |
| `/api/mailbox/messages/:id` | `DELETE` | Deletes a specific email message |
| `/api/health` | `GET` | Health check & upstream API status |
