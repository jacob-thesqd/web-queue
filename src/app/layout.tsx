import type { Metadata, Viewport } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import { siteConfig } from "@/config/site";
import { globalConfig } from "@/config/globalConfig";
import Image from "next/image";
import { Suspense } from "react";

import { LayoutProvider } from "@/hooks/use-layout";
import { CustomScrollbarProvider } from "@/components/providers/CustomScrollbarProvider";
import { ServiceWorkerProvider } from "@/components/providers/ServiceWorkerProvider";
import { LoadingProvider } from "@/components/providers/LoadingProvider";
import { Analytics } from "@vercel/analytics/next" 

const inter = Inter({ 
  subsets: ["latin"], 
  variable: "--font-sans",
  display: 'swap',
  preload: true
});

export const metadata: Metadata = {
  title: globalConfig.siteTitle,
  description: siteConfig.description,
};

export const viewport: Viewport = {
  width: 'device-width',
  initialScale: 1,
};

// Optimized Logo Component - renders immediately without waiting for providers
function ImmediateLogo() {
  return (
    <div className="fixed top-4 right-4 z-50">
      <Image 
        src="/squad-logo.svg" 
        alt="Squad Logo" 
        width={70} 
        height={70} 
        priority
        sizes="70px"
        style={{ 
          width: '70px', 
          height: '70px',
          display: 'block'
        }}
        // Add inline loading optimization
        decoding="sync"
        fetchPriority="high"
      />
    </div>
  );
}

function OptimizedProviders({ children }: { children: React.ReactNode }) {
  return (
    <Suspense fallback={null}>
      <LoadingProvider>
        <ServiceWorkerProvider />
        <CustomScrollbarProvider />
        <LayoutProvider>
          {children}
        </LayoutProvider>
      </LoadingProvider>
    </Suspense>
  );
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <head>
        {/* Critical resource preloads - higher priority for squad logo */}
        <link rel="preload" href="/squad-logo.svg" as="image" type="image/svg+xml" fetchPriority="high" />
        <link rel="preload" href="/_next/static/css/app/layout.css" as="style" />
        
        {/* Preload critical component CSS */}
        <link rel="modulepreload" href="/_next/static/chunks/app/page.js" />
        <link rel="preload" href="/_next/static/chunks/webpack.js" as="script" />
        
        {/* DNS prefetch for external resources */}
        <link rel="preconnect" href="https://assets.calendly.com" crossOrigin="" />
        <link rel="dns-prefetch" href="https://assets.calendly.com" />
        <link rel="dns-prefetch" href="https://vercel.live" />
        
        {/* Favicon */}
        <link rel="icon" href={globalConfig.faviconPath} />
        
        {/* Critical CSS inline - include logo styles */}
        <style dangerouslySetInnerHTML={{
          __html: `
            .fixed-dot-grid-background {
              opacity: 1;
            }
            .min-h-screen {
              min-height: 100vh;
            }
            .bg-transparent {
              background-color: transparent;
            }
            .text-center {
              text-align: center;
            }
            .text-gray-500 {
              color: rgb(107 114 128);
            }
            .py-8 {
              padding-top: 2rem;
              padding-bottom: 2rem;
            }
            /* Critical styles for logo positioning */
            .fixed {
              position: fixed;
            }
            .top-4 {
              top: 1rem;
            }
            .right-4 {
              right: 1rem;
            }
            .z-50 {
              z-index: 50;
            }
          `
        }} />
        
        {/* Non-critical scripts - defer completely */}
        <script 
          type="text/javascript" 
          src="https://assets.calendly.com/assets/external/widget.js" 
          async 
          defer
        />
      </head>
      <body className={`min-h-screen bg-background font-sans antialiased ${inter.variable}`}>
        {/* Fixed background element - renders immediately 
        <div 
        className="absolute inset-0 bg-cover bg-center bg-no-repeat opacity-10"
        style={{
          backgroundImage: 'url(/bg-gradient-2.jpeg)'
        }}
      />*/}
      {/* Dot grid overlay */}
      <div className="fixed-dot-grid-background" />
        
        {/* Logo rendered immediately outside of any Suspense boundary */}
        <ImmediateLogo />
        
        {/* Main content with optimized providers */}
        <OptimizedProviders>
          {children}
        </OptimizedProviders>
        
        {/* Analytics at the end to not block rendering */}
        <Analytics />
      </body>
    </html>
  );
}
