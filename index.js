/* =========================================================================
   OM MOBILE & ELECTRONICS (Branch No. 4, Dhanore, Pune)
   Universal Entrypoint for Vercel Serverless / Node.js Runtime
   ========================================================================= */

const fs = require('fs');
const path = require('path');

const MIME_TYPES = {
  '.html': 'text/html; charset=utf-8',
  '.js': 'application/javascript; charset=utf-8',
  '.json': 'application/json; charset=utf-8',
  '.css': 'text/css; charset=utf-8',
  '.png': 'image/png',
  '.jpg': 'image/jpeg',
  '.jpeg': 'image/jpeg',
  '.webp': 'image/webp',
  '.svg': 'image/svg+xml',
  '.ico': 'image/x-icon'
};

let apiHandler;
try {
  apiHandler = require('./api/index.js');
} catch (e) {
  console.warn('API handler lazy load warning:', e.message);
}

module.exports = async (req, res) => {
  const parsedUrl = new URL(req.url, `http://${req.headers.host || 'localhost'}`);
  let pathname = parsedUrl.pathname;

  // 1. Forward API routes to dedicated handler
  if (pathname.startsWith('/api')) {
    if (typeof apiHandler === 'function') {
      return apiHandler(req, res);
    }
  }

  // 2. Resolve clean URLs to static HTML files
  if (pathname === '/' || pathname === '') {
    pathname = '/index.html';
  } else if (pathname === '/products') {
    pathname = '/products.html';
  } else if (pathname === '/admin') {
    pathname = '/admin.html';
  }

  const filePath = path.join(__dirname, pathname);
  const ext = path.extname(filePath).toLowerCase();

  try {
    if (fs.existsSync(filePath)) {
      const content = fs.readFileSync(filePath);
      const contentType = MIME_TYPES[ext] || 'application/octet-stream';
      res.writeHead(200, {
        'Content-Type': contentType,
        'Cache-Control': ext === '.html' ? 'no-cache' : 'public, max-age=3600'
      });
      return res.end(content);
    }
  } catch (err) {
    console.error('File read error:', err.message);
  }

  // Fallback to index.html for Single Page Applications
  try {
    const fallbackPath = path.join(__dirname, 'index.html');
    if (fs.existsSync(fallbackPath)) {
      const content = fs.readFileSync(fallbackPath);
      res.writeHead(200, { 'Content-Type': 'text/html; charset=utf-8' });
      return res.end(content);
    }
  } catch (err) {}

  res.writeHead(404, { 'Content-Type': 'text/plain' });
  res.end('Not Found');
};
