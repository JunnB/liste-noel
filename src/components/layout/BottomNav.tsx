"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

export default function BottomNav() {
  const pathname = usePathname();

  const isActive = (path: string) => {
    if (path === "/dashboard" && pathname === "/dashboard") return true;
    if (path !== "/dashboard" && pathname.startsWith(path)) return true;
    return false;
  };

  return (
    <nav className="md:hidden fixed bottom-0 left-0 right-0 bg-white border-t border-gray-200 z-20 pb-safe">
      <div className="flex justify-around items-center h-16">
        <Link
          href="/dashboard"
          className={`flex flex-col items-center justify-center w-full h-full space-y-1 ${
            isActive("/dashboard") ? "text-noel-red" : "text-gray-500"
          }`}
        >
          <span className="text-2xl">🏠</span>
          <span className="text-xs font-medium">Accueil</span>
        </Link>

        <Link
          href="/events"
          className={`flex flex-col items-center justify-center w-full h-full space-y-1 ${
            isActive("/events") ? "text-noel-red" : "text-gray-500"
          }`}
        >
          <span className="text-2xl">🎁</span>
          <span className="text-xs font-medium">Événements</span>
        </Link>

        <Link
          href="/contributions"
          className={`flex flex-col items-center justify-center w-full h-full space-y-1 ${
            isActive("/contributions") ? "text-noel-red" : "text-gray-500"
          }`}
        >
          <span className="text-2xl">💰</span>
          <span className="text-xs font-medium">Contributions</span>
        </Link>
      </div>
    </nav>
  );
}

