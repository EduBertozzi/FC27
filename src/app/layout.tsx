import "@fontsource-variable/inter";
import "./globals.css";

import { type Metadata, type Viewport } from "next";

import { AppShell } from "@/components/layout/app-shell";

export const metadata: Metadata = {
  title: { default: "FC Career Companion", template: "%s · FC Career Companion" },
  description:
    "O companheiro do seu modo Carreira de Atleta: partidas, estatísticas, timeline, notícias e um assistente de IA.",
  applicationName: "FC Career Companion",
};

export const viewport: Viewport = {
  themeColor: "#050b18",
  colorScheme: "dark",
  width: "device-width",
  initialScale: 1,
  viewportFit: "cover",
};

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html lang="pt-BR">
      <body>
        <AppShell>{children}</AppShell>
      </body>
    </html>
  );
}
