/* =========================================================================
   OM MOBILE & ELECTRONICS (PCS Chowk, Dhanore, Pune)
   Dedicated Vercel Serverless Function: /api/admin/login
   ========================================================================= */

const ADMIN_USER = (process.env.ADMIN_USERNAME || 'guarav bhosle').trim().toLowerCase();
const ADMIN_PASS = (process.env.ADMIN_PASSWORD || 'guarav@omelectronics');

function parseBody(req) {
  if (req.body !== undefined && req.body !== null) {
    if (typeof req.body === 'object' && !Buffer.isBuffer(req.body)) return Promise.resolve(req.body);
    if (Buffer.isBuffer(req.body)) {
      try { return Promise.resolve(JSON.parse(req.body.toString('utf8'))); } catch (e) { return Promise.resolve({}); }
    }
    if (typeof req.body === 'string') {
      try { return Promise.resolve(JSON.parse(req.body)); } catch (e) { return Promise.resolve({}); }
    }
  }
  return new Promise((resolve) => {
    const chunks = [];
    req.on('data', chunk => chunks.push(chunk));
    req.on('end', () => {
      try {
        const raw = Buffer.concat(chunks).toString('utf8');
        resolve(raw ? JSON.parse(raw) : {});
      } catch (e) {
        resolve({});
      }
    });
    req.on('error', () => resolve({}));
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
      branch: 'Dhanore Showroom, Dhanore'
    }));
  } else {
    res.end(JSON.stringify({
      success: false,
      message: 'Invalid username or password'
    }));
  }
};
