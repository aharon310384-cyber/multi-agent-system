const firecrawl = require('./firecrawl');
const brave = require('./brave');

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
  {
    type: 'function',
    function: {
      name: 'brave_search',
      description: 'Быстрый поиск в вебе через Brave Search API (latency ~700ms, дешевле Firecrawl). Используй для daily-discovery, мониторинга новостей, проверки актуальности. Параметр freshness: pd (за день), pw (за неделю), pm (за месяц), py (за год). Для глубокого scrape страницы — используй firecrawl_scrape.',
      parameters: {
        type: 'object',
        properties: {
          query: { type: 'string', description: 'Поисковый запрос.' },
          count: { type: 'integer', minimum: 1, maximum: 20, description: 'Сколько результатов (по умолчанию 5).' },
          freshness: { type: 'string', enum: ['pd', 'pw', 'pm', 'py'], description: 'Фильтр по свежести: pd/pw/pm/py.' },
        },
        required: ['query'],
      },
    },
  },
  {
    type: 'function',
    function: {
      name: 'brave_news',
      description: 'Поиск свежих новостей через Brave News API. Возвращает заголовки за указанный период (по умолчанию за день). Лучший инструмент для daily-разведки AI-индустрии: новые модели, MCP, релизы, инциденты.',
      parameters: {
        type: 'object',
        properties: {
          query: { type: 'string', description: 'Тема для мониторинга (например, "Claude Code MCP release").' },
          count: { type: 'integer', minimum: 1, maximum: 20, description: 'Сколько новостей (по умолчанию 10).' },
          freshness: { type: 'string', enum: ['pd', 'pw', 'pm'], description: 'pd — за день (default), pw — за неделю, pm — за месяц.' },
        },
        required: ['query'],
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
  'osint',
  'intel-scout',
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
  if (name === 'brave_search') return await brave.search(args);
  if (name === 'brave_news') return await brave.news(args);
  throw new Error(`unknown_tool: ${name}`);
}

const TOOLS_PROMPT_BLOCK = [
  'Доступные инструменты (function calling):',
  '— brave_search(query, count, freshness): быстрый поиск в вебе. Дёшево и быстро (~700ms). Лучший выбор для daily-discovery и проверки актуальности.',
  '— brave_news(query, count, freshness): свежие новости. Используй для мониторинга AI-индустрии, релизов, инцидентов.',
  '— firecrawl_search(query, limit): альтернативный поиск через Firecrawl (дороже, но иногда даёт другие источники).',
  '— firecrawl_scrape(url): скачать страницу как markdown. Используй, когда URL уже известен (например, из brave_search/brave_news).',
  '',
  'Правила:',
  '— Сначала brave_search/brave_news для discovery → потом firecrawl_scrape для глубокого чтения нужных страниц.',
  '— Если задача требует свежих данных (бенчмарки, цены, релизы, конкуренты) — сначала иди в веб.',
  '— Цитируя факт из веба — указывай источник (URL) и дату.',
  '— Не вызывай инструменты без необходимости: если ответ есть в твоих знаниях/контексте — не ходи в веб.',
].join('\n');

module.exports = {
  TOOL_DEFS,
  hasTools,
  getToolsForAgent,
  executeTool,
  TOOLS_PROMPT_BLOCK,
};
