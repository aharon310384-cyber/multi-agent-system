const crypto = require('crypto');

const STOPWORDS = new Set(['the', 'a', 'an', 'and', 'or', 'of', 'in', 'on', 'for', 'to', 'is', 'are', 'was', 'were', 'be', 'been', 'has', 'have', 'had', 'это', 'как', 'и', 'в', 'на', 'с', 'по', 'не', 'что', 'для']);

function canonicalUrl(u) {
  try {
    const url = new URL(u);
    url.hash = '';
    for (const p of [...url.searchParams.keys()]) {
      if (/^utm_|^ref$|^source$|^fbclid$|^gclid$/i.test(p)) url.searchParams.delete(p);
    }
    let s = url.toString();
    if (s.endsWith('/')) s = s.slice(0, -1);
    return s.toLowerCase();
  } catch {
    return (u || '').toLowerCase();
  }
}

function normalizeTitle(t) {
  return String(t || '')
    .toLowerCase()
    .replace(/[^\p{L}\p{N}\s]/gu, ' ')
    .split(/\s+/)
    .filter((w) => w && !STOPWORDS.has(w) && w.length > 2)
    .sort()
    .join(' ');
}

function titleHash(t) {
  return crypto.createHash('md5').update(normalizeTitle(t)).digest('hex').slice(0, 16);
}

function jaccard(a, b) {
  const sa = new Set(a.split(' ').filter(Boolean));
  const sb = new Set(b.split(' ').filter(Boolean));
  if (!sa.size || !sb.size) return 0;
  let inter = 0;
  for (const w of sa) if (sb.has(w)) inter++;
  return inter / (sa.size + sb.size - inter);
}

function dedupItems(items, { jaccardThreshold = 0.75 } = {}) {
  const byUrl = new Map();
  for (const it of items) {
    const key = canonicalUrl(it.url);
    if (!byUrl.has(key)) byUrl.set(key, { ...it, cluster: [it] });
    else byUrl.get(key).cluster.push(it);
  }
  const urlDedup = [...byUrl.values()];

  const clusters = [];
  for (const it of urlDedup) {
    const norm = normalizeTitle(it.title);
    let matched = false;
    for (const cl of clusters) {
      const sim = jaccard(norm, cl.normTitle);
      if (sim >= jaccardThreshold) {
        cl.members.push(it);
        if (it.authority > cl.lead.authority) {
          cl.lead = it;
          cl.normTitle = norm;
        }
        matched = true;
        break;
      }
    }
    if (!matched) {
      clusters.push({ lead: it, normTitle: norm, members: [it] });
    }
  }

  return clusters.map((cl) => ({
    ...cl.lead,
    cluster_size: cl.members.length,
    cluster_sources: [...new Set(cl.members.map((m) => m.source))],
    title_hash: titleHash(cl.lead.title),
  }));
}

module.exports = { dedupItems, canonicalUrl, normalizeTitle, titleHash, jaccard };
