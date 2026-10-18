import type { Metadata, Viewport } from "next";
import "@fontsource-variable/inter";
import "./globals.css";
import { PwaRegister } from "@/components/pwa-register";

export const metadata: Metadata = {
  title: "PredictFoot",
  description: "Prédisez. Gagnez des points. Grimpez au classement.",
  applicationName: "PredictFoot",
  appleWebApp: { capable: true, title: "PredictFoot", statusBarStyle: "default" },
  icons: { icon: "/pwa-icon/192", apple: "/pwa-icon/180?maskable=1" },
};

export const viewport: Viewport = {
  themeColor: "#0b2447",
  width: "device-width",
  initialScale: 1,
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="fr">
      <body
        style={{ fontFamily: "'Inter Variable', Inter, system-ui, -apple-system, 'Segoe UI', sans-serif" }}
        className="min-h-screen antialiased"
      >
        <PwaRegister />
        {children}
      </body>
    </html>
  );
}