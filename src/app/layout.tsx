import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "4 CAPS IA",
  description: "Application d'IA pour 4 CAPS",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="fr">
      <body className="font-sans antialiased">
        {children}
      </body>
    </html>
  );
}
