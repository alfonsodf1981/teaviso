import { NextRequest, NextResponse } from "next/server";
import { PrismaClient } from "@prisma/client";
import { createPriceFetcher } from "@/lib/price-fetcher";
import {
  priceHitEmailHtml,
  priceHitEmailSubject,
} from "@/lib/email-templates";

export const runtime = "nodejs";
export const maxDuration = 60;

async function sendEmail(to: string, subject: string, html: string) {
  if (!process.env.RESEND_API_KEY) {
    console.log(`[cron] skip email (no RESEND) -> ${to}: ${subject}`);
    return;
  }
  const res = await fetch("https://api.resend.com/emails", {
    method: "POST",
    headers: {
      Authorization: `Bearer ${process.env.RESEND_API_KEY}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      from: process.env.EMAIL_FROM || "TeAviso <onboarding@resend.dev>",
      to: [to],
      subject,
      html,
    }),
  });
  if (!res.ok) console.error("[cron] Resend", await res.text());
}

export async function GET(req: NextRequest) {
  const secret = process.env.CRON_SECRET;
  const auth = req.headers.get("authorization");
  const q = req.nextUrl.searchParams.get("secret");
  const ok =
    (secret && auth === `Bearer ${secret}`) ||
    (secret && q === secret) ||
    (!secret && process.env.NODE_ENV !== "production");
  if (!ok) {
    return NextResponse.json({ error: "unauthorized" }, { status: 401 });
  }

  const prisma = new PrismaClient();
  const fetcher = createPriceFetcher();
  const baseUrl = process.env.NEXTAUTH_URL || "https://teaviso.vercel.app";
  let hits = 0;
  let checked = 0;
  let missing = 0;

  try {
    const alerts = await prisma.alert.findMany({
      where: { paused: false },
      include: { user: true },
    });

    for (const alert of alerts) {
      const quote = await fetcher.fetchPrice(alert.product, alert.category);
      checked++;
      if (!quote) {
        missing++;
        await prisma.alert.update({
          where: { id: alert.id },
          data: { lastChecked: new Date() },
        });
        continue;
      }

      await prisma.alert.update({
        where: { id: alert.id },
        data: { currentPrice: quote.price, lastChecked: quote.checkedAt },
      });

      if (quote.price > alert.targetPrice) continue;

      if (alert.lastNotified) {
        const hours = (Date.now() - alert.lastNotified.getTime()) / 3_600_000;
        if (hours < 24) continue;
      }

      if (alert.emailOn && alert.user.email) {
        await sendEmail(
          alert.user.email,
          priceHitEmailSubject(alert.product),
          priceHitEmailHtml({
            userName: alert.user.name,
            product: alert.product,
            category: alert.category,
            targetPrice: alert.targetPrice,
            currentPrice: quote.price,
            alertUrl: `${baseUrl}/editar/${alert.id}`,
          })
        );
      }

      if (alert.pushOn) {
        console.log(`[cron] push stub user=${alert.userId}`);
      }

      await prisma.alert.update({
        where: { id: alert.id },
        data: { lastNotified: new Date() },
      });
      hits++;
    }

    return NextResponse.json({
      ok: true,
      checked,
      missingQuotes: missing,
      notifications: hits,
      fetcher: process.env.MERCADOLIBRE_ACCESS_TOKEN
        ? "mercadolibre"
        : process.env.USE_MOCK_PRICES === "1"
          ? "mock"
          : "null",
    });
  } catch (e) {
    console.error(e);
    return NextResponse.json({ error: String(e) }, { status: 500 });
  } finally {
    await prisma.$disconnect();
  }
}
