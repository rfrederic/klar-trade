import type { Metadata } from "next";
import { Inter, Plus_Jakarta_Sans } from "next/font/google";
import "./globals.css";

const inter = Inter({
  subsets: ["latin"],
  variable: "--font-inter",
  display: "swap",
});

const plusJakarta = Plus_Jakarta_Sans({
  subsets: ["latin"],
  variable: "--font-plus-jakarta",
  display: "swap",
});

const BASE_URL = "https://klartrade.com";

export const metadata: Metadata = {
  metadataBase: new URL(BASE_URL),
  title: "KlarTrade — Trade with Clarity, Not Emotion",
  description:
    "The AI-powered trading platform that builds unbreakable discipline, manages risk intelligently, and reviews your psychology — so every decision is driven by your edge, not your fear.",
  keywords: ["trading", "AI", "discipline", "risk management", "trading journal", "psychology"],
  openGraph: {
    title: "KlarTrade — Trade with Clarity, Not Emotion",
    description: "Trade with Clarity. Execute with Discipline. AI-powered trading intelligence for serious traders.",
    url: BASE_URL,
    siteName: "KlarTrade",
    type: "website",
    images: [
      {
        url: "/og-image.png",
        width: 1200,
        height: 630,
        alt: "KlarTrade — Trade with Clarity, Not Emotion",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "KlarTrade — Trade with Clarity, Not Emotion",
    description: "Trade with Clarity. Execute with Discipline. AI-powered trading intelligence for serious traders.",
    images: ["/og-image.png"],
  },
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className="dark" suppressHydrationWarning>
      <head>
        <meta name="viewport" content="width=device-width, initial-scale=1" />
      </head>
      <body
        className={`${inter.variable} ${plusJakarta.variable} font-sans bg-[#050508] text-white antialiased`}
        suppressHydrationWarning
      >
        {children}
      </body>
    </html>
  );
}
