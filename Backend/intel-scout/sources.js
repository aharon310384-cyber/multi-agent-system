const RSS_FEEDS = [
  { id: 'openai-blog', url: 'https://openai.com/news/rss.xml', authority: 0.9, tags: ['openai'] },
  { id: 'huggingface-blog', url: 'https://huggingface.co/blog/feed.xml', authority: 0.85, tags: ['ml', 'opensource'] },
  { id: 'arxiv-cs-ai', url: 'https://arxiv.org/rss/cs.AI', authority: 0.7, tags: ['research'] },
  { id: 'arxiv-cs-ma', url: 'https://arxiv.org/rss/cs.MA', authority: 0.7, tags: ['multi-agent'] },
  { id: 'github-blog', url: 'https://github.blog/feed/', authority: 0.8, tags: ['github', 'ai'] },
  { id: 'simonw-blog', url: 'https://simonwillison.net/atom/everything/', authority: 0.85, tags: ['llm', 'tools'] },
  { id: 'openrouter-blog', url: 'https://openrouter.ai/blog/rss.xml', authority: 0.9, tags: ['openrouter', 'llm'] },
  { id: 'lobsters', url: 'https://lobste.rs/rss', authority: 0.7, tags: ['hn-like'] },
  { id: 'habr-ai', url: 'https://habr.com/ru/rss/hubs/artificial_intelligence/articles/', authority: 0.6, tags: ['habr', 'ru'] },
  { id: 'habr-ml', url: 'https://habr.com/ru/rss/hubs/machine_learning/articles/', authority: 0.6, tags: ['habr', 'ru', 'ml'] },
];

const GITHUB_WATCHED_REPOS = [
  'anthropics/claude-code',
  'anthropics/anthropic-sdk-typescript',
  'modelcontextprotocol/servers',
  'modelcontextprotocol/typescript-sdk',
  'mastra-ai/mastra',
  'langchain-ai/langgraph',
  'VoltAgent/voltagent',
];

const REDDIT_SUBS = ['LocalLLaMA', 'ClaudeAI', 'singularity', 'MachineLearning'];

const HN_KEYWORDS = ['claude', 'mcp', 'agent', 'llm', 'openrouter', 'anthropic'];

const BRAVE_NEWS_QUERIES = [
  'Claude Code new feature',
  'MCP server release',
  'OpenRouter pricing update',
  'multi-agent framework',
];

module.exports = {
  RSS_FEEDS,
  GITHUB_WATCHED_REPOS,
  REDDIT_SUBS,
  HN_KEYWORDS,
  BRAVE_NEWS_QUERIES,
};
