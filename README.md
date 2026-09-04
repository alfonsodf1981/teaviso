# TeAviso MVP

Monitor de precios MX. Email+push only.

Tono MX amigo. Colores brand documentados en Tailwind.

## Stack
- Next.js App Router + TypeScript + Tailwind
- Prisma + SQLite
- NextAuth email magic link (+ demo login si faltan keys de correo)
- Job scripts/check-alerts.ts cada 6 horas

## Setup
1. Copia .env.example a .env
2. Instala dependencias del package.json
3. prisma db push (script db:push)
4. next dev (script dev)
5. Abre http://localhost:3000

## Auth / correo
Variables: NEXTAUTH_URL, NEXTAUTH_SECRET, DATABASE_URL.
Para envio real: clave de Resend (RESEND_API_KEY) o EMAIL_SERVER SMTP, y EMAIL_FROM.
Sin esas keys: modo DEMO — login con cualquier email, sin envio real (banner en UI, logs DEMO AUTH).

## Paginas
- / home
- /crear alerta
- /confirm
- /mis-alertas
- /editar/[id]
- /cuenta

## CRUD alertas
Campos: product, category, targetPrice, emailOn, pushOn, paused.
API: GET/POST /api/alerts y GET/PATCH/DELETE /api/alerts/[id].

## PriceFetcher + job
Interfaz + MockPriceFetcher en src/lib/price-fetcher.ts.
Job: script check-alerts (package script check-alerts).
Programar cada 6 horas con cron del sistema, systemd timer o similar.
Ejemplo crontab (minuto 0, cada 6 horas): ver comentario en scripts/check-alerts.ts

## Email template
HTML en src/lib/email-templates.ts (priceHitEmailHtml) cuando el precio llega al objetivo.

## Scripts package
- dev / build / start
- db:push / db:studio
- check-alerts

## Repo destino
https://github.com/alfonsodf1981/teaviso — este scaffold no hace push; el parent configura auth y pushea.
