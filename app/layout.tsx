import React from "react";
import type { Metadata } from "next";
import { Inter, Fraunces } from "next/font/google";
import "./globals.css";
import { ThemeProvider } from "@/components/theme-provider";
import { PersonaProvider } from "@/app/lib/persona-context";

const inter = Inter({ subsets: ["latin"], variable: "--font-inter" });
const fraunces = Fraunces({
  subsets: ["latin"],
  variable: "--font-fraunces",
  axes: ["opsz"],
});

export const metadata: Metadata = {
  title: "CareNav — Clinical and Financial Triage",
  description:
    "Describe your symptoms in plain language. CareNav weighs urgency, your insurance, and what is actually open right now, then recommends the safest, most affordable next step.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body className={`${inter.variable} ${fraunces.variable} font-sans flex flex-col min-h-screen`}>
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
