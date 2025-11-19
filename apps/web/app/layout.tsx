import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import { ReactScanProvider } from "@/components/react-scan-provider";
import { ThemeProvider } from "@/components/theme-provider";
import "./globals.css";
import "./navbar-scroll-animations.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "InmoApp - Plataforma Inmobiliaria",
  description:
    "Encuentra tu propiedad ideal o gestiona tus inmuebles como agente",
};

export default function RootLayout({
  children,
  auth,
}: Readonly<{
  children: React.ReactNode;
  auth: React.ReactNode;
}>) {
  return (
    <html lang="es" suppressHydrationWarning>
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased`}
      >
        <ReactScanProvider />
        <ThemeProvider
          attribute="class"
          defaultTheme="dark"
          enableSystem
          storageKey="inmoapp-theme"
        >
          {children}
          {auth}
        </ThemeProvider>
      </body>
    </html>
  );
}
