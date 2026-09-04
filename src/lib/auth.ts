import type { NextAuthOptions } from "next-auth";
import { PrismaAdapter } from "@auth/prisma-adapter";
import EmailProvider from "next-auth/providers/email";
import CredentialsProvider from "next-auth/providers/credentials";
import { prisma } from "@/lib/prisma";
import type { Adapter } from "next-auth/adapters";

/** True when no real email transport is configured. */
export function isDemoAuthMode(): boolean {
  return !process.env.RESEND_API_KEY && !process.env.EMAIL_SERVER;
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

const providers: NextAuthOptions["providers"] = [];

if (!isDemoAuthMode()) {
  providers.push(
    EmailProvider({
      server: buildEmailServer(),
      from: process.env.EMAIL_FROM || "TeAviso <onboarding@resend.dev>",
      maxAge: 24 * 60 * 60,
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
