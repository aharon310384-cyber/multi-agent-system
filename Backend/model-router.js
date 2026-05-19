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

  // Дефолт (designer, sales, account) → DeepSeek V3 (deepseek-chat)
};

const DEFAULT_MODELS = {
  default: 'deepseek/deepseek-chat',
  dev: 'anthropic/claude-opus-4.7',
  marketing: 'google/gemini-2.5-flash',
  orchestration: 'minimax/minimax-m2.7',
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

module.exports = { resolveModel, getTaskType, getImageModel, DEFAULT_MODELS, TASK_TYPE };
