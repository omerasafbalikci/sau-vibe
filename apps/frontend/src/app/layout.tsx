import type { Metadata } from "next";
import { Inter, Plus_Jakarta_Sans } from "next/font/google";
import "./globals.css";
import { cn } from "@/lib/utils";
import { Navbar } from "@/components/layout/navbar";
import { Footer } from "@/components/layout/footer";
import { Providers } from "@/components/providers";

const inter = Inter({
  subsets: ["latin"],
  variable: "--font-inter",
});

const plusJakarta = Plus_Jakarta_Sans({
  subsets: ["latin"],
  variable: "--font-jakarta",
});

export const metadata: Metadata = {
  title: {
    default: "SAU VIBE — Sakarya Üniversitesi",
    template: "%s | SAÜ Vibe",
  },
  description:
    "Sakarya Üniversitesi öğrenci portalı. Bölümler, kampüs haritası, etkinlikler ve daha fazlası.",
  keywords: ["Sakarya Üniversitesi", "SAÜ", "üniversite", "kampüs"],
  openGraph: {
    title: "SAU VIBE",
    description: "Sakarya Üniversitesi",
    locale: "tr_TR",
    type: "website",
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="tr" suppressHydrationWarning>
      <body
        className={cn(
          inter.variable,
          plusJakarta.variable,
          "font-sans antialiased bg-background"
        )}
      >
        <Providers>
          <Navbar />
          <main>{children}</main>
          <Footer />
        </Providers>
      </body>
    </html>
  );
}
