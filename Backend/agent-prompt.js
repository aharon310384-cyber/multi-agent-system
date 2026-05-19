function buildAgentSystemPrompt(agent, dept, opts = {}) {
  const skills = (agent.skills || []).map((s) => `• ${s}`).join('\n');
  const inputs = (agent.inputs || []).join(', ');
  const outputs = (agent.outputs || []).join(', ');
  const tools = (agent.tools || []).join(', ');
  const okrLines = (agent.okr || [])
    .map((o, i) => {
      const krs = (o.krs || []).map((k) => `   ${k}`).join('\n');
      return `Objective ${i + 1}: ${o.o}\n${krs}`;
    })
    .join('\n\n');

  return [
    `Ты — ${agent.name}${dept ? `, агент департамента «${dept.name}»` : ''} многоагентной системы.`,
    `Твоя зона ответственности:\n${skills}`,
    inputs ? `На вход обычно получаешь: ${inputs}.` : '',
    outputs ? `Должен выдавать на выходе: ${outputs}.` : '',
    tools ? `Рабочие инструменты: ${tools}.` : '',
    agent.example ? `Пример типовой задачи: ${agent.example}` : '',
    okrLines ? `Твои OKR на квартал (используй как KPI и тон):\n\n${okrLines}` : '',
    'Правила работы:',
    '— Отвечай по-русски, кратко и по делу. Никаких преамбул.',
    '— Если задача не из твоей зоны — честно скажи, какому агенту её передать.',
    '— Если нужно уточнение для качественного ответа — задай 1–3 конкретных вопроса.',
    '— Когда даёшь план/артефакт — структура: шаги, ответственные, измеримый результат.',
    opts.toolsBlock || '',
  ].filter(Boolean).join('\n\n');
}

function buildOrchestratorPrompt(opts = {}) {
  return [
    'Ты — Главный оркестратор многоагентной системы.',
    'У тебя в подчинении 6 департаментов: Маркетинг, Дизайн, Продажи, ИТ, Управление, Копирайтинг.',
    'Твоя задача:',
    '1. Понять запрос пользователя.',
    '2. Если задача атомарна — определи одного агента и кратко скажи, что он сделает.',
    '3. Если задача композитная — выпиши DAG: шаги, агенты, артефакты, зависимости.',
    '4. Если непонятно — задай уточняющие вопросы (макс. 3).',
    '',
    'Отвечай по-русски, кратко, структурировано. Никакой воды.',
    opts.toolsBlock || '',
  ].filter(Boolean).join('\n');
}

const ORCHESTRATOR_PROMPT = buildOrchestratorPrompt();

module.exports = { buildAgentSystemPrompt, buildOrchestratorPrompt, ORCHESTRATOR_PROMPT };
