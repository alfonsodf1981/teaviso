# TeAviso MVP

Monitor de precios MX. Email + push only. Nunca WhatsApp. Tono amigo MX.

UI soft-3D: fondo #F3F4F6, acento naranja #FF6A3D, CTA verde #16A34A, cards glass con sombra suave, mascota V2 en /public/mascot.png. Navegacion: tabs de categoria arriba (icono + underline) + FAB verde Crear alerta (sin BottomNav).

## Stack
- Next.js + TypeScript + Tailwind
- Prisma + SQLite
- NextAuth magic link
- Job check-alerts cada 6 horas

## Setup
1. Copia env.example al archivo de entorno local
2. Instala dependencias
3. prisma db push
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

## PriceFetcher stub
MockPriceFetcher en src/lib/price-fetcher.ts es un STUB: precios mock deterministas.

Siguiente paso: scrapers/APIs reales de marketplaces MX (reemplazar el mock detras de la interfaz PriceFetcher). El job check-alerts ya usa la interfaz.

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

## Repo
https://github.com/alfonsodf1981/teaviso
