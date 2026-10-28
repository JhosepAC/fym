import type { Metadata, Viewport } from "next";
import { Inter } from "next/font/google";
import { LibraryProvider } from "@/components/LibraryProvider";
import Footer from "@/components/Footer";
import "./globals.css";

const inter = Inter({
  variable: "--font-inter",
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
const APP_DESCRIPTION =
  "Encuentra tu próxima película o serie. Explora tendencias, consulta reparto y proveedores, y organiza tu lista personal de cine.";
const APP_IMAGE = "/assets/og/og-image.jpg";

export const metadata: Metadata = {
  metadataBase: new URL(APP_URL),
  title: {
    default: APP_NAME,
    template: "%s | FyM",
  },
  description: APP_DESCRIPTION,
  keywords: [
    "movies",
    "TV shows",
    "film",
    "cinema",
    "streaming",
    "TMDB",
    "actor",
    "cast",
    "trailers",
    "reviews",
  ],
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
    locale: "es_ES",
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
  },
  icons: {
    icon: [
      {
        url: "/assets/favicon/favicon-dark.svg",
        media: "(prefers-color-scheme: light)",
      },
      {
        url: "/assets/favicon/favicon-light.svg",
        media: "(prefers-color-scheme: dark)",
      },
    ],
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
    <html lang="es" className={`${inter.variable} h-full antialiased`}>
      <head>
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
        />
      </head>
      <body>
        <LibraryProvider>
          <a href="#main-content" className="skip-link">
            Saltar al contenido
          </a>
          {children}
          <Footer />
        </LibraryProvider>
      </body>
    </html>
  );
}
