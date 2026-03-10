import { SpeedInsights } from "@vercel/speed-insights/next";
import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { PrimerProvider } from "../src/components/PrimerProvider";
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
    <html lang="en" suppressHydrationWarning>
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
      </head>
      <body>
        <PrimerProvider>
          <header className="app-header">
            <div className="app-header-inner">
              <div style={{ display: "flex", alignItems: "center", gap: "12px", flexShrink: 0 }}>
                <Link href="/" className="app-brand">
                  <Image
                    src="/images/GeeBees_4inchRoundLabel_wBleed+copy.webp"
                    alt="Organizize"
                    width={36}
                    height={36}
                    style={{ borderRadius: "50%", objectFit: "contain" }}
                    priority
                  />
                </Link>
                <Link href="/" className="app-brand-name">
                  Organizize
                </Link>
              </div>

              <nav className="app-nav" aria-label="Primary">
                <Link href="/" className="nav-link">
                  Home
                </Link>
                <Link href="/products" className="nav-link">
                  Products
                </Link>
                <Link href="/intake" className="nav-link">
                  Intake
                </Link>
                <Link href="/outtake" className="nav-link">
                  Outtake
                </Link>
                <Link href="/inventory" className="nav-link">
                  Inventory
                </Link>
                <Link href="/history" className="nav-link">
                  History
                </Link>
                <a href="/api/reports/inventory" className="nav-link">
                  Export CSV
                </a>
                {isAdmin && (
                  <Link href="/admin/users" className="nav-link">
                    Admin
                  </Link>
                )}
                <span className="nav-divider" aria-hidden="true" />
                {isLoggedIn ? (
                  <LogoutButton />
                ) : (
                  <Link href="/login" className="nav-link nav-link-signin">
                    Sign In
                  </Link>
                )}
              </nav>
            </div>
          </header>

          <div className="page-content">{children}</div>

          {showSpeedInsights ? <SpeedInsights /> : null}
        </PrimerProvider>
      </body>
    </html>
  );
}
