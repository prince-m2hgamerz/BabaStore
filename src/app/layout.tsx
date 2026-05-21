import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import { siteConfig } from "@/lib/constants";
import { Toaster } from "@/components/ui/toaster";

const inter = Inter({
  subsets: ["latin"],
  display: "swap"
});

export const metadata: Metadata = {
  title: {
    default: siteConfig.name,
    template: `%s | ${siteConfig.shortName}`
  },
  description: siteConfig.description,
  applicationName: siteConfig.name,
  metadataBase: new URL(siteConfig.url)
};

export default function RootLayout({
  children
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className={inter.className}>
        {children}
        <Toaster />
      </body>
    </html>
  );
}
