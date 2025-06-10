import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import { siteConfig } from "@/config/site";
import { globalConfig } from "@/config/globalConfig";
import Image from "next/image";

import { LayoutProvider } from "@/hooks/use-layout";
import { CustomScrollbarProvider } from "@/components/providers/CustomScrollbarProvider";
import { Analytics } from "@vercel/analytics/next" 

const inter = Inter({ subsets: ["latin"], variable: "--font-sans" });

export const metadata: Metadata = {
  title: globalConfig.siteTitle,
  description: siteConfig.description,
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <head>
        <link rel="icon" href={globalConfig.faviconPath} />
        <script type="text/javascript" src="https://assets.calendly.com/assets/external/widget.js" async></script>
      </head>
      <body className="min-h-screen bg-background font-sans antialiased">
        <CustomScrollbarProvider />
        <div className="fixed-dot-grid-background" />
        <LayoutProvider>
          <div className="fixed top-4 right-4 z-50">
            <Image 
              src="/squad-logo.svg" 
              alt="Squad Logo" 
              width={70} 
              height={70} 
              priority
            />
          </div>
          {children}
        </LayoutProvider>
        <Analytics />
      </body>
    </html>
  );
}
