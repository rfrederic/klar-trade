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

export const metadata: Metadata = {
  title: "Klartrade — Trade with Clarity, Not Emotion",
  description:
    "The AI-powered trading platform that builds unbreakable discipline, manages risk intelligently, and reviews your psychology — so every decision is driven by your edge, not your fear.",
  keywords: ["trading", "AI", "discipline", "risk management", "trading journal", "psychology"],
  openGraph: {
    title: "Klartrade — Trade with Clarity, Not Emotion",
    description: "AI-powered trading discipline platform for serious traders.",
    type: "website",
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
