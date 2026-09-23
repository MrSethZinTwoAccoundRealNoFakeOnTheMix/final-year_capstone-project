const path = require('path');
const fs = require('fs');
const express = require('express');
const routes = require('./routes');
const errorHandler = require('./middlewares/errorHandler');

const app = express();

// Trust reverse proxies (Cloudflare Tunnel, Nginx, PM2)
app.set('trust proxy', 1);

// Parse JSON and capture raw buffer for Meta Webhook signature verification
app.use(
  express.json({
    verify: (req, res, buf) => {
      req.rawBody = buf;
    },
  })
);

// Parse URL-encoded bodies
app.use(express.urlencoded({ extended: true }));

// Serve static assets from public/ (CSS, JS, uploads)
app.use(express.static(path.join(__dirname, '../public')));

// Webview route: serves customer storefront
app.get(['/', '/webview'], (req, res) => {
  const indexPath = path.join(__dirname, '../public/index.html');
  if (fs.existsSync(indexPath)) {
    return res.sendFile(indexPath);
  }
  res.json({
    name: 'Luxe Jewelry API',
    status: 'online',
    phase: 'Phase 2 (Backend API Ready)',
    message: 'Storefront webview will be populated in Phase 3.',
  });
});

// Admin dashboard route
app.get('/admin', (req, res) => {
  const adminPath = path.join(__dirname, '../public/admin.html');
  if (fs.existsSync(adminPath)) {
    return res.sendFile(adminPath);
  }
  res.json({
    name: 'Luxe Jewelry Admin API',
    status: 'online',
    phase: 'Phase 2 (Backend API Ready)',
    message: 'Admin dashboard UI will be populated in Phase 4.',
  });
});

// Mount all API & Webhook routes
app.use(routes);

// Global Error Handler
app.use(errorHandler);

module.exports = app;
