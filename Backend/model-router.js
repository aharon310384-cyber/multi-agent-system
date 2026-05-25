const TASK_TYPE = {
  // Маркетинг и копирайтинг → Gemini Flash (лёгкие тексты, быстрые итерации)
  strategist: 'marketing',
  targetolog: 'marketing',
  seo: 'marketing',
  smm: 'marketing',
  analyst: 'marketing',
  copywriter: 'marketing',

  // ИТ-агенты → Opus 4.7 (код, архитектура, сложный reasoning)
  backend: 'dev',
  frontend: 'dev',
  mobile: 'dev',
  devops: 'dev',
  qa: 'dev',
  aiml: 'dev',
  data: 'dev',
  security: 'dev',
  techlead: 'dev',

  // Оркестрация и управление → Minimax M2 (заточен под мультиагентность)
  chief: 'orchestration',
  decomposer: 'orchestration',
  router: 'orchestration',
  arbiter: 'orchestration',
  memory: 'orchestration',
  pm: 'orchestration',
  ba: 'orchestration',
  osint: 'orchestration',

  // Онлайн-разведка → Sonnet 4.5 (баланс качества/цены для аналитики)
  'intel-scout': 'intel',

  // Дефолт (designer, sales, account) → DeepSeek V3 (deepseek-chat)
};

const DEFAULT_MODELS = {
  default: 'deepseek/deepseek-chat',
  dev: 'anthropic/claude-opus-4.7',
  marketing: 'google/gemini-2.5-flash',
  orchestration: 'minimax/minimax-m2.7',
  intel: 'anthropic/claude-sonnet-4.5',
};

const IMAGE_MODEL = 'google/gemini-2.5-flash-image';

function getTaskType(agentId) {
  return TASK_TYPE[agentId] || 'default';
}

function resolveModel(agentId, overrides = {}) {
  const env = process.env;
  const taskType = getTaskType(agentId);
  return (
    overrides[agentId] ||
    overrides[taskType] ||
    env[`OPENROUTER_MODEL_${agentId.toUpperCase()}`] ||
    env[`OPENROUTER_MODEL_${taskType.toUpperCase()}`] ||
    DEFAULT_MODELS[taskType] ||
    DEFAULT_MODELS.default
  );
}

function getImageModel() {
  return process.env.OPENROUTER_MODEL_IMAGE || IMAGE_MODEL;
}

function supportsExplicitCache(model) {
  if (typeof model !== 'string') return false;
  return model.startsWith('anthropic/');
}

function applyCacheControl(messages, model) {
  if (!supportsExplicitCache(model)) return messages;
  return messages.map((m, i) => {
    if (m.role !== 'system' || typeof m.content !== 'string' || m.content.length < 1024) {
      return m;
    }
    return {
      role: 'system',
      content: [
        {
          type: 'text',
          text: m.content,
          cache_control: { type: 'ephemeral' },
        },
      ],
    };
  });
}

module.exports = {
  resolveModel,
  getTaskType,
  getImageModel,
  supportsExplicitCache,
  applyCacheControl,
  DEFAULT_MODELS,
  TASK_TYPE,
};
