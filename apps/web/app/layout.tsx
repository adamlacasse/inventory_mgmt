import type { Metadata } from "next";
import Link from "next/link";
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
      <body>
        <header className="app-header">
          <div className="app-header__brand">
            <Link href="/">Cannabis Inventory</Link>
            <span className="app-header__tag">MVP</span>
          </div>
          <nav className="app-nav" aria-label="Primary">
            <Link className="app-nav__link" href="/">
              Home
            </Link>
            <Link className="app-nav__link" href="/products">
              Products
            </Link>
            <Link className="app-nav__link" href="/intake">
              Intake
            </Link>
            <Link className="app-nav__link" href="/outtake">
              Outtake
            </Link>
            <Link className="app-nav__link" href="/inventory">
              Inventory
            </Link>
            <Link className="app-nav__link" href="/history">
              History
            </Link>
            <a className="app-nav__link" href="/api/reports/inventory">
              Export CSV
            </a>
          </nav>
        </header>
        {children}
      </body>
    </html>
  );
}
