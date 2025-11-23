"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useState } from "react";

interface HeaderProps {
  user?: {
    name: string;
    email: string;
  };
}

export default function Header({ user }: HeaderProps) {
  const [menuOpen, setMenuOpen] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const pathname = usePathname();

  const handleLogout = async () => {
    await fetch("/api/auth/sign-out", { method: "POST" });
    window.location.href = "/";
  };

  const isActive = (path: string) => {
    if (path === "/dashboard" && pathname === "/dashboard") return true;
    if (path !== "/dashboard" && pathname.startsWith(path)) return true;
    return false;
  };

  return (
    <header className="bg-white border-b border-gray-200 sticky top-0 z-30 md:hidden">
      <div className="px-4 py-4 flex items-center justify-between">
        <Link href={user ? "/dashboard" : "/"} className="flex items-center gap-2">
          <span className="text-2xl">🎄</span>
          <h1 className="text-xl font-bold text-noel-red">
            Liste de cadeaux
          </h1>
        </Link>

        {user && (
          <div className="flex items-center gap-2">
            {/* Menu Hamburger (Mobile uniquement) */}
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="p-2 rounded-lg hover:bg-gray-100 md:hidden"
              aria-label="Menu"
            >
              <svg
                className="w-6 h-6 text-noel-text"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                {mobileMenuOpen ? (
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M6 18L18 6M6 6l12 12"
                  />
                ) : (
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M4 6h16M4 12h16M4 18h16"
                  />
                )}
              </svg>
            </button>

            {/* User Menu (Desktop) */}
            <div className="relative hidden md:block">
              <button
                onClick={() => setMenuOpen(!menuOpen)}
                className="flex items-center gap-2 px-3 py-2 rounded-lg hover:bg-gray-100"
              >
                <span className="text-sm font-medium text-noel-text">{user.name}</span>
                <span className="text-xs">▼</span>
              </button>

              {menuOpen && (
                <div className="absolute right-0 mt-2 w-48 bg-white rounded-lg shadow-lg border border-gray-200">
                  <button
                    onClick={handleLogout}
                    className="w-full text-left px-4 py-2 hover:bg-gray-100 text-noel-text text-sm"
                  >
                    Se déconnecter
                  </button>
                </div>
              )}
            </div>
          </div>
        )}
      </div>

      {/* Menu Mobile Déroulant */}
      {user && mobileMenuOpen && (
        <div className="border-t border-gray-200 bg-white md:hidden">
          <nav className="px-4 py-4 space-y-2">
            <Link
              href="/dashboard"
              onClick={() => setMobileMenuOpen(false)}
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
              onClick={() => setMobileMenuOpen(false)}
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
              onClick={() => setMobileMenuOpen(false)}
              className={`flex items-center gap-3 px-4 py-3 rounded-lg transition-colors ${
                isActive("/contributions")
                  ? "bg-noel-red/10 text-noel-red font-medium"
                  : "text-noel-text hover:bg-gray-50"
              }`}
            >
              <span className="text-xl">💰</span>
              Contributions
            </Link>

            <div className="pt-2 border-t border-gray-100">
              <button
                onClick={() => {
                  setMobileMenuOpen(false);
                  handleLogout();
                }}
                className="flex items-center gap-3 px-4 py-3 w-full rounded-lg text-gray-500 hover:bg-gray-50 hover:text-red-600 transition-colors"
              >
                <span className="text-xl">🚪</span>
                Se déconnecter
              </button>
            </div>
          </nav>
        </div>
      )}
    </header>
  );
}
