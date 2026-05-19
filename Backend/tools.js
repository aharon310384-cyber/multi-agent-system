const firecrawl = require('./firecrawl');

const TOOL_DEFS = [
  {
    type: 'function',
    function: {
      name: 'firecrawl_search',
      description: 'Поиск в вебе через Firecrawl. Возвращает релевантные страницы (URL, заголовок, описание). Используй, когда нужны источники по теме: бенчмарки, конкуренты, тренды, индустриальные данные. Не используй для уже известных URL — там firecrawl_scrape.',
      parameters: {
        type: 'object',
        properties: {
          query: {
            type: 'string',
            description: 'Поисковый запрос на естественном языке. Поддерживает операторы: site:, "точная фраза", -исключить.',
          },
          limit: {
            type: 'integer',
            minimum: 1,
            maximum: 10,
            description: 'Сколько результатов вернуть (по умолчанию 5).',
          },
        },
        required: ['query'],
      },
    },
  },
  {
    type: 'function',
    function: {
      name: 'firecrawl_scrape',
      description: 'Скачать одну веб-страницу в виде markdown. Используй, когда URL уже известен (из firecrawl_search, из задания пользователя, из ссылки в обсуждении).',
      parameters: {
        type: 'object',
        properties: {
          url: {
            type: 'string',
            description: 'Полный URL (https://...).',
          },
        },
        required: ['url'],
      },
    },
  },
];

const TOOLS_ENABLED_AGENTS = new Set([
  'chief',
  'strategist',
  'targetolog',
  'seo',
  'smm',
  'analyst',
]);

function hasTools(agentId) {
  return TOOLS_ENABLED_AGENTS.has(agentId);
}

function getToolsForAgent(agentId) {
  return hasTools(agentId) ? TOOL_DEFS : null;
}

async function executeTool(name, rawArgs) {
  const args = rawArgs && typeof rawArgs === 'object' ? rawArgs : {};
  if (name === 'firecrawl_search') return await firecrawl.search(args);
  if (name === 'firecrawl_scrape') return await firecrawl.scrape(args);
  throw new Error(`unknown_tool: ${name}`);
}

const TOOLS_PROMPT_BLOCK = [
  'Доступные инструменты (function calling):',
  '— firecrawl_search(query, limit): поиск в вебе. Используй, когда нужны источники, бенчмарки, факты, которых нет в твоей памяти, или они могут быть устаревшими.',
  '— firecrawl_scrape(url): скачать страницу как markdown. Используй, когда URL уже известен.',
  '',
  'Правила:',
  '— Если задача требует свежих данных (бенчмарки, цены, релизы, конкуренты) — сначала вызови firecrawl_search.',
  '— Цитируя факт из веба — указывай источник (URL).',
  '— Не вызывай инструменты без необходимости: если ответ есть в твоих знаниях/контексте — не ходи в веб.',
].join('\n');

module.exports = {
  TOOL_DEFS,
  hasTools,
  getToolsForAgent,
  executeTool,
  TOOLS_PROMPT_BLOCK,
};
