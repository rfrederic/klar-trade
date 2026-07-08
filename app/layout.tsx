import type { Metadata, Viewport } from "next";
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
const OG_TITLE = "KlarTrade — Trade with Clarity, Not Emotion";
const OG_DESCRIPTION =
  "The AI-powered trading journal that builds discipline, tracks your edge, and protects your mental game.";
const OG_IMAGE = `${BASE_URL}/og-image.png`;

export const metadata: Metadata = {
  metadataBase: new URL(BASE_URL),
  title: OG_TITLE,
  description: OG_DESCRIPTION,
  keywords: [
    "trading journal",
    "prop firm",
    "trading discipline",
    "trading analytics",
    "forex journal",
  ],
  robots: { index: true, follow: true },
  alternates: { canonical: BASE_URL },
  openGraph: {
    title: OG_TITLE,
    description: OG_DESCRIPTION,
    url: BASE_URL,
    siteName: "KlarTrade",
    type: "website",
    images: [{ url: OG_IMAGE, width: 1200, height: 630, alt: OG_TITLE }],
  },
  twitter: {
    card: "summary_large_image",
    title: OG_TITLE,
    description: OG_DESCRIPTION,
    site: "@klartrade",
    images: [OG_IMAGE],
  },
};

// Viewport must go through Next's dedicated export, not a hand-written
// <head><meta name="viewport" ...></head> — a manual tag there collides with
// Next's own __next_viewport_boundary__ injection during streaming and was
// the cause of the recurring __next_metadata_boundary__ hydration mismatch.
export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className="dark" suppressHydrationWarning>
      <body
        className={`${inter.variable} ${plusJakarta.variable} font-sans bg-[#050508] text-white antialiased`}
        suppressHydrationWarning
      >
        {children}
      </body>
    </html>
  );
}
