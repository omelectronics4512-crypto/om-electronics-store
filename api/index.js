/* =========================================================================
   OM MOBILE & ELECTRONICS (Branch No. 4, Dhanore, Pune)
   Vercel Serverless Function API Handler (/api/*)
   ========================================================================= */

let OM_SAMPLE_PRODUCTS = [];
try {
  const storeModule = require('../store.js');
  OM_SAMPLE_PRODUCTS = storeModule.OM_SAMPLE_PRODUCTS || [];
} catch (e) {}

const SUPABASE_URL = (process.env.SUPABASE_URL || '').replace(/\/$/, '');
const SUPABASE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.SUPABASE_ANON_KEY || '';
const ADMIN_USER = (process.env.ADMIN_USERNAME || 'guarav bhosle').trim().toLowerCase();
const ADMIN_PASS = (process.env.ADMIN_PASSWORD || 'guarav@omelectronics');

function isCloudActive() {
  return Boolean(
    SUPABASE_URL && 
    SUPABASE_KEY && 
    SUPABASE_URL.startsWith('http') && 
    !SUPABASE_URL.includes('your-project')
  );
}

// Mappers between Supabase snake_case and Frontend camelCase
function dbToProduct(row) {
  if (!row) return null;
  return {
    id: String(row.id),
    name: row.name || 'Device',
    category: row.category || 'smartphones',
    brand: row.brand || 'Apple',
    price: Number(row.price) || 0,
    originalPrice: Number(row.original_price != null ? row.original_price : row.price) || 0,
    emiPerMonth: Number(row.emi_per_month) || 0,
    rating: Number(row.rating) || 4.8,
    reviews: Number(row.reviews) || 0,
    tag: row.tag || 'New',
    tagColor: row.tag_color || 'bg-primary text-white',
    stockStatus: row.stock_status || 'In Stock',
    image: row.image || '',
    description: row.description || '',
    specs: (typeof row.specs === 'object' && row.specs !== null) ? row.specs : {},
    colors: Array.isArray(row.colors) ? row.colors : [],
    createdAt: row.created_at || new Date().toISOString()
  };
}

function productToDb(p) {
  return {
    id: String(p.id),
    name: p.name,
    category: p.category || 'smartphones',
    brand: p.brand || 'Other',
    price: Number(p.price) || 0,
    original_price: Number(p.originalPrice) || Number(p.price) || 0,
    emi_per_month: Number(p.emiPerMonth) || 0,
    rating: Number(p.rating) || 4.8,
    reviews: Number(p.reviews) || 0,
    tag: p.tag || 'New Arrival',
    tag_color: p.tagColor || 'bg-primary text-white',
    stock_status: p.stockStatus || 'In Stock',
    image: p.image || '',
    description: p.description || '',
    specs: p.specs || {},
    colors: Array.isArray(p.colors) ? p.colors : [],
    updated_at: new Date().toISOString()
  };
}

async function supabaseFetch(endpoint, options = {}) {
  const url = `${SUPABASE_URL}/rest/v1${endpoint}`;
  const headers = {
    'apikey': SUPABASE_KEY,
    'Authorization': `Bearer ${SUPABASE_KEY}`,
    'Content-Type': 'application/json',
    ...(options.headers || {})
  };
  return fetch(url, { ...options, headers });
}

function sendJson(res, statusCode, data, isCloudHealthy = null) {
  const cloudActive = isCloudHealthy !== null ? Boolean(isCloudHealthy) : isCloudActive();
  res.writeHead(statusCode, {
    'Content-Type': 'application/json',
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS',
    'Access-Control-Allow-Headers': 'Content-Type, Authorization, X-Requested-With',
    'X-Cloud-Active': cloudActive ? 'true' : 'false'
  });
  res.end(JSON.stringify(data));
}

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
  // Handle CORS Preflight
  if (req.method === 'OPTIONS') {
    res.writeHead(204, {
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS',
      'Access-Control-Allow-Headers': 'Content-Type, Authorization, X-Requested-With'
    });
    res.end();
    return;
  }

  const parsedUrl = new URL(req.url, `http://${req.headers.host || 'localhost'}`);
  const pathParam = req.query?.path || parsedUrl.searchParams.get('path');
  const pathname = pathParam ? ('/api/' + pathParam) : (req.headers['x-matched-path'] || req.headers['x-vercel-matched-path'] || req.headers['x-forwarded-uri'] || parsedUrl.pathname);

  // 1. Status Check
  if (pathname.includes('/status') && req.method === 'GET') {
    return sendJson(res, 200, {
      status: 'online',
      platform: 'Vercel Serverless',
      cloudConfigured: isCloudActive(),
      storageEngine: isCloudActive() ? 'Supabase Cloud PostgreSQL' : 'Local Fallback',
      storeName: 'OM Mobile & Electronics (Branch No. 4, Dhanore)',
      version: '2.0.0-production'
    });
  }

  // 2. Admin Authentication
  if (pathname.includes('/admin/login') && req.method === 'POST') {
    const { username, password } = await parseBody(req);
    const userClean = (username || '').trim().toLowerCase();
    if (userClean === ADMIN_USER && password === ADMIN_PASS) {
      return sendJson(res, 200, {
        success: true,
        message: 'Authenticated successfully',
        adminName: 'Gaurav Bhosle',
        branch: 'Branch No. 4, Dhanore'
      });
    } else {
      return sendJson(res, 401, {
        success: false,
        message: 'Invalid username or password'
      });
    }
  }

  // 3. Products: GET ALL
  if (pathname.includes('/products') && req.method === 'GET') {
    if (isCloudActive()) {
      try {
        const resp = await supabaseFetch('/products?select=*&order=created_at.desc');
        if (resp.ok) {
          const data = await resp.json();
          return sendJson(res, 200, data.map(dbToProduct), true);
        } else {
          const errText = await resp.text();
          console.warn('Supabase products table not found or error:', resp.status, errText);
          return sendJson(res, 200, [], false);
        }
      } catch (e) {
        console.warn('Supabase fetch failed on Vercel:', e.message);
        return sendJson(res, 200, [], false);
      }
    }
    return sendJson(res, 200, [], false);
  }

  // 4. Products: CREATE (POST)
  if (pathname.includes('/products') && req.method === 'POST') {
    const product = await parseBody(req);
    const id = product.id || 'om-' + Date.now() + '-' + Math.random().toString(36).substr(2, 5);
    const newProduct = { ...product, id, createdAt: new Date().toISOString() };

    if (isCloudActive()) {
      try {
        const resp = await supabaseFetch('/products', {
          method: 'POST',
          headers: { 'Prefer': 'resolution=merge-duplicates,return=representation' },
          body: JSON.stringify([productToDb(newProduct)])
        });
        if (resp.ok) {
          const data = await resp.json();
          return sendJson(res, 201, dbToProduct(data[0]), true);
        } else {
          const errText = await resp.text();
          console.warn('Supabase insert failed with status:', resp.status, errText);
          return sendJson(res, 201, newProduct, false);
        }
      } catch (e) {
        console.error('Supabase insert failed on Vercel:', e);
        return sendJson(res, 201, newProduct, false);
      }
    }
    return sendJson(res, 201, newProduct, false);
  }

  // 5. Products: UPDATE (PUT)
  if (pathname.includes('/products') && req.method === 'PUT') {
    const id = req.query?.id || parsedUrl.searchParams.get('id') || decodeURIComponent(parsedUrl.pathname.split('/').pop());
    const updates = await parseBody(req);

    if (isCloudActive() && id) {
      try {
        const resp = await supabaseFetch(`/products?id=eq.${encodeURIComponent(id)}`, {
          method: 'PATCH',
          headers: { 'Prefer': 'return=representation' },
          body: JSON.stringify(productToDb({ ...updates, id }))
        });
        if (resp.ok) {
          const data = await resp.json();
          return sendJson(res, 200, dbToProduct(data[0]));
        }
      } catch (e) {
        console.error('Supabase update failed on Vercel:', e);
      }
    }
    return sendJson(res, 200, { ...updates, id });
  }

  // 6. Products: DELETE (DELETE)
  if (pathname.includes('/products') && req.method === 'DELETE') {
    const id = req.query?.id || parsedUrl.searchParams.get('id') || decodeURIComponent(parsedUrl.pathname.split('/').pop());

    if (isCloudActive() && id) {
      try {
        await supabaseFetch(`/products?id=eq.${encodeURIComponent(id)}`, {
          method: 'DELETE'
        });
      } catch (e) {
        console.error('Supabase delete failed on Vercel:', e);
      }
    }
    return sendJson(res, 200, { success: true, deletedId: id });
  }

  // 7. Load Sample Products
  if (pathname.includes('/sample') && req.method === 'POST') {
    if (isCloudActive()) {
      try {
        await supabaseFetch('/products', {
          method: 'POST',
          headers: { 'Prefer': 'resolution=merge-duplicates' },
          body: JSON.stringify(OM_SAMPLE_PRODUCTS.map(productToDb))
        });
      } catch (e) {}
    }
    return sendJson(res, 200, { success: true, count: OM_SAMPLE_PRODUCTS.length, products: OM_SAMPLE_PRODUCTS });
  }

  // 8. Clear Products
  if (pathname.includes('/clear') && req.method === 'POST') {
    if (isCloudActive()) {
      try {
        await supabaseFetch('/products?id=neq.___non_existent___', {
          method: 'DELETE'
        });
      } catch (e) {}
    }
    return sendJson(res, 200, { success: true, count: 0 });
  }

  return sendJson(res, 404, { error: 'Route not found' });
};
