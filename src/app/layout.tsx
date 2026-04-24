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
};

export const metadata: Metadata = {
  title: "Find Your Movie",
  description: "Discover movies and TV shows",
  icons: {
    icon: [
      { url: "/assets/favicon/favicon-dark.svg", media: "(prefers-color-scheme: light)" },
      { url: "/assets/favicon/favicon-light.svg", media: "(prefers-color-scheme: dark)" },
    ],
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="en"
      className={`${geistSans.variable} ${geistMono.variable} ${rubikGlitch.variable} h-full antialiased`}
    >
      <body className="min-h-full flex flex-col">{children}</body>
    </html>
  );
}
