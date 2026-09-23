# Homelab & Production Deployment Guide 🚀

This document provides a comprehensive, battle-tested deployment guide for the **Luxe Jewelry Social Commerce Platform** on a Linux server or **Proxmox LXC Container** using **Node.js, PM2, Cloudflare Tunnel, Meta Messenger Webhooks, and Telegram Bot**.

---

## 📋 System Requirements & Architecture

- **Host OS:** Ubuntu 22.04 / 24.04 LTS (Proxmox LXC Container 100 or VPS)
- **Node.js:** Node.js v20.x or v22.x LTS
- **Database:** Embedded SQLite 3 (`shop.db` with WAL mode enabled)
- **Process Manager:** PM2 (running in fork or cluster mode)
- **Reverse Proxy / SSL:** Cloudflare Tunnel (`cloudflared`) pointing to `http://localhost:3000`
- **Domain:** `https://test.trapiseth.site`

---

## 🗂️ Server Directory Architecture

We separate legacy prototypes from the production/capstone application to avoid port and naming conflicts:

| App | Directory Path | PM2 Name | Port | Description |
|---|---|---|---|---|
| **Old Prototype** | `/root/jewelry-shop-prototype` | `jewelry-prototype` | `3000` *(Stopped)* | Preserved prototype codebase |
| **Active Capstone** | `/opt/jewelry-shop` | `jewelry-shop` | `3000` *(Online)* | Production Capstone application |

---

## 🛠️ Step-by-Step Installation

### Step 1: Install Node.js v22 LTS & Build Tools

```bash
# Update system packages
apt-get update && apt-get install -y curl git build-essential

# Install Node.js 22 LTS via NodeSource
curl -fsSL https://deb.nodesource.com/setup_22.x | bash -
apt-get install -y nodejs

# Verify versions
node -v   # Should show v22.x.x
npm -v    # Should show v10.x.x
```

### Step 2: Install PM2 Globally

```bash
npm install -g pm2
```

### Step 3: Clone the Repository to `/opt/jewelry-shop`

```bash
cd /opt
git clone https://github.com/MrSethZinTwoAccoundRealNoFakeOnTheMix/jewelry-shop_capstone-project-.git jewelry-shop
cd /opt/jewelry-shop
```

### Step 4: Install Production Dependencies

```bash
npm install --omit=dev
```
> `--omit=dev` ensures build speed and skips dev-only tools like `nodemon`.

---

## ⚙️ Environment Configuration (`.env`)

Create the production environment file:

```bash
nano /opt/jewelry-shop/.env
```

Paste your production secrets:

```env
PORT=3000
NODE_ENV=production
BASE_URL=https://your-domain.com

# --- Meta App & Messenger ---
APP_SECRET=your_meta_app_secret_here
APP_SESSION_TOKEN=your_meta_page_access_token_here
VERIFY_TOKEN=your_webhook_verify_token_here

# --- Admin Security ---
ADMIN_PASSWORD=your_secure_admin_password_here

# --- Telegram Notifications & Owner Control ---
TELEGRAM_BOT_TOKEN=your_telegram_bot_token_here
TELEGRAM_OWNER_CHAT_ID=your_primary_numeric_user_id_here
TELEGRAM_OWNER_CHAT_ID_2=optional_second_owner_user_id_here
```

> [!IMPORTANT]
> `NODE_ENV=production` disables demo identity bypasses and ensures timing-safe HMAC checks.
> Never share or commit your `.env` file to version control.

---

## 🗄️ Database Setup & Migrations

Initialize the SQLite database schema and seed initial demo products:

```bash
cd /opt/jewelry-shop
npm run migrate
npm run seed
```

This creates:
- `shop.db`: Core database storing products, orders, order items, and metadata.
- `shop.db-wal` & `shop.db-shm`: Write-Ahead Log files guaranteeing high concurrency and fast performance.

---

## 💬 Meta Messenger Setup

To enable auto-replies, customer receipts, and interactive chips:

### 1. Webhook Verification in Meta Developer Portal
1. Navigate to **Meta Developer Portal** ➔ **Your App** ➔ **Messenger** ➔ **Webhooks**.
2. Set **Callback URL**: `https://your-domain.com/webhook`
3. Set **Verify Token**: (must match `VERIFY_TOKEN` in `.env`).
4. Click **Verify and Save**.

### 2. Subscribe Facebook Page to Webhook Events
1. In the Webhook settings for your page, click **Add Subscriptions** / **Edit Subscriptions**.
2. Select your Facebook Page and enable:
   - ✅ **`messages`** (Incoming customer messages)
   - ✅ **`messaging_postbacks`** (Button clicks and Ice Breaker triggers)
3. Click **Save**.

### 3. Initialize Messenger Profile (Ice Breakers & Menu)
Run the automated profile setup script from `/opt/jewelry-shop`:

```bash
node setup-messenger-profile.js
```

This registers the following on Meta's servers:
- **Get Started** button (`payload: GET_STARTED`)
- **Welcome Greeting** dialog
- **3 Ice Breaker prompt chips** (*"✨ Open Jewelry Store"*, *"💍 How do I place an order?"*, *"📍 Store Location"*)
- **Persistent Menu** (3-bar hamburger menu with store webview link)

---

## 🤖 Telegram Bot Setup

1. Message **@BotFather** on Telegram to create your bot and obtain the `TELEGRAM_BOT_TOKEN`.
2. Send `/start` to your bot, or use `@userinfobot` to find your numerical Telegram User ID.
3. Set `TELEGRAM_OWNER_CHAT_ID` (and optionally `TELEGRAM_OWNER_CHAT_ID_2`) in `.env`.
4. Only configured owner IDs receive real-time order alerts and have permission to execute `/menu` and one-tap order approvals.

> [!WARNING]
> Only **one instance** of the application can run polling for a Telegram bot token at any given time.
> Running both a local dev machine and the homelab server concurrently with the same token will trigger `409 Conflict: terminated by other getUpdates request`.

---

## 🌐 Cloudflare Tunnel Setup (`cloudflared`)

If `cloudflared` is already installed on the container:

```bash
# Verify status
systemctl status cloudflared
```

Ensure `/root/.cloudflared/config.yml` routes traffic to port `3000`:

```yaml
tunnel: <your-tunnel-uuid>
credentials-file: /root/.cloudflared/<your-tunnel-uuid>.json

ingress:
  - hostname: test.trapiseth.site
    service: http://localhost:3000
  - service: http_status:404
```

Restart the tunnel daemon if changes are made:
```bash
systemctl restart cloudflared
```

---

## 🚀 Running & Managing with PM2

### Start the Application

```bash
cd /opt/jewelry-shop
pm2 start ecosystem.config.js --name "jewelry-shop"
pm2 save
pm2 startup
```
*(Copy and run the `sudo env PATH=...` command that `pm2 startup` prints to enable auto-start on server reboot).*

### Common Operations

| Task | Command |
|---|---|
| **View real-time status** | `pm2 status` |
| **Stream live application logs** | `pm2 logs jewelry-shop` |
| **Stream last 50 lines** | `pm2 logs jewelry-shop --lines 50` |
| **Restart application** | `pm2 restart jewelry-shop` |
| **Restart and reload modified `.env`** | `pm2 restart jewelry-shop --update-env` |
| **Stop application** | `pm2 stop jewelry-shop` |
| **Switch from prototype to capstone** | `pm2 stop jewelry-prototype && pm2 start jewelry-shop` |
| **Switch from capstone to prototype** | `pm2 stop jewelry-shop && pm2 start jewelry-prototype` |

---

## 🔄 Deploying Updates & Code Changes

Whenever you push new features or bug fixes to GitHub:

```bash
# 1. Navigate to project directory
cd /opt/jewelry-shop

# 2. Pull latest commits
git pull origin master

# 3. Install new dependencies (if package.json was updated)
npm install --omit=dev

# 4. Run migrations (if new SQL migrations were added)
npm run migrate

# 5. Restart the server with updated environment
pm2 restart jewelry-shop --update-env
```

---

## 🔍 Troubleshooting Guide

### 1. `Invalid OAuth access token - Cannot parse access token (Code 190)`
- **Cause:** `APP_SESSION_TOKEN` in `.env` is either empty, placeholder `<your Page Access Token>`, or expired.
- **Fix:** Copy the real Page Access Token into `/opt/jewelry-shop/.env` and re-run `node setup-messenger-profile.js`.

### 2. `409 Conflict: terminated by other getUpdates request`
- **Cause:** Multiple processes are long-polling Telegram with the same token (e.g., your laptop and your server).
- **Fix:** Terminate the local laptop process so that only the homelab server connects to Telegram.

### 3. Messenger bot not auto-replying to messages
- **Cause:** The Facebook Page is not subscribed to `messages` and `messaging_postbacks` in Meta Developer Portal.
- **Fix:** In Meta Portal ➔ Webhooks ➔ Select Page ➔ Click "Subscribe" and ensure `messages` and `messaging_postbacks` are checked.

### 4. Admin login returns "Incorrect admin password"
- **Cause:** Password mismatch in `.env`, or PM2 cached an old password in memory.
- **Fix:** Verify `ADMIN_PASSWORD` in `/opt/jewelry-shop/.env`, then run `pm2 restart jewelry-shop --update-env`.

### 5. Cooldown between customer messages
- **Config:** Configured in `src/config/constants.js` via `SHOP_LINK_COOLDOWN_MS`.
- **Behavior:** Explicit requests (`shop`, `ចូលហាង`, or button clicks) always respond immediately. Greetings are throttled to avoid message spam.
