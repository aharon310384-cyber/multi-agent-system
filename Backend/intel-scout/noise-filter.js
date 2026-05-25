const { chat } = require('./openrouter');

const FILTER_MODEL = process.env.OPENROUTER_MODEL_FILTER || 'deepseek/deepseek-chat';

const FILTER_SYSTEM = `Ты — фильтр шума для intel-scout многоагентной AI-системы.
На вход — массив заголовков и сниппетов. Для каждого определи: РЕЛЕВАНТ или ШУМ.

РЕЛЕВАНТ — это что-то одно из:
- новый MCP-сервер / обновление существующего
- новый skill / плагин для Claude Code
- релиз/обновление Claude Code, Anthropic SDK, OpenRouter
- новый agentic framework (Mastra, LangGraph, CrewAI, VoltAgent и подобные)
- новый research/search API дешевле или быстрее текущих
- готовый open-source intel-scout / news-digest бот
- инструмент для генерации видео-контента, инфографики
- кейс автоматизации бизнеса в нашей нише

ШУМ:
- общие новости «AI изменит мир», «ChatGPT превзошёл»
- базовые туториалы «что такое LLM»
- реклама курсов, платных сервисов
- прогнозы и философия без конкретики
- хайповые заголовки без сабстанса

Ответ обязательно через function call submit_verdicts.`;

const FILTER_TOOL = {
  type: 'function',
  function: {
    name: 'submit_verdicts',
    description: 'Возвращает массив вердиктов в том же порядке и той же длины, что и items на входе.',
    parameters: {
      type: 'object',
      properties: {
        verdicts: {
          type: 'array',
          items: {
            type: 'object',
            properties: {
              i: { type: 'integer', description: 'Индекс элемента в input (0-based).' },
              relevant: { type: 'boolean' },
              reason: { type: 'string', description: 'Короткое обоснование, ≤ 80 символов.' },
            },
            required: ['i', 'relevant', 'reason'],
          },
        },
      },
      required: ['verdicts'],
    },
  },
};

async function filterNoise(items, { batchSize = 30 } = {}) {
  if (!items.length) return [];
  const results = new Array(items.length);

  for (let off = 0; off < items.length; off += batchSize) {
    const batch = items.slice(off, off + batchSize);
    const payload = batch.map((it, idx) => ({
      i: idx,
      title: it.title,
      source: it.source,
      body: (it.body_md || '').slice(0, 300),
    }));

    let response;
    try {
      response = await chat({
        model: FILTER_MODEL,
        temperature: 0.1,
        tools: [FILTER_TOOL],
        toolChoice: { type: 'function', function: { name: 'submit_verdicts' } },
        messages: [
          { role: 'system', content: FILTER_SYSTEM },
          { role: 'user', content: JSON.stringify({ items: payload }) },
        ],
      });
    } catch (e) {
      for (let k = 0; k < batch.length; k++) results[off + k] = { ...batch[k], relevant: true, filter_reason: `filter_error: ${e.message}` };
      continue;
    }

    const arr = Array.isArray(response.toolArgs?.verdicts) ? response.toolArgs.verdicts : [];

    for (let k = 0; k < batch.length; k++) {
      const verdict = arr.find((x) => x.i === k) || { relevant: true, reason: 'missing_verdict' };
      results[off + k] = {
        ...batch[k],
        relevant: Boolean(verdict.relevant),
        filter_reason: verdict.reason || null,
      };
    }
  }

  return results.filter((x) => x.relevant);
}

module.exports = { filterNoise, FILTER_TOOL };
