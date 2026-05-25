# Деплой на Timeweb Cloud Apps

Минимальный путь для развёртывания репозитория [`aharon310384-cyber/multi-agent-system`](https://github.com/aharon310384-cyber/multi-agent-system) на Timeweb Cloud → **Apps (PaaS)**.

## 1. Создать приложение в Timeweb Cloud

1. Открой проект: <https://timeweb.cloud/my/projects/54703>
2. **Создать → Приложение (Cloud Apps)**.
3. Тип: **Backend** (Node.js — сервер раздаёт и API, и статику).
4. **Источник кода → GitHub**. При первом разе авторизуй приложение Timeweb в GitHub под аккаунтом `aharon310384-cyber`.
5. Выбери репозиторий **`multi-agent-system`**, ветка **`main`**.

## 2. Параметры сборки и запуска

| Поле               | Значение                            |
|--------------------|-------------------------------------|
| Runtime / Среда    | **Node.js 20** (зафиксировано в `.nvmrc`) |
| Корневая директория| `/` (корень репо)                   |
| Команда сборки     | `npm ci` (или `npm install`)        |
| Команда запуска    | `npm start`                         |
| Порт               | **`3000`** (или из `PORT`)          |
| Healthcheck path   | `/api/health`                       |

Корневой `package.json` уже настроен: `start` запускает `node Backend/server.js`, сервер слушает `HOST=0.0.0.0` и `PORT` из env. Версия Node фиксируется файлом `.nvmrc` в корне — Timeweb сам подберёт совместимый рантайм.

## 3. Переменные окружения

В разделе **Variables / Переменные** добавь:

| Имя                              | Значение                            | Обязательно |
|----------------------------------|-------------------------------------|-------------|
| `OPENROUTER_API_KEY`             | ключ с <https://openrouter.ai/keys> | **Да**      |
| `OPENROUTER_MODEL_DEFAULT`       | `deepseek/deepseek-chat`            | Нет         |
| `OPENROUTER_MODEL_DEV`           | `anthropic/claude-opus-4.7`         | Нет         |
| `OPENROUTER_MODEL_MARKETING`     | `google/gemini-2.5-flash`           | Нет         |
| `OPENROUTER_MODEL_ORCHESTRATION` | `minimax/minimax-m2`                | Нет         |
| `OPENROUTER_MODEL_IMAGE`         | `google/gemini-2.5-flash-image-preview` | Нет     |
| `FIRECRAWL_API_KEY`              | ключ с <https://www.firecrawl.dev/app/api-keys> | Нет (без него агенты chief/маркетинг/ОСИНТ работают без веб-доступа) |
| `BRAVE_API_KEY`                  | ключ с <https://api-dashboard.search.brave.com/register> | Нет (без него отключаются tools `brave_search`/`brave_news`; ~1K запросов/мес бесплатно на Free-плане) |
| `TELEGRAM_BOT_TOKEN`             | токен Telegram-бота (получить у @BotFather) | Нет (без него `/api/intel-scout/run` пропускает доставку — дайджест возвращается только в HTTP-ответе и в `Онлайн разведка/архив/`) |
| `TELEGRAM_CHAT_ID`               | `7910484608` (chat_id оператора) | Нет (вместе с `TELEGRAM_BOT_TOKEN` включает delivery через оркестратора → Telegram) |
| `OPENROUTER_MODEL_INTEL_SCOUT`   | override модели для анализа в digest.js (по умолчанию `anthropic/claude-sonnet-4.5`) | Нет |
| `OPENROUTER_MODEL_FILTER`        | override модели для фильтра шума в noise-filter.js (по умолчанию `google/gemini-2.5-flash`) | Нет |
| `VT_API_KEY`                     | ключ с <https://www.virustotal.com/gui/my-apikey> (бесплатный, 500 req/day) | Нет (без него `mcp__osint-mcp-server__vt_domain` отключён — security-check новых RSS-источников будет только через whois+dns) |
| `PORT`                           | `3000` (если Timeweb не пробрасывает свой) | Зависит от платформы |

Дефолты моделей зашиты в `Backend/model-router.js` — если не задавать override, он подставит их сам.

## 4. Домен и SSL

После первого деплоя Timeweb выдаст временный домен вида `*.twc1.net`. Для прода:
1. В разделе **Домены** добавь свой домен → создай CNAME-запись.
2. SSL выпускается автоматически (Let's Encrypt).

## 5. Проверка после деплоя

- `https://<your-app>.twc1.net/api/health` → `{ "ok": true, "llm": { "configured": true, ... } }`
- `https://<your-app>.twc1.net/` → чат-оркестратор (index.html)
- `https://<your-app>.twc1.net/map.html` → карта оркестрации

## 5.1 Cron для intel-scout (ежедневный AI-дайджест)

### Windows (локально на машине оператора)

Однократно зарегистрировать задачу в Task Scheduler:

```powershell
powershell -NoProfile -ExecutionPolicy Bypass -File "C:\Projects\Многоагентная система\scripts\register-task-scheduler.ps1"
```

Это создаст задачу `IntelScoutDaily`, которая каждый день в **09:00** запускает `scripts/intel-scout-daily.ps1` → `node Backend/intel-scout/cli.js --deliver` → дайджест → оркестратор → Telegram оператору.

Полезные команды:
- Запустить вручную: `Start-ScheduledTask -TaskName IntelScoutDaily`
- Статус: `Get-ScheduledTask -TaskName IntelScoutDaily | Get-ScheduledTaskInfo`
- Удалить: `schtasks /Delete /TN IntelScoutDaily /F`

Логи каждого прогона: `Онлайн разведка/архив/cron-YYYY-MM-DD_HHMMSS.log` (+ `.err`).

### Timeweb Cloud Apps (Linux)

Если Apps не даёт нативный cron — самый простой вариант поднять отдельный **Cloud Server (VPS)** для cron или использовать внешний планировщик (cron-job.org, EasyCron) с веб-хуком на `https://<your-app>.twc1.net/api/intel-scout/run`.

Вариант через crontab на VPS:
```bash
0 9 * * * /usr/bin/env bash /opt/multi-agent-system/scripts/intel-scout-daily.sh
```

## 6. Авто-деплой при push

В настройках приложения → раздел **Деплой / Auto deploy**:
1. Источник: тот же `aharon310384-cyber/multi-agent-system`, ветка `main`.
2. Включи **«Автоматический деплой при push»** (Auto-deploy on push).
3. Timeweb создаст GitHub webhook автоматически — никаких `.github/workflows/*.yml` в репо не требуется.

После этого любой `git push origin main` запускает сборку → новый коммит выкатывается в прод без ручных шагов.

> Если позже понадобится **CI-проверка перед деплоем** (lint/тесты до push в прод) — добавим отдельный `.github/workflows/ci.yml`, который блокирует мерж при ошибках. Сейчас тестов нет, поэтому workflow не заводим.

---

## Альтернативы, если Apps не подойдёт

- **Cloud Server (VPS)** — если нужны крон-таски, доступ к ФС, кастомный системный софт. Тогда: установить Node 20, склонировать репо, `npm ci`, поставить `pm2 start npm -- start`, поднять nginx + certbot.
- **Vercel** — уже привязан (`.vercel/project.json`), но затачивается под Next.js/SSR; для текущего Express-сервера потребуются `vercel.json` с `builds`/`routes`. Можно оставить Vercel под фронтенд, если позже разделим.
