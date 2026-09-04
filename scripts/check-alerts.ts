/**
 * TeAviso price check job
 * Run every 6 hours (cron: minute 0 of every 6th hour).
 * Example: cd /path/to/teaviso then run the check-alerts package script.
 */

import { PrismaClient } from "@prisma/client";
import { MockPriceFetcher } from "../src/lib/price-fetcher";
import {
  priceHitEmailHtml,
  priceHitEmailSubject,
} from "../src/lib/email-templates";

const prisma = new PrismaClient();
const fetcher = new MockPriceFetcher();
const baseUrl = process.env.NEXTAUTH_URL || "http://localhost:3000";


async function sendEmail(to: string, subject: string, html: string) {
  const hasResend = Boolean(process.env.RESEND_API_KEY);
  const hasSmtp = Boolean(process.env.EMAIL_SERVER);
  if (!hasResend && !hasSmtp) {
    console.log(`[DEMO EMAIL] -> ${to}`);
    console.log(`  Subject: ${subject}`);
    console.log(`  (HTML ${html.length} chars — set RESEND_API_KEY / EMAIL_SERVER to send)`);
    return;
  }

  if (hasResend) {
    const res = await fetch("https://api.resend.com/emails", {
      method: "POST",
      headers: {
        Authorization: "Bearer " + process.env.RESEND_API_KEY,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        from: process.env.EMAIL_FROM || "TeAviso <onboarding@resend.dev>",
        to: [to],
        subject,
        html,
      }),
    });
    if (!res.ok) console.error("Resend error", await res.text());
    return;
  }

  const nm = await import("nodemailer");
  const transport = nm.createTransport(process.env.EMAIL_SERVER);
  await transport.sendMail({
    from: process.env.EMAIL_FROM || "TeAviso <avisos@localhost>",
    to,
    subject,
    html,
  });
}

async function main() {
  console.log(`[check-alerts] start ${new Date().toISOString()}`);

  const alerts = await prisma.alert.findMany({
    where: { paused: false },
    include: { user: true },
  });

  console.log(`[check-alerts] ${alerts.length} active alert(s)`);

  let hits = 0;
  for (const alert of alerts) {
    const quote = await fetcher.fetchPrice(alert.product, alert.category);
    if (!quote) {
      console.warn(`  no quote for ${alert.product}`);
      continue;
    }

    await prisma.alert.update({
      where: { id: alert.id },
      data: { currentPrice: quote.price, lastChecked: quote.checkedAt },
    });

    const hit = quote.price <= alert.targetPrice;
    console.log(
      `  ${alert.product}: ${quote.price} MXN (target ${alert.targetPrice}) ${hit ? "HIT" : "-"}`
    );

    if (!hit) continue;

    if (alert.lastNotified) {
      const hours = (Date.now() - alert.lastNotified.getTime()) / 3_600_000;
      if (hours < 24) {
        console.log(`    skip notify (last ${hours.toFixed(1)}h ago)`);
        continue;
      }
    }

    if (alert.emailOn && alert.user.email) {
      const html = priceHitEmailHtml({
        userName: alert.user.name,
        product: alert.product,
        category: alert.category,
        targetPrice: alert.targetPrice,
        currentPrice: quote.price,
        alertUrl: `${baseUrl}/editar/${alert.id}`,
      });
      await sendEmail(alert.user.email, priceHitEmailSubject(alert.product), html);
    }

    if (alert.pushOn) {
      console.log(`    [push stub] would notify user ${alert.userId}`);
    }

    await prisma.alert.update({
      where: { id: alert.id },
      data: { lastNotified: new Date() },
    });
    hits++;
  }

  console.log(`[check-alerts] done — ${hits} notification(s)`);
}

main()
  .catch((e) => {
    console.error(e);
    process.exitCode = 1;
  })
  .finally(() => prisma.$disconnect());
