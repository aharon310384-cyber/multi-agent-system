const { chat } = require('./openrouter');

function pickAnalystModel() {
  return process.env.OPENROUTER_MODEL_INTEL_SCOUT || 'deepseek/deepseek-chat';
}

const ANALYST_SYSTEM = `Ты — аналитик intel-scout многоагентной AI-системы. Тебе передают snapshot
текущего стека системы и топ-кандидатов внешних новостей/релизов.

Задача — для каждого кандидата сформировать proposal или пропустить (если дубль/мусор).
Только два типа предложений:
1) ОПТИМИЗАЦИЯ существующего (cost / speed / упрощение)
2) ДОБАВЛЕНИЕ нового, чего НЕТ в snapshot и что закрывает реальный gap

Запреты:
- НЕ предлагать менять то, что уже работает и закрывает задачу
- НЕ дублировать то, что уже есть в snapshot (mcp_servers, plugins, npm_deps)
- НЕ выдумывать факты; если не уверен — не предлагай
- Не больше 7 proposals в одном дайджесте

Ответ обязательно через function call submit_digest.`;

const PROPOSAL_SCHEMA = {
  type: 'object',
  properties: {
    id: { type: 'string', description: 'P-YYYY-MM-DD-NN' },
    priority: { type: 'string', enum: ['🔴 urgent', '🟡 consider', '🟢 info'] },
    category: { type: 'string', enum: ['cost', 'speed', 'new_capability', 'upgrade'] },
    title: { type: 'string' },
    what_we_have_now: { type: 'string' },
    what_is_new: { type: 'string' },
    why_it_matters: { type: 'string' },
    expected_gain: {
      type: 'object',
      properties: {
        cost_delta_usd_month: { type: 'number' },
        speed_delta_ms: { type: 'number' },
        capability_added: { type: 'string' },
      },
    },
    sources: { type: 'array', items: { type: 'string' }, minItems: 1 },
    license: { type: 'string' },
    rollout_plan: { type: 'array', items: { type: 'string' }, minItems: 1 },
    effort_estimate_hours: { type: 'number' },
    risk: { type: 'string' },
    needs_approval: { type: 'boolean' },
  },
  required: ['id', 'priority', 'category', 'title', 'what_we_have_now', 'what_is_new', 'why_it_matters', 'sources', 'rollout_plan', 'needs_approval'],
};

const DIGEST_TOOL = {
  type: 'function',
  function: {
    name: 'submit_digest',
    description: 'Финальный дайджест с proposals и кратким markdown-резюме.',
    parameters: {
      type: 'object',
      properties: {
        summary_md: { type: 'string', description: 'Markdown-резюме для Telegram, ≤ 1500 символов.' },
        proposals: { type: 'array', items: PROPOSAL_SCHEMA, maxItems: 7 },
      },
      required: ['summary_md', 'proposals'],
    },
  },
};

const { todayLocal } = require('./util-date');

function buildDate() {
  return todayLocal();
}

async function buildDigest({ snapshot, candidates, metrics }) {
  const date = buildDate();
  const compactCandidates = candidates.slice(0, 15).map((c, i) => ({
    n: i + 1,
    title: c.title,
    url: c.url,
    source: c.source,
    score: c.score,
    cluster_size: c.cluster_size,
    body: (c.body_md || '').slice(0, 500),
    already_in_stack: c._already_in_stack || null,
  }));

  const userMsg = JSON.stringify({
    date,
    snapshot: {
      mcp_servers: snapshot.mcp_servers,
      plugins: snapshot.plugins,
      models_in_use: snapshot.models_in_use,
      key_deps: snapshot.npm_deps.slice(0, 30),
    },
    candidates: compactCandidates,
  });

  const analystModel = pickAnalystModel();
  let response;
  try {
    response = await chat({
      model: analystModel,
      temperature: 0.2,
      cacheSystem: true,
      tools: [DIGEST_TOOL],
      toolChoice: { type: 'function', function: { name: 'submit_digest' } },
      messages: [
        { role: 'system', content: ANALYST_SYSTEM },
        { role: 'user', content: userMsg },
      ],
    });
  } catch (e) {
    return {
      date,
      snapshot,
      metrics,
      proposals: [],
      summary_md: `⚠️ intel-scout: ошибка генерации дайджеста — ${e.message}`,
      error: e.message,
    };
  }

  const args = response.toolArgs || {};
  return {
    date,
    snapshot: {
      models_in_use: snapshot.models_in_use,
      mcp_servers: snapshot.mcp_servers,
      plugins: snapshot.plugins,
    },
    metrics,
    proposals: Array.isArray(args.proposals) ? args.proposals : [],
    summary_md: args.summary_md || '',
    usage: response.usage,
    model: response.model,
  };
}

module.exports = { buildDigest, DIGEST_TOOL };
