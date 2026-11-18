import type { Metadata } from "next";
import "./globals.css";
import { Nav } from "@/components/Nav";
import { SimulatedBanner } from "@/components/SimulatedBanner";

export const metadata: Metadata = {
  title: "LUZI-style Data & Analytics (simulated)",
  description:
    "Data Engineer case: a Microsoft Fabric-ready data platform for a fragrance manufacturer, with pipelines, data contracts, quality gates and dashboards. Simulated data.",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body className="min-h-screen antialiased">
        <SimulatedBanner />
        <Nav />
        <main className="mx-auto max-w-6xl px-6 py-8">{children}</main>
        <footer className="mx-auto max-w-6xl px-6 pb-10 pt-4 text-xs text-muted-foreground">
          Stack: Python pipeline (pandas, statsmodels) → JSON export → Next.js, React, Recharts. Source and tests are in
          the repository.
        </footer>
      </body>
    </html>
  );
}
