const fs = require('fs');
const path = require('path');
const decisions = require('./decisions');
const { todayLocal } = require('./util-date');

const OFFSET_FILE = path.join(decisions.DECISIONS_DIR, '.tg-update-offset.json');
const TELEGRAM_API = 'https://api.telegram.org';

const EMOJI = {
  '👍': 'approved',
  '✅': 'approved',
  '❤': 'approved',
  '❤️': 'approved',
  '👎': 'rejected',
  '❌': 'rejected',
  '🚫': 'rejected',
  '⏸': 'postponed',
  '⏸️': 'postponed',
  '⌛': 'postponed',
  '⏳': 'postponed',
};

const KEYWORDS = [
  { re: /\bapprove\b|\bодобрено\b|\bok\b|\byes\b|\bда\b/i, status: 'approved' },
  { re: /\breject\b|\bотклонено\b|\bno\b|\bнет\b/i, status: 'rejected' },
  { re: /\bpostpone\b|\bотложено\b|\blater\b|\bпотом\b/i, status: 'postponed' },
];

function loadOffset() {
  try { return JSON.parse(fs.readFileSync(OFFSET_FILE, 'utf8')).offset || 0; } catch { return 0; }
}
function saveOffset(offset) {
  try {
    decisions.loadAll;
    fs.mkdirSync(path.dirname(OFFSET_FILE), { recursive: true });
    fs.writeFileSync(OFFSET_FILE, JSON.stringify({ offset, ts: new Date().toISOString() }, null, 2));
  } catch {}
}

async function getUpdates({ token, offset, limit = 100, timeout = 10 }) {
  const url = `${TELEGRAM_API}/bot${token}/getUpdates`;
  const r = await fetch(url, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      offset,
      limit,
      timeout,
      allowed_updates: ['message', 'message_reaction'],
    }),
  });
  const json = await r.json().catch(() => ({}));
  if (!json.ok) {
    const err = new Error(`getUpdates failed: ${json.description || r.status}`);
    err.body = json;
    throw err;
  }
  return json.result || [];
}

function findDigestByMessageId(messageId) {
  for (const d of decisions.loadAll()) {
    if (Array.isArray(d.telegramMessageIds) && d.telegramMessageIds.includes(messageId)) return d;
  }
  return null;
}

function extractIdsFromText(text) {
  if (!text || typeof text !== 'string') return [];
  const set = new Set();
  const re = /P-\d{4}-\d{2}-\d{2}-\d{1,3}/g;
  let m;
  while ((m = re.exec(text)) !== null) set.add(m[0]);
  return [...set];
}

function statusFromMessageText(text) {
  if (!text) return null;
  if (/[👍✅❤️❤]/u.test(text)) return 'approved';
  if (/[👎❌🚫]/u.test(text)) return 'rejected';
  if (/[⏸⏳⌛]/u.test(text)) return 'postponed';
  for (const k of KEYWORDS) if (k.re.test(text)) return k.status;
  return null;
}

function statusFromReactions(emoji_list) {
  if (!Array.isArray(emoji_list)) return null;
  for (const e of emoji_list) {
    const status = EMOJI[e.emoji || e];
    if (status) return status;
  }
  return null;
}

function applyDecisionAllItems(digest, status, source) {
  let changed = 0;
  for (const it of digest.items || []) {
    if (it.status !== status) {
      decisions.setItemStatus(digest.date, it.proposal_id, status, source);
      changed++;
    }
  }
  return changed;
}

function applyDecisionByIds(digest, ids, status, source) {
  let changed = 0;
  for (const id of ids) {
    const it = (digest.items || []).find((x) => x.proposal_id === id);
    if (it && it.status !== status) {
      decisions.setItemStatus(digest.date, it.proposal_id, status, source);
      changed++;
    }
  }
  return changed;
}

async function syncOnce() {
  const token = process.env.TELEGRAM_BOT_TOKEN;
  if (!token) return { skipped: true, reason: 'TELEGRAM_BOT_TOKEN не задан' };

  const offset = loadOffset();
  let updates;
  try { updates = await getUpdates({ token, offset, timeout: 0 }); }
  catch (e) { return { error: e.message }; }

  let processed = 0;
  let changed = 0;
  let lastUpdateId = offset;

  for (const upd of updates) {
    lastUpdateId = upd.update_id + 1;

    if (upd.message_reaction) {
      const mr = upd.message_reaction;
      const targetMessageId = mr.message_id;
      const digest = findDigestByMessageId(targetMessageId);
      if (!digest) continue;
      const emojis = (mr.new_reaction || []).map((r) => r.emoji || r);
      const status = statusFromReactions(emojis);
      if (!status) continue;
      changed += applyDecisionAllItems(digest, status, 'telegram_reaction');
      processed++;
      continue;
    }

    const msg = upd.message;
    if (!msg) continue;

    const replyTo = msg.reply_to_message?.message_id;
    const text = msg.text || msg.caption || '';
    const status = statusFromMessageText(text);
    if (!status) continue;

    const ids = extractIdsFromText(text);
    if (ids.length) {
      const today = todayLocal();
      const digest = decisions.loadByDate(today) || decisions.loadAll().slice(-1)[0];
      if (digest) {
        changed += applyDecisionByIds(digest, ids, status, 'telegram_reply');
        processed++;
        continue;
      }
    }
    if (replyTo) {
      const digest = findDigestByMessageId(replyTo);
      if (digest) {
        changed += applyDecisionAllItems(digest, status, 'telegram_reply_blanket');
        processed++;
      }
    }
  }

  saveOffset(lastUpdateId);
  return { processed_updates: processed, status_changes: changed, new_offset: lastUpdateId, total_updates: updates.length };
}

module.exports = { syncOnce, loadOffset, saveOffset };
