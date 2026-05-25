const OPENROUTER_URL = 'https://openrouter.ai/api/v1/chat/completions';

async function chat({ model, messages, temperature = 0.3, tools, toolChoice, maxTokens, cacheSystem = false }) {
  const apiKey = process.env.OPENROUTER_API_KEY;
  if (!apiKey) {
    const err = new Error('OPENROUTER_API_KEY не задан в .env');
    err.code = 'missing_key';
    throw err;
  }

  let finalMessages = messages;
  if (cacheSystem && model.startsWith('anthropic/')) {
    finalMessages = messages.map((m) => {
      if (m.role === 'system' && typeof m.content === 'string') {
        return {
          role: 'system',
          content: [{ type: 'text', text: m.content, cache_control: { type: 'ephemeral' } }],
        };
      }
      return m;
    });
  }

  const body = {
    model,
    messages: finalMessages,
    temperature,
    usage: { include: true },
    provider: { allow_fallbacks: true },
  };
  if (maxTokens) body.max_tokens = maxTokens;
  if (tools && tools.length) {
    body.tools = tools;
    body.tool_choice = toolChoice || 'auto';
  }

  const r = await fetch(OPENROUTER_URL, {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${apiKey}`,
      'Content-Type': 'application/json',
      'HTTP-Referer': 'http://localhost',
      'X-Title': 'Intel-Scout',
    },
    body: JSON.stringify(body),
  });
  const text = await r.text();
  if (!r.ok) {
    const err = new Error(`OpenRouter HTTP ${r.status}: ${text.slice(0, 400)}`);
    err.status = r.status;
    throw err;
  }
  let parsed;
  try { parsed = JSON.parse(text); } catch { throw new Error('OpenRouter: invalid JSON response'); }

  const msg = parsed.choices?.[0]?.message || {};
  const toolCalls = Array.isArray(msg.tool_calls) ? msg.tool_calls : [];
  let toolArgs = null;
  if (toolCalls.length && toolCalls[0].function?.arguments) {
    try { toolArgs = JSON.parse(toolCalls[0].function.arguments); }
    catch { toolArgs = { _parse_error: toolCalls[0].function.arguments }; }
  }

  return {
    content: msg.content || '',
    toolCalls,
    toolArgs,
    usage: parsed.usage || null,
    model: parsed.model || model,
  };
}

module.exports = { chat };
