import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Cannabis Inventory",
  description: "Inventory management MVP for intake, outtake, inventory, and audit history",
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
