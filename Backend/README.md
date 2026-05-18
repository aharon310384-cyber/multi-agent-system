# Backend — API для карты оркестрации

Node.js + Express. Отдаёт данные многоагентной системы и обслуживает статику фронтенда.

## Запуск

```bash
npm install
npm start                  # node server.js
# или
npm run dev                # node --watch server.js
```

По умолчанию `http://localhost:3000`. Переопределение: `PORT=3001 npm start` (Linux/Mac) или `$env:PORT=3001; npm start` (PowerShell).

## Эндпойнты

| Метод | Путь                       | Описание                                                 |
|-------|----------------------------|----------------------------------------------------------|
| GET   | `/api/health`              | `{ ok: true, ts }`                                       |
| GET   | `/api/bootstrap`           | Всё разом: departments, orchestrator, scenarios, edges, rules |
| GET   | `/api/departments`         | Список департаментов с агентами и OKR                    |
| GET   | `/api/departments/:id`     | Один департамент                                         |
| GET   | `/api/orchestrator`        | Оркестратор и его агенты (с OKR)                         |
| GET   | `/api/scenarios`           | Сценарии и таймлайны                                     |
| GET   | `/api/flow-edges`          | Связи между департаментами для графа                     |
| GET   | `/api/routing-rules`       | Правила маршрутизации задач (для отладки)                |
| POST  | `/api/route`               | `{ text }` → `{ matched, dept, agent }` с подсказкой OKR |
| GET   | `/`                        | Отдаёт `../Frontend/index.html` + статику                |

## Источники данных

`data.js` — всё в памяти, без БД. OKR мёрджатся в `agent.okr` до старта сервера.

## Секреты

`server.js` подгружает `../.env` (в нём лежит `OPENROUTER_API_KEY`).
