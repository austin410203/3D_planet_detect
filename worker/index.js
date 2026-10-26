/**
 * worker/index.js — 網站的 Cloudflare Worker
 * --------------------------------------------------
 * 靜態檔案（dist/）由 assets 直接提供，只有 /api/* 會進到這裡（wrangler.jsonc 的 run_worker_first）。
 * /api/license/activate|validate：網頁版「完整版」的 Lemon Squeezy 序號。授權 API 不需要密鑰，
 * 這裡只負責確認序號屬於我們的商品（LS_PRODUCT_ID、LS_STORE_ID）才讓頁面解鎖。
 * - LS_LIVE=1（商店正式收款後）：測試模式的序號一律拒絕。
 * - LS_MOCK=1（只放在本機 .dev.vars）：TEST- 開頭的序號直接通過，含 REFUND 的在重新驗證時失敗，方便離線測試。
 */
const json = (data, status = 200) => new Response(JSON.stringify(data), {
  status, headers: { 'content-type': 'application/json; charset=utf-8', 'cache-control': 'no-store' },
});

export async function license(action, req, env, fetchImpl = fetch) {
  if (action !== 'activate' && action !== 'validate') return json({ error: 'not found' }, 404);
  const b = await req.json().catch(() => ({}));
  const key = String(b.key || '').trim().slice(0, 100);
  if (!key) return json({ error: 'empty' }, 400);
  if (env.LS_MOCK === '1' && key.startsWith('TEST-')) {
    return json(action === 'activate' ? { instance: `mock-${key}` } : { valid: !key.includes('REFUND') });
  }
  if (!env.LS_PRODUCT_ID) return json({ error: 'not configured' }, 503);
  const form = new URLSearchParams({ license_key: key });
  if (action === 'activate') form.set('instance_name', String(b.name || 'web').slice(0, 60));
  else if (b.instance) form.set('instance_id', String(b.instance).slice(0, 60));
  const r = await fetchImpl(`https://api.lemonsqueezy.com/v1/licenses/${action}`, {
    method: 'POST', headers: { accept: 'application/json', 'content-type': 'application/x-www-form-urlencoded' }, body: form,
  });
  if (r.status >= 500) return json({ error: 'upstream' }, 502); // Lemon Squeezy 暫時故障：頁面維持原本狀態
  const j = await r.json().catch(() => ({}));
  const m = j.meta || {};
  const ours = String(m.product_id) === String(env.LS_PRODUCT_ID) && (!env.LS_STORE_ID || String(m.store_id) === String(env.LS_STORE_ID));
  const testKey = !!(j.license_key?.test_mode || m.test_mode);
  if (env.LS_LIVE === '1' && testKey) return json({ error: 'invalid' }, 400);
  if (action === 'activate') {
    if (!j.activated) return json({ error: /limit/i.test(j.error || '') ? 'limit' : 'invalid' }, 400);
    if (!ours) return json({ error: 'invalid' }, 400);
    return json({ instance: j.instance?.id });
  }
  const status = j.license_key?.status;
  return json({ valid: !!j.valid && ours && status !== 'disabled' && status !== 'expired' });
}

export default {
  async fetch(req, env) {
    const url = new URL(req.url);
    if (url.pathname.startsWith('/api/license/') && req.method === 'POST') return license(url.pathname.slice(13), req, env);
    if (url.pathname.startsWith('/api/')) return json({ error: 'not found' }, 404);
    return env.ASSETS.fetch(req);
  },
};
