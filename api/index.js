/* =========================================================================
   OM MOBILE & ELECTRONICS (PCS Chowk, Dhanore, Pune)
   Production Vercel Serverless Function API Handler (/api/*)
   ========================================================================= */

let OM_SAMPLE_PRODUCTS = [];
try {
  const storeModule = require('../store.js');
  OM_SAMPLE_PRODUCTS = storeModule.OM_SAMPLE_PRODUCTS || [];
} catch (e) {}

const SUPABASE_URL = (process.env.SUPABASE_URL || '').replace(/\/$/, '');
const SUPABASE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.SUPABASE_ANON_KEY || '';
const SUPABASE_ANON_KEY = process.env.SUPABASE_ANON_KEY || '';
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
    tag: row.tag || 'New Arrival',
    tagColor: row.tag_color || 'bg-primary text-white',
    stockStatus: row.stock_status || 'In Stock at Dhanore Showroom',
    image: row.image || '',
    description: row.description || '',
    specs: (typeof row.specs === 'object' && row.specs !== null) ? row.specs : {},
    colors: Array.isArray(row.colors) ? row.colors : [],
    createdAt: row.created_at || new Date().toISOString()
  };
}


function dbToBanner(row) {
  if (!row) return null;
  return {
    id: String(row.id),
    image: row.image || '',
    title: row.title || '',
    subtitle: row.subtitle || '',
    tag: row.tag || 'Showroom',
    link: row.link || '#products',
    active: row.active !== false,
    order: Number(row.display_order != null ? row.display_order : (row.order != null ? row.order : 1)) || 1,
    createdAt: row.created_at || new Date().toISOString()
  };
}


function bannerPatchToDb(updates) {
  const patch = {};
  if (updates.image !== undefined) patch.image = String(updates.image);
  if (updates.title !== undefined) patch.title = String(updates.title);
  if (updates.subtitle !== undefined) patch.subtitle = String(updates.subtitle);
  if (updates.tag !== undefined) patch.tag = String(updates.tag);
  if (updates.link !== undefined) patch.link = String(updates.link);
  if (updates.active !== undefined) patch.active = Boolean(updates.active);
  if (updates.order !== undefined || updates.display_order !== undefined) {
    patch.display_order = Number(updates.order != null ? updates.order : updates.display_order) || 1;
  }
  patch.updated_at = new Date().toISOString();
  return patch;
}
function bannerToDb(b) {
  return {
    id: String(b.id),
    image: String(b.image || ''),
    title: String(b.title || ''),
    subtitle: String(b.subtitle || ''),
    tag: String(b.tag || 'Showroom'),
    link: String(b.link || '#products'),
    active: b.active !== false,
    display_order: Number(b.order != null ? b.order : (b.display_order != null ? b.display_order : 1)) || 1
  };
}

function dbToQuery(row) {
  if (!row) return null;
  return {
    id: String(row.id),
    productId: row.product_id || '',
    productName: row.product_name || 'Device',
    productBrand: row.product_brand || '',
    productPrice: Number(row.product_price) || 0,
    productImage: row.product_image || '',
    customerName: row.customer_name || 'Customer',
    customerPhone: row.customer_phone || '',
    message: row.message || '',
    status: row.status || 'new',
    createdAt: row.created_at || new Date().toISOString()
  };
}

function queryToDb(q) {
  return {
    id: String(q.id),
    product_id: String(q.productId || q.product_id || ''),
    product_name: String(q.productName || q.product_name || 'Device'),
    product_brand: String(q.productBrand || q.product_brand || ''),
    product_price: Number(q.productPrice != null ? q.productPrice : (q.product_price != null ? q.product_price : 0)) || 0,
    product_image: String(q.productImage || q.product_image || ''),
    customer_name: String(q.customerName || q.customer_name || 'Customer'),
    customer_phone: String(q.customerPhone || q.customer_phone || ''),
    message: String(q.message || ''),
    status: String(q.status || 'new')
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

  // 1. Status Check & Config Bootstrap
  if (pathname.includes('/status') && req.method === 'GET') {
    return sendJson(res, 200, {
      status: 'online',
      platform: 'Vercel Serverless',
      cloudConfigured: isCloudActive(),
      storageEngine: isCloudActive() ? 'Supabase Cloud PostgreSQL' : 'Local Fallback',
      supabaseUrl: SUPABASE_URL,
      supabaseAnonKey: SUPABASE_ANON_KEY,
      storeName: 'OM Mobile & Electronics (Dhanore, Dhanore)',
      version: '2.1.0-production'
    });
  }

  // 2. Public Client Config
  if ((pathname.includes('/config') || pathname.includes('/public-config')) && req.method === 'GET') {
    return sendJson(res, 200, {
      supabaseUrl: SUPABASE_URL,
      supabaseAnonKey: SUPABASE_ANON_KEY,
      cloudConfigured: isCloudActive(),
      storeName: 'OM Mobile & Electronics (Dhanore, Dhanore)',
      branch: 'PCS Chowk, Dhanore, Pune',
      phone: '+91 98220 12345'
    });
  }

  // 3. Admin Authentication
  if (pathname.includes('/admin/login') && req.method === 'POST') {
    const { username, password } = await parseBody(req);
    const userClean = (username || '').trim().toLowerCase();
    if (userClean === ADMIN_USER && password === ADMIN_PASS) {
      return sendJson(res, 200, {
        success: true,
        message: 'Authenticated successfully',
        adminName: 'Gaurav Bhosle',
        branch: 'Dhanore Showroom, Dhanore'
      });
    } else {
      return sendJson(res, 401, {
        success: false,
        message: 'Invalid username or password'
      });
    }
  }

  // 4. Products: GET ALL
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

  // 5. Products: CREATE (POST) - accepts single product OR array of products
  if (pathname.includes('/products') && req.method === 'POST') {
    const body = await parseBody(req);

    // Support batch insert if body is array
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
          console.error('Batch insert exception:', e);
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
        console.error('Supabase insert exception on Vercel:', e);
        return sendJson(res, 500, {
          error: 'Database connection failed',
          message: e.message,
          product: newProduct
        }, false);
      }
    }
    return sendJson(res, 201, newProduct, false);
  }

  // 6. Products: UPDATE (PUT)
  if (pathname.includes('/products') && req.method === 'PUT') {
    const idFromParam = pathParam && pathParam.includes('/') ? decodeURIComponent(pathParam.split('/').pop()) : '';
    const idFromPath = decodeURIComponent(parsedUrl.pathname.split('/').pop());
    const id = req.query?.id || parsedUrl.searchParams.get('id') || idFromParam || (idFromPath !== 'index.js' && idFromPath !== 'products' ? idFromPath : '');
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
        console.error('Supabase update failed on Vercel:', e);
      }
    }
    return sendJson(res, 200, { ...updates, id }, false);
  }

  // 7. Products: DELETE (DELETE)
  if (pathname.includes('/products') && req.method === 'DELETE') {
    const idFromParam = pathParam && pathParam.includes('/') ? decodeURIComponent(pathParam.split('/').pop()) : '';
    const idFromPath = decodeURIComponent(parsedUrl.pathname.split('/').pop());
    const id = req.query?.id || parsedUrl.searchParams.get('id') || idFromParam || (idFromPath !== 'index.js' && idFromPath !== 'products' ? idFromPath : '');

    if (isCloudActive() && id) {
      try {
        await supabaseFetch(`/products?id=eq.${encodeURIComponent(id)}`, {
          method: 'DELETE'
        });
        return sendJson(res, 200, { success: true, deletedId: id }, true);
      } catch (e) {
        console.error('Supabase delete failed on Vercel:', e);
      }
    }
    return sendJson(res, 200, { success: true, deletedId: id }, false);
  }

  // 8. Load Sample Products
  if (pathname.includes('/sample') && req.method === 'POST') {
    if (isCloudActive() && OM_SAMPLE_PRODUCTS.length > 0) {
      try {
        await supabaseFetch('/products', {
          method: 'POST',
          headers: { 'Prefer': 'resolution=merge-duplicates' },
          body: JSON.stringify(OM_SAMPLE_PRODUCTS.map(productToDb))
        });
      } catch (e) {
        console.error('Supabase sample load failed:', e);
      }
    }
    return sendJson(res, 200, { success: true, count: OM_SAMPLE_PRODUCTS.length, products: OM_SAMPLE_PRODUCTS });
  }

  // 9. Clear Products
  if (pathname.includes('/clear') && req.method === 'POST') {
    if (isCloudActive()) {
      try {
        await supabaseFetch('/products?id=neq.___non_existent___', {
          method: 'DELETE'
        });
      } catch (e) {
        console.error('Supabase clear failed:', e);
      }
    }
    return sendJson(res, 200, { success: true, count: 0 });
  }

  // 10. Banners
  if (pathname.includes('/banners')) {
    if (req.method === 'GET') {
      if (isCloudActive()) {
        try {
          const resp = await supabaseFetch('/banners?select=*&order=display_order.asc');
          if (resp.ok) {
            const data = await resp.json();
            return sendJson(res, 200, data.map(dbToBanner), true);
          }
        } catch (e) {
          console.error('Supabase banners error:', e);
        }
      }
      return sendJson(res, 200, [], false);
    }
    if (req.method === 'POST') {
      const b = await parseBody(req);
      const newB = { ...b, id: b.id || ('banner-' + Date.now()) };
      if (isCloudActive()) {
        try {
          await supabaseFetch('/banners', { method: 'POST', body: JSON.stringify(bannerToDb(newB)) });
        } catch (e) { console.error('Supabase banner add error:', e); }
      }
      return sendJson(res, 201, { success: true, banner: newB });
    }
    if (req.method === 'PUT' || req.method === 'PATCH') {
      const id = req.query?.id || parsedUrl.searchParams.get('id') || decodeURIComponent(parsedUrl.pathname.split('/').pop());
      const updates = await parseBody(req);
      if (isCloudActive() && id) {
        try {
          await supabaseFetch(`/banners?id=eq.${encodeURIComponent(id)}`, {
            method: 'PATCH',
            body: JSON.stringify(bannerPatchToDb(updates))
          });
        } catch (e) { console.error('Supabase banner update error:', e); }
      }
      return sendJson(res, 200, { success: true, id, updates });
    }
    if (req.method === 'DELETE') {
      const id = req.query?.id || parsedUrl.searchParams.get('id') || decodeURIComponent(parsedUrl.pathname.split('/').pop());
      if (isCloudActive() && id) {
        try {
          await supabaseFetch(`/banners?id=eq.${encodeURIComponent(id)}`, { method: 'DELETE' });
        } catch (e) { console.error('Supabase banner delete error:', e); }
      }
      return sendJson(res, 200, { success: true, id });
    }
  }

  // 11. Customer Queries
  if (pathname.includes('/queries')) {
    if (req.method === 'GET') {
      if (isCloudActive()) {
        try {
          const resp = await supabaseFetch('/queries?select=*&order=created_at.desc');
          if (resp.ok) {
            const data = await resp.json();
            return sendJson(res, 200, data.map(dbToQuery), true);
          }
        } catch (e) { console.error('Supabase queries error:', e); }
      }
      return sendJson(res, 200, [], false);
    }
    if (req.method === 'POST') {
      const q = await parseBody(req);
      const newQ = { ...q, id: q.id || ('query-' + Date.now() + '-' + Math.random().toString(36).substr(2, 5)) };
      if (isCloudActive()) {
        try {
          await supabaseFetch('/queries', { method: 'POST', body: JSON.stringify(queryToDb(newQ)) });
        } catch (e) { console.error('Supabase query add error:', e); }
      }
      return sendJson(res, 201, { success: true, query: newQ });
    }
    if (req.method === 'PUT') {
      const id = req.query?.id || parsedUrl.searchParams.get('id') || decodeURIComponent(parsedUrl.pathname.split('/').pop());
      const updates = await parseBody(req);
      if (isCloudActive() && id) {
        try {
          await supabaseFetch(`/queries?id=eq.${encodeURIComponent(id)}`, { method: 'PATCH', body: JSON.stringify(queryToDb(updates)) });
        } catch (e) { console.error('Supabase query update error:', e); }
      }
      return sendJson(res, 200, { success: true, query: { ...updates, id } });
    }
    if (req.method === 'DELETE') {
      const id = req.query?.id || parsedUrl.searchParams.get('id') || decodeURIComponent(parsedUrl.pathname.split('/').pop());
      if (isCloudActive() && id) {
        try {
          await supabaseFetch(`/queries?id=eq.${encodeURIComponent(id)}`, { method: 'DELETE' });
        } catch (e) { console.error('Supabase query delete error:', e); }
      }
      return sendJson(res, 200, { success: true, id });
    }
  }

  return sendJson(res, 404, { error: 'Route not found' });
};
