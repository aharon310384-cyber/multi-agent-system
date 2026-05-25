const Parser = require('rss-parser');
const brave = require('../brave');
const { RSS_FEEDS, GITHUB_WATCHED_REPOS, REDDIT_SUBS, HN_KEYWORDS, BRAVE_NEWS_QUERIES } = require('./sources');

const parser = new Parser({ timeout: 15000, headers: { 'User-Agent': 'intel-scout/0.1 (multi-agent-system)' } });

const HOURS_24 = 24 * 60 * 60 * 1000;

function withinWindow(ts, sinceMs) {
  if (!ts) return true;
  const t = new Date(ts).getTime();
  if (!Number.isFinite(t)) return true;
  return t >= sinceMs;
}

async function fetchRss(feed, sinceMs) {
  try {
    const parsed = await parser.parseURL(feed.url);
    const items = (parsed.items || [])
      .filter((i) => withinWindow(i.isoDate || i.pubDate, sinceMs))
      .map((i) => ({
        source: feed.id,
        source_type: 'rss',
        authority: feed.authority,
        tags: feed.tags,
        title: (i.title || '').trim(),
        url: i.link || '',
        ts: i.isoDate || i.pubDate || null,
        body_md: (i.contentSnippet || i.content || '').slice(0, 1500),
      }))
      .filter((x) => x.title && x.url);
    return items;
  } catch (e) {
    return [{ source: feed.id, source_type: 'rss', error: String(e.message || e).slice(0, 200) }];
  }
}

async function fetchHackerNews(sinceMs) {
  try {
    const idsRes = await fetch('https://hacker-news.firebaseio.com/v0/topstories.json');
    const ids = (await idsRes.json()).slice(0, 100);
    const stories = await Promise.all(
      ids.map(async (id) => {
        try {
          const r = await fetch(`https://hacker-news.firebaseio.com/v0/item/${id}.json`);
          return await r.json();
        } catch { return null; }
      })
    );
    const kw = HN_KEYWORDS.map((k) => k.toLowerCase());
    return stories
      .filter(Boolean)
      .filter((s) => s.time * 1000 >= sinceMs)
      .filter((s) => {
        const hay = `${s.title || ''} ${s.url || ''}`.toLowerCase();
        return kw.some((k) => hay.includes(k));
      })
      .map((s) => ({
        source: 'hackernews',
        source_type: 'hn',
        authority: 0.75,
        tags: ['hn'],
        title: s.title,
        url: s.url || `https://news.ycombinator.com/item?id=${s.id}`,
        ts: new Date(s.time * 1000).toISOString(),
        body_md: `Score: ${s.score} · Comments: ${s.descendants || 0}`,
      }));
  } catch (e) {
    return [{ source: 'hackernews', source_type: 'hn', error: String(e.message || e).slice(0, 200) }];
  }
}

async function fetchReddit(sinceMs) {
  const all = [];
  for (const sub of REDDIT_SUBS) {
    try {
      const parsed = await parser.parseURL(`https://www.reddit.com/r/${sub}/new/.rss`);
      const items = (parsed.items || [])
        .filter((i) => withinWindow(i.isoDate || i.pubDate, sinceMs))
        .map((i) => ({
          source: `reddit/${sub}`,
          source_type: 'reddit',
          authority: 0.6,
          tags: ['reddit', sub.toLowerCase()],
          title: (i.title || '').trim(),
          url: i.link || '',
          ts: i.isoDate || i.pubDate || null,
          body_md: (i.contentSnippet || i.content || '').slice(0, 1500),
        }))
        .filter((x) => x.title && x.url);
      all.push(...items);
    } catch (e) {
      all.push({ source: `reddit/${sub}`, source_type: 'reddit', error: String(e.message || e).slice(0, 200) });
    }
  }
  return all;
}

async function fetchGithubReleases(sinceMs) {
  const all = [];
  for (const repo of GITHUB_WATCHED_REPOS) {
    try {
      const r = await fetch(`https://api.github.com/repos/${repo}/releases?per_page=5`, {
        headers: {
          'User-Agent': 'intel-scout/0.1 (multi-agent-system)',
          ...(process.env.GITHUB_TOKEN ? { Authorization: `Bearer ${process.env.GITHUB_TOKEN}` } : {}),
        },
      });
      if (!r.ok) { all.push({ source: `gh/${repo}`, source_type: 'github', error: `HTTP ${r.status}` }); continue; }
      const releases = await r.json();
      const items = (Array.isArray(releases) ? releases : [])
        .filter((rel) => new Date(rel.published_at).getTime() >= sinceMs)
        .map((rel) => ({
          source: `gh/${repo}`,
          source_type: 'github_release',
          authority: 0.95,
          tags: ['github', 'release'],
          title: `${repo}: ${rel.name || rel.tag_name}`,
          url: rel.html_url,
          ts: rel.published_at,
          body_md: (rel.body || '').slice(0, 2000),
        }));
      all.push(...items);
    } catch (e) {
      all.push({ source: `gh/${repo}`, source_type: 'github', error: String(e.message || e).slice(0, 200) });
    }
  }
  return all;
}

async function fetchBraveNews() {
  if (!process.env.BRAVE_API_KEY) return [];
  const all = [];
  for (const q of BRAVE_NEWS_QUERIES) {
    try {
      const res = await brave.news({ query: q, count: 10, freshness: 'pd' });
      const items = (res.results || []).map((r) => ({
        source: 'brave-news',
        source_type: 'brave',
        authority: 0.7,
        tags: ['brave', 'news'],
        title: r.title,
        url: r.url,
        ts: r.published || null,
        body_md: r.description || '',
        meta_query: q,
      }));
      all.push(...items);
    } catch (e) {
      all.push({ source: 'brave-news', source_type: 'brave', error: String(e.message || e).slice(0, 200), meta_query: q });
    }
  }
  return all;
}

async function ingestAll({ windowHours = 24 } = {}) {
  const sinceMs = Date.now() - windowHours * 60 * 60 * 1000;
  const [rssResults, hnResults, redditResults, ghResults, braveResults] = await Promise.all([
    Promise.all(RSS_FEEDS.map((f) => fetchRss(f, sinceMs))).then((arr) => arr.flat()),
    fetchHackerNews(sinceMs),
    fetchReddit(sinceMs),
    fetchGithubReleases(sinceMs),
    fetchBraveNews(),
  ]);

  const all = [...rssResults, ...hnResults, ...redditResults, ...ghResults, ...braveResults];
  const items = all.filter((x) => !x.error);
  const errors = all.filter((x) => x.error);
  return { items, errors, sinceMs, windowHours };
}

module.exports = { ingestAll, fetchRss, fetchHackerNews, fetchReddit, fetchGithubReleases, fetchBraveNews };
