import type { Metadata } from "next";
import "./globals.css";
import { Providers } from "@/components/Providers";
import { CreateAlertFab } from "@/components/CreateAlertFab";

export const metadata: Metadata = {
  title: "TeAviso — Te aviso cuando baje",
  description:
    "Monitor de precios en México. Solo email y push — nunca WhatsApp. No vendemos nada.",
  icons: { icon: "/favicon.png", apple: "/app-icon.png" },
};

export default function RootLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="es-MX">
      <body>
        <Providers>
          <div className="page-shell">
            {children}
            <CreateAlertFab />
          </div>
        </Providers>
      </body>
    </html>
  );
}
