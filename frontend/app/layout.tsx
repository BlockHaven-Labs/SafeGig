import type React from "react";
import type { Metadata } from "next";
import { Space_Grotesk, DM_Sans } from "next/font/google";
import { Suspense } from "react";
import "./globals.css";
import { WalletProvider } from "@/lib/wallet-context";
import { GigProvider } from "@/lib/gig-context";
import { ThemeProvider } from "@/components/theme-provider";

const spaceGrotesk = Space_Grotesk({
  subsets: ["latin"],
  display: "swap",
  variable: "--font-space-grotesk",
});

const dmSans = DM_Sans({
  subsets: ["latin"],
  display: "swap",
  variable: "--font-dm-sans",
});

export const metadata: Metadata = {
  title: "SafeGig - Trustless Freelance Escrow Platform",
  description:
    "Secure blockchain-based escrow for freelancers and clients. Get paid safely with smart contracts.",
  generator: "safeGig.app",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body className={`font-sans ${spaceGrotesk.variable} ${dmSans.variable}`}>
        <ThemeProvider attribute="class" defaultTheme="light" enableSystem>
          <WalletProvider>
            <GigProvider>
              <Suspense fallback={null}>{children}</Suspense>
            </GigProvider>
          </WalletProvider>
        </ThemeProvider>
      </body>
    </html>
  );
}
