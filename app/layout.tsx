import type { Metadata, Viewport } from "next";
import { Poppins } from "next/font/google";
import "./globals.css";
import "./responsive.css";
import Providers from "./providers";

export const revalidate = 300;

const poppins = Poppins({
  weight: ["100", "200", "300", "400", "500", "600", "700", "800", "900"],
  style: ["normal", "italic"],
  subsets: ["latin"],
  display: "swap",
  variable: "--font-poppins",
  preload: true,
});

export const metadata: Metadata = {
  metadataBase: new URL("https://privora.com"),
  title: "Privora - Luxury Jewelry Online",
  description:
    "Discover exquisite luxury jewelry at Privora. Shop elegant rings, necklaces, earrings, and more. Premium quality, elegant designs, and secure checkout.",
  keywords: "jewelry, luxury jewelry, rings, necklaces, earrings, online jewelry store",
  authors: [{ name: "Privora" }],
  openGraph: {
    title: "Privora - Luxury Jewelry Online",
    description:
      "Discover exquisite luxury jewelry at Privora. Premium quality and elegant designs.",
    type: "website",
    locale: "en_IN",
    url: "https://privora.com",
    siteName: "Privora",
    images: [
      {
        url: "/img/og-image.png",
        width: 1200,
        height: 630,
        alt: "Privora Luxury Jewelry",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "Privora - Luxury Jewelry Online",
    description: "Discover exquisite luxury jewelry at Privora.",
    images: ["/img/og-image.png"],
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
    },
  },
};

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  maximumScale: 1,
  userScalable: false,
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const structuredData = {
    "@context": "https://schema.org",
    "@type": "Organization",
    name: "Privora",
    url: "https://privora.com",
    logo: "https://privora.com/img/logo.png",
    description: "Luxury Jewelry Online Store",
    sameAs: [
      "https://www.facebook.com/privora",
      "https://www.instagram.com/privora",
      "https://www.twitter.com/privora",
    ],
    contactPoint: {
      "@type": "ContactPoint",
      contactType: "Customer Support",
      email: "support@privora.com",
    },
  };

  return (
    <html lang="en" suppressHydrationWarning className={poppins.variable}>
      <head>
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(structuredData) }}
        />
      </head>
      <body suppressHydrationWarning>
        <Providers>{children}</Providers>
      </body>
    </html>
  );
}
