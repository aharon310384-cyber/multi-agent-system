# Frontend — Карта оркестрации многоагентной системы

Статичный React SPA (React 18 + Babel-standalone, без сборки) в одном файле `index.html`.

## Источник данных

При загрузке выполняется `GET /api/bootstrap` к [Backend](../Backend/). Возвращённые `departments`, `orchestrator`, `scenarios`, `flowEdges`, `routingRules` перезаписывают локальные let-биндинги до монтирования React.

Если бэкенд недоступен — отрабатывает фолбэк на встроенные данные (страница остаётся работоспособной).

## Запуск

Откройте `index.html` прямо или через Backend:

```bash
cd ../Backend
npm start
# открыть http://localhost:3000
```

## Чат-маршрутизатор

Виджет в правом нижнем углу. Опишите задачу — попадёт к нужному агенту через `POST /api/route` (если бэк жив) либо через локальные ROUTING_RULES.
