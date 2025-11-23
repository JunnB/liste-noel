import type { Metadata } from "next";
import "./globals.css";
import { ToastContainer } from "@/components/Toast";
import AppShell from "@/components/layout/AppShell";

export const metadata: Metadata = {
  title: "Liste de Noël Familiale",
  description: "Gérez vos listes de cadeaux de Noël en famille",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="fr">
      <body>
        <AppShell>
          {children}
        </AppShell>
        <ToastContainer />
      </body>
    </html>
  );
}
