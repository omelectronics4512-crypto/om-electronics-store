/* =========================================================================
   OM MOBILE & ELECTRONICS (Branch No. 4, Dhanore, Pune)
   Dedicated Vercel Serverless Function: /api/status
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

module.exports = (req, res) => {
  res.writeHead(200, {
    'Content-Type': 'application/json',
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Methods': 'GET, OPTIONS',
    'Access-Control-Allow-Headers': 'Content-Type, Authorization, X-Requested-With',
    'X-Cloud-Active': isCloudActive() ? 'true' : 'false'
  });
  res.end(JSON.stringify({
    status: 'online',
    platform: 'Vercel Serverless',
    cloudConfigured: isCloudActive(),
    storageEngine: isCloudActive() ? 'Supabase Cloud PostgreSQL' : 'Local Fallback',
    storeName: 'OM Mobile & Electronics (Branch No. 4, Dhanore)',
    version: '2.0.0-production'
  }));
};
