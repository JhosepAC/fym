import type { Metadata, Viewport } from "next";
import { Geist, Geist_Mono, Rubik_Glitch } from "next/font/google";
import "./globals.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

const rubikGlitch = Rubik_Glitch({
  variable: "--font-rubik-glitch",
  weight: "400",
  subsets: ["latin"],
});

export const viewport: Viewport = {
  themeColor: [
    { media: "(prefers-color-scheme: light)", color: "#1A1A1B" },
    { media: "(prefers-color-scheme: dark)", color: "#1A1A1B" },
  ],
  width: "device-width",
  initialScale: 1,
  maximumScale: 5,
};

const APP_NAME = "FyM - Find Your Movie";
const APP_URL = "https://fym-jac.vercel.app";
const APP_DESCRIPTION = "Discover movies and TV shows. Explore trending, popular, top rated content with cast, trailers, and streaming providers.";
const APP_IMAGE = "/assets/og/og-image.jpg";

export const metadata: Metadata = {
  metadataBase: new URL(APP_URL),
  title: {
    default: APP_NAME,
    template: "%s | FyM",
  },
  description: APP_DESCRIPTION,
  keywords: ["movies", "TV shows", "film", "cinema", "streaming", "TMDB", "actor", "cast", "trailers", "reviews"],
  authors: [{ name: "Jhosep Argomedo" }],
  creator: "Jhosep Argomedo",
  publisher: "Jhosep Argomedo",
  applicationName: APP_NAME,
  formatDetection: {
    email: false,
    address: false,
    telephone: false,
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      "max-video-preview": -1,
      "max-image-preview": "large",
      "max-snippet": -1,
    },
  },
  openGraph: {
    type: "website",
    url: APP_URL,
    siteName: APP_NAME,
    title: {
      default: APP_NAME,
      template: "%s | FyM",
    },
    description: APP_DESCRIPTION,
    locale: "en_US",
    alternateLocale: "es_ES",
    images: [
      {
        url: APP_IMAGE,
        width: 1200,
        height: 630,
        alt: APP_NAME,
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: APP_NAME,
    description: APP_DESCRIPTION,
    images: [APP_IMAGE],
    creator: "@jh_slin",
  },
  alternates: {
    canonical: APP_URL,
    languages: {
      en: APP_URL,
      es: `${APP_URL}/es`,
    },
  },
  icons: {
    icon: [
      { url: "/assets/favicon/favicon-dark.svg", media: "(prefers-color-scheme: light)" },
      { url: "/assets/favicon/favicon-light.svg", media: "(prefers-color-scheme: dark)" },
    ],
  },
  verification: {
    google: "google-site-verification-code",
  },
} as const;

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "WebSite",
    name: APP_NAME,
    url: APP_URL,
    description: APP_DESCRIPTION,
    publisher: {
      "@type": "Person",
      name: "Jhosep Argomedo",
    },
    potentialAction: {
      "@type": "SearchAction",
      target: {
        "@type": "EntryPoint",
        urlTemplate: `${APP_URL}/search?q={search_term_string}`,
      },
      "query-input": "required name=search_term_string",
    },
  };

  return (
    <html
      lang="en"
      className={`${geistSans.variable} ${geistMono.variable} ${rubikGlitch.variable} h-full antialiased`}
    >
      <head>
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
        />
      </head>
      <body className="min-h-full flex flex-col">{children}</body>
    </html>
  );
}
