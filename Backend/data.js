const DEPARTMENTS = [
  {
    id: 'marketing', name: 'Маркетинг', accent: '#F6C85F', short: 'МКТ',
    output: 'Кампании', workload: 0.78, activeTasks: 5,
    agents: [
      { id: 'strategist', name: 'Маркетолог-стратег', skills: ['Стратегия и оффер', 'ICP, JTBD, воронки'], inputs: ['Бизнес-цель', 'Ограничения'], outputs: ['Стратегия', 'KPI'], tools: ['Perplexity', 'Miro', 'GA4'], example: 'Описать ICP и спроектировать воронку под B2B SaaS на квартал.' },
      { id: 'targetolog', name: 'Таргетолог', skills: ['Платная реклама', 'A/B креативов'], inputs: ['ICP', 'Бюджет', 'Креативы'], outputs: ['Кампании', 'Ad sets'], tools: ['Meta Ads', 'Google Ads', 'AdCreative.ai'], example: 'Запустить тест на 3 гипотезы аудиторий за 7 дней с CPL ≤ 1500₽.' },
      { id: 'seo', name: 'SEO-специалист', skills: ['Семантика', 'Технический SEO'], inputs: ['Продукт', 'Регионы'], outputs: ['Контент-план', 'ТЗ на тексты'], tools: ['Ahrefs', 'Surfer SEO', 'Search Console'], example: 'Собрать 200 ключей и кластеризовать под пиллар-страницу.' },
      { id: 'smm', name: 'SMM-щик', skills: ['Контент-план', 'Автопостинг'], inputs: ['Стратегия', 'Тексты', 'Визуал'], outputs: ['Календарь', 'Публикации'], tools: ['Buffer', 'Canva', 'CapCut'], example: 'Сделать 14-дневный контент-план под Telegram и Instagram.' },
      { id: 'analyst', name: 'Аналитик', skills: ['Дашборды', 'Unit-экономика'], inputs: ['Данные', 'Воронки'], outputs: ['Отчёт', 'Дашборд'], tools: ['Looker Studio', 'Metabase', 'Mixpanel'], example: 'Построить дашборд по сквозной аналитике маркетинга за месяц.' },
      { id: 'pr', name: 'PR / Brand-менеджер', skills: ['Медиа-присутствие', 'Репутация и кризисы', 'Founder в медиа'], inputs: ['Инфоповоды', 'Tone of voice'], outputs: ['Публикации в СМИ', 'Питчи журналистам'], tools: ['Pressfeed', 'Mediatoolkit', 'Notion'], example: 'Разместить кейс клиента в Forbes / VC.ru через 2 недели с измеримыми KPI охвата.' },
      { id: 'email-marketer', name: 'Email / CRM-маркетолог', skills: ['Welcome-цепочки', 'Lifecycle и сегментация', 'Ретеншн-рассылки'], inputs: ['База контактов', 'Сегменты', 'Контент'], outputs: ['Триггерные цепочки', 'Метрики open/click'], tools: ['UniSender', 'Customer.io', 'HubSpot'], example: 'Запустить onboarding-цепочку из 5 писем с open ≥ 42% и click ≥ 6%.' },
    ],
  },
  {
    id: 'design', name: 'Дизайн', accent: '#C8A2FF', short: 'ДЗН',
    output: 'Макеты', workload: 0.66, activeTasks: 4,
    agents: [
      { id: 'designer', name: 'Дизайнер', skills: ['Лендинги, КП, презентации', 'Деплой на Vercel'], inputs: ['Бриф', 'Тексты'], outputs: ['Дизайн', 'Деплой'], tools: ['Stitch', 'Figma', 'Next.js', 'Tailwind'], example: 'Сделать лендинг под КП на 8 секций с деплоем на Vercel.' },
      { id: 'motion', name: 'Motion / Video', skills: ['Reels и YouTube-видео', 'Ad-creatives и моушен', 'Motion-приветствия'], inputs: ['Сценарий', 'Голос/музыка', 'Бренд-стиль'], outputs: ['Видео', 'Анимация'], tools: ['CapCut', 'After Effects', 'Runway', 'ElevenLabs'], example: 'Смонтировать 6 Reels под рекламную кампанию за 3 дня по бренд-стилю.' },
    ],
  },
  {
    id: 'sales', name: 'Продажи', accent: '#FF9E7A', short: 'ПРД',
    output: 'Сделки', workload: 0.62, activeTasks: 3,
    agents: [
      { id: 'sales', name: 'Sales-менеджер', skills: ['Квалификация', 'Переговоры'], inputs: ['Лиды', 'КП'], outputs: ['Сделки', 'Договоры'], tools: ['AmoCRM', 'Bitrix24', 'DocuSign'], example: 'Закрыть сделку на 500к₽ с лидом из таргетированной рекламы.' },
      { id: 'account', name: 'Аккаунт-менеджер', skills: ['Удержание', 'Апсейл'], inputs: ['Активные клиенты'], outputs: ['Отчёты', 'Апсейл-сделки'], tools: ['HubSpot', 'Notion', 'Slack'], example: 'Провести QBR с клиентом и предложить апсейл на новый канал.' },
    ],
  },
  {
    id: 'it', name: 'ИТ-департамент', accent: '#7AB8FF', short: 'ИТ',
    output: 'Продакшн', workload: 0.71, activeTasks: 6,
    agents: [
      { id: 'techlead', name: 'Tech Lead', skills: ['Архитектура', 'ADR и ревью'], inputs: ['Требования'], outputs: ['Архитектура', 'Стандарты'], tools: ['Excalidraw', 'C4', 'GitHub'], example: 'Принять решение между монолитом и микросервисами для нового SaaS.' },
      { id: 'backend', name: 'Backend', skills: ['API', 'Базы данных'], inputs: ['Контракты'], outputs: ['API', 'Сервисы'], tools: ['Node.js', 'PostgreSQL', 'Redis'], example: 'Реализовать API для онбординга с авторизацией и платежами.' },
      { id: 'frontend', name: 'Frontend', skills: ['SPA, дашборды', 'Server Components'], inputs: ['Дизайн', 'API'], outputs: ['UI', 'Сборка'], tools: ['Next.js', 'TanStack Query', 'shadcn/ui'], example: 'Сделать дашборд клиента с фильтрами и real-time обновлениями.' },
      { id: 'mobile', name: 'Mobile', skills: ['iOS / Android', 'Push, deep links'], inputs: ['Дизайн', 'API'], outputs: ['Сборка', 'Релиз в сторы'], tools: ['React Native', 'Expo', 'Fastlane'], example: 'Опубликовать приложение в App Store и Google Play в одной волне.' },
      { id: 'devops', name: 'DevOps', skills: ['CI/CD', 'Инфраструктура'], inputs: ['Код', 'Конфиги'], outputs: ['Деплой', 'Метрики'], tools: ['Docker', 'Terraform', 'Grafana'], example: 'Поднять GitHub Actions с превью-стейджем на каждый PR.' },
      { id: 'qa', name: 'QA-инженер', skills: ['Тест-планы', 'E2E'], inputs: ['Сборка'], outputs: ['Отчёт', 'Авто-тесты'], tools: ['Playwright', 'k6', 'Allure'], example: 'Прогнать регресс из 80 кейсов и зафиксировать критичные баги.' },
      { id: 'aiml', name: 'AI / ML', skills: ['LLM, RAG', 'Мульти-агенты'], inputs: ['Задача', 'Данные'], outputs: ['AI-фича', 'Промпты'], tools: ['Claude API', 'Qdrant', 'LangGraph'], example: 'Внедрить RAG над базой знаний с цитатами для саппорта.' },
      { id: 'data', name: 'Data Engineer', skills: ['ETL', 'DWH и BI'], inputs: ['Источники'], outputs: ['Дата-марты', 'Дашборды'], tools: ['dbt', 'BigQuery', 'Airbyte'], example: 'Подключить 4 источника в DWH через Airbyte и описать модели в dbt.' },
      { id: 'security', name: 'Security', skills: ['OWASP', 'SAST / DAST'], inputs: ['Код', 'Инфра'], outputs: ['Отчёт уязвимостей'], tools: ['Semgrep', 'Trivy', 'Vault'], example: 'Провести SAST + SCA сканирование и закрыть critical-уязвимости.' },
    ],
  },
  {
    id: 'management', name: 'Управление', accent: '#A8F0D2', short: 'УПР',
    output: 'План и риски', workload: 0.48, activeTasks: 3,
    agents: [
      { id: 'pm', name: 'Project Manager', skills: ['Планы и сроки', 'Риски и блокеры'], inputs: ['Бриф', 'Команда'], outputs: ['Roadmap', 'Статусы'], tools: ['Linear', 'Notion', 'Asana'], example: 'Скоординировать запуск лендинга через 3 команды за 2 недели.' },
      { id: 'ba', name: 'Бизнес-аналитик', skills: ['Требования', 'BPMN, User Stories'], inputs: ['Стейкхолдеры'], outputs: ['ТЗ', 'User Stories'], tools: ['Miro', 'Confluence', 'Lucidchart'], example: 'Превратить «нам нужен сайт» в ТЗ с измеримыми требованиями.' },
      { id: 'osint', name: 'ОСИНТ', skills: ['Конкурентная разведка', 'Бенчмарки и OKR'], inputs: ['Запрос на исследование'], outputs: ['Отчёт', 'OKR агентам'], tools: ['WebSearch', 'osint-mcp-server', 'Wayback'], example: 'Найти индустриальные бенчмарки и проставить OKR всем 20 агентам на квартал.' },
    ],
  },
  {
    id: 'copywriting', name: 'Копирайтинг', accent: '#66F2A6', short: 'КП',
    output: 'Тексты', workload: 0.55, activeTasks: 4,
    agents: [
      { id: 'copywriter', name: 'Копирайтер', skills: ['КП, лендинги, ТЗ', 'Посты, креативы, рассылки'], inputs: ['Бриф', 'ЦА', 'Оффер'], outputs: ['Тексты', 'Структуры'], tools: ['Claude', 'Perplexity', 'LanguageTool'], example: 'Написать структуру КП под digital-агентство для B2B-клиента.' },
    ],
  },
  {
    id: 'security', name: 'Безопасность', accent: '#FF5C7A', short: 'БЗП',
    output: 'Контроль рисков', workload: 0.4, activeTasks: 1,
    agents: [
      { id: 'security-officer', name: 'Агент безопасности', skills: ['Секреты и доступы', 'Прод-действия', 'Аудит и угрозы', 'OWASP-проверки кода'], inputs: ['Код', 'Конфиги', 'Запрос доступа'], outputs: ['Вердикт', 'Отчёт уязвимостей'], tools: ['osint-mcp-server', 'Semgrep', 'Trivy', 'Vault'], example: 'Проверить PR на утечку секретов и наличие OWASP-категорий до мерджа в main.' },
    ],
  },
  {
    id: 'intel', name: 'Онлайн разведка', accent: '#4DE3FF', short: 'РЗВ',
    output: 'AI-дайджест', workload: 0.6, activeTasks: 2,
    agents: [
      { id: 'intel-scout', name: 'Intel-Scout', skills: ['Daily-мониторинг AI-стека', 'Фильтрация сигнал/шум', 'Дайджест с приоритизацией'], inputs: ['RSS, GitHub, Brave News, ArXiv'], outputs: ['Дайджест', 'Proposals в backlog'], tools: ['Brave Search', 'Firecrawl', 'OpenRouter', 'rss-reader'], example: 'Каждое утро присылать дайджест 3-5 находок по Claude Code, MCP, vibe-coding с приоритетами 🔴/🟡/🟢.' },
    ],
  },
  {
    id: 'hr', name: 'HR / Люди', accent: '#FFB87A', short: 'HR',
    output: 'Команда', workload: 0.45, activeTasks: 2,
    agents: [
      { id: 'hr', name: 'HR-менеджер', skills: ['Подбор и найм', 'Онбординг', 'Performance review', 'Культура и мотивация'], inputs: ['Заявка на найм', 'Команда', 'Бенчмарки рынка'], outputs: ['Кандидаты', 'Оффер', 'Карьерные планы'], tools: ['hh.ru', 'LinkedIn', 'Notion', 'Lattice'], example: 'Закрыть вакансию Senior Frontend за 21 день с offer-acceptance ≥ 70%.' },
    ],
  },
  {
    id: 'finance', name: 'Финансы', accent: '#A8F0D2', short: 'ФИН',
    output: 'P&L и кэшфлоу', workload: 0.5, activeTasks: 3,
    agents: [
      { id: 'finance', name: 'Финансист', skills: ['Бухгалтерия и налоги', 'P&L и кэшфлоу', 'Рентабельность сделок', 'Юнит-экономика'], inputs: ['Счета', 'Сделки', 'Расходы'], outputs: ['Отчёты', 'Прогноз', 'Налоги'], tools: ['1С', 'Эльба', 'Notion Finance', 'Excel'], example: 'Составить P&L за месяц с разбивкой по проектам и подсветить убыточные.' },
    ],
  },
  {
    id: 'legal', name: 'Юридический', accent: '#FF9E7A', short: 'ЮР',
    output: 'Договоры и риски', workload: 0.35, activeTasks: 1,
    agents: [
      { id: 'lawyer', name: 'Юрист', skills: ['Договоры и оферты', 'NDA и ИС', 'Споры и претензии', 'Compliance (152-ФЗ, GDPR)'], inputs: ['Сделка', 'Контрагент', 'Регион'], outputs: ['Договор', 'Правовой риск-чек'], tools: ['КонсультантПлюс', 'DocuSign', 'Контур.Договоры'], example: 'Подготовить договор с зарубежным контрагентом с защитой ИС и платежами в USD.' },
    ],
  },
];

const ORCHESTRATOR = {
  id: 'orchestrator', name: 'Оркестратор', status: 'Маршрутизация задач',
  agents: [
    { id: 'chief', name: 'Главный оркестратор', skills: ['Маршрутизация', 'Согласования'], inputs: ['Задача от пользователя'], outputs: ['План'], tools: ['Внутренний'], example: 'Декомпозировать «запустить кампанию» в 7 подзадач для нужных агентов.' },
    { id: 'decomposer', name: 'Декомпозитор задач', skills: ['DAG', 'Гранулярность'], inputs: ['План'], outputs: ['Подзадачи'], tools: ['Внутренний'], example: 'Разбить запрос на КП на 12 атомарных задач с зависимостями.' },
    { id: 'router', name: 'Контекст-роутер', skills: ['Маршрутизация', 'Память'], inputs: ['Подзадача'], outputs: ['Назначение департаменту'], tools: ['Внутренний'], example: 'Тексты — Копирайтеру, дизайн — Дизайнеру, верстку — Frontend.' },
    { id: 'arbiter', name: 'Контролёр качества', skills: ['Eval', 'Ревью'], inputs: ['Артефакт'], outputs: ['Вердикт'], tools: ['Внутренний'], example: 'Отклонить КП со слабым оффером и вернуть на переработку.' },
    { id: 'memory', name: 'Менеджер памяти', skills: ['RAG', 'Состояние сессии'], inputs: ['Артефакты'], outputs: ['Контекст'], tools: ['Vector DB'], example: 'Сохранить состояние сессии и контекст между 30+ переключениями.' },
  ],
};

const OKR = {
  'copywriter': [
    { o: 'Тексты приносят клиенту измеримый коммерческий результат', krs: ['KR 1.1: Средний conversion rate лендингов/КП, написанных копирайтером, ≥ 4% (бенчмарк HubSpot 2025: e-commerce <2%, B2B SaaS 2,6–2,7% visitor-to-lead) к 30.09.2026', 'KR 1.2: CTR заголовков в Meta/Google креативах ≥ 1,5% (Meta benchmark 2025: 0,9% средний, >1,5% — strong) на 80% запущенных кампаний к 30.09.2026', 'KR 1.3: Email open rate рассылок, написанных копирайтером, ≥ 42% (HubSpot 2025: 42,35% cross-industry average) к 30.09.2026'] },
    { o: 'Скорость и качество драфтинга обгоняют среднюю студию', krs: ['KR 2.1: ≥ 70% черновиков (КП, лендинги, посты) принимаются заказчиком с первого раза без переделки сути к 30.09.2026', 'KR 2.2: Среднее время на готовый КП (от брифа до финала) ≤ 6 рабочих часов на типовой проект к 30.09.2026', 'KR 2.3: Объём готового контента ≥ 60 единиц/квартал (посты, лендинги, КП, email) при сохранении принципа «один текст — одна цель» к 30.09.2026'] }
  ],
  'seo': [
    { o: 'Органика становится главным каналом лидогенерации', krs: ['KR 1.1: Рост органического трафика +20% QoQ (бенчмарк Stratabeat 2025: здоровая SaaS-программа $10M–$30M ARR делает 15–20% QoQ) к 30.09.2026', 'KR 1.2: Visitor-to-lead conversion с органики ≥ 2,7% (бенчмарк Powered by Search 2025: B2B SaaS 2,6–2,7%) к 30.09.2026', 'KR 1.3: ≥ 30% запросов из приоритетного семантического ядра в топ-10 Google/Яндекс к 30.09.2026'] },
    { o: 'Технический фундамент сайта — на уровне индустриальных лидеров', krs: ['KR 2.1: Lighthouse Performance Mobile ≥ 90 на 100% посадочных под трафик к 30.09.2026', 'KR 2.2: Core Web Vitals «Good» по всем трём метрикам (LCP < 2,5s, INP < 200ms, CLS < 0,1) на 90% страниц в Search Console к 30.09.2026', 'KR 2.3: Доля проиндексированных страниц от валидных ≥ 95% (без дублей, soft-404, orphan) к 30.09.2026'] }
  ],
  'smm': [
    { o: 'Соцсети генерируют вовлечённую аудиторию выше рынка', krs: ['KR 1.1: Средний engagement rate Instagram ≥ 0,8% (бенчмарк Socialinsider 2025/2026: средний 0,45–0,6%, карусели 0,55%, reels 0,52%) к 30.09.2026', 'KR 1.2: Средний engagement rate LinkedIn ≥ 4% (бенчмарк Adobe/Buffer 2025: 3–3,5% средний, top 5%+) к 30.09.2026', 'KR 1.3: Рост подписной базы целевых каналов +15% за квартал к 30.09.2026'] },
    { o: 'Контент-конвейер работает без сбоев и переделок', krs: ['KR 2.1: ≥ 95% публикаций выходят по плану в утверждённое время без ошибок автопостинга к 30.09.2026', 'KR 2.2: Контент-план ведётся минимум на 14 дней вперёд в 100% недель квартала к 30.09.2026', 'KR 2.3: Доля постов, прошедших проверку с первого раза (без статуса «требует доработки»), ≥ 80% к 30.09.2026'] }
  ],
  'analyst': [
    { o: 'Команда принимает решения на основе данных, а не «ощущений»', krs: ['KR 1.1: ≥ 80% ключевых маркетинговых и продуктовых решений в квартале опираются на дашборд/отчёт аналитика (фиксация в Decision log) к 30.09.2026', 'KR 1.2: Точность прогнозов воронки на 4-недельном горизонте — MAPE ≤ 15% (индустриальная практика для forecast accuracy в SaaS, Benchmarkit 2025) к 30.09.2026', 'KR 1.3: Запущено ≥ 6 A/B-тестов с корректным расчётом размера выборки и зафиксированным результатом в Decision log к 30.09.2026'] },
    { o: 'Скорость и качество отчётности позволяют реагировать в течение дня', krs: ['KR 2.1: Среднее время на стандартный недельный отчёт ≤ 2 часа за счёт автоматизации дашбордов к 30.09.2026', 'KR 2.2: Data freshness основных дашбордов (маркетинг, продажи, продукт) ≤ 24 часа в 95% случаев к 30.09.2026', 'KR 2.3: 100% боевых дашбордов имеют описание метрик, источников, периода и владельца к 30.09.2026'] }
  ],
  'strategist': [
    { o: 'Стратегия делает unit-экономику здоровой', krs: ['KR 1.1: LTV/CAC по приоритетным сегментам ≥ 3:1 (бенчмарк Optifai 2025: median B2B SaaS 3,2:1, healthy 3:1) к 30.09.2026', 'KR 1.2: CAC payback period ≤ 8 месяцев для SMB-сегментов (бенчмарк First Page Sage 2025: median SaaS 6,8 мес, B2B SaaS 8,6 мес) к 30.09.2026', 'KR 1.3: Revenue от приоритетных сегментов +25% QoQ за счёт перенаправления бюджета по новой стратегии к 30.09.2026'] },
    { o: 'Каждая активная гипотеза подкреплена данными и customer development', krs: ['KR 2.1: Проведено ≥ 15 customer development интервью с реальными ICP за квартал к 30.09.2026', 'KR 2.2: 100% запущенных кампаний имеют письменно зафиксированную гипотезу + KPI успеха до старта (no metrics — no launch) к 30.09.2026', 'KR 2.3: Доля гипотез с подтверждённым результатом (success/fail по предзаявленному KPI) ≥ 60% от запущенных к 30.09.2026'] }
  ],
  'targetolog': [
    { o: 'Реклама окупается выше среднерыночного уровня', krs: ['KR 1.1: Средний ROAS по e-commerce кампаниям ≥ 4x (бенчмарк OwlClaw/Enrich Labs 2025: Meta среднее 2,19x, strong 3–5x, top 8x+) к 30.09.2026', 'KR 1.2: Средний CPL по лидогенерации ≤ $20 (или эквивалент в RUB) при сохранении качества лида (бенчмарк Meta 2025: $19–40 globally) к 30.09.2026', 'KR 1.3: Средний CTR креативов ≥ 1,5% (бенчмарк Meta 2025: 0,9% средний, >1,5% strong) к 30.09.2026'] },
    { o: 'Тестирование гипотез масштабирует то, что работает', krs: ['KR 2.1: Запущено ≥ 30 креативных гипотез (3–5 на адсет × число адсетов) с зафиксированным результатом к 30.09.2026', 'KR 2.2: Доля масштабированных рабочих гипотез (CPL/ROAS лучше плана) ≥ 25% от запущенных к 30.09.2026', 'KR 2.3: 100% активных кампаний имеют рабочий пиксель + Conversions API + UTM до запуска (no tracking — no launch) к 30.09.2026'] }
  ],
  'designer': [
    { o: 'Каждый деплой попадает в зелёную зону производительности', krs: ['KR 1.1: Lighthouse Performance Mobile ≥ 90 на 100% продакшн-деплоев в Vercel к 30.09.2026', 'KR 1.2: LCP < 2,5s, INP < 200ms, CLS < 0,1 (бенчмарк Google web.dev 2025) на 90% страниц по Real User Metrics к 30.09.2026', 'KR 1.3: Lighthouse Accessibility ≥ 95 на 100% выпущенных страниц к 30.09.2026'] },
    { o: 'Дизайн-конвейер: концепт → деплой за минимально возможное время', krs: ['KR 2.1: Среднее время от утверждённого брифа до прод-деплоя на Vercel ≤ 3 рабочих дня для типовых КП/лендингов к 30.09.2026', 'KR 2.2: ≥ 80% макетов принимаются клиентом с первой итерации (после Stitch-концепта и согласования) к 30.09.2026', 'KR 2.3: Среднее CSAT/NPS отданных макетов ≥ 8/10 (опрос Account-менеджером) к 30.09.2026'] }
  ],
  'sales': [
    { o: 'Win rate воронки выше индустриального бенчмарка', krs: ['KR 1.1: Win rate по квалифицированным сделкам ≥ 30% (бенчмарк Kixie/Ebsta 2025: B2B SaaS 20–30% norm, top 35%+) к 30.09.2026', 'KR 1.2: Средний чек выигранных сделок +20% QoQ за счёт работы с возражениями по цене после раскрытия ценности к 30.09.2026', 'KR 1.3: Средний sales cycle ≤ 60 дней для SMB-сегмента (бенчмарк Gradient.works 2025: SMB SaaS median 40 дней, mid-market 60–120) к 30.09.2026'] },
    { o: 'Скорость и качество обработки лидов — на уровне топ-команд', krs: ['KR 2.1: Время первого касания по новому лиду ≤ 15 минут в рабочее время на 95% лидов к 30.09.2026', 'KR 2.2: 100% сделок в CRM имеют квалификацию BANT/MEDDIC, следующий шаг с датой, причину выигрыша/проигрыша к 30.09.2026', 'KR 2.3: Доля проигранных сделок с зафиксированной и проанализированной причиной отвала ≥ 90% к 30.09.2026'] }
  ],
  'account': [
    { o: 'Удержание клиентов на уровне топ-квартиля B2B SaaS', krs: ['KR 1.1: Net Revenue Retention (NRR) портфеля ≥ 115% (бенчмарк ChartMogul/Optifai 2024–25: median 106%, healthy 115%+) к 30.09.2026', 'KR 1.2: Logo churn rate ≤ 5% за квартал (бенчмарк B2B SaaS 2025: <5% годовой считается «good», ~1,25% в квартал — best) к 30.09.2026', 'KR 1.3: NPS клиентского портфеля ≥ 50 (бенчмарк SurveySparrow/CustomerGauge 2025: SaaS median 30, >50 = top tier) к 30.09.2026'] },
    { o: 'Развитие аккаунтов даёт +30% к LTV без маркетинговых затрат', krs: ['KR 2.1: Доля клиентов с зафиксированным upsell/cross-sell в квартал ≥ 25% от активной базы к 30.09.2026', 'KR 2.2: 100% активных клиентов имеют QBR (Quarterly Business Review) проведённый в Q3 2026 к 30.09.2026', 'KR 2.3: CSAT по итогам каждого месячного отчёта ≥ 4,5/5 (бенчмарк SaaS 2025: 78–82%) к 30.09.2026'] }
  ],
  'aiml': [
    { o: 'AI-фичи в продакшене — качественные, дешёвые и измеримые', krs: ['KR 1.1: Faithfulness/accuracy RAG-систем ≥ 85% по FaithJudge-like eval-сету (бенчмарк Vectara/FaithJudge 2025: top judge accuracy 84% balanced) к 30.09.2026', 'KR 1.2: Hallucination rate в проде ≤ 5% по случайной выборке ответов (бенчмарк Vectara Hallucination Leaderboard 2025: топ-модели 1–3%, среднее 5–10%) к 30.09.2026', 'KR 1.3: Median latency LLM-ответа (без стриминга, по 95-му перцентилю) ≤ 3s для синхронных запросов к 30.09.2026'] },
    { o: 'Многоагентная система расширяется и измеряется', krs: ['KR 2.1: Добавлено ≥ 3 новых полезных агентов или MCP-серверов с задокументированной миссией и стыковками к 30.09.2026', 'KR 2.2: 100% AI-фич в проде имеют eval-сет ≥ 50 кейсов, observability (Langfuse/LangSmith) и prompt caching к 30.09.2026', 'KR 2.3: Стоимость на 1 запрос снижена ≥ на 30% за счёт перехода на Haiku/cheapest-that-works + prompt caching к 30.09.2026'] }
  ],
  'backend': [
    { o: 'API работают надёжно и быстро на уровне топовых сервисов', krs: ['KR 1.1: p95 latency публичных эндпойнтов ≤ 300ms (бенчмарк OneUptime/Uptrends 2025: <500ms excellent, top сервисы держат <300ms) к 30.09.2026', 'KR 1.2: Uptime прод-сервисов ≥ 99,9% за квартал (Uptrends «State of API Reliability 2025»: средний 99,46%) к 30.09.2026', 'KR 1.3: Error rate (5xx) на боевых эндпойнтах ≤ 0,1% запросов к 30.09.2026'] },
    { o: 'Качество кода и тестов снижает риски в проде', krs: ['KR 2.1: Покрытие тестами критичной бизнес-логики ≥ 75% (unit + integration) к 30.09.2026', 'KR 2.2: 100% новых эндпойнтов имеют OpenAPI-схему, валидацию входа (zod/pydantic), логи с correlation_id к 30.09.2026', 'KR 2.3: Доля reversible миграций БД 100%, ноль incident-ов из-за миграции в Q3 к 30.09.2026'] }
  ],
  'data': [
    { o: 'Single source of truth работает быстро и надёжно', krs: ['KR 1.1: Data freshness ключевых mart-таблиц ≤ 1 час для near-real-time потоков и ≤ 24 часов для daily-batch в 99% случаев к 30.09.2026', 'KR 1.2: SLA на восстановление упавшего пайплайна ≤ 4 часа (с алертом + runbook) к 30.09.2026', 'KR 1.3: 100% боевых dbt-моделей покрыты как минимум базовыми тестами (not_null, unique, relationships) к 30.09.2026'] },
    { o: 'Стоимость и качество данных под контролем', krs: ['KR 2.1: Снижение cost BigQuery/Snowflake на ≥ 25% QoQ за счёт partitioning + clustering + инкрементальных моделей к 30.09.2026', 'KR 2.2: 100% PII в DWH pseudonymized/hashed или хранится в отдельном vault с RBAC к 30.09.2026', 'KR 2.3: Time-to-insight (от запроса аналитика до готового data mart) ≤ 5 рабочих дней для типового кейса к 30.09.2026'] }
  ],
  'devops': [
    { o: 'DORA-метрики команды — на уровне Elite-перформеров', krs: ['KR 1.1: Deployment frequency ≥ 1 деплой в день в среднем по активным сервисам (DORA 2024/25 Elite: multiple per day, High: daily–weekly) к 30.09.2026', 'KR 1.2: Change Lead Time от коммита до прод ≤ 24 часа на 80% PR (DORA top 15%: <1 day) к 30.09.2026', 'KR 1.3: Change failure rate ≤ 10% и Failed deployment recovery time ≤ 1 час к 30.09.2026'] },
    { o: 'Инфраструктура наблюдаема, защищена и оптимизирована по cost', krs: ['KR 2.1: 100% прод-сервисов имеют логи + метрики (Four Golden Signals) + трейсы (OTel) + алерты с runbook к 30.09.2026', 'KR 2.2: Cloud cost снижен ≥ на 20% QoQ за счёт rightsizing, autoscaling, reserved instances к 30.09.2026', 'KR 2.3: 100% секретов вынесены из репозиториев в Vault/Secret Manager, secret-scanning включён в CI к 30.09.2026'] }
  ],
  'frontend': [
    { o: 'Продуктовые интерфейсы держат планку Core Web Vitals и a11y', krs: ['KR 1.1: LCP < 2,5s, INP < 200ms, CLS < 0,1 (Google web.dev 2025) на 90% страниц по Real User Metrics к 30.09.2026', 'KR 1.2: Lighthouse Accessibility ≥ 95 на 100% ключевых маршрутов продукта к 30.09.2026', 'KR 1.3: Initial JS bundle главных маршрутов ≤ 200 КБ (gzip) к 30.09.2026'] },
    { o: 'Продакшн-фронт стабилен и поддерживаем', krs: ['KR 2.1: Frontend error rate (Sentry, JS exceptions) ≤ 0,5% сессий к 30.09.2026', 'KR 2.2: 100% компонентов критичных потоков покрыты Storybook + минимум одним e2e Playwright-тестом к 30.09.2026', 'KR 2.3: TypeScript strict: 0 использований any в новом коде, ≥ 80% типов сгенерированы из OpenAPI/tRPC к 30.09.2026'] }
  ],
  'mobile': [
    { o: 'Стабильность приложения — выше отраслевого порога', krs: ['KR 1.1: Crash-free users rate ≥ 99,7% (внутренний таргет приложения, рынок-минимум 99,5%) на обеих платформах к 30.09.2026', 'KR 1.2: Средний App Store rating ≥ 4,5 и Google Play rating ≥ 4,4 к 30.09.2026', 'KR 1.3: Размер бандла iOS ≤ 50 МБ и Android ≤ 30 МБ (AAB) без необоснованного роста к 30.09.2026'] },
    { o: 'Retention догоняет лидеров вертикали', krs: ['KR 2.1: D7 retention ≥ 10% (бенчмарк Pushwoosh 2025: средний iOS 6,89%, Android 5,15%; e-commerce 10,7%) к 30.09.2026', 'KR 2.2: D30 retention ≥ 5% (бенчмарк Pushwoosh 2025: iOS 3,10%, Android 2,82%; median по индустрии 7%) к 30.09.2026', 'KR 2.3: 100% релизов выкатываются через phased/staged rollout с мониторингом crash-аналитики к 30.09.2026'] }
  ],
  'qa': [
    { o: 'Баги не доходят до продакшена', krs: ['KR 1.1: Bug escape rate (баги, найденные в проде / общее число багов) ≤ 5% (бенчмарк Count.co 2025: best-in-class <5%, target <10%) к 30.09.2026', 'KR 1.2: Доля S1/S2 (Blocker/Critical) багов, найденных QA до релиза, ≥ 95% к 30.09.2026', 'KR 1.3: 100% acceptance criteria покрыты тест-кейсами до старта разработки (shift-left) к 30.09.2026'] },
    { o: 'Автоматизация снимает регрессионную нагрузку с команды', krs: ['KR 2.1: Покрытие критичных user flow e2e-автотестами ≥ 80% (бенчмарк Katalon 2025: mature teams 60–80%) к 30.09.2026', 'KR 2.2: Среднее время полного регресс-прогона в CI ≤ 30 минут к 30.09.2026', 'KR 2.3: Доля flaky-тестов в CI ≤ 2% (каждый flaky разбирается, не игнорируется) к 30.09.2026'] }
  ],
  'security': [
    { o: 'Уязвимости устраняются раньше, чем их успевают эксплуатировать', krs: ['KR 1.1: MTTR на критические уязвимости ≤ 7 рабочих дней (бенчмарк Checkmarx 2025: critical 2,5 days top, organizations with automation <7 days) к 30.09.2026', 'KR 1.2: MTTR на high severity ≤ 14 дней, medium ≤ 30 дней (Phoenix Security 2025) к 30.09.2026', 'KR 1.3: 0 vulnerabilities с CVSS ≥ 9.0 старше 30 дней в проде к 30.09.2026'] },
    { o: 'Безопасность встроена в CI и архитектуру', krs: ['KR 2.1: 100% репозиториев имеют SAST + SCA + secret scanning в pre-commit/CI к 30.09.2026', 'KR 2.2: 100% новых фич проходят threat modeling (STRIDE) до старта разработки к 30.09.2026', 'KR 2.3: DAST-скан на stage перед каждым прод-релизом, 0 регрессий High/Critical в проде к 30.09.2026'] }
  ],
  'techlead': [
    { o: 'Команда работает на DORA-метриках уровня High/Elite', krs: ['KR 1.1: PR review median time ≤ 8 часов в рабочее время на 80% PR к 30.09.2026', 'KR 1.2: Change failure rate команды ≤ 10% и DORA lead time ≤ 24 часа от коммита до прод на 80% изменений (DORA 2024/25 top 15%) к 30.09.2026', 'KR 1.3: On-call load: ≤ 2 P1/P2 ночных инцидента на дежурного в месяц к 30.09.2026'] },
    { o: 'Архитектурная зрелость и предсказуемость растут', krs: ['KR 2.1: Каждое крупное архитектурное решение оформлено ADR — ≥ 8 новых ADR за квартал к 30.09.2026', 'KR 2.2: C4 Context + Container диаграммы актуальны для 100% активных сервисов к 30.09.2026', 'KR 2.3: «Onboarding time»: новый инженер закрывает первую содержательную задачу ≤ 5 рабочих дней к 30.09.2026'] }
  ],
  'pm': [
    { o: 'Проекты доходят до конца в срок и в бюджете', krs: ['KR 1.1: On-time delivery rate ≥ 80% проектов закрываются в плановый срок (бенчмарк PMI «Pulse of the Profession 2025»: индустриальный средний — 31% успешных полностью; 80% — top quartile в малых проектах) к 30.09.2026', 'KR 1.2: Перерасход бюджета не более 10% по любому проекту в портфеле к 30.09.2026', 'KR 1.3: ≤ 15% проектов фиксируют scope creep (бенчмарк PMI/Asana 2025: 55% проектов в индустрии страдают от scope creep) к 30.09.2026'] },
    { o: 'Прозрачность и предсказуемость работы команды', krs: ['KR 2.1: 100% задач в трекере имеют ответственного и срок; ноль «висящих» задач без owner к 30.09.2026', 'KR 2.2: Status-report выходит без срывов 12 недель подряд к 30.09.2026', 'KR 2.3: Team velocity (закрытых story points/задач) стабильна с волатильностью ≤ 20% между спринтами к 30.09.2026'] }
  ],
  'ba': [
    { o: 'Требования принимаются командой и бизнесом без переделок', krs: ['KR 1.1: ≥ 90% User Stories принимаются командой разработки без запроса на переработку требований к 30.09.2026', 'KR 1.2: Доля change requests от объёма scope ≤ 10% за время реализации проекта (бенчмарк IIBA / PMI 2025: средний 15–25%) к 30.09.2026', 'KR 1.3: 100% функциональных требований сопровождаются acceptance criteria и привязаны к бизнес-цели к 30.09.2026'] },
    { o: 'Time to spec — скорость от брифа до готовых требований', krs: ['KR 2.1: Среднее time-to-spec (от kick-off до подписанного scope statement) ≤ 10 рабочих дней для среднего проекта к 30.09.2026', 'KR 2.2: ≥ 5 stakeholder-интервью на каждый новый крупный проект проведено и расшифровано к 30.09.2026', 'KR 2.3: 100% проектов имеют просчитанный business case (cost/benefit/risk) до старта разработки к 30.09.2026'] }
  ],
  'osint': [
    { o: 'Каждый агент в системе работает по индустриальным бенчмаркам', krs: ['KR 1.1: 100% активных агентов многоагентной системы имеют квартальные OKR, основанные на ≥ 2 публичных бенчмарках к 30.09.2026', 'KR 1.2: Каждое OKR-исследование опирается ≥ на 3 независимых источника (HBR/McKinsey/Gartner/HubSpot/DORA и т.п.) к 30.09.2026', 'KR 1.3: ≥ 4 справки/бенчмарк-отчёта по индустриям подготовлены для оркестратора в Q3 к 30.09.2026'] },
    { o: 'Скорость и качество ОСИНТ-исследований выше среднерыночного', krs: ['KR 2.1: Среднее время на стандартную справку ≤ 4 рабочих часа (от запроса до отчёта с источниками) к 30.09.2026', 'KR 2.2: 100% утверждений в отчётах имеют атрибуцию (ссылку или название источника + год) к 30.09.2026', 'KR 2.3: ≥ 90% использованных источников ≤ 18 месяцев от даты отчёта (свежесть) к 30.09.2026'] }
  ]
};

const ORCHESTRATOR_OKR = {
  'chief': [
    { o: 'End-to-end задачи доводятся до пользователя без сбоев', krs: ['KR 1.1: Доля задач, дошедших до accept арбитра с первой попытки (pass@1), ≥ 75% к 30.09.2026', 'KR 1.2: Среднее время от запроса пользователя до финального артефакта ≤ 30 минут (медиана по типовым задачам) к 30.09.2026', 'KR 1.3: ≥ 95% сессий закрыты без эскалации/перезапуска плана к 30.09.2026'] },
    { o: 'Координация работает как единая точка ответственности', krs: ['KR 2.1: 100% артефактов перед выдачей пользователю прошли вердикт QualityArbiter к 30.09.2026', 'KR 2.2: CSAT по закрытым сессиям ≥ 4.5/5 (минимум 20 опрошенных сессий за квартал) к 30.09.2026', 'KR 2.3: Доля сессий, начинающихся с чтения состояния через MemoryManager, = 100% к 30.09.2026'] }
  ],
  'decomposer': [
    { o: 'План задачи — корректный с первой попытки', krs: ['KR 1.1: Доля DAG, выполненных без переделки плана (planning pass@1), ≥ 80% к 30.09.2026', 'KR 1.2: 100% подзадач имеют явного владельца и definition of done к 30.09.2026', 'KR 1.3: Доля исполнений, где появились implicit зависимости (всплыли в рантайме), ≤ 5% к 30.09.2026'] },
    { o: 'DAG ускоряет систему за счёт параллелизма и переиспользования', krs: ['KR 2.1: Средний коэффициент параллелизма DAG (узлы / критический путь) ≥ 2.0 к 30.09.2026', 'KR 2.2: Среднее время декомпозиции одной входящей задачи ≤ 90 секунд к 30.09.2026', 'KR 2.3: ≥ 60% задач выполняются из reusable шаблонов DAG (КП, лендинг, кампания и т.п.) к 30.09.2026'] }
  ],
  'router': [
    { o: 'Подзадача попадает к нужному агенту с минимальным контекстом', krs: ['KR 1.1: Routing accuracy (правильный департамент/агент с первой попытки) ≥ 95% к 30.09.2026', 'KR 1.2: Retrieval precision@5 для контекстных фрагментов ≥ 0.80 к 30.09.2026', 'KR 1.3: Средний размер контекста на подзадачу ≤ 4 000 токенов (p50) к 30.09.2026'] },
    { o: 'Роутер экономит ресурсы и не теряет критичные данные', krs: ['KR 2.1: Retrieval recall@10 по ключевым фактам подзадачи ≥ 0.90 к 30.09.2026', 'KR 2.2: Доля подзадач, на которые ответ найден в памяти и повторный вызов агента не нужен, ≥ 25% к 30.09.2026', 'KR 2.3: Случаи cross-session context leak = 0 (по аудиту арбитра за квартал) к 30.09.2026'] }
  ],
  'arbiter': [
    { o: 'Вердикты арбитра совпадают с экспертной оценкой', krs: ['KR 1.1: Agreement между LLM-as-judge арбитром и human reviewer (F1-macro) ≥ 0.80 к 30.09.2026', 'KR 1.2: False-accept rate (артефакт принят, но забракован пользователем) ≤ 5% к 30.09.2026', 'KR 1.3: Eval coverage — доля артефактов, прошедших полный чек-лист департамента, = 100% к 30.09.2026'] },
    { o: 'Уровень галлюцинаций перед выдачей пользователю — минимальный', krs: ['KR 2.1: Hallucination rate (по HHEM-2.x / RAGAS faithfulness) на выпускаемых текстах ≤ 3% к 30.09.2026', 'KR 2.2: 100% числовых утверждений в принятых артефактах имеют атрибуцию (источник + дата) к 30.09.2026', 'KR 2.3: Доля артефактов, прошедших не более 2 итераций до accept, ≥ 90% к 30.09.2026'] }
  ],
  'memory': [
    { o: 'Релевантная память доступна быстро и полно', krs: ['KR 1.1: Retrieval recall@10 по запросам контекст-роутера ≥ 0.90 к 30.09.2026', 'KR 1.2: P95 latency запроса к векторному индексу ≤ 60 мс к 30.09.2026', 'KR 1.3: Cache hit rate для повторяющихся запросов контекста ≥ 40% к 30.09.2026'] },
    { o: 'Память чистая, свежая, без дублей', krs: ['KR 2.1: Dedup rate (доля дублирующихся записей в индексе) ≤ 3% к 30.09.2026', 'KR 2.2: Freshness — доля активных записей с обновлением ≤ 90 дней ≥ 80% к 30.09.2026', 'KR 2.3: 100% записей долгосрочной памяти имеют атрибуцию источника (агент/файл/чат + timestamp) к 30.09.2026'] }
  ]
};

const SCENARIOS = [
  {
    id: 'campaign', name: 'Запуск рекламной кампании',
    path: ['orchestrator', 'marketing', 'copywriting', 'design', 'marketing', 'sales', 'orchestrator'],
    timeline: [
      { label: 'Задача получена', dept: 'orchestrator' },
      { label: 'Стратегия и каналы', dept: 'marketing' },
      { label: 'Тексты и хуки', dept: 'copywriting' },
      { label: 'Креативы', dept: 'design' },
      { label: 'Запуск таргета', dept: 'marketing' },
      { label: 'Лиды → продажи', dept: 'sales' },
      { label: 'Оркестратор закрыл', dept: 'orchestrator' },
    ],
  },
  {
    id: 'landing', name: 'Лендинг под КП',
    path: ['orchestrator', 'management', 'copywriting', 'design', 'it', 'sales', 'orchestrator'],
    timeline: [
      { label: 'Задача получена', dept: 'orchestrator' },
      { label: 'Бриф и требования', dept: 'management' },
      { label: 'Тексты лендинга', dept: 'copywriting' },
      { label: 'Дизайн и Vercel', dept: 'design' },
      { label: 'Интеграции и формы', dept: 'it' },
      { label: 'Передача в продажи', dept: 'sales' },
      { label: 'Оркестратор закрыл', dept: 'orchestrator' },
    ],
  },
  {
    id: 'kp', name: 'Подготовить КП',
    path: ['orchestrator', 'sales', 'copywriting', 'design', 'sales', 'orchestrator'],
    timeline: [
      { label: 'Задача получена', dept: 'orchestrator' },
      { label: 'Бриф от Sales', dept: 'sales' },
      { label: 'Текст КП', dept: 'copywriting' },
      { label: 'Дизайн КП', dept: 'design' },
      { label: 'Отправка клиенту', dept: 'sales' },
      { label: 'Оркестратор закрыл', dept: 'orchestrator' },
    ],
  },
  {
    id: 'product', name: 'Запустить SaaS-продукт',
    path: ['orchestrator', 'management', 'marketing', 'design', 'it', 'sales', 'marketing', 'orchestrator'],
    timeline: [
      { label: 'Задача получена', dept: 'orchestrator' },
      { label: 'Требования и план', dept: 'management' },
      { label: 'Стратегия и позиционирование', dept: 'marketing' },
      { label: 'UI/UX продукта', dept: 'design' },
      { label: 'Разработка и деплой', dept: 'it' },
      { label: 'Подключение продаж', dept: 'sales' },
      { label: 'Маркетинговый запуск', dept: 'marketing' },
      { label: 'Оркестратор закрыл', dept: 'orchestrator' },
    ],
  },
];

const FLOW_EDGES = [
  { from: 'marketing', to: 'copywriting', label: 'бриф', kind: 'solid' },
  { from: 'copywriting', to: 'design', label: 'тексты', kind: 'solid' },
  { from: 'design', to: 'it', label: 'макеты', kind: 'solid' },
  { from: 'management', to: 'it', label: 'требования', kind: 'solid' },
  { from: 'management', to: 'marketing', label: 'план', kind: 'solid' },
  { from: 'design', to: 'sales', label: 'КП', kind: 'solid' },
  { from: 'sales', to: 'marketing', label: 'фидбек', kind: 'dashed' },
  { from: 'it', to: 'marketing', label: 'метрики', kind: 'dashed' },
  { from: 'sales', to: 'orchestrator', label: 'отчёт', kind: 'thin' },
  { from: 'orchestrator', to: 'management', label: 'задача', kind: 'thin' },
];

const ROUTING_RULES = [
  { keys: ['дизайн', 'лендинг', 'кп ', 'коммерческое', 'презентац', 'смета', 'тз', 'креатив', 'макет', 'figma', 'stitch', 'vercel'], agent: 'designer', dept: 'design' },
  { keys: ['текст', 'пост', 'статья', 'описание', 'оффер', 'заголовок', 'рассылк', 'email', 'копирайт'], agent: 'copywriter', dept: 'copywriting' },
  { keys: ['smm', 'инстаграм', 'instagram', 'telegram', 'сторис', 'reels', 'tiktok', 'подписчик'], agent: 'smm', dept: 'marketing' },
  { keys: ['seo', 'органик', 'ключев', 'позиц', 'индекс', 'lighthouse', 'core web vitals'], agent: 'seo', dept: 'marketing' },
  { keys: ['таргет', 'реклам', 'ads', 'meta ads', 'google ads', 'roas', 'cpl'], agent: 'targetolog', dept: 'marketing' },
  { keys: ['стратегия', 'icp', 'jtbd', 'воронк', 'позиционир', 'go-to-market'], agent: 'strategist', dept: 'marketing' },
  { keys: ['аналитик', 'дашборд', 'отчёт', 'отчет', 'метрик', 'a/b', 'unit-эконом'], agent: 'analyst', dept: 'marketing' },
  { keys: ['продаж', 'sales', 'сделк', 'переговор', 'демо', 'crm', 'win rate'], agent: 'sales', dept: 'sales' },
  { keys: ['клиент', 'аккаунт', 'удержан', 'churn', 'апсейл', 'cross-sell', 'qbr', 'nrr'], agent: 'account', dept: 'sales' },
  { keys: ['ai', 'llm', 'rag', 'ml', 'промпт', 'модель', 'embed', 'eval', 'multi-agent'], agent: 'aiml', dept: 'it' },
  { keys: ['backend', 'бэк', 'api', 'эндпойнт', 'база данных', 'postgres', 'redis', 'миграц'], agent: 'backend', dept: 'it' },
  { keys: ['frontend', 'фронт', 'ui', 'react', 'next.js', 'компонент', 'bundle'], agent: 'frontend', dept: 'it' },
  { keys: ['mobile', 'мобильн', 'ios', 'android', 'react native', 'expo', 'app store', 'google play'], agent: 'mobile', dept: 'it' },
  { keys: ['devops', 'ci/cd', 'docker', 'kubernetes', 'terraform', 'инфра', 'pipeline', 'observability', 'monitor'], agent: 'devops', dept: 'it' },
  { keys: ['qa', 'тест', 'регресс', 'playwright', 'autotest', 'e2e', 'flaky'], agent: 'qa', dept: 'it' },
  { keys: ['security', 'безопасн', 'уязвим', 'cve', 'pentest', 'owasp', 'sast', 'dast'], agent: 'security', dept: 'it' },
  { keys: ['архитектур', 'tech lead', 'adr', 'c4', 'review', 'on-call', 'dora'], agent: 'techlead', dept: 'it' },
  { keys: ['data', 'etl', 'dwh', 'bigquery', 'snowflake', 'dbt', 'airbyte', 'pipeline данных'], agent: 'data', dept: 'it' },
  { keys: ['pm', 'project manager', 'проект', 'roadmap', 'сроки', 'риск', 'статус', 'velocity'], agent: 'pm', dept: 'management' },
  { keys: ['бизнес-аналитик', 'требован', 'user stor', 'bpmn', 'спецификац', 'acceptance'], agent: 'ba', dept: 'management' },
  { keys: ['осинт', 'osint', 'разведк', 'бенчмарк', 'окр ', 'okr', 'конкурент', 'исследован'], agent: 'osint', dept: 'management' },
];

DEPARTMENTS.forEach(d => d.agents.forEach(a => { if (OKR[a.id]) a.okr = OKR[a.id]; }));
ORCHESTRATOR.agents.forEach(a => { if (ORCHESTRATOR_OKR[a.id]) a.okr = ORCHESTRATOR_OKR[a.id]; });

function routeTask(text) {
  const t = (text || '').toLowerCase();
  for (const rule of ROUTING_RULES) {
    if (rule.keys.some((k) => t.includes(k))) {
      const dept = DEPARTMENTS.find((d) => d.id === rule.dept);
      const agent = dept ? dept.agents.find((a) => a.id === rule.agent) : null;
      if (agent && dept) return { agent, dept };
    }
  }
  return null;
}

module.exports = { DEPARTMENTS, ORCHESTRATOR, SCENARIOS, FLOW_EDGES, ROUTING_RULES, routeTask };
