import "@fontsource/barlow/400.css";
import "@fontsource/barlow/500.css";
import "@fontsource/barlow/600.css";
import "@fontsource/barlow/700.css";
import "@fontsource/barlow-condensed/500.css";
import "@fontsource/barlow-condensed/600.css";
import "@fontsource/barlow-condensed/700.css";
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
  themeColor: "#0e1930",
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
