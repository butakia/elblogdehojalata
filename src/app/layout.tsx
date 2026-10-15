import type { Metadata, Viewport } from "next";
import { Fraunces, Lora, Caveat } from "next/font/google";
import Link from "next/link";
import "./globals.css";
import { Header, BottomNav } from "@/components/SiteChrome";
import ThemeSwitcher from "@/components/ThemeSwitcher";
import { AUTHOR, INSTAGRAM } from "@/lib/content";

const display = Fraunces({ variable: "--font-display", subsets: ["latin"], display: "swap" });
const body = Lora({ variable: "--font-body", subsets: ["latin"], display: "swap" });
const hand = Caveat({ variable: "--font-hand", subsets: ["latin"], display: "swap" });

export const metadata: Metadata = {
  metadataBase: new URL(process.env.VERCEL_PROJECT_PRODUCTION_URL ? `https://${process.env.VERCEL_PROJECT_PRODUCTION_URL}` : "http://localhost:3000"),
  title: { default: "El blog de Hojalata", template: "%s · El blog de Hojalata" },
  description: "Cuentos, microcuentos y dibujos de Angel Oliden, desde una casa de hojalata donde un gato sonríe en la copa del abeto del relato.",
  openGraph: { title: "El blog de Hojalata", description: "Cuentos, microcuentos y dibujos.", locale: "es_PE", type: "website", images: ["/img/2021-06-elgatoblanco.webp"] },
};

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  themeColor: [{ color: "#f6efe2" }],
};

// Aplica el diseño elegido antes de pintar (evita parpadeo). ?tema=tinta|hojalata|cheshire
const themeScript = `(function(){try{var q=new URLSearchParams(location.search).get('tema');var t=q||localStorage.getItem('hojalata-theme')||'tinta';if(q)localStorage.setItem('hojalata-theme',q);document.documentElement.dataset.theme=t;}catch(e){document.documentElement.dataset.theme='tinta';}})();`;

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html lang="es" data-theme="tinta" suppressHydrationWarning className={`${display.variable} ${body.variable} ${hand.variable}`}>
      <head>
        <script dangerouslySetInnerHTML={{ __html: themeScript }} />
      </head>
      <body>
        <Header />
        <main>{children}</main>
        <footer className="site-footer">
          <p className="hand">Gracias por pasar por esta casa de hojalata.</p>
          <p>
            © {new Date().getFullYear()} {AUTHOR} · <a href={`https://instagram.com/${INSTAGRAM}`} target="_blank" rel="noopener noreferrer">@{INSTAGRAM}</a> ·{" "}
            <Link href="/propuestas">Propuestas de diseño</Link>
          </p>
        </footer>
        <BottomNav />
        <ThemeSwitcher />
      </body>
    </html>
  );
}
