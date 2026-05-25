const BRAVE_API_URL = 'https://api.search.brave.com/res/v1';

async function braveRequest(path, params) {
  const apiKey = process.env.BRAVE_API_KEY;
  if (!apiKey) {
    const err = new Error('BRAVE_API_KEY не задан в .env');
    err.code = 'missing_key';
    throw err;
  }
  const url = new URL(`${BRAVE_API_URL}${path}`);
  for (const [k, v] of Object.entries(params)) {
    if (v !== undefined && v !== null) url.searchParams.set(k, String(v));
  }
  const r = await fetch(url, {
    method: 'GET',
    headers: {
      Accept: 'application/json',
      'Accept-Encoding': 'gzip',
      'X-Subscription-Token': apiKey,
    },
  });
  const text = await r.text();
  if (!r.ok) {
    const err = new Error(`brave ${path} HTTP ${r.status}: ${text.slice(0, 400)}`);
    err.status = r.status;
    throw err;
  }
  try {
    return JSON.parse(text);
  } catch {
    throw new Error(`brave ${path}: invalid JSON response`);
  }
}

async function search({ query, count = 5, freshness, country = 'us' }) {
  if (!query || typeof query !== 'string') throw new Error('query обязателен');
  const lim = Math.max(1, Math.min(20, Number(count) || 5));
  const params = { q: query, count: lim, country, safesearch: 'moderate' };
  if (freshness && ['pd', 'pw', 'pm', 'py'].includes(freshness)) {
    params.freshness = freshness;
  }
  const res = await braveRequest('/web/search', params);
  const web = res.web?.results || [];
  return {
    query,
    results: web.slice(0, lim).map((r) => ({
      url: r.url,
      title: r.title,
      description: r.description || null,
      age: r.age || null,
      published: r.page_age || null,
    })),
  };
}

async function news({ query, count = 10, freshness = 'pd' }) {
  if (!query || typeof query !== 'string') throw new Error('query обязателен');
  const lim = Math.max(1, Math.min(20, Number(count) || 10));
  const res = await braveRequest('/news/search', {
    q: query,
    count: lim,
    freshness,
    country: 'us',
  });
  const items = res.results || [];
  return {
    query,
    freshness,
    results: items.slice(0, lim).map((r) => ({
      url: r.url,
      title: r.title,
      description: r.description || null,
      source: r.meta_url?.hostname || null,
      published: r.age || null,
    })),
  };
}

module.exports = { search, news };
