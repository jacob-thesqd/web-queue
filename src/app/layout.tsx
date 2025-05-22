import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import { siteConfig } from "@/config/site";
import { globalConfig } from "@/config/globalConfig";
import Image from "next/image";

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
        <div className="fixed top-4 right-4 z-50">
          <Image 
            src="/squad-logo.svg" 
            alt="Squad Logo" 
            width={48} 
            height={48} 
            priority
          />
        </div>
        {children}
      </body>
    </html>
  );
}
