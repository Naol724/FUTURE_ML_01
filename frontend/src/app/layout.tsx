import type { Metadata } from "next";
import localFont from "next/font/local";
import { Footer } from "@/components/footer";
import { Navbar } from "@/components/navbar";
import { PrewarmApi } from "@/components/prewarm";
import { Providers } from "@/components/providers";
import "./globals.css";

/**
 * Fonts are bundled locally (src/fonts) instead of fetched from Google Fonts
 * at build/dev time. That avoids SSL interception failures on some Windows
 * networks (UNABLE_TO_VERIFY_LEAF_SIGNATURE).
 */
const spaceGrotesk = localFont({
  src: [
    {
      path: "../fonts/space-grotesk-latin-500-normal.woff2",
      weight: "500",
      style: "normal",
    },
    {
      path: "../fonts/space-grotesk-latin-600-normal.woff2",
      weight: "600",
      style: "normal",
    },
    {
      path: "../fonts/space-grotesk-latin-700-normal.woff2",
      weight: "700",
      style: "normal",
    },
  ],
  variable: "--font-display",
  display: "swap",
});

const inter = localFont({
  src: [
    {
      path: "../fonts/inter-latin-400-normal.woff2",
      weight: "400",
      style: "normal",
    },
    {
      path: "../fonts/inter-latin-500-normal.woff2",
      weight: "500",
      style: "normal",
    },
    {
      path: "../fonts/inter-latin-600-normal.woff2",
      weight: "600",
      style: "normal",
    },
    {
      path: "../fonts/inter-latin-700-normal.woff2",
      weight: "700",
      style: "normal",
    },
  ],
  variable: "--font-body",
  display: "swap",
});

export const metadata: Metadata = {
  title: {
    default: "Forecastly — AI Sales & Demand Forecasting",
    template: "%s | Forecastly",
  },
  description:
    "AI-powered sales & demand forecasting for businesses. Upload historical sales data, train a Random Forest model, and get accurate forecasts with exportable reports.",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body className={`${spaceGrotesk.variable} ${inter.variable} font-sans`}>
        <Providers>
          <PrewarmApi />
          <div className="flex min-h-screen flex-col">
            <Navbar />
            <main className="flex-1">{children}</main>
            <Footer />
          </div>
        </Providers>
      </body>
    </html>
  );
}
