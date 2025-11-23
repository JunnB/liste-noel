"use client";

import { useEffect } from "react";
import Link from "next/link";

export default function Error({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error(error);
  }, [error]);

  return (
    <div className="min-h-screen flex items-center justify-center bg-noel-cream px-4">
      <div className="text-center card max-w-md">
        <h2 className="text-2xl font-bold text-noel-red mb-2">
          ⚠️ Oups! Une erreur s'est produite
        </h2>
        <p className="text-noel-text mb-4">{error.message}</p>
        <div className="flex gap-3">
          <button onClick={() => reset()} className="btn-primary flex-1">
            Réessayer
          </button>
          <Link href="/dashboard" className="btn-secondary flex-1">
            Accueil
          </Link>
        </div>
      </div>
    </div>
  );
}
