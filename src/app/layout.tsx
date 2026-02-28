import type { Metadata } from "next";
import { Plus_Jakarta_Sans } from "next/font/google";
import "./globals.css";

const plusJakarta = Plus_Jakarta_Sans({
  variable: "--font-plus-jakarta",
  subsets: ["latin"],
  display: "swap",
});

export const metadata: Metadata = {
  title: "Sawala Bumi — Konsultasi Arsitek 90 Menit",
  description:
    "Konsultasi langsung dengan arsitek berpengalaman. Dapatkan kejelasan desain, budget, dan langkah awal untuk proyek rumah impian Anda dalam 90 menit. Rp 750.000.",
  keywords: [
    "konsultasi arsitek",
    "arsitek online",
    "desain rumah",
    "konsultasi desain",
    "bangun rumah",
  ],
  openGraph: {
    title: "Sawala Bumi — Konsultasi Arsitek 90 Menit",
    description:
      "Konsultasi langsung dengan arsitek berpengalaman. Dapatkan kejelasan untuk proyek rumah impian Anda.",
    type: "website",
    locale: "id_ID",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="id">
      <body className={`${plusJakarta.variable} antialiased`}>{children}</body>
    </html>
  );
}
