import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Cannabis Inventory",
  description: "Inventory management scaffold",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}
