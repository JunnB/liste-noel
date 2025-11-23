"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

export default function Sidebar() {
  const pathname = usePathname();

  const isActive = (path: string) => {
    if (path === "/dashboard" && pathname === "/dashboard") return true;
    if (path !== "/dashboard" && pathname.startsWith(path)) return true;
    return false;
  };

  const handleLogout = async () => {
    await fetch("/api/auth/sign-out", { method: "POST" });
    window.location.href = "/auth/login";
  };

  return (
    <aside className="hidden md:flex flex-col w-64 bg-white border-r border-gray-200 h-screen fixed left-0 top-0 z-20">
      <div className="p-6 border-b border-gray-100">
        <Link href="/dashboard" className="flex items-center gap-2">
          <span className="text-2xl">🎄</span>
          <h1 className="text-xl font-bold text-noel-red">Liste de cadeaux</h1>
        </Link>
      </div>

      <nav className="flex-1 overflow-y-auto py-6 px-4 space-y-2">
        <Link
          href="/dashboard"
          className={`flex items-center gap-3 px-4 py-3 rounded-lg transition-colors ${
            isActive("/dashboard")
              ? "bg-noel-red/10 text-noel-red font-medium"
              : "text-noel-text hover:bg-gray-50"
          }`}
        >
          <span className="text-xl">🏠</span>
          Accueil
        </Link>

        <Link
          href="/events"
          className={`flex items-center gap-3 px-4 py-3 rounded-lg transition-colors ${
            isActive("/events")
              ? "bg-noel-red/10 text-noel-red font-medium"
              : "text-noel-text hover:bg-gray-50"
          }`}
        >
          <span className="text-xl">🎁</span>
          Mes Événements
        </Link>

        <Link
          href="/contributions"
          className={`flex items-center gap-3 px-4 py-3 rounded-lg transition-colors ${
            isActive("/contributions")
              ? "bg-noel-red/10 text-noel-red font-medium"
              : "text-noel-text hover:bg-gray-50"
          }`}
        >
          <span className="text-xl">💰</span>
          Contributions
        </Link>
      </nav>

      <div className="p-4 border-t border-gray-100">
        <button
          onClick={handleLogout}
          className="flex items-center gap-3 px-4 py-3 w-full rounded-lg text-gray-500 hover:bg-gray-50 hover:text-red-600 transition-colors"
        >
          <span className="text-xl">🚪</span>
          Se déconnecter
        </button>
      </div>
    </aside>
  );
}

