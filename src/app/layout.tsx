import type { Metadata, Viewport } from "next";
import Script from "next/script";
import { Inter } from "next/font/google";
import "./globals.css";
import { Providers } from "./providers";

const inter = Inter({
  subsets: ["latin"],
  display: "swap",
  variable: "--font-inter",
});

export const metadata: Metadata = {
  metadataBase: new URL("https://closerai-app.vercel.app"),
  title: {
    default: "CloserAI - AI-Powered Real Estate Lead Conversion | 24/7 AI Chat for Real Estate Agents",
    template: "%s | CloserAI",
  },
  description:
    "Convert more real estate leads with AI that works 24/7. Capture, qualify, and nurture leads automatically in 50+ languages. Free 14-day trial, no credit card, no setup fee.",
  keywords: [
    "real estate AI",
    "lead conversion",
    "AI chatbot",
    "real estate software",
    "24/7 AI assistant",
    "real estate leads",
    "AI for realtors",
    "real estate automation",
    "realtor chatbot",
    "lead capture",
  ],
  authors: [{ name: "CloserAI" }],
  creator: "CloserAI",
  publisher: "CloserAI",
  manifest: "/manifest.json",
  openGraph: {
    title: "CloserAI - AI That Closes Real Estate Leads 24/7",
    description:
      "24/7 AI chat agent for real estate. Captures leads in 50+ languages. $0 setup fee. 14-day free trial.",
    url: "https://closerai-app.vercel.app",
    siteName: "CloserAI",
    images: [
      {
        url: "https://closerai-app.vercel.app/logo-pfp-512.png",
        width: 512,
        height: 512,
        alt: "CloserAI Logo",
      },
    ],
    locale: "en_US",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "CloserAI - AI That Closes Real Estate Leads 24/7",
    description: "24/7 AI chat agent for real estate. 50+ languages. $0 setup. 14-day free trial.",
    images: ["https://closerai-app.vercel.app/logo-pfp-512.png"],
    creator: "@CloserAI",
  },
  icons: {
    icon: [
      { url: "/favicon.svg", type: "image/svg+xml" },
      { url: "/logo-pfp-250.png", sizes: "250x250", type: "image/png" },
    ],
    apple: [
      { url: "/logo-pfp-512.png", sizes: "512x512", type: "image/png" },
    ],
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      "max-image-preview": "large",
      "max-snippet": -1,
      "max-video-preview": -1,
    },
  },
  alternates: {
    canonical: "https://closerai-app.vercel.app",
  },
};

export const viewport: Viewport = {
  themeColor: [
    { media: "(prefers-color-scheme: light)", color: "#ffffff" },
    { media: "(prefers-color-scheme: dark)", color: "#0f172a" },
  ],
  width: "device-width",
  initialScale: 1,
  maximumScale: 5,
};

// Google Analytics ID — set NEXT_PUBLIC_GA_ID in Vercel env vars to enable tracking
const GA_ID = process.env.NEXT_PUBLIC_GA_ID || "";

// JSON-LD Structured Data for SEO (Organization + SoftwareApplication)
const jsonLd = {
  "@context": "https://schema.org",
  "@graph": [
    {
      "@type": "Organization",
      "@id": "https://closerai-app.vercel.app/#organization",
      name: "CloserAI",
      url: "https://closerai-app.vercel.app",
      logo: "https://closerai-app.vercel.app/logo-pfp-512.png",
      email: "AbdelrahmanAbdelati20@gmail.com",
      description:
        "AI-powered real estate lead conversion platform. 24/7 AI chat agent that captures, qualifies, and converts leads in 50+ languages.",
      sameAs: [],
    },
    {
      "@type": "WebSite",
      "@id": "https://closerai-app.vercel.app/#website",
      url: "https://closerai-app.vercel.app",
      name: "CloserAI",
      publisher: { "@id": "https://closerai-app.vercel.app/#organization" },
      inLanguage: "en-US",
    },
    {
      "@type": "SoftwareApplication",
      name: "CloserAI",
      applicationCategory: "BusinessApplication",
      operatingSystem: "Web",
      description:
        "24/7 AI chat agent that captures and converts real estate website visitors into qualified leads.",
      offers: [
        {
          "@type": "Offer",
          name: "Starter Plan",
          price: "299",
          priceCurrency: "USD",
          priceSpecification: { "@type": "UnitPriceSpecification", price: "299", priceCurrency: "USD", unitCode: "MON" },
        },
        {
          "@type": "Offer",
          name: "Professional Plan",
          price: "799",
          priceCurrency: "USD",
          priceSpecification: { "@type": "UnitPriceSpecification", price: "799", priceCurrency: "USD", unitCode: "MON" },
        },
        {
          "@type": "Offer",
          name: "Enterprise Plan",
          price: "1999",
          priceCurrency: "USD",
          priceSpecification: { "@type": "UnitPriceSpecification", price: "1999", priceCurrency: "USD", unitCode: "MON" },
        },
      ],
      aggregateRating: undefined,
      featureList: [
        "24/7 AI chat agent",
        "50+ languages support",
        "Lead scoring and qualification",
        "Property matching AI",
        "CRM integration",
        "Real-time analytics",
        "White-label option",
      ],
    },
  ],
};

// Global client-side error tracker - captures window errors and unhandled promises
const errorTrackerScript = `
(function() {
  var reportError = function(type, message, stack) {
    try {
      fetch('/api/errors', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          type: type,
          message: String(message || 'Unknown error'),
          stack: String(stack || ''),
          url: window.location.href,
          userAgent: navigator.userAgent
        }),
        keepalive: true
      }).catch(function() {});
    } catch (e) {}
  };
  window.addEventListener('error', function(e) {
    reportError('window', e.message, e.error && e.error.stack);
  });
  window.addEventListener('unhandledrejection', function(e) {
    reportError('promise', (e.reason && e.reason.message) || String(e.reason), e.reason && e.reason.stack);
  });
})();
`;

// Service worker registration — enables PWA install + offline support
const swRegisterScript = `
(function() {
  if ('serviceWorker' in navigator && window.location.protocol === 'https:') {
    window.addEventListener('load', function() {
      navigator.serviceWorker.register('/sw.js').catch(function() {});
    });
  }
})();
`;

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className={inter.variable}>
      <body className="min-h-screen bg-white text-gray-900 antialiased">
        {/* JSON-LD structured data for SEO */}
        <Script
          id="json-ld"
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
        />
        {/* Global client-side error tracker */}
        <Script id="error-tracker" strategy="afterInteractive">
          {errorTrackerScript}
        </Script>
        {/* Service worker for PWA install + offline support */}
        <Script id="sw-register" strategy="afterInteractive">
          {swRegisterScript}
        </Script>
        <Providers>{children}</Providers>
        {GA_ID ? (
          <>
            <Script src={`https://www.googletagmanager.com/gtag/js?id=${GA_ID}`} strategy="afterInteractive" />
            <Script id="google-analytics" strategy="afterInteractive">
              {`window.dataLayer = window.dataLayer || [];function gtag(){dataLayer.push(arguments);}gtag('js', new Date());gtag('config', '${GA_ID}', { page_path: window.location.pathname });`}
            </Script>
          </>
        ) : null}
      </body>
    </html>
  );
}
