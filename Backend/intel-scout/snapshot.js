const fs = require('fs');
const path = require('path');
const os = require('os');

function safeJson(p) {
  try { return JSON.parse(fs.readFileSync(p, 'utf8')); } catch { return null; }
}

function takeSnapshot() {
  const home = os.homedir();
  const claudeJson = safeJson(path.join(home, '.claude.json'));
  const mcpServers = claudeJson?.mcpServers ? Object.keys(claudeJson.mcpServers) : [];

  const installedPlugins = safeJson(path.join(home, '.claude', 'plugins', 'installed_plugins.json'));
  const plugins = installedPlugins ? Object.keys(installedPlugins) : [];

  const projectPkg = safeJson(path.resolve(__dirname, '..', '..', 'package.json'));
  const backendPkg = safeJson(path.resolve(__dirname, '..', 'package.json'));
  const deps = {
    ...(projectPkg?.dependencies || {}),
    ...(backendPkg?.dependencies || {}),
  };

  const router = (() => {
    try { return require('../model-router').DEFAULT_MODELS; } catch { return null; }
  })();

  return {
    ts: new Date().toISOString(),
    mcp_servers: mcpServers,
    plugins,
    npm_deps: Object.keys(deps),
    models_in_use: router,
    env_keys_present: {
      OPENROUTER_API_KEY: Boolean(process.env.OPENROUTER_API_KEY),
      FIRECRAWL_API_KEY: Boolean(process.env.FIRECRAWL_API_KEY),
      BRAVE_API_KEY: Boolean(process.env.BRAVE_API_KEY),
      GITHUB_TOKEN: Boolean(process.env.GITHUB_TOKEN),
    },
  };
}

function isAlreadyInStack(candidate, snapshot) {
  const text = ` ${(candidate.title || '').toLowerCase()} ${(candidate.url || '').toLowerCase()} `;
  const haystack = [
    ...snapshot.mcp_servers.map((s) => s.toLowerCase()),
    ...snapshot.plugins.map((s) => s.toLowerCase()),
    ...snapshot.npm_deps.map((s) => s.toLowerCase()),
  ].filter((s) => s && s.length >= 5);
  for (const h of haystack) {
    const re = new RegExp(`(^|[^a-z0-9])${h.replace(/[-/\\^$*+?.()|[\]{}]/g, '\\$&')}([^a-z0-9]|$)`, 'i');
    if (re.test(text)) return h;
  }
  return null;
}

module.exports = { takeSnapshot, isAlreadyInStack };
