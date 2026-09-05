import type { NextAuthOptions } from "next-auth";
import { PrismaAdapter } from "@auth/prisma-adapter";
import EmailProvider from "next-auth/providers/email";
import CredentialsProvider from "next-auth/providers/credentials";
import { createTransport } from "nodemailer";
import { prisma } from "@/lib/prisma";
import type { Adapter } from "next-auth/adapters";

/** True when no real email transport is configured. */
export function isDemoAuthMode(): boolean {
  return !process.env.RESEND_API_KEY && !process.env.EMAIL_SERVER;
}

const MAGIC_LINK_SUBJECT = "Tu acceso a TeAviso — entra con este link";

function magicLinkText(url: string): string {
  return [
    "Hola,",
    "",
    "Aquí tienes tu link para entrar a TeAviso (válido 24 horas):",
    url,
    "",
    "Si no pediste esto, ignora el correo.",
    "Solo te avisamos por email y push — nunca por WhatsApp.",
    "",
    "— TeAviso",
  ].join("\n");
}

function magicLinkHtml(url: string): string {
  return `<!DOCTYPE html>
<html lang="es-MX"><body style="font-family:system-ui,sans-serif;background:#F3F4F6;padding:24px;color:#1A1A1A">
  <div style="max-width:480px;margin:0 auto;background:#fff;border-radius:16px;padding:28px;box-shadow:0 8px 24px rgba(0,0,0,.06)">
    <p style="font-size:18px;font-weight:700;margin:0 0 8px">Tu acceso a TeAviso</p>
    <p style="margin:0 0 20px;line-height:1.5;color:#4B5563">Toca el botón para entrar. El link dura 24 horas. Sin contraseñas.</p>
    <p style="text-align:center;margin:0 0 20px">
      <a href="${url}" style="display:inline-block;background:#16A34A;color:#fff;text-decoration:none;font-weight:700;padding:12px 22px;border-radius:999px">Entrar a TeAviso</a>
    </p>
    <p style="font-size:12px;color:#6B7280;line-height:1.5;margin:0">Si el botón no funciona, copia este link:<br/><a href="${url}" style="color:#FF6A3D;word-break:break-all">${url}</a></p>
    <p style="font-size:12px;color:#6B7280;margin:16px 0 0">Si no pediste esto, ignora el correo. Solo email y push — nunca WhatsApp.</p>
  </div>
</body></html>`;
}

function buildEmailServer() {
  if (process.env.EMAIL_SERVER) {
    return process.env.EMAIL_SERVER;
  }
  if (process.env.RESEND_API_KEY) {
    return {
      host: "smtp.resend.com",
      port: 465,
      secure: true,
      auth: {
        user: "resend",
        pass: process.env.RESEND_API_KEY,
      },
    };
  }
  // Demo stub — never actually sends; NextAuth still needs a server object
  // for EmailProvider shape. We also expose Credentials demo login below.
  return {
    host: "localhost",
    port: 1025,
    secure: false,
    auth: { user: "demo", pass: "demo" },
  };
}

async function sendVerificationRequest({
  identifier,
  url,
  provider,
}: {
  identifier: string;
  url: string;
  provider: { from?: string; server?: unknown };
}) {
  const from = provider.from || "TeAviso <onboarding@resend.dev>";
  const subject = MAGIC_LINK_SUBJECT;
  const text = magicLinkText(url);
  const html = magicLinkHtml(url);

  if (process.env.RESEND_API_KEY) {
    const res = await fetch("https://api.resend.com/emails", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${process.env.RESEND_API_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        from,
        to: [identifier],
        subject,
        text,
        html,
      }),
    });
    if (!res.ok) {
      const body = await res.text().catch(() => "");
      throw new Error(`Resend error ${res.status}: ${body}`);
    }
    return;
  }

  const transport = createTransport(provider.server as Parameters<typeof createTransport>[0]);
  await transport.sendMail({
    to: identifier,
    from,
    subject,
    text,
    html,
  });
}

const providers: NextAuthOptions["providers"] = [];

if (!isDemoAuthMode()) {
  providers.push(
    EmailProvider({
      server: buildEmailServer(),
      from: process.env.EMAIL_FROM || "TeAviso <onboarding@resend.dev>",
      maxAge: 24 * 60 * 60,
      sendVerificationRequest,
    })
  );
} else {
  // DEMO MODE (clearly labeled): credentials stub — enter email, no mail sent.
  providers.push(
    CredentialsProvider({
      id: "demo-email",
      name: "Demo email (sin envío real)",
      credentials: {
        email: { label: "Email", type: "email", placeholder: "tu@correo.com" },
      },
      async authorize(credentials) {
        const email = credentials?.email?.trim().toLowerCase();
        if (!email || !email.includes("@")) return null;

        let user = await prisma.user.findUnique({ where: { email } });
        if (!user) {
          user = await prisma.user.create({
            data: { email, name: email.split("@")[0], emailVerified: new Date() },
          });
        } else if (!user.emailVerified) {
          user = await prisma.user.update({
            where: { id: user.id },
            data: { emailVerified: new Date() },
          });
        }

        console.log(
          `[DEMO AUTH] Sesión creada para ${email} sin enviar correo. ` +
            `Configura RESEND_API_KEY o EMAIL_SERVER para magic links reales.`
        );

        return { id: user.id, email: user.email, name: user.name };
      },
    })
  );
}

export const authOptions: NextAuthOptions = {
  adapter: PrismaAdapter(prisma) as Adapter,
  providers,
  session: {
    strategy: isDemoAuthMode() ? "jwt" : "database",
  },
  pages: {
    signIn: "/cuenta",
    verifyRequest: "/cuenta?sent=1",
  },
  callbacks: {
    async session({ session, user, token }) {
      if (session.user) {
        if (user?.id) {
          (session.user as { id?: string }).id = user.id;
        } else if (token?.sub) {
          (session.user as { id?: string }).id = token.sub;
        }
      }
      return session;
    },
    async jwt({ token, user }) {
      if (user?.id) token.sub = user.id;
      return token;
    },
  },
  secret: process.env.NEXTAUTH_SECRET,
  debug: process.env.NODE_ENV === "development",
};
