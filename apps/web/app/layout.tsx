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
        <script src="https://cdn.tailwindcss.com" />
        <script
          // biome-ignore lint/security/noDangerouslySetInnerHtml: static Tailwind CDN config, no user input
          dangerouslySetInnerHTML={{
            __html: `tailwind.config={theme:{extend:{colors:{charcoal:'#1c252c',amber:'#fdc740',cream:'#f9f7f4'},fontFamily:{serif:['"Cormorant Infant"','Georgia','serif']}}}}`,
          }}
        />
      </head>
      <body className="bg-cream font-serif text-charcoal min-h-screen">
        <header className="sticky top-0 z-50 bg-charcoal shadow-lg">
          <div className="max-w-screen-xl mx-auto px-6 py-3 flex flex-wrap items-center justify-between gap-x-8 gap-y-2">
            <div className="flex items-center gap-3 flex-shrink-0">
              <Link href="/" className="flex items-center">
                <Image
                  src="/images/GeeBees_4inchRoundLabel_wBleed+copy.webp"
                  alt="Organizize"
                  width={36}
                  height={36}
                  className="rounded-full object-contain"
                  priority
                />
              </Link>
              <Link
                href="/"
                className="text-amber font-bold tracking-widest uppercase text-sm no-underline hover:opacity-80 transition-opacity"
              >
                Organizize
              </Link>
            </div>

            <nav className="flex flex-wrap items-center gap-1" aria-label="Primary">
              <Link
                href="/"
                className="px-3 py-1.5 text-white/75 hover:text-amber text-sm tracking-wide transition-colors no-underline"
              >
                Home
              </Link>
              <Link
                href="/products"
                className="px-3 py-1.5 text-white/75 hover:text-amber text-sm tracking-wide transition-colors no-underline"
              >
                Products
              </Link>
              <Link
                href="/intake"
                className="px-3 py-1.5 text-white/75 hover:text-amber text-sm tracking-wide transition-colors no-underline"
              >
                Intake
              </Link>
              <Link
                href="/outtake"
                className="px-3 py-1.5 text-white/75 hover:text-amber text-sm tracking-wide transition-colors no-underline"
              >
                Outtake
              </Link>
              <Link
                href="/inventory"
                className="px-3 py-1.5 text-white/75 hover:text-amber text-sm tracking-wide transition-colors no-underline"
              >
                Inventory
              </Link>
              <Link
                href="/history"
                className="px-3 py-1.5 text-white/75 hover:text-amber text-sm tracking-wide transition-colors no-underline"
              >
                History
              </Link>
              <a
                href="/api/reports/inventory"
                className="px-3 py-1.5 text-white/75 hover:text-amber text-sm tracking-wide transition-colors no-underline"
              >
                Export CSV
              </a>
              {isAdmin && (
                <Link
                  href="/admin/users"
                  className="px-3 py-1.5 text-white/75 hover:text-amber text-sm tracking-wide transition-colors no-underline"
                >
                  Admin
                </Link>
              )}
              <div className="w-px h-4 bg-white/20 mx-1" />
              {isLoggedIn ? (
                <LogoutButton />
              ) : (
                <Link
                  href="/login"
                  className="px-3 py-1.5 border border-amber/50 text-amber hover:bg-amber hover:text-charcoal text-sm tracking-wide transition-colors no-underline rounded-sm"
                >
                  Sign In
                </Link>
              )}
            </nav>
          </div>
        </header>

        <div className="max-w-screen-xl mx-auto px-6 py-8">{children}</div>

        {showSpeedInsights ? <SpeedInsights /> : null}
      </body>
    </html>
  );
}
