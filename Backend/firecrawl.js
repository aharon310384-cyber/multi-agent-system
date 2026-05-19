const FIRECRAWL_API_URL = 'https://api.firecrawl.dev/v2';
const SCRAPE_MAX_CHARS = 12000;

async function firecrawlRequest(path, body) {
  const apiKey = process.env.FIRECRAWL_API_KEY;
  if (!apiKey) {
    const err = new Error('FIRECRAWL_API_KEY не задан в .env');
    err.code = 'missing_key';
    throw err;
  }
  const r = await fetch(`${FIRECRAWL_API_URL}${path}`, {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${apiKey}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(body),
  });
  const text = await r.text();
  if (!r.ok) {
    const err = new Error(`firecrawl ${path} HTTP ${r.status}: ${text.slice(0, 400)}`);
    err.status = r.status;
    throw err;
  }
  try {
    return JSON.parse(text);
  } catch {
    throw new Error(`firecrawl ${path}: invalid JSON response`);
  }
}

async function scrape({ url, onlyMainContent = true }) {
  if (!url || typeof url !== 'string') throw new Error('url обязателен');
  const res = await firecrawlRequest('/scrape', {
    url,
    formats: ['markdown'],
    onlyMainContent,
  });
  const data = res.data || res;
  const md = data.markdown || '';
  return {
    url,
    title: data.metadata?.title || null,
    statusCode: data.metadata?.statusCode || null,
    markdown: md.length > SCRAPE_MAX_CHARS
      ? `${md.slice(0, SCRAPE_MAX_CHARS)}\n\n[…truncated to ${SCRAPE_MAX_CHARS} chars]`
      : md,
  };
}

async function search({ query, limit = 5 }) {
  if (!query || typeof query !== 'string') throw new Error('query обязателен');
  const lim = Math.max(1, Math.min(10, Number(limit) || 5));
  const res = await firecrawlRequest('/search', { query, limit: lim });
  const web = res.data?.web || res.web || [];
  return {
    query,
    results: web.slice(0, lim).map((r) => ({
      url: r.url,
      title: r.title,
      description: r.description || r.snippet || null,
    })),
  };
}

module.exports = { scrape, search };
