export default function Home() {
  return (
    <main className="min-h-screen flex items-center justify-center bg-noel-cream">
      <div className="text-center">
        <h1 className="text-4xl font-bold text-noel-red mb-4">
          🎄 Liste de Noël Familiale
        </h1>
        <p className="text-noel-text mb-8">
          Gérez vos listes de cadeaux avec votre famille
        </p>
        <div className="flex gap-4 justify-center">
          <a href="/auth/login" className="btn-primary">
            Se connecter
          </a>
          <a href="/auth/register" className="btn-secondary">
            S'inscrire
          </a>
        </div>
      </div>
    </main>
  );
}
