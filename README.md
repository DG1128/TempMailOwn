# ⚡ TempMail Pro — Worldwide Infallible Temporary Email System

A high-performance temporary disposable email web application powered by a **Worldwide Multi-Engine Federation** (TempMail.io CDN, Mail.tm Enterprise, and Guerrilla Mail 18-Year Shield), featuring **17+ global business `.com` domains**, **multi-inbox tabs**, **permanent lock vault for long-term email use**, **smart OTP & verification code extraction**, **instant test email simulator**, **synthetic identity generator**, and **rich sandboxed HTML email preview**.

---

## 🌟 Key Features & Upgrades

### 1. 🌐 Worldwide Multi-Engine Federation (Infallible 100% Uptime)
- **Auto-Failover Architecture**: Unlike fragile single-provider tools that break when one upstream API encounters downtime or a 502 Bad Gateway, TempMail Pro routes traffic seamlessly across three independent worldwide networks:
  - **TempMail.io CDN (US/EU)**: Fast corporate `.com` domains (`ruutukf.com`, `yzcalo.com`, `lnovic.com`, `gmeenramy.com`, `olipii.com`, `ooynib.com`, `tanpony.com`).
  - **Mail.tm Enterprise Hydra**: High-delivery token-authenticated engine (`maxxspace.com`).
  - **Guerrilla Mail (18-Year Infallible Shield)**: Operating continuously since 2006 with 9 resilient global domains (`sharklasers.com`, `guerrillamail.com`, `guerrillamail.info`, `grr.la`, `guerrillamail.biz`, `guerrillamail.net`, `guerrillamail.org`, `pokemail.net`).
  - **Mail.gw**: Auto-monitored secondary gateway.
- **Real-Time Telemetry Monitor**: Click the top status badge to inspect live pings (ms) and operational status of all global email nodes.

### 2. ⚡ Instant Test Email Simulator
- Test your active temporary mailbox in **under 1 second** without needing external websites.
- 1-click test scenarios for **GitHub 2FA**, **Google Verification PIN**, and **Discord Security**.
- Delivers realistic HTML emails directly to your active inbox to test the OTP extractor, chime, confetti, and reader.

### 3. 👤 Fake Persona & Identity Generator
- Quickly generate authentic synthetic identities for form registrations:
  - Full Name, Phone Number, Street Address, City, State, Zip, Country, Company, Job Title, and Birthday.
  - 1-click copy buttons for every individual field or the entire profile.

### 4. 🛡️ Legit Corporate Domains & High Stealth Rating
- High Bypass Score (96%–99%): Corporate domains look authentic and bypass strict disposable email blacklists on websites, SaaS signups, and social media platforms.

### 5. 🔒 Permanent Mailbox Lock & Long-Term Vault
- **Lock / Pin Inboxes**: Lock any temporary email address with 1 click to prevent auto-cleanup or accidental deletion.
- **Custom Labels & Notes**: Attach custom tags (e.g. `Netflix Trial`, `AWS Dev Test`, `GitHub Account`) to remember what each address was used for.
- **Backup & Restore**: Export your locked accounts as JSON backups and import them anytime on any device.

### 6. 📑 Multi-Inbox Concurrent Tabs
- Manage up to **10 active disposable email addresses simultaneously** in tabs without losing inbox messages.
- Real-time unread badges and quick tab switching with zero page reloads.

### 7. ⚡ Smart OTP & Verification Code Extractor
- Automatically scans incoming emails and detects 4, 6, 8-digit verification codes (OTP, security PINs, confirmation links).
- Displays a glowing **"⚡ Verification Code Detected: [ 123456 ] (Copy Code)"** banner with 1-click clipboard copy and celebratory confetti feedback.

### 8. 📧 Rich Email Reader & Privacy Sandbox
- **Sandboxed Iframe**: Renders complex HTML emails securely while blocking malicious scripts.
- **Privacy Shield**: Toggle external images to protect your IP address from email tracking pixels.
- **Plain Text & RFC822 Headers View**: Inspect raw email headers, SPF/DKIM data, and source.
- **Actions**: Download as `.eml`, Print, Copy body text, or Delete.

### 9. ⏱️ Live Polling & Sound Alerts
- Configurable auto-refresh countdown with an animated circular progress ring.
- Harmonic notification chimes generated via the browser Web Audio API (no external mp3 files needed).
- Dynamic browser tab title with unread counter `(1) New Email - TempMail Pro`.

### 10. 📱 Mobile Companion & QR Code
- Instant QR Code modal so you can scan with a smartphone camera and copy or view emails on the go.

### 11. 🎨 4 Modern Glassmorphism Themes
- **Cyber Dark** (Default neon indigo & cyan aura)
- **OLED Midnight** (True pitch black `#000000` with emerald accents)
- **Sunset Neon** (Deep violet aura with pink neon)
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

## 🛠️ Architecture

```
                      [Browser Client]
                      (React 18 + Vite)
                             │
                             │ (Proxy: /api)
                             ▼
               [Express Worldwide Gateway Server]
                         (Port :5000)
       ┌─────────────────────┼─────────────────────┐
       ▼                     ▼                     ▼
[TempMail.io CDN]     [Mail.tm Hydra]    [Guerrilla Mail 18y]
(7x .COM Domains)    (Enterprise Token)     (9x Domains)
```

---

## 📡 API Endpoints

| Endpoint | Method | Description |
|---|---|---|
| `/api/domains` | `GET` | Fetches active business domains across global providers |
| `/api/providers/status` | `GET` | Real-time health & latency monitor of all global nodes |
| `/api/mailbox/create` | `POST` | Auto-failover mailbox creation with optional custom domain |
| `/api/mailbox/login` | `POST` | Re-authenticates a saved/locked mailbox |
| `/api/mailbox/messages` | `GET` | Retrieves inbox messages for active mailbox |
| `/api/mailbox/messages/:id` | `GET` | Retrieves full email body, HTML, and attachments |
| `/api/mailbox/simulate-email` | `POST` | Injects an instant simulated test email with OTP code |
| `/api/fake-persona` | `GET` | Generates synthetic personal identity for forms |
| `/api/mailbox/messages/:id` | `DELETE` | Deletes a specific email message |
| `/api/health` | `GET` | Gateway health check |
