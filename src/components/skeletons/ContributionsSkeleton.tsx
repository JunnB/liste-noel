import { Skeleton } from "@/components/ui/Skeleton";

export default function ContributionsSkeleton() {
  return (
    <div className="min-h-screen bg-noel-cream pb-20">
      <main className="max-w-4xl mx-auto px-4 py-8">
        {/* Lien retour */}
        <Skeleton className="h-4 w-24 mb-4" />

        {/* Titre */}
        <Skeleton className="h-9 w-64 mb-2" />
        <Skeleton className="h-5 w-96 mb-8" />

        {/* Onglets */}
        <div className="flex gap-2 mb-6 overflow-x-auto">
          {[1, 2, 3].map((i) => (
            <Skeleton key={i} className="h-12 w-48 rounded-lg" />
          ))}
        </div>

        {/* Filtre par événement */}
        <div className="mb-6">
          <Skeleton className="h-5 w-40 mb-2" />
          <Skeleton className="h-12 w-full rounded-lg" />
        </div>

        {/* Liste de contributions */}
        <div className="space-y-4">
          {[1, 2, 3, 4].map((i) => (
            <div
              key={i}
              className="bg-white p-5 rounded-xl shadow-sm border border-gray-100"
            >
              <div className="flex justify-between items-start mb-3">
                <div className="flex-1">
                  <Skeleton className="h-6 w-48 mb-2" />
                  <Skeleton className="h-4 w-40 mb-1" />
                  <Skeleton className="h-3 w-32" />
                </div>
                <div className="flex gap-2">
                  <Skeleton className="h-8 w-20 rounded-lg" />
                  <Skeleton className="h-8 w-8 rounded-lg" />
                </div>
              </div>

              <div className="bg-gray-50 p-3 rounded-lg">
                <div className="flex gap-4">
                  <Skeleton className="h-5 w-32" />
                  <Skeleton className="h-5 w-24" />
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Info box */}
        <div className="mt-12 bg-white p-6 rounded-xl border border-noel-green/20">
          <Skeleton className="h-6 w-48 mb-2" />
          <Skeleton className="h-4 w-full mb-2" />
          <Skeleton className="h-4 w-full mb-2" />
          <Skeleton className="h-4 w-3/4" />
        </div>
      </main>
    </div>
  );
}

