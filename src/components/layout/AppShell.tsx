"use client";

import { usePathname } from "next/navigation";
import Sidebar from "./Sidebar";
import BottomNav from "./BottomNav";

export default function AppShell({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const isAuthPage = pathname?.startsWith("/auth") || pathname === "/";

  if (isAuthPage) {
    return <>{children}</>;
  }

  return (
    <div className="min-h-screen bg-noel-cream">
      <Sidebar />
      
      <div className="md:pl-64 pb-16 md:pb-0 min-h-screen transition-all duration-300">
        {children}
      </div>

      <BottomNav />
    </div>
  );
}

