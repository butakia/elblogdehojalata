import type { Metadata, Viewport } from "next";
import { Cormorant_Garamond, Newsreader } from "next/font/google";
import "./globals.css";
import "./extras.css";
import { Header, BottomNav } from "@/components/SiteChrome";
import NavLoader from "@/components/NavLoader";
import Tracker from "@/components/Tracker";
import ThemeSwitcher from "@/components/ThemeSwitcher";

const display = Cormorant_Garamond({ variable: "--font-display", subsets: ["latin"], weight: ["500", "600", "700"], display: "swap" });
const body = Newsreader({ variable: "--font-body", subsets: ["latin"], style: ["normal", "italic"], display: "swap" });

export const metadata: Metadata = {
  metadataBase: new URL(process.env.NEXT_PUBLIC_SITE_URL ?? (process.env.VERCEL_PROJECT_PRODUCTION_URL ? `https://${process.env.VERCEL_PROJECT_PRODUCTION_URL}` : `http://localhost:${process.env.PORT ?? 3100}`)),
  title: { default: "El blog de Hojalata", template: "%s · El blog de Hojalata" },
  description: "Cuentos y libros de Angel Oliden.",
  openGraph: { type: "website", siteName: "El blog de Hojalata", locale: "es_PE", title: "El blog de Hojalata", description: "Cuentos y libros de Angel Oliden.", images: [{ url: "/og/default", width: 1200, height: 630, alt: "El blog de Hojalata" }] },
  twitter: { card: "summary_large_image", title: "El blog de Hojalata", description: "Cuentos y libros de Angel Oliden.", images: ["/og/default"] },
};

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  themeColor: "#15171b",
};

// Aplica el diseño elegido antes de pintar (evita parpadeo). ?tema=tinta|hojalata
const themeScript = `(function(){try{var q=new URLSearchParams(location.search).get('tema');var t=q||localStorage.getItem('hojalata-theme')||'hojalata';if(t!=='tinta')t='hojalata';if(q)localStorage.setItem('hojalata-theme',t);document.documentElement.dataset.theme=t;}catch(e){document.documentElement.dataset.theme='hojalata';}})();`;

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html lang="es" data-theme="hojalata" suppressHydrationWarning className={`${display.variable} ${body.variable}`}>
      <head>
        <script dangerouslySetInnerHTML={{ __html: themeScript }} />
      </head>
      <body>
        <Header />
        <main>{children}</main>
        <BottomNav />
        <ThemeSwitcher />
        <NavLoader />
        <Tracker />
      </body>
    </html>
  );
}
