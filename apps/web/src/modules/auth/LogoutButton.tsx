"use client";

import { useRouter } from "next/navigation";

export function LogoutButton() {
  const router = useRouter();

  async function handleLogout() {
    await fetch("/api/auth/logout", { method: "POST" });
    router.push("/login");
    router.refresh();
  }

  return (
    <button
      type="button"
      onClick={handleLogout}
      className="px-3 py-1.5 text-white/75 hover:text-amber text-sm tracking-wide transition-colors cursor-pointer bg-transparent border-0 font-serif"
    >
      Sign Out
    </button>
  );
}
