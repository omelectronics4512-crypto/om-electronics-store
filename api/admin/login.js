/* =========================================================================
   OM MOBILE & ELECTRONICS (Branch No. 4, Dhanore, Pune)
   Dedicated Vercel Serverless Function: /api/admin/login
   ========================================================================= */

const ADMIN_USER = (process.env.ADMIN_USERNAME || 'guarav bhosle').trim().toLowerCase();
const ADMIN_PASS = (process.env.ADMIN_PASSWORD || 'guarav@omelectronics');

function parseBody(req) {
  if (req.body !== undefined && req.body !== null) {
    if (typeof req.body === 'object') return Promise.resolve(req.body);
    if (typeof req.body === 'string') {
      try { return Promise.resolve(JSON.parse(req.body)); } catch (e) { return Promise.resolve({}); }
    }
  }
  if (req.readableEnded || req.complete) {
    return Promise.resolve({});
  }
  return new Promise((resolve) => {
    let body = '';
    const timer = setTimeout(() => resolve({}), 2000);
    req.on('data', chunk => body += chunk.toString());
    req.on('end', () => {
      clearTimeout(timer);
      try { resolve(body ? JSON.parse(body) : {}); } catch (e) { resolve({}); }
    });
    req.on('error', () => {
      clearTimeout(timer);
      resolve({});
    });
  });
}

module.exports = async (req, res) => {
  if (req.method === 'OPTIONS') {
    res.writeHead(204, {
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Methods': 'POST, OPTIONS',
      'Access-Control-Allow-Headers': 'Content-Type, Authorization, X-Requested-With'
    });
    res.end();
    return;
  }

  if (req.method !== 'POST') {
    res.writeHead(405, { 'Content-Type': 'application/json' });
    res.end(JSON.stringify({ error: 'Method not allowed' }));
    return;
  }

  const { username, password } = await parseBody(req);
  const userClean = (username || '').trim().toLowerCase();

  res.writeHead(userClean === ADMIN_USER && password === ADMIN_PASS ? 200 : 401, {
    'Content-Type': 'application/json',
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Methods': 'POST, OPTIONS',
    'Access-Control-Allow-Headers': 'Content-Type, Authorization, X-Requested-With'
  });

  if (userClean === ADMIN_USER && password === ADMIN_PASS) {
    res.end(JSON.stringify({
      success: true,
      message: 'Authenticated successfully',
      adminName: 'Gaurav Bhosle',
      branch: 'Branch No. 4, Dhanore'
    }));
  } else {
    res.end(JSON.stringify({
      success: false,
      message: 'Invalid username or password'
    }));
  }
};
