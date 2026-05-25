const { chat } = require('./openrouter');
const { buildOrchestratorDeliveryPrompt } = require('../agent-prompt');
const decisionsStore = require('./decisions');

const ORCHESTRATOR_MODEL = process.env.OPENROUTER_MODEL_ORCHESTRATION || 'minimax/minimax-m2.7';
const TELEGRAM_API = 'https://api.telegram.org';
const TG_CHUNK = 3500;

const DELIVERY_TOOL = {
  type: 'function',
  function: {
    name: 'deliver_decision',
    description: 'Финальное решение оркестратора по дайджесту intel-scout с готовым текстом для Telegram.',
    parameters: {
      type: 'object',
      properties: {
        operator_message: {
          type: 'string',
          description: 'Готовое сообщение для оператора в Telegram, plain-text, ≤ 3500 символов.',
        },
        approved_ids: { type: 'array', items: { type: 'string' } },
        postponed_ids: { type: 'array', items: { type: 'string' } },
        rejected_ids: { type: 'array', items: { type: 'string' } },
        delegations: {
          type: 'array',
          description: 'Какому ИТ-агенту делегировать каждый approved proposal.',
          items: {
            type: 'object',
            properties: {
              proposal_id: { type: 'string' },
              owner_agent: { type: 'string', description: 'backend|devops|aiml|security|techlead|data|frontend|qa' },
              note: { type: 'string' },
            },
            required: ['proposal_id', 'owner_agent'],
          },
        },
      },
      required: ['operator_message', 'approved_ids', 'postponed_ids', 'rejected_ids'],
    },
  },
};

async function decideViaChief(digest) {
  if (!process.env.OPENROUTER_API_KEY) {
    return {
      operator_message: '⚠️ Дайджест сформирован, но OPENROUTER_API_KEY не задан — оркестратор не смог принять решение.',
      approved_ids: [],
      postponed_ids: [],
      rejected_ids: [],
      delegations: [],
      _skipped: true,
    };
  }
  const compact = {
    date: digest.date,
    metrics: digest.metrics,
    snapshot: {
      mcp_servers: digest.snapshot?.mcp_servers,
      plugins: digest.snapshot?.plugins,
      models_in_use: digest.snapshot?.models_in_use,
    },
    proposals: digest.proposals,
    summary_md: digest.summary_md,
  };

  try {
    const r = await chat({
      model: ORCHESTRATOR_MODEL,
      temperature: 0.2,
      tools: [DELIVERY_TOOL],
      toolChoice: { type: 'function', function: { name: 'deliver_decision' } },
      messages: [
        { role: 'system', content: buildOrchestratorDeliveryPrompt() },
        { role: 'user', content: JSON.stringify(compact) },
      ],
    });
    return r.toolArgs || { operator_message: r.content || '(empty)', approved_ids: [], postponed_ids: [], rejected_ids: [] };
  } catch (e) {
    return {
      operator_message: `⚠️ Оркестратор не смог обработать дайджест: ${e.message}`,
      approved_ids: [],
      postponed_ids: [],
      rejected_ids: [],
      delegations: [],
      _error: e.message,
    };
  }
}

function chunkText(text, size) {
  const out = [];
  let i = 0;
  while (i < text.length) {
    out.push(text.slice(i, i + size));
    i += size;
  }
  return out;
}

async function sendToTelegram(text) {
  const token = process.env.TELEGRAM_BOT_TOKEN;
  const chatId = process.env.TELEGRAM_CHAT_ID;
  if (!token || !chatId) {
    return { skipped: true, reason: 'TELEGRAM_BOT_TOKEN или TELEGRAM_CHAT_ID не задан в .env' };
  }
  const chunks = chunkText(text, TG_CHUNK);
  const sent = [];
  for (const part of chunks) {
    const r = await fetch(`${TELEGRAM_API}/bot${token}/sendMessage`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json; charset=utf-8' },
      body: JSON.stringify({ chat_id: Number(chatId), text: part, disable_web_page_preview: true }),
    });
    const json = await r.json().catch(() => ({}));
    if (!json.ok) return { sent, error: json.description || `HTTP ${r.status}` };
    sent.push(json.result?.message_id);
  }
  return { sent };
}

async function deliver(digest) {
  const decision = await decideViaChief(digest);
  const tg = await sendToTelegram(decision.operator_message || '(empty)');
  try {
    decisionsStore.recordDigest({
      date: digest.date,
      decision,
      proposals: digest.proposals || [],
      candidates: digest.top_candidates || [],
      telegramMessageIds: tg.sent || null,
    });
  } catch (e) {
    return { decision, telegram: tg, decisions_save_error: e.message };
  }
  return { decision, telegram: tg };
}

module.exports = { deliver, decideViaChief, sendToTelegram, DELIVERY_TOOL };
