import Link from "next/link";

export default function NotFound() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-noel-cream px-4">
      <div className="text-center card max-w-md">
        <h2 className="text-4xl font-bold text-noel-red mb-2">404</h2>
        <p className="text-noel-text mb-4">Page non trouvée</p>
        <p className="text-sm text-gray-600 mb-6">
          La page que vous cherchez n'existe pas ou a été supprimée.
        </p>
        <Link href="/dashboard" className="btn-primary inline-block">
          Retour à l'accueil
        </Link>
      </div>
    </div>
  );
}
