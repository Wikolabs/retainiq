import type { Metadata } from "next";
import { Lora, Nunito } from "next/font/google";
import "./globals.css";

const lora = Lora({ subsets: ["latin"], variable: "--font-display", display: "swap" });
const nunito = Nunito({ subsets: ["latin"], variable: "--font-body", display: "swap" });

export const metadata: Metadata = {
  title: "RetainIQ — 75% du churn détecté avant qu'il se produise",
  description: "Monitoring comportemental continu, scoring churn IA et séquences de réengagement personnalisées.",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="fr" className={`${lora.variable} ${nunito.variable}`}>
      <body style={{ fontFamily: "var(--font-body)", background: "#fffbeb" }}>{children}</body>
    </html>
  );
}
