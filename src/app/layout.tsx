import type { Metadata } from "next";
import type { ReactNode } from "react";
import "./globals.css";
import { ThemeProvider } from "@/components/ThemeProvider";
import { SiteHeader } from "@/components/SiteHeader";

export const metadata: Metadata = {
  title: { default: "ISTQB for ninjas", template: "%s | ISTQB for ninjas" },
  description: "Focused ISTQB CTFL practice exams with instant, grounded feedback.",
  applicationName: "ISTQB for ninjas",
  keywords: ["ISTQB", "CTFL", "software testing", "practice exam"]
};

export default function RootLayout({ children }: { children: ReactNode }) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body>
        <ThemeProvider>
          <SiteHeader />
          {children}
        </ThemeProvider>
      </body>
    </html>
  );
}
