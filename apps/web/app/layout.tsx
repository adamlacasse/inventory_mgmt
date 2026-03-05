import { SpeedInsights } from "@vercel/speed-insights/next";
import type { Metadata } from "next";
import Link from "next/link";
import { LogoutButton } from "../src/modules/auth/LogoutButton";
import { getSession } from "../src/server/auth";
import "./globals.css";

export const metadata: Metadata = {
  title: "Organizize",
  description:
    "Organizize inventory management MVP for intake, outtake, inventory, and audit history",
};

export default async function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const session = await getSession();
  const isLoggedIn = !!session.user;

  return (
    <html lang="en">
      <body>
        <header className="app-header">
          <div className="app-header__brand">
            <Link href="/">Organizize</Link>
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
            {isLoggedIn ? (
              <LogoutButton />
            ) : (
              <Link className="app-nav__link" href="/login">
                Sign In
              </Link>
            )}
          </nav>
        </header>
        {children}
        <SpeedInsights />
      </body>
    </html>
  );
}
