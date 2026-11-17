import type { Metadata } from "next";
import {
  Bricolage_Grotesque,
  Hanken_Grotesk,
  Instrument_Serif,
  Inter,
  Noto_Sans_Bengali,
} from "next/font/google";
import { CartProvider } from "@/components/cart/CartProvider";
import { ContactProvider } from "@/lib/contact-context";
import { AuthProvider } from "@/lib/firebase/auth-context";
import { LanguageProvider } from "@/lib/i18n/context";
import { ProductsProvider } from "@/lib/products-context";
import "./globals.css";

const inter = Inter({
  subsets: ["latin"],
  weight: ["400", "500", "600", "700", "800"],
  style: ["normal", "italic"],
  variable: "--font-inter",
  display: "swap",
});

const instrumentSerif = Instrument_Serif({
  subsets: ["latin"],
  weight: ["400"],
  style: ["normal", "italic"],
  variable: "--font-serif",
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
    <html
      lang="en"
      data-intro="on"
      data-scroll-behavior="smooth"
      className={`${inter.variable} ${instrumentSerif.variable} ${notoBengali.variable} ${bricolage.variable} ${hanken.variable}`}
    >
      <body>
        <noscript>
          <style>{`.loader{display:none}.w,.fade-in,.chip-pop{opacity:1}`}</style>
        </noscript>
        <LanguageProvider>
          <AuthProvider>
            <ContactProvider>
              <ProductsProvider>
                <CartProvider>{children}</CartProvider>
              </ProductsProvider>
            </ContactProvider>
          </AuthProvider>
        </LanguageProvider>
      </body>
    </html>
  );
}
