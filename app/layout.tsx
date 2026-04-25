import React from "react";
import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import { ThemeProvider } from "@/components/theme-provider";
import { PersonaProvider } from "@/app/lib/persona-context";

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "CareNav - Clinical and Financial Triage",
  description:
    "Tell us what's wrong. We'll show you the safest, cheapest, fastest place to get care - given your insurance and the time of day.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body className={`${inter.className} flex flex-col h-full`}>
        <ThemeProvider
          attribute="class"
          defaultTheme="light"
          enableSystem
          disableTransitionOnChange
        >
          <PersonaProvider>{children}</PersonaProvider>
        </ThemeProvider>
      </body>
    </html>
  );
}
