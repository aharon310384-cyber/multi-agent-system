const fs = require('fs');
const path = require('path');
const { ingestAll } = require('./ingestion');
const { dedupItems } = require('./dedup');
const { filterNoise } = require('./noise-filter');
const { takeSnapshot, isAlreadyInStack } = require('./snapshot');
const { rank } = require('./ranker');
const { buildDigest } = require('./digest');
const { buildExcludeSet, isExcluded } = require('./decisions');
const { todayLocal } = require('./util-date');

const ARCHIVE_DIR = path.resolve(__dirname, '..', '..', 'Онлайн разведка', 'архив');

function ensureArchive() {
  try { fs.mkdirSync(ARCHIVE_DIR, { recursive: true }); } catch {}
}

function digestToMarkdown(digest) {
  const lines = [];
  lines.push(`# Intel-Scout дайджест — ${digest.date}`);
  lines.push('');
  if (digest.summary_md) {
    lines.push(digest.summary_md);
    lines.push('');
  }
  lines.push('## Метрики прохода');
  lines.push('```json');
  lines.push(JSON.stringify(digest.metrics, null, 2));
  lines.push('```');
  lines.push('');
  if (digest.error) {
    lines.push('## ⚠️ Ошибка');
    lines.push(digest.error);
    lines.push('');
  }
  if (digest.proposals?.length) {
    lines.push('## Proposals');
    for (const p of digest.proposals) {
      lines.push('');
      lines.push(`### ${p.priority || ''} ${p.title || '(без заголовка)'}`);
      lines.push(`- **id:** ${p.id || '?'} · **category:** ${p.category || '?'}`);
      lines.push(`- **Сейчас:** ${p.what_we_have_now || ''}`);
      lines.push(`- **Предлагается:** ${p.what_is_new || ''}`);
      lines.push(`- **Зачем:** ${p.why_it_matters || ''}`);
      if (p.expected_gain) lines.push(`- **Выгода:** \`${JSON.stringify(p.expected_gain)}\``);
      lines.push(`- **License:** ${p.license || '?'} · **Effort:** ${p.effort_estimate_hours || '?'}ч · **Risk:** ${p.risk || '?'}`);
      if (Array.isArray(p.rollout_plan) && p.rollout_plan.length) {
        lines.push('- **План:**');
        p.rollout_plan.forEach((s, i) => lines.push(`  ${i + 1}. ${s}`));
      }
      if (Array.isArray(p.sources) && p.sources.length) {
        lines.push('- **Источники:**');
        p.sources.forEach((s) => lines.push(`  - ${s}`));
      }
    }
  } else {
    lines.push('## Proposals');
    lines.push('_За сутки не нашлось ничего стоящего внедрения._');
  }
  return lines.join('\n');
}

async function run({ windowHours = 24, dryLLM = false } = {}) {
  const t0 = Date.now();
  const snapshot = takeSnapshot();

  const { items: rawItems, errors, sinceMs } = await ingestAll({ windowHours });
  const rawCount = rawItems.length;

  const clusters = dedupItems(rawItems);
  const afterDedup = clusters.length;

  const excludeSet = buildExcludeSet();
  const afterExcludeFilter = clusters.filter((c) => !isExcluded(c, excludeSet));
  const excludedByDecisions = afterDedup - afterExcludeFilter.length;

  const tagged = afterExcludeFilter.map((c) => ({
    ...c,
    _already_in_stack: isAlreadyInStack(c, snapshot),
  }));

  const fresh = tagged.filter((c) => !c._already_in_stack);
  const alreadyInStack = tagged.filter((c) => c._already_in_stack);

  let afterFilter = fresh;
  if (!dryLLM && process.env.OPENROUTER_API_KEY) {
    afterFilter = await filterNoise(fresh);
  }

  const ranked = rank(afterFilter);
  const top = ranked.slice(0, 15);

  const metrics = {
    sources_scanned_ok: new Set(rawItems.map((i) => i.source)).size,
    sources_failed: errors.length,
    raw_signals: rawCount,
    after_dedup: afterDedup,
    excluded_by_past_decisions: excludedByDecisions,
    after_noise_filter: afterFilter.length,
    already_in_stack: alreadyInStack.length,
    in_digest_candidates: top.length,
    duration_ms: 0,
  };

  let digest;
  if (dryLLM || !process.env.OPENROUTER_API_KEY) {
    digest = {
      date: todayLocal(),
      snapshot,
      metrics,
      proposals: [],
      summary_md: 'dry-run: LLM-шаги пропущены (нет OPENROUTER_API_KEY или dryLLM=true). Кандидаты ниже.',
      candidates_dry: top.map((c) => ({ title: c.title, url: c.url, score: c.score, source: c.source })),
    };
  } else {
    digest = await buildDigest({ snapshot, candidates: top, metrics });
  }

  metrics.duration_ms = Date.now() - t0;
  digest.metrics = metrics;
  digest.errors = errors;
  digest.already_in_stack_examples = alreadyInStack.slice(0, 10).map((c) => ({
    title: c.title,
    matched: c._already_in_stack,
  }));
  digest.top_candidates = top.map((c) => ({
    title: c.title,
    url: c.url,
    title_hash: c.title_hash,
    source: c.source,
    score: c.score,
  }));

  ensureArchive();
  const stamp = digest.date || todayLocal();
  const jsonPath = path.join(ARCHIVE_DIR, `${stamp}.json`);
  const mdPath = path.join(ARCHIVE_DIR, `${stamp}.md`);
  fs.writeFileSync(jsonPath, JSON.stringify(digest, null, 2), 'utf8');
  fs.writeFileSync(mdPath, digestToMarkdown(digest), 'utf8');

  return { digest, jsonPath, mdPath };
}

module.exports = { run, digestToMarkdown };
