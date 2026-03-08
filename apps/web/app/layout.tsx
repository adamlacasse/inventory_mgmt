import { SpeedInsights } from "@vercel/speed-insights/next";
import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { LogoutButton } from "../src/modules/auth/LogoutButton";
import { getSession } from "../src/server/auth";
import { shouldRenderSpeedInsights } from "../src/server/observability";
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
  const isAdmin = session.user?.role === "admin";
  const showSpeedInsights = shouldRenderSpeedInsights();

  return (
    <html lang="en">
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
      </head>
      <body>
        <header className="app-header">
          <div className="app-header__brand">
            <Link href="/" className="app-header__logo-link">
              <Image
                src="/images/GeeBees_4inchRoundLabel_wBleed+copy.webp"
                alt="Organizize"
                width={40}
                height={40}
                className="app-header__logo"
                priority
              />
            </Link>
            <Link href="/">Organizize</Link>
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
            {isAdmin && (
              <Link className="app-nav__link" href="/admin/users">
                Admin
              </Link>
            )}
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
        {showSpeedInsights ? <SpeedInsights /> : null}
      </body>
    </html>
  );
}
