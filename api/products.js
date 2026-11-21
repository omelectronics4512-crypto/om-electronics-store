/* =========================================================================
   OM MOBILE & ELECTRONICS (Branch No. 4, Dhanore, Pune)
   Dedicated Vercel Serverless Function: /api/products
   ========================================================================= */

const SUPABASE_URL = (process.env.SUPABASE_URL || '').replace(/\/$/, '');
const SUPABASE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.SUPABASE_ANON_KEY || '';

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
  const name = String(p.name || 'OM Store Product').trim();
  const price = Number(p.price) || 0;
  const origPrice = Number(p.originalPrice != null ? p.originalPrice : (p.original_price != null ? p.original_price : price)) || price;
  const emi = Number(p.emiPerMonth != null ? p.emiPerMonth : (p.emi_per_month != null ? p.emi_per_month : 0)) || 0;
  return {
    id: String(p.id),
    name: name || 'OM Store Product',
    category: String(p.category || 'smartphones').trim().toLowerCase(),
    brand: String(p.brand || 'Other').trim(),
    price: price,
    original_price: origPrice,
    emi_per_month: emi,
    rating: Number(p.rating) || 4.8,
    reviews: Number(p.reviews) || 0,
    tag: String(p.tag || 'New Arrival').trim(),
    tag_color: String(p.tagColor || p.tag_color || 'bg-primary text-white').trim(),
    stock_status: String(p.stockStatus || p.stock_status || 'In Stock at Dhanore Showroom').trim(),
    image: String(p.image || '').trim(),
    description: String(p.description || '').trim(),
    specs: (typeof p.specs === 'object' && p.specs !== null) ? p.specs : {},
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
  // CORS Preflight
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
  const pathname = parsedUrl.pathname;

  // Handle sample products
  if (pathname.includes('/sample') && req.method === 'POST') {
    return sendJson(res, 200, { success: true, count: 0, products: [] });
  }

  // Handle clear products
  if (pathname.includes('/clear') && req.method === 'POST') {
    if (isCloudActive()) {
      try {
        await supabaseFetch('/products?id=neq.___non_existent___', { method: 'DELETE' });
      } catch (e) {}
    }
    return sendJson(res, 200, { success: true, count: 0 });
  }

  // GET ALL PRODUCTS
  if (req.method === 'GET') {
    if (isCloudActive()) {
      try {
        const resp = await supabaseFetch('/products?select=*&order=created_at.desc');
        if (resp.ok) {
          const data = await resp.json();
          return sendJson(res, 200, data.map(dbToProduct), true);
        } else {
          const errText = await resp.text();
          console.warn('Supabase fetch returned error:', resp.status, errText);
          return sendJson(res, 200, [], false);
        }
      } catch (e) {
        console.warn('Supabase fetch failed:', e);
        return sendJson(res, 200, [], false);
      }
    }
    return sendJson(res, 200, [], false);
  }

  // CREATE PRODUCT (POST) - accepts single product OR array
  if (req.method === 'POST') {
    const body = await parseBody(req);

    if (Array.isArray(body)) {
      const dbRows = body.map(p => {
        const id = p.id || 'om-' + Date.now() + '-' + Math.random().toString(36).substr(2, 5);
        return productToDb({ ...p, id });
      });
      if (isCloudActive()) {
        try {
          const resp = await supabaseFetch('/products', {
            method: 'POST',
            headers: { 'Prefer': 'resolution=merge-duplicates,return=representation' },
            body: JSON.stringify(dbRows)
          });
          if (resp.ok) {
            const data = await resp.json();
            return sendJson(res, 201, data.map(dbToProduct), true);
          }
        } catch (e) {
          console.error('Supabase batch insert failed:', e);
        }
      }
      return sendJson(res, 201, body, false);
    }

    const product = body;
    const id = product.id || 'om-' + Date.now() + '-' + Math.random().toString(36).substr(2, 5);
    const newProduct = { ...product, id, createdAt: new Date().toISOString() };
    const dbRow = productToDb(newProduct);

    if (isCloudActive()) {
      try {
        const resp = await supabaseFetch('/products', {
          method: 'POST',
          headers: { 'Prefer': 'resolution=merge-duplicates,return=representation' },
          body: JSON.stringify([dbRow])
        });
        if (resp.ok) {
          const data = await resp.json();
          return sendJson(res, 201, dbToProduct(data[0]), true);
        } else {
          const errText = await resp.text();
          console.error('Supabase insert failed with status:', resp.status, errText);
          return sendJson(res, resp.status >= 400 && resp.status < 600 ? resp.status : 500, {
            error: 'Failed to save product in cloud database',
            details: errText,
            product: newProduct
          }, false);
        }
      } catch (e) {
        console.error('Supabase exception:', e);
        return sendJson(res, 500, {
          error: 'Database connection failed',
          message: e.message,
          product: newProduct
        }, false);
      }
    }
    return sendJson(res, 201, newProduct, false);
  }

  // UPDATE PRODUCT (PUT)
  if (req.method === 'PUT') {
    const parsedUrl = new URL(req.url, `http://${req.headers.host || 'localhost'}`);
    const idFromPath = decodeURIComponent(parsedUrl.pathname.split('/').pop());
    const id = req.query?.id || parsedUrl.searchParams.get('id') || (idFromPath !== 'products' && idFromPath !== 'products.js' ? idFromPath : '');
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
          return sendJson(res, 200, dbToProduct(data[0]), true);
        }
      } catch (e) {
        console.error('Supabase update failed:', e);
      }
    }
    return sendJson(res, 200, { ...updates, id }, false);
  }

  // DELETE PRODUCT (DELETE)
  if (req.method === 'DELETE') {
    const parsedUrl = new URL(req.url, `http://${req.headers.host || 'localhost'}`);
    const idFromPath = decodeURIComponent(parsedUrl.pathname.split('/').pop());
    const id = req.query?.id || parsedUrl.searchParams.get('id') || (idFromPath !== 'products' && idFromPath !== 'products.js' ? idFromPath : '');

    if (isCloudActive() && id) {
      try {
        await supabaseFetch(`/products?id=eq.${encodeURIComponent(id)}`, {
          method: 'DELETE'
        });
        return sendJson(res, 200, { success: true, deletedId: id }, true);
      } catch (e) {
        console.error('Supabase delete failed:', e);
      }
    }
    return sendJson(res, 200, { success: true, deletedId: id }, false);
  }

  return sendJson(res, 405, { error: 'Method not allowed' });
};
