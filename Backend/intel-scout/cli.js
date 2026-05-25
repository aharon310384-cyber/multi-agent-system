#!/usr/bin/env node
const path = require('path');
require('dotenv').config({ path: path.resolve(__dirname, '..', '..', '.env') });

const { run } = require('./pipeline');
const { deliver } = require('./delivery');
const { syncOnce } = require('./sync-feedback');

(async () => {
  const args = new Set(process.argv.slice(2));
  const opts = {
    windowHours: 24,
    dryLLM: args.has('--dry') || args.has('--dry-llm'),
    deliver: args.has('--deliver'),
    sync: args.has('--sync'),
    syncOnly: args.has('--sync-only'),
  };
  for (const a of process.argv.slice(2)) {
    const w = a.match(/^--window=(\d+)$/);
    if (w) opts.windowHours = Number(w[1]);
    const m = a.match(/^--model=(.+)$/);
    if (m) process.env.OPENROUTER_MODEL_INTEL_SCOUT = m[1];
  }

  if (opts.sync || opts.syncOnly) {
    const r = await syncOnce();
    console.log('[intel-scout sync]', r);
    if (opts.syncOnly) return;
  }

  const stamp = new Date().toISOString();
  console.log(`[intel-scout ${stamp}] start window=${opts.windowHours}h dryLLM=${opts.dryLLM} deliver=${opts.deliver}`);
  const t0 = Date.now();
  try {
    const { digest, jsonPath, mdPath } = await run(opts);
    console.log(`[intel-scout] pipeline done in ${((Date.now() - t0) / 1000).toFixed(1)}s`);
    console.log(`[intel-scout] metrics:`, digest.metrics);
    console.log(`[intel-scout] json: ${jsonPath}`);
    console.log(`[intel-scout] md:   ${mdPath}`);
    if (digest.proposals?.length) {
      console.log(`[intel-scout] proposals: ${digest.proposals.length}`);
      for (const p of digest.proposals) console.log(`  - ${p.priority || ''} ${p.title}`);
    }

    if (opts.deliver && !opts.dryLLM) {
      console.log('[intel-scout] delivering via chief → telegram...');
      const result = await deliver(digest);
      console.log('[intel-scout] decision approved/postponed/rejected:',
        (result.decision.approved_ids || []).length,
        (result.decision.postponed_ids || []).length,
        (result.decision.rejected_ids || []).length);
      console.log('[intel-scout] telegram:', result.telegram);
    }
    console.log(`[intel-scout ${new Date().toISOString()}] total ${((Date.now() - t0) / 1000).toFixed(1)}s`);
  } catch (e) {
    console.error('[intel-scout] FATAL:', e.message);
    process.exitCode = 1;
  }
})();
