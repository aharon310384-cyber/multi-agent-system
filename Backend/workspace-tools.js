const fs = require('fs');
const path = require('path');

const WORKSPACE_DIR = path.resolve(__dirname, '..', 'workspace');
const MAX_FILE_BYTES = 256 * 1024;
const MAX_LIST_ENTRIES = 200;

if (!fs.existsSync(WORKSPACE_DIR)) {
  fs.mkdirSync(WORKSPACE_DIR, { recursive: true });
}

function sanitizeRelativePath(rel) {
  if (typeof rel !== 'string' || !rel.trim()) {
    return { error: 'path_required' };
  }
  const cleaned = rel.replace(/\\/g, '/').replace(/^\/+/, '').trim();
  if (!cleaned) return { error: 'path_empty' };
  if (cleaned.length > 200) return { error: 'path_too_long' };
  if (/(^|\/)\.\.(\/|$)/.test(cleaned)) return { error: 'path_traversal_forbidden' };
  if (/[\x00-\x1f]/.test(cleaned)) return { error: 'control_chars_forbidden' };

  const abs = path.resolve(WORKSPACE_DIR, cleaned);
  const root = WORKSPACE_DIR + path.sep;
  if (abs !== WORKSPACE_DIR && !abs.startsWith(root)) {
    return { error: 'outside_workspace' };
  }
  return { abs, rel: cleaned };
}

function publicUrl(relPath, baseUrl) {
  const safe = relPath.split('/').map(encodeURIComponent).join('/');
  const rel = `/workspace/${safe}`;
  if (typeof baseUrl === 'string' && baseUrl) {
    return `${baseUrl.replace(/\/+$/, '')}${rel}`;
  }
  return rel;
}

async function saveFile(args, ctx) {
  const s = sanitizeRelativePath(args?.path);
  if (s.error) return { error: s.error };
  const content = typeof args?.content === 'string' ? args.content : '';
  const bytes = Buffer.byteLength(content, 'utf8');
  if (bytes > MAX_FILE_BYTES) {
    return { error: 'file_too_large', max_bytes: MAX_FILE_BYTES, got_bytes: bytes };
  }
  fs.mkdirSync(path.dirname(s.abs), { recursive: true });
  fs.writeFileSync(s.abs, content, 'utf8');
  return {
    ok: true,
    path: s.rel,
    bytes,
    url: publicUrl(s.rel, ctx?.baseUrl),
  };
}

async function readFile(args, ctx) {
  const s = sanitizeRelativePath(args?.path);
  if (s.error) return { error: s.error };
  if (!fs.existsSync(s.abs)) return { error: 'not_found', path: s.rel };
  const stat = fs.statSync(s.abs);
  if (stat.isDirectory()) return { error: 'is_directory', path: s.rel };
  if (stat.size > MAX_FILE_BYTES) {
    return { error: 'file_too_large_to_read', max_bytes: MAX_FILE_BYTES, bytes: stat.size };
  }
  return {
    ok: true,
    path: s.rel,
    bytes: stat.size,
    content: fs.readFileSync(s.abs, 'utf8'),
    url: publicUrl(s.rel, ctx?.baseUrl),
  };
}

async function listFiles(args, ctx) {
  const sub = typeof args?.path === 'string' && args.path.trim() ? args.path : '';
  let baseAbs = WORKSPACE_DIR;
  let baseRel = '';
  if (sub) {
    const s = sanitizeRelativePath(sub);
    if (s.error) return { error: s.error };
    baseAbs = s.abs;
    baseRel = s.rel;
  }
  if (!fs.existsSync(baseAbs)) return { ok: true, path: baseRel, entries: [] };
  const entries = [];
  const stack = [{ abs: baseAbs, rel: baseRel }];
  while (stack.length && entries.length < MAX_LIST_ENTRIES) {
    const cur = stack.pop();
    const items = fs.readdirSync(cur.abs, { withFileTypes: true });
    for (const it of items) {
      if (entries.length >= MAX_LIST_ENTRIES) break;
      const childRel = cur.rel ? `${cur.rel}/${it.name}` : it.name;
      const childAbs = path.join(cur.abs, it.name);
      if (it.isDirectory()) {
        entries.push({ type: 'dir', path: childRel });
        stack.push({ abs: childAbs, rel: childRel });
      } else if (it.isFile()) {
        const stat = fs.statSync(childAbs);
        entries.push({
          type: 'file',
          path: childRel,
          bytes: stat.size,
          url: publicUrl(childRel, ctx?.baseUrl),
        });
      }
    }
  }
  return { ok: true, path: baseRel, entries, truncated: entries.length >= MAX_LIST_ENTRIES };
}

const WORKSPACE_TOOLS = [
  {
    type: 'function',
    function: {
      name: 'save_file',
      description: 'Сохранить артефакт (HTML, MD, JSON, TXT, CSS, JS) в общую файловую память (workspace). Это единственный способ сделать файл, который пользователь сможет скачать или открыть в браузере. Используй для готовых артефактов: HTML-страница, КП, ТЗ, отчёт, конфиг. Возвращает публичный URL.',
      parameters: {
        type: 'object',
        properties: {
          path: {
            type: 'string',
            description: 'Относительный путь внутри workspace, например "hello.html" или "kp/client-X/index.html". Подпапки создаются автоматически. Запрещены абсолютные пути и "..".',
          },
          content: {
            type: 'string',
            description: 'Содержимое файла. UTF-8 текст, до 256 KB.',
          },
        },
        required: ['path', 'content'],
      },
    },
  },
  {
    type: 'function',
    function: {
      name: 'read_file',
      description: 'Прочитать существующий файл из workspace (для использования наработок предыдущих агентов). Возвращает content и URL.',
      parameters: {
        type: 'object',
        properties: {
          path: {
            type: 'string',
            description: 'Относительный путь файла в workspace.',
          },
        },
        required: ['path'],
      },
    },
  },
  {
    type: 'function',
    function: {
      name: 'list_files',
      description: 'Показать содержимое workspace (рекурсивно). Используй, чтобы узнать какие артефакты уже сохранены.',
      parameters: {
        type: 'object',
        properties: {
          path: {
            type: 'string',
            description: 'Опционально: подпапка. Пусто — корень workspace.',
          },
        },
      },
    },
  },
];

async function executeWorkspaceTool(name, args, ctx) {
  if (name === 'save_file') return saveFile(args || {}, ctx);
  if (name === 'read_file') return readFile(args || {}, ctx);
  if (name === 'list_files') return listFiles(args || {}, ctx);
  return null;
}

function isWorkspaceTool(name) {
  return name === 'save_file' || name === 'read_file' || name === 'list_files';
}

const WORKSPACE_TOOLS_PROMPT_BLOCK = [
  'Файловая память (workspace):',
  '— save_file(path, content): сохранить артефакт (HTML/MD/JSON/CSS/JS/TXT). ВСЕГДА вызывай этот tool, когда пользователь просит создать файл или генерируешь готовый артефакт — без save_file файл нигде не сохранится, пользователь получит только текст в чате. Возвращает url вида /workspace/<path>, дай его пользователю как ссылку для скачивания/просмотра.',
  '— read_file(path): прочитать ранее сохранённый файл (наработки предыдущих агентов).',
  '— list_files(path?): показать содержимое workspace.',
  'Имена файлов — короткие осмысленные kebab-case или snake_case. Структурируй по папкам, если артефактов несколько (kp/clientX/index.html, reports/2026-Q3-pnl.md).',
].join('\n');

module.exports = {
  WORKSPACE_DIR,
  WORKSPACE_TOOLS,
  WORKSPACE_TOOLS_PROMPT_BLOCK,
  executeWorkspaceTool,
  isWorkspaceTool,
};
