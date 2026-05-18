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
| Runtime / Среда    | **Node.js 20** (или 18+)            |
| Корневая директория| `/` (корень репо)                   |
| Команда сборки     | `npm ci` (или `npm install`)        |
| Команда запуска    | `npm start`                         |
| Порт               | **`3000`** (или из `PORT`)          |
| Healthcheck path   | `/api/health`                       |

Корневой `package.json` уже настроен: `start` запускает `node Backend/server.js`, сервер слушает `HOST=0.0.0.0` и `PORT` из env.

## 3. Переменные окружения

В разделе **Variables / Переменные** добавь:

| Имя                              | Значение                            | Обязательно |
|----------------------------------|-------------------------------------|-------------|
| `OPENROUTER_API_KEY`             | ключ с <https://openrouter.ai/keys> | **Да**      |
| `OPENROUTER_MODEL_DEFAULT`       | `openai/gpt-5.5`                    | Нет         |
| `OPENROUTER_MODEL_DEV`           | `anthropic/claude-opus-4.7`         | Нет         |
| `OPENROUTER_MODEL_MARKETING`     | `google/gemini-2.5-flash`           | Нет         |
| `OPENROUTER_MODEL_ORCHESTRATION` | `minimax/minimax-m2`                | Нет         |
| `OPENROUTER_MODEL_IMAGE`         | `google/gemini-2.5-flash-image-preview` | Нет     |
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

## 6. Авто-деплой при push

Включи **Auto deploy on push** в настройках приложения — каждый коммит в `main` будет автоматически собираться и катиться в прод.

---

## Альтернативы, если Apps не подойдёт

- **Cloud Server (VPS)** — если нужны крон-таски, доступ к ФС, кастомный системный софт. Тогда: установить Node 20, склонировать репо, `npm ci`, поставить `pm2 start npm -- start`, поднять nginx + certbot.
- **Vercel** — уже привязан (`.vercel/project.json`), но затачивается под Next.js/SSR; для текущего Express-сервера потребуются `vercel.json` с `builds`/`routes`. Можно оставить Vercel под фронтенд, если позже разделим.
