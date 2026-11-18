# Nuit Lumière

Dark editorial fragrance storefront with a React / Express / tRPC / Drizzle server and managed MySQL database.

Use `npm install` to install dependencies, `npm run dev` for development, `npm run build` / `npm run start` for a production build, `npm run db:migrate` to apply committed migrations, `npm run db:push` to generate and apply additive schema changes, and `npm run check` / `npm run test` for checks.

## Storefront and routes

The storefront routes are `/`, `/collection`, `/about`, `/cart`, `/checkout`, `/checkout/result`, `/contacts`, and `/privacy`. The protected `/admin` route requires a real Manus OAuth session and a server-side administrator role. Configure `NUIT_ADMIN_EMAIL` to grant that role to an account whose verified login email matches exactly. The cart is stored in browser `localStorage`; the server recalculates product prices and validates active products before saving each order. UAH prices are used throughout. Orders stay pending until a verified LiqPay callback confirms payment.

## Protected configuration

Supply `LIQPAY_PUBLIC_KEY`, `LIQPAY_PRIVATE_KEY`, and `NUIT_ADMIN_EMAIL` through protected environment variables. Never put credentials in source control, `.env.example`, chat or browser code. Both LiqPay keys must use the official `sandbox_` prefix; the server rejects live-key prefixes and will not create a real-charge checkout. If test merchant keys or callback origin are not ready, the UI says the gateway is not configured and the order remains pending. Card details are entered only on LiqPay and are not stored here. `NUIT_PUBLIC_URL` is an optional override for the absolute callback/result origin; the current project's Preview origin is used by default.

Checkout offers Nova Poshta and Ukrposhta for domestic Ukrainian delivery only. Address and carrier branch details are collected, but the app does not request live carrier tariffs or branch search: no carrier API credentials or contract were supplied.

## LiqPay test-mode details

The integration posts signed `data` and `signature` to the official Checkout endpoint and verifies the provider callback against the order ID, UAH currency, amount, and public key before marking payment successful. Outbound checkout signing follows the current [official Checkout API documentation](https://www.liqpay.ua/en/doc/api/internet_acquiring/checkout). Callback documentation currently contains SHA3-256 prose alongside older SHA1 examples and an [official NodeJS SDK](https://github.com/liqpay/sdk-nodejs/blob/master/lib/liqpay.js) using SHA1; outgoing requests use the current SHA3-256 rule, while callback verification accepts SHA3-256 and legacy SHA1 signatures for compatibility. Confirm a payment only from a valid signed server callback, never from the browser return URL.

LiqPay's [official Testing page](https://www.liqpay.ua/en/doc/api/testing) says test `public_key` and `private_key` always start with `sandbox_` and that their use does not move real funds. It also lists test cards; use those only at the provider's hosted test page.

## Assets and archive

The home hero uses the user-provided diamond perfume bottle image. Product photographs and local media are in `client/public/`. The restoration ZIP includes project source, migrations, lockfile, readable effect implementations and a fresh `dist/`; it excludes `.git`, `node_modules`, local `.env` files and credential values.

## Deploying to Vercel

A safe environment-variable template and hosting notes are in [docs/vercel-environment.md](docs/vercel-environment.md). This project builds the Vite frontend into `dist/public`, the Node server into `dist/index.js`, and includes the Vercel API catch-all at `api/[...path].ts`. Required external services and variables must be configured separately in Vercel; the safe placeholder values in `.env.example` are not credentials.

## Restoring effects and running the project

For complete recovery, install, build and run steps, see [`RESTORE.md`](RESTORE.md). The exact source locations and dependencies of typewriter, Oracle Search, Golden Dust, Mirror auto-scroll, and audio are mapped in [`docs/effects-restoration.md`](docs/effects-restoration.md).
