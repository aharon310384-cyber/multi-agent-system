const fs = require('fs');
const path = require('path');

const DECISIONS_DIR = path.resolve(__dirname, '..', '..', 'Онлайн разведка', 'решения');
const STATUS = { PENDING: 'pending', APPROVED: 'approved', REJECTED: 'rejected', POSTPONED: 'postponed' };

const POSTPONE_DAYS = 7;

function ensureDir() {
  try { fs.mkdirSync(DECISIONS_DIR, { recursive: true }); } catch {}
}

function listFiles() {
  ensureDir();
  return fs.readdirSync(DECISIONS_DIR).filter((f) => /^\d{4}-\d{2}-\d{2}\.json$/.test(f));
}

function loadAll() {
  return listFiles()
    .map((f) => {
      try { return JSON.parse(fs.readFileSync(path.join(DECISIONS_DIR, f), 'utf8')); }
      catch { return null; }
    })
    .filter(Boolean);
}

function loadByDate(date) {
  ensureDir();
  const p = path.join(DECISIONS_DIR, `${date}.json`);
  if (!fs.existsSync(p)) return null;
  try { return JSON.parse(fs.readFileSync(p, 'utf8')); }
  catch { return null; }
}

function saveByDate(date, data) {
  ensureDir();
  fs.writeFileSync(path.join(DECISIONS_DIR, `${date}.json`), JSON.stringify(data, null, 2), 'utf8');
}

function recordDigest({ date, decision, proposals, candidates, telegramMessageIds }) {
  const existing = loadByDate(date) || { date, items: [] };
  const items = [];

  const approvedSet = new Set(decision.approved_ids || []);
  const postponedSet = new Set(decision.postponed_ids || []);
  const rejectedSet = new Set(decision.rejected_ids || []);

  for (const p of proposals || []) {
    let status = STATUS.PENDING;
    if (approvedSet.has(p.id)) status = STATUS.APPROVED;
    else if (rejectedSet.has(p.id)) status = STATUS.REJECTED;
    else if (postponedSet.has(p.id)) status = STATUS.POSTPONED;

    const candidate = (candidates || []).find((c) => c.title === p.title) || {};
    items.push({
      proposal_id: p.id,
      title: p.title,
      url: (p.sources && p.sources[0]) || candidate.url || null,
      title_hash: candidate.title_hash || null,
      priority: p.priority,
      category: p.category,
      status,
      decided_at: new Date().toISOString(),
      delegated_to: (decision.delegations || []).find((d) => d.proposal_id === p.id)?.owner_agent || null,
    });
  }

  const merged = {
    date,
    telegramMessageIds: telegramMessageIds || existing.telegramMessageIds || null,
    operator_message: decision.operator_message || null,
    items: [...existing.items.filter((x) => !items.find((y) => y.proposal_id === x.proposal_id)), ...items],
    updated_at: new Date().toISOString(),
  };
  saveByDate(date, merged);
  return merged;
}

function setItemStatus(date, proposalId, status, source = 'manual') {
  const data = loadByDate(date);
  if (!data) return null;
  const item = data.items.find((x) => x.proposal_id === proposalId);
  if (!item) return null;
  item.status = status;
  item.status_changed_at = new Date().toISOString();
  item.status_source = source;
  data.updated_at = new Date().toISOString();
  saveByDate(date, data);
  return item;
}

function buildExcludeSet({ now = Date.now() } = {}) {
  const all = loadAll();
  const titleHashes = new Set();
  const urls = new Set();
  const postponeCutoff = now - POSTPONE_DAYS * 24 * 60 * 60 * 1000;

  for (const file of all) {
    for (const item of file.items || []) {
      if (item.status === STATUS.REJECTED) {
        if (item.title_hash) titleHashes.add(item.title_hash);
        if (item.url) urls.add(item.url);
      }
      if (item.status === STATUS.POSTPONED) {
        const decidedAt = new Date(item.status_changed_at || item.decided_at || 0).getTime();
        if (decidedAt > postponeCutoff) {
          if (item.title_hash) titleHashes.add(item.title_hash);
          if (item.url) urls.add(item.url);
        }
      }
      if (item.status === STATUS.APPROVED) {
        if (item.title_hash) titleHashes.add(item.title_hash);
        if (item.url) urls.add(item.url);
      }
    }
  }
  return { titleHashes, urls };
}

function isExcluded(candidate, excludeSet) {
  if (!excludeSet) return false;
  if (candidate.title_hash && excludeSet.titleHashes.has(candidate.title_hash)) return true;
  if (candidate.url && excludeSet.urls.has(candidate.url)) return true;
  return false;
}

module.exports = {
  recordDigest,
  loadByDate,
  loadAll,
  saveByDate,
  setItemStatus,
  buildExcludeSet,
  isExcluded,
  DECISIONS_DIR,
  STATUS,
};
