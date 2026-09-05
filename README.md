# TeAviso MVP

Monitor de precios MX. Email + push only. Nunca WhatsApp. Tono amigo MX.

UI soft-3D: fondo #F3F4F6, acento naranja #FF6A3D, CTA verde #16A34A, cards glass con sombra suave, mascota V2 en /public/mascot.png. Navegacion: tabs de categoria arriba (icono + underline) + FAB verde Crear alerta (sin BottomNav).

## Stack
- Next.js + TypeScript + Tailwind
- Prisma + PostgreSQL (required for Vercel; SQLite will not work on serverless)
- NextAuth magic link
- Job check-alerts cada 6 horas

## Setup
1. Copia env.example al archivo de entorno local
2. Instala dependencias
3. Set DATABASE_URL to Postgres, then prisma db push
4. next dev
5. Abre http://localhost:3000

## Auth / correo
Vars: NEXTAUTH_URL, NEXTAUTH_SECRET, DATABASE_URL.
Envio real: RESEND_API_KEY o EMAIL_SERVER + EMAIL_FROM.
Sin keys: modo DEMO.

## Paginas
- / home
- /crear
- /confirm
- /mis-alertas
- /editar/[id]
- /cuenta

## CRUD alertas
Campos: product, category, targetPrice, emailOn, pushOn, paused.
API: GET/POST /api/alerts y GET/PATCH/DELETE /api/alerts/[id].

## PriceFetcher MX (robot)

Interfaz PriceFetcher + createPriceFetcher() en src/lib/price-fetcher.ts.

Fuente legal primaria: API oficial Mercado Libre Mexico (MLM) con OAuth Bearer.

- MERCADOLIBRE_ACCESS_TOKEN (requerido en prod)
- CRON_SECRET (protege /api/cron/check-alerts)
- PRICE_FETCHER=mock o USE_MOCK_PRICES=1 solo demos

Alta de app: https://developers.mercadolibre.com.mx/
Search: GET /sites/MLM/search con Authorization Bearer.
Cron Vercel cada 6h. Sin token en production: NullPriceFetcher.

## Browser push stub/skeleton
El flag pushOn se guarda y se muestra en UI; esqueleto en src/lib/push.ts.

No hay service worker, VAPID ni envio Web Push todavia.

Siguiente paso: implementar push del navegador DESPUES de que el email funcione bien.

## Email template
HTML en src/lib/email-templates.ts (priceHitEmailHtml).

## Scripts
- dev / build / start
- db:push / db:studio
- check-alerts


## Deploy (Vercel)
1. Set env in Vercel: `NEXTAUTH_URL` (https://your-app.vercel.app), `NEXTAUTH_SECRET` (32+ random chars), `DATABASE_URL` (Postgres connection string with ssl).
2. Optional email: `RESEND_API_KEY` + `EMAIL_FROM`, or `EMAIL_SERVER` + `EMAIL_FROM`. Without them, Demo auth is active — check Vercel logs for `[DEMO AUTH]` magic links.
3. After first deploy, run migrations against prod DB: `npx prisma db push` with production `DATABASE_URL`.
4. Claim any temporary Prisma Postgres DB via the claim URL so it is not deleted after 24h.

## Repo
https://github.com/alfonsodf1981/teaviso
