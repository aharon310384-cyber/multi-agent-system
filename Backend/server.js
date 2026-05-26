const path = require('path');
const express = require('express');
const cors = require('cors');

require('dotenv').config({ path: path.resolve(__dirname, '..', '.env') });

const { DEPARTMENTS, ORCHESTRATOR, SCENARIOS, FLOW_EDGES, ROUTING_RULES, routeTask } = require('./data');
const { buildAgentSystemPrompt, buildOrchestratorPrompt } = require('./agent-prompt');
const { resolveModel, getTaskType, getImageModel, applyCacheControl, DEFAULT_MODELS } = require('./model-router');
const { getToolsForAgent, hasTools, executeTool, TOOLS_PROMPT_BLOCK } = require('./tools');

const PORT = Number(process.env.PORT) || 3000;
const HOST = process.env.HOST || '0.0.0.0';
const FRONTEND_DIR = path.resolve(__dirname, '..', 'Frontend');
const OPENROUTER_API_KEY = process.env.OPENROUTER_API_KEY;
const OPENROUTER_URL = 'https://openrouter.ai/api/v1/chat/completions';

const app = express();
app.use(cors());
app.use(express.json({ limit: '256kb' }));

app.get('/api/health', (_req, res) => {
  res.json({
    ok: true,
    ts: new Date().toISOString(),
    llm: {
      configured: Boolean(OPENROUTER_API_KEY),
      defaults: DEFAULT_MODELS,
      imageModel: getImageModel(),
    },
    tools: {
      firecrawl: Boolean(process.env.FIRECRAWL_API_KEY),
    },
  });
});

app.get('/api/bootstrap', (_req, res) => {
  res.json({
    departments: DEPARTMENTS,
    orchestrator: ORCHESTRATOR,
    scenarios: SCENARIOS,
    flowEdges: FLOW_EDGES,
    routingRules: ROUTING_RULES,
  });
});

app.get('/api/departments', (_req, res) => res.json(DEPARTMENTS));
app.get('/api/departments/:id', (req, res) => {
  const dept = DEPARTMENTS.find((d) => d.id === req.params.id);
  if (!dept) return res.status(404).json({ error: 'department_not_found' });
  res.json(dept);
});

app.get('/api/orchestrator', (_req, res) => res.json(ORCHESTRATOR));
app.get('/api/scenarios', (_req, res) => res.json(SCENARIOS));
app.get('/api/flow-edges', (_req, res) => res.json(FLOW_EDGES));
app.get('/api/routing-rules', (_req, res) => res.json(ROUTING_RULES));

app.post('/api/route', (req, res) => {
  const text = typeof req.body?.text === 'string' ? req.body.text : '';
  if (!text.trim()) return res.status(400).json({ error: 'text_required' });
  const route = routeTask(text);
  if (!route) return res.json({ matched: false });
  res.json({
    matched: true,
    dept: { id: route.dept.id, name: route.dept.name, accent: route.dept.accent },
    agent: {
      id: route.agent.id,
      name: route.agent.name,
      example: route.agent.example,
      okrHint: route.agent.okr?.[0]?.krs?.[0] || null,
      taskType: getTaskType(route.agent.id),
      model: resolveModel(route.agent.id),
    },
  });
});

function resolveAgent(agentId) {
  if (!agentId || agentId === 'orchestrator' || agentId === 'chief') {
    return {
      agent: ORCHESTRATOR.agents.find((a) => a.id === 'chief') || ORCHESTRATOR.agents[0],
      dept: null, isOrchestrator: true,
    };
  }
  for (const dept of DEPARTMENTS) {
    const agent = dept.agents.find((a) => a.id === agentId);
    if (agent) return { agent, dept, isOrchestrator: false };
  }
  const orchAgent = ORCHESTRATOR.agents.find((a) => a.id === agentId);
  if (orchAgent) return { agent: orchAgent, dept: null, isOrchestrator: true };
  return null;
}

async function runDelegate(args) {
  const targetId = typeof args?.agent_id === 'string' ? args.agent_id : '';
  const task = typeof args?.task === 'string' ? args.task : '';
  const context = typeof args?.context === 'string' ? args.context : '';
  if (!targetId) return { error: 'agent_id_required' };
  if (!task.trim()) return { error: 'task_required' };
  const sub = resolveAgent(targetId);
  if (!sub) return { error: 'agent_not_found', agent_id: targetId };
  if (sub.isOrchestrator) return { error: 'cannot_delegate_to_orchestrator' };

  const systemPrompt = buildAgentSystemPrompt(sub.agent, sub.dept, { toolsBlock: '' });
  const userPrompt = context ? `${task}\n\n— Контекст от оркестратора —\n${context}` : task;
  const model = resolveModel(sub.agent.id);

  const r = await fetch(OPENROUTER_URL, {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${OPENROUTER_API_KEY}`,
      'Content-Type': 'application/json',
      'HTTP-Referer': 'http://localhost',
      'X-Title': 'Multi-Agent Delegate',
    },
    body: JSON.stringify({
      model,
      messages: applyCacheControl([
        { role: 'system', content: systemPrompt },
        { role: 'user', content: userPrompt },
      ], model),
      temperature: getTaskType(sub.agent.id) === 'dev' ? 0.3 : 0.6,
    }),
  });
  const txt = await r.text();
  if (!r.ok) return { error: 'delegate_llm_error', status: r.status, body: txt.slice(0, 400), agent_id: targetId };
  let json;
  try { json = JSON.parse(txt); } catch { return { error: 'invalid_json', agent_id: targetId }; }
  const reply = json.choices?.[0]?.message?.content || '';
  return {
    agent_id: targetId,
    agent_name: sub.agent.name,
    dept_name: sub.dept?.name || null,
    model,
    reply,
  };
}

async function runChatTurn({ model, messages, taskType, tools, sendEvent }) {
  const body = {
    model,
    messages: applyCacheControl(messages, model),
    stream: true,
    temperature: taskType === 'dev' ? 0.3 : 0.6,
    usage: { include: true },
    provider: {
      order: ['Fireworks', 'Together', 'Novita', 'Hyperbolic'],
      allow_fallbacks: true,
      ignore: ['DeepSeek'],
    },
  };
  if (tools && tools.length) {
    body.tools = tools;
    body.tool_choice = 'auto';
  }

  const upstream = await fetch(OPENROUTER_URL, {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${OPENROUTER_API_KEY}`,
      'Content-Type': 'application/json',
      'HTTP-Referer': 'http://localhost',
      'X-Title': 'Multi-Agent Orchestrator',
    },
    body: JSON.stringify(body),
  });

  if (!upstream.ok || !upstream.body) {
    const errBody = await upstream.text().catch(() => '');
    return { error: { status: upstream.status, body: errBody.slice(0, 800) } };
  }

  const reader = upstream.body.getReader();
  const decoder = new TextDecoder('utf-8');
  let buffer = '';
  let content = '';
  const toolCalls = [];
  let finishReason = null;

  outer: while (true) {
    const { done, value } = await reader.read();
    if (done) break;
    buffer += decoder.decode(value, { stream: true });

    const lines = buffer.split('\n');
    buffer = lines.pop() || '';

    for (const line of lines) {
      const trimmed = line.trim();
      if (!trimmed || !trimmed.startsWith('data:')) continue;
      const payload = trimmed.slice(5).trim();
      if (payload === '[DONE]') break outer;
      let json;
      try { json = JSON.parse(payload); } catch { continue; }
      const choice = json.choices?.[0];
      if (!choice) continue;
      const delta = choice.delta || {};
      if (typeof delta.content === 'string' && delta.content.length) {
        content += delta.content;
        sendEvent('delta', { content: delta.content });
      }
      if (Array.isArray(delta.tool_calls)) {
        for (const tc of delta.tool_calls) {
          const idx = typeof tc.index === 'number' ? tc.index : toolCalls.length;
          if (!toolCalls[idx]) {
            toolCalls[idx] = { id: tc.id || '', type: 'function', function: { name: '', arguments: '' } };
          }
          const slot = toolCalls[idx];
          if (tc.id) slot.id = tc.id;
          if (tc.function?.name) slot.function.name = tc.function.name;
          if (typeof tc.function?.arguments === 'string') {
            slot.function.arguments += tc.function.arguments;
          }
        }
      }
      if (choice.finish_reason) finishReason = choice.finish_reason;
    }
  }

  return { content, toolCalls: toolCalls.filter(Boolean), finishReason };
}

app.post('/api/chat', async (req, res) => {
  if (!OPENROUTER_API_KEY) {
    return res.status(500).json({ error: 'OPENROUTER_API_KEY не задан в .env' });
  }

  const messages = Array.isArray(req.body?.messages) ? req.body.messages : null;
  const text = typeof req.body?.text === 'string' ? req.body.text : '';
  const modelOverride = typeof req.body?.model === 'string' ? req.body.model : null;

  if (!messages && !text.trim()) {
    return res.status(400).json({ error: 'text или messages обязательны' });
  }

  const agentId = 'chief';
  const resolved = resolveAgent(agentId);
  if (!resolved) return res.status(404).json({ error: 'agent_not_found' });

  const agentTools = getToolsForAgent(resolved.agent.id);
  const toolsBlock = agentTools ? TOOLS_PROMPT_BLOCK : '';

  const systemPrompt = resolved.isOrchestrator
    ? buildOrchestratorPrompt({ toolsBlock })
    : buildAgentSystemPrompt(resolved.agent, resolved.dept, { toolsBlock });

  const model = modelOverride || resolveModel(resolved.agent.id);
  const taskType = getTaskType(resolved.agent.id);

  const chatMessages = [{ role: 'system', content: systemPrompt }];
  if (messages) {
    for (const m of messages) {
      if (!m || typeof m.content !== 'string') continue;
      if (m.role === 'user' || m.role === 'assistant') {
        chatMessages.push({ role: m.role, content: m.content });
      }
    }
  } else {
    chatMessages.push({ role: 'user', content: text });
  }

  res.setHeader('Content-Type', 'text/event-stream; charset=utf-8');
  res.setHeader('Cache-Control', 'no-cache, no-transform');
  res.setHeader('Connection', 'keep-alive');
  res.setHeader('X-Accel-Buffering', 'no');
  res.flushHeaders?.();

  const sendEvent = (event, data) => {
    res.write(`event: ${event}\n`);
    res.write(`data: ${JSON.stringify(data)}\n\n`);
  };

  sendEvent('meta', {
    agent: { id: resolved.agent.id, name: resolved.agent.name },
    dept: resolved.dept ? { id: resolved.dept.id, name: resolved.dept.name, accent: resolved.dept.accent } : null,
    isOrchestrator: resolved.isOrchestrator,
    okrHint: resolved.agent.okr?.[0]?.krs?.[0] || null,
    model,
    taskType,
    toolsEnabled: Boolean(agentTools),
  });

  const MAX_TOOL_ITER = 5;
  try {
    for (let iter = 0; iter < MAX_TOOL_ITER + 1; iter++) {
      const turn = await runChatTurn({
        model,
        messages: chatMessages,
        taskType,
        tools: agentTools,
        sendEvent,
      });

      if (turn.error) {
        sendEvent('error', { ...turn.error, model });
        return res.end();
      }

      if (turn.finishReason === 'tool_calls' && turn.toolCalls.length) {
        if (iter >= MAX_TOOL_ITER) {
          sendEvent('error', { message: `tool-loop превысил лимит ${MAX_TOOL_ITER} итераций`, model });
          return res.end();
        }
        chatMessages.push({
          role: 'assistant',
          content: turn.content || '',
          tool_calls: turn.toolCalls.map((tc) => ({
            id: tc.id,
            type: 'function',
            function: { name: tc.function.name, arguments: tc.function.arguments || '{}' },
          })),
        });

        for (const tc of turn.toolCalls) {
          const name = tc.function.name;
          let args = {};
          try { args = tc.function.arguments ? JSON.parse(tc.function.arguments) : {}; } catch {}
          const meta = {};
          if (name === 'delegate') {
            const sub = resolveAgent(args.agent_id);
            meta.agentName = sub?.agent?.name || args.agent_id || 'агент';
            meta.deptName = sub?.dept?.name || null;
          }
          sendEvent('tool_call', { id: tc.id, name, args, meta });
          let result;
          let isError = false;
          try {
            if (name === 'delegate') {
              result = await runDelegate(args);
            } else {
              result = await executeTool(name, args);
            }
          } catch (err) {
            isError = true;
            result = { error: err?.message || String(err), code: err?.code || null };
            sendEvent('tool_error', { id: tc.id, name, message: result.error });
          }
          if (!isError) {
            const summary = name === 'firecrawl_search'
              ? { query: result.query, count: result.results?.length || 0 }
              : name === 'firecrawl_scrape'
                ? { url: result.url, title: result.title, chars: result.markdown?.length || 0 }
                : name === 'delegate'
                  ? { agent_id: args.agent_id, agentName: meta.agentName, chars: (result.reply || '').length, model: result.model }
                  : {};
            sendEvent('tool_result', { id: tc.id, name, summary });
          }
          chatMessages.push({
            role: 'tool',
            tool_call_id: tc.id,
            content: JSON.stringify(result),
          });
        }
        continue;
      }

      sendEvent('done', {});
      return res.end();
    }
  } catch (err) {
    sendEvent('error', { message: err?.message || String(err), model });
    res.end();
  }
});

app.post('/api/image', async (req, res) => {
  if (!OPENROUTER_API_KEY) return res.status(500).json({ error: 'OPENROUTER_API_KEY не задан в .env' });
  const prompt = typeof req.body?.prompt === 'string' ? req.body.prompt.trim() : '';
  if (!prompt) return res.status(400).json({ error: 'prompt обязателен' });
  const model = req.body?.model || getImageModel();
  try {
    const r = await fetch(OPENROUTER_URL, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${OPENROUTER_API_KEY}`,
        'Content-Type': 'application/json',
        'HTTP-Referer': 'http://localhost',
        'X-Title': 'Multi-Agent Orchestrator',
      },
      body: JSON.stringify({
        model,
        modalities: ['image', 'text'],
        messages: [{ role: 'user', content: prompt }],
      }),
    });
    const text = await r.text();
    if (!r.ok) return res.status(r.status).json({ error: 'openrouter_error', body: text.slice(0, 800), model });
    let json;
    try { json = JSON.parse(text); } catch { return res.status(502).json({ error: 'invalid_json', body: text.slice(0, 800) }); }
    const choice = json.choices?.[0]?.message;
    const images = (choice?.images || []).map((img) => img?.image_url?.url || img?.url).filter(Boolean);
    res.json({ model, prompt, images, raw_text: choice?.content || null });
  } catch (e) {
    res.status(500).json({ error: 'fetch_failed', message: e?.message || String(e) });
  }
});

app.post('/api/transcribe', (_req, res) => {
  res.status(501).json({
    error: 'not_implemented',
    reason: 'OpenRouter не предоставляет audio/transcription endpoints — поддерживается только chat/completions.',
    workaround: 'Голосовой ввод реализован браузерным Web Speech API (фронт). Для серверной транскрипции через Whisper нужен отдельный OpenAI API key или Groq Whisper key.',
  });
});

app.post('/api/embed', (_req, res) => {
  res.status(501).json({
    error: 'not_implemented',
    reason: 'OpenRouter не предоставляет endpoint /embeddings. Для семантического поиска по базе знаний нужен отдельный ключ OpenAI / Voyage / Cohere.',
    workaround: 'Можно подключить OpenAI embeddings (text-embedding-3-large) или локальную модель через sentence-transformers — обоё требует доп. инфраструктуры (vector DB + индексация Knowledge base/).',
  });
});

const TG_INBOX_DIR = path.resolve(__dirname, '..', 'Онлайн разведка', 'telegram-inbox');
try { require('fs').mkdirSync(TG_INBOX_DIR, { recursive: true }); } catch {}

app.post('/api/telegram/webhook', express.json({ limit: '1mb' }), (req, res) => {
  const expected = process.env.TELEGRAM_WEBHOOK_SECRET;
  if (expected) {
    const got = req.headers['x-telegram-bot-api-secret-token'];
    if (got !== expected) return res.status(401).json({ error: 'unauthorized' });
  }
  try {
    const fs = require('fs');
    const date = new Date().toISOString().slice(0, 10);
    const file = path.join(TG_INBOX_DIR, `${date}.jsonl`);
    const entry = { received_at: new Date().toISOString(), update: req.body };
    fs.appendFileSync(file, JSON.stringify(entry) + '\n', 'utf8');
    res.json({ ok: true });
  } catch (e) {
    console.error('[tg-webhook] write failed:', e.message);
    res.status(500).json({ error: 'write_failed', message: e.message });
  }
});

app.get('/api/telegram/inbox', (req, res) => {
  const expected = process.env.INBOX_READ_TOKEN;
  const got = (req.headers.authorization || '').replace(/^Bearer\s+/i, '');
  if (!expected || got !== expected) return res.status(401).json({ error: 'unauthorized' });
  try {
    const fs = require('fs');
    const since = req.query.since ? new Date(req.query.since).getTime() : 0;
    const limit = Math.min(Number(req.query.limit) || 100, 500);
    const files = fs.readdirSync(TG_INBOX_DIR).filter((f) => f.endsWith('.jsonl')).sort().slice(-3);
    const items = [];
    for (const f of files) {
      const lines = fs.readFileSync(path.join(TG_INBOX_DIR, f), 'utf8').split('\n').filter(Boolean);
      for (const line of lines) {
        try {
          const e = JSON.parse(line);
          if (new Date(e.received_at).getTime() > since) items.push(e);
        } catch {}
      }
    }
    res.json({ count: items.length, items: items.slice(-limit) });
  } catch (e) {
    res.status(500).json({ error: e.message });
  }
});

app.post('/api/intel-scout/run', async (req, res) => {
  if (!OPENROUTER_API_KEY) return res.status(500).json({ error: 'OPENROUTER_API_KEY не задан в .env' });
  const windowHours = Number(req.body?.windowHours) > 0 ? Number(req.body.windowHours) : 24;
  const dryLLM = Boolean(req.body?.dryLLM);
  const skipDelivery = Boolean(req.body?.skipDelivery);

  let pipeline, delivery;
  try {
    pipeline = require('./intel-scout/pipeline');
    delivery = require('./intel-scout/delivery');
  } catch (e) {
    return res.status(500).json({ error: 'intel_scout_module_load_failed', message: e.message });
  }

  try {
    const t0 = Date.now();
    const { digest, jsonPath, mdPath } = await pipeline.run({ windowHours, dryLLM });
    let delivered = null;
    if (!skipDelivery && !dryLLM) {
      delivered = await delivery.deliver(digest);
    }
    res.json({
      ok: true,
      duration_ms: Date.now() - t0,
      metrics: digest.metrics,
      proposals_count: digest.proposals?.length || 0,
      summary_md: digest.summary_md,
      archive: { json: jsonPath, md: mdPath },
      delivery: delivered,
    });
  } catch (e) {
    res.status(500).json({ error: 'intel_scout_failed', message: e?.message || String(e) });
  }
});

app.use(express.static(FRONTEND_DIR));
app.get('/', (_req, res) => res.sendFile(path.join(FRONTEND_DIR, 'index.html')));

app.listen(PORT, HOST, () => {
  console.log(`[multi-agent] API + UI listening on ${HOST}:${PORT}`);
  console.log(`[multi-agent] LLM key: ${OPENROUTER_API_KEY ? 'OK' : 'MISSING'}`);
  console.log(`[multi-agent] Defaults:`, DEFAULT_MODELS);
  console.log(`[multi-agent] Image model: ${getImageModel()}`);
});
