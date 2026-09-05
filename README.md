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

## PriceFetcher (Mercado Libre MX)
`src/lib/price-fetcher.ts` — interfaz `PriceFetcher` + `MockPriceFetcher` + `MercadoLibreMxPriceFetcher` (híbrido).

Comportamiento real (`createPriceFetcher()` / `priceFetcher`):
1. Si el producto es URL de mercadolibre.com.mx o id `MLM…` → API `items` / `products`.
2. Si no → API `sites/MLM/search`, y si falla → HTML de `listado.mercadolibre.com.mx/{slug}`.
3. Si todo falla → `null` (con un `console.warn`).

**Limitación honesta:** desde IPs serverless / datacenter la search API suele devolver **403** y el listado redirige a **account-verification** (bot wall). Sin app token de ML, en producción a menudo no hay precio. Workarounds MVP: pegar la URL o id MLM del producto como nombre, o demos con mock.

Env:
- `PRICE_FETCHER=mock` o `USE_MOCK_PRICES=1` → mock determinista (demos / local sin red).
- Default → `MercadoLibreMxPriceFetcher`.

Siguiente paso: app token oficial de Mercado Libre para search estable.

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
