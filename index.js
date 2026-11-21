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

// Static string literals required for @vercel/nft to bundle all HTML files
const STATIC_ASSETS = {
  '/': path.join(__dirname, 'index.html'),
  '/index': path.join(__dirname, 'index.html'),
  '/index.html': path.join(__dirname, 'index.html'),
  '/products': path.join(__dirname, 'products.html'),
  '/products/': path.join(__dirname, 'products.html'),
  '/products.html': path.join(__dirname, 'products.html'),
  '/admin': path.join(__dirname, 'admin.html'),
  '/admin/': path.join(__dirname, 'admin.html'),
  '/admin.html': path.join(__dirname, 'admin.html'),
  '/admin/index.html': path.join(__dirname, 'admin.html'),
  '/store.js': path.join(__dirname, 'store.js'),
  '/admin/store.js': path.join(__dirname, 'store.js'),
  '/logo.png': path.join(__dirname, 'logo.png'),
  '/admin/logo.png': path.join(__dirname, 'logo.png')
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

  // 2. Normalize pathname (strip trailing slash if present)
  const cleanPath = pathname.length > 1 ? pathname.replace(/\/$/, '') : pathname;

  if (STATIC_ASSETS[cleanPath] || STATIC_ASSETS[pathname]) {
    const targetFile = STATIC_ASSETS[cleanPath] || STATIC_ASSETS[pathname];
    if (fs.existsSync(targetFile)) {
      const ext = path.extname(targetFile).toLowerCase();
      const isDynamic = ext === '.html' || ext === '.js';
      res.writeHead(200, {
        'Content-Type': MIME_TYPES[ext] || 'text/html; charset=utf-8',
        'Cache-Control': isDynamic ? 'no-cache, must-revalidate' : 'public, max-age=3600'
      });
      return res.end(fs.readFileSync(targetFile));
    }
  }

  // 3. Fallback for any other file on disk
  const directPath = path.join(__dirname, pathname);
  try {
    if (fs.existsSync(directPath) && fs.statSync(directPath).isFile()) {
      const ext = path.extname(directPath).toLowerCase();
      const isDynamic = ext === '.html' || ext === '.js';
      res.writeHead(200, {
        'Content-Type': MIME_TYPES[ext] || 'application/octet-stream',
        'Cache-Control': isDynamic ? 'no-cache, must-revalidate' : 'public, max-age=3600'
      });
      return res.end(fs.readFileSync(directPath));
    }
  } catch (err) {}

  // 4. Default fallback: index.html
  const indexPath = path.join(__dirname, 'index.html');
  if (fs.existsSync(indexPath)) {
    res.writeHead(200, { 'Content-Type': 'text/html; charset=utf-8' });
    return res.end(fs.readFileSync(indexPath));
  }

  res.writeHead(404, { 'Content-Type': 'text/plain' });
  res.end('Not Found');
};
