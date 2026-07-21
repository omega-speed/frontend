import type { Metadata } from "next";
import { Nunito } from "next/font/google";
import NextTopLoader from "nextjs-toploader";
import { TooltipProvider } from "@/components/ui/tooltip";
import "./globals.css";
import { Toaster } from "sonner";
import { APP_NAME, APP_DESCRIPTION } from "@/lib/config";

// Brand font: Nunito — warm, humanist, highly legible. Keep the --font-sans
// variable name so globals.css picks it up.
const nunito = Nunito({
  variable: "--font-sans",
  subsets: ["latin"],
  weight: ["400", "500", "600", "700", "800"],
});

// Absolute base for OG/Twitter image URLs. Prefers an explicit env var, then the
// Vercel production domain, then a sensible default.
const siteUrl =
  process.env.NEXT_PUBLIC_SITE_URL ||
  (process.env.VERCEL_PROJECT_PRODUCTION_URL &&
    `https://${process.env.VERCEL_PROJECT_PRODUCTION_URL}`) ||
  "http://localhost:3000";

export const metadata: Metadata = {
  metadataBase: new URL(siteUrl),
  title: APP_NAME,
  description: APP_DESCRIPTION,
  openGraph: {
    type: "website",
    siteName: APP_NAME,
    title: APP_NAME,
    description: APP_DESCRIPTION,
    url: siteUrl,
  },
  twitter: {
    card: "summary_large_image",
    title: APP_NAME,
    description: APP_DESCRIPTION,
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className={`${nunito.variable} h-full antialiased`}>
      <body className="min-h-full flex flex-col">
        <NextTopLoader
          color="oklch(0.48 0.16 258)"
          height={2}
          shadow="0 0 8px oklch(0.48 0.16 258 / 0.4)"
          showSpinner={false}
        />
        <TooltipProvider>{children}</TooltipProvider>
        <Toaster
          theme="light"
          toastOptions={{
            classNames: {
              toast:
                "bg-card border border-border text-foreground font-sans rounded-none shadow-none gap-3 !w-96",
              title: "text-sm font-medium",
              description: "text-xs text-muted-foreground",
              icon: "mt-0.5",
              success: "border-l-2 border-l-primary",
              error: "border-l-2 border-l-destructive",
              warning: "border-l-2 border-l-yellow-500",
              info: "border-l-2 border-l-blue-500",
            },
          }}
        />
      </body>
    </html>
  );
}
