import type { Metadata } from "next";
import { Bricolage_Grotesque, Hanken_Grotesk, Inter, Noto_Sans_Bengali } from "next/font/google";
import { CartProvider } from "@/components/cart/CartProvider";
import "./globals.css";

const inter = Inter({
  subsets: ["latin"],
  weight: ["400", "500", "600", "700", "800"],
  style: ["normal", "italic"],
  variable: "--font-inter",
  display: "swap",
});

const notoBengali = Noto_Sans_Bengali({
  subsets: ["bengali"],
  weight: ["400", "600"],
  variable: "--font-bengali",
  display: "swap",
});

// Logo typefaces — used only by the logo lockup (see components/ui/Logo).
const bricolage = Bricolage_Grotesque({
  subsets: ["latin"],
  weight: ["700"],
  variable: "--font-display",
  display: "swap",
});

const hanken = Hanken_Grotesk({
  subsets: ["latin"],
  weight: ["500", "700"],
  variable: "--font-hanken",
  display: "swap",
});

export const metadata: Metadata = {
  title: "One Time Product BD — Food packaging, presented beautifully",
  description:
    "Square boxes, round containers, dessert cups and crates — made for sweet shops, bakeries, caterers and homes across Bangladesh.",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" data-intro="on" className={`${inter.variable} ${notoBengali.variable} ${bricolage.variable} ${hanken.variable}`}>
      <body>
        <noscript>
          <style>{`.loader{display:none}.w,.fade-in,.chip-pop{opacity:1}`}</style>
        </noscript>
        <CartProvider>{children}</CartProvider>
      </body>
    </html>
  );
}
