"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

const links: { href: string; label: string; exact?: boolean }[] = [
  { href: "/", label: "Home", exact: true },
  { href: "/products", label: "Products" },
  { href: "/intake", label: "Intake" },
  { href: "/outtake", label: "Outtake" },
  { href: "/inventory", label: "Inventory" },
  { href: "/history", label: "History" },
];

export function NavLinks() {
  const pathname = usePathname();

  return (
    <>
      {links.map(({ href, label, exact }) => {
        const isActive = exact ? pathname === href : pathname.startsWith(href);
        return (
          <Link
            key={href}
            href={href}
            className={`nav-link${isActive ? " nav-link-active" : ""}`}
          >
            {label}
          </Link>
        );
      })}
    </>
  );
}
