# Настройки Vercel для Nuit Lumière

## Переменные окружения

В архиве есть `.env.example` только с placeholders; локальный `.env` исключён. Значения placeholders не являются credentials и не обеспечат подключение. Настоящие значения добавляйте в Vercel Project Settings → Environment Variables отдельно для Preview/Production по необходимости, затем запускайте новый deployment.

Для полного server-backed магазина нужны доступная из Vercel MySQL-совместимая база и Manus OAuth configuration:

```dotenv
DATABASE_URL=mysql://DB_USER:DB_PASSWORD@DB_HOST:3306/DB_NAME
MANUS_PROJECT_ID=REPLACE_WITH_MANUS_PROJECT_ID
MANUS_JWT_SECRET=REPLACE_WITH_UNIQUE_RANDOM_SECRET_32_CHARS_OR_MORE
MANUS_OAUTH_API_URL=https://api.manus.ai
MANUS_OAUTH_PORTAL_URL=REPLACE_WITH_MANUS_OAUTH_PORTAL_BASE_URL
```

Дополнительные переменные нужны только для соответствующих функций:

```dotenv
# Manus API-backed services; browser key must be restricted in provider settings.
MANUS_API_URL=REPLACE_WITH_MANUS_API_BASE_URL
MANUS_API_KEY=REPLACE_WITH_SERVER_SIDE_MANUS_API_KEY
MANUS_API_BROWSER_KEY=REPLACE_WITH_BROWSER_RESTRICTED_KEY

# Optional verified-email admin grant.
NUIT_ADMIN_EMAIL=admin@example.com

# Optional LiqPay test checkout only. Use official sandbox keys, not placeholders.
LIQPAY_PUBLIC_KEY=sandbox_REPLACE_WITH_TEST_PUBLIC_KEY
LIQPAY_PRIVATE_KEY=sandbox_REPLACE_WITH_TEST_PRIVATE_KEY
NUIT_PUBLIC_URL=https://your-project.vercel.app

# Optional Supabase catalog integration (if enabled/configured).
VITE_SUPABASE_URL=https://your-project.supabase.co
VITE_SUPABASE_ANON_KEY=your-supabase-anon-key
SUPABASE_URL=https://your-project.supabase.co
SUPABASE_ANON_KEY=your-supabase-anon-key
```

`OWNER_OPEN_ID` — альтернативная legacy-привязка администратора; обычно достаточно `NUIT_ADMIN_EMAIL`. Серверные ключи (`DATABASE_URL`, `MANUS_JWT_SECRET`, `MANUS_API_KEY`, LiqPay private key) нельзя помещать в `VITE_*`, source code или публичные файлы. `MANUS_API_BROWSER_KEY` предназначен для браузера и должен быть ограничен на стороне provider. Для LiqPay использовать только официальные тестовые ключи `sandbox_` до отдельного решения о production payments.

После заполнения `DATABASE_URL` примените миграции с рабочей машины/среды, имеющей разрешённый доступ к базе: `npm run db:migrate`. Миграции изменяют схему БД; перед применением к production проверьте резервное копирование и полномочия.

## Build, static frontend и API

`vercel.json` не используется. Установите зависимости через `npm install`; `npm run build` создаёт браузерный Vite output в `dist/public` и обычную серверную сборку Express в `dist/index.js`. Для Vercel задайте output directory `dist/public` при необходимости в настройках проекта.

Для Vercel API есть `api/[...path].ts` — serverless catch-all, подключающий те же tRPC/OAuth/LiqPay handlers. Vercel Functions используют env variables из Vercel runtime; Express-файл `dist/index.js` нужен для самостоятельного Node-сервера и не заменяет serverless function на Vercel. Проверьте deployment logs, а после deployment — `/api/health`, клиентские JS/CSS и `/api/trpc`.

Если нет реальных database/OAuth values, frontend может показать seed-каталог, но авторизация, администрирование и сохранение заказов не будут полноценными. Оплата остаётся недоступной без правильных тестовых merchant keys и настроенного публичного callback URL. Не считать зелёную сборку подтверждением работающих платежей или production credentials.
