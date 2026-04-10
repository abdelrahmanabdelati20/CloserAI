import type { Metadata } from "next";
import Script from "next/script";
import "./globals.css";
import { Providers } from "./providers";

export const metadata: Metadata = {
  title: "CloserAI - AI-Powered Real Estate Lead Conversion | 24/7 AI Chat for Real Estate Agents",
  description: "Convert more real estate leads with AI that works 24/7. Capture, qualify, and nurture leads automatically in 50+ languages. Free 14-day trial, no credit card, no setup fee.",
  keywords: "real estate AI, lead conversion, AI chatbot, real estate software, 24/7 AI assistant, real estate leads, AI for realtors",
  openGraph: {
    title: "CloserAI - AI That Closes Real Estate Leads 24/7",
    description: "24/7 AI chat agent for real estate. Captures leads in 50+ languages. $0 setup fee. 14-day free trial.",
    url: "https://closerai-app.vercel.app",
    siteName: "CloserAI",
    images: [{ url: "https://closerai-app.vercel.app/logo-pfp-512.png", width: 512, height: 512, alt: "CloserAI Logo" }],
    locale: "en_US",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "CloserAI - AI That Closes Real Estate Leads 24/7",
    description: "24/7 AI chat agent for real estate. 50+ languages. $0 setup. 14-day free trial.",
    images: ["https://closerai-app.vercel.app/logo-pfp-512.png"],
  },
  icons: {
    icon: "/favicon.svg",
  },
};

// Google Analytics ID — set NEXT_PUBLIC_GA_ID in Vercel env vars to enable tracking
const GA_ID = process.env.NEXT_PUBLIC_GA_ID || "";

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body className="min-h-screen bg-white text-gray-900 antialiased">
        <Providers>{children}</Providers>
        {GA_ID ? (
          <>
            <Script
              src={`https://www.googletagmanager.com/gtag/js?id=${GA_ID}`}
              strategy="afterInteractive"
            />
            <Script id="google-analytics" strategy="afterInteractive">
              {`window.dataLayer = window.dataLayer || [];function gtag(){dataLayer.push(arguments);}gtag('js', new Date());gtag('config', '${GA_ID}', { page_path: window.location.pathname });`}
            </Script>
          </>
        ) : null}
      </body>
    </html>
  );
}
