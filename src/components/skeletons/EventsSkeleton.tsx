import { Skeleton } from "@/components/ui/Skeleton";

export default function EventsSkeleton() {
  return (
    <div className="min-h-screen bg-noel-cream">
      <main className="max-w-4xl mx-auto px-4 py-8">
        {/* Header */}
        <div className="mb-8">
          <Skeleton className="h-9 w-64 mb-2" />
          <Skeleton className="h-5 w-48" />
        </div>

        {/* Boutons d'action */}
        <div className="flex gap-4 mb-8">
          <Skeleton className="h-11 flex-1 rounded-lg" />
          <Skeleton className="h-11 flex-1 rounded-lg" />
        </div>

        {/* Grille d'événements */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {[1, 2, 3, 4].map((i) => (
            <div
              key={i}
              className="bg-white p-6 rounded-xl shadow-sm border border-gray-100"
            >
              <div className="flex justify-between items-start mb-3">
                <Skeleton className="h-7 w-40" />
                <Skeleton className="h-5 w-16 rounded" />
              </div>
              <Skeleton className="h-4 w-full mb-2" />
              <Skeleton className="h-4 w-3/4 mb-3" />
              <Skeleton className="h-3 w-32 mb-3" />
              <Skeleton className="h-9 w-full rounded-lg" />
            </div>
          ))}
        </div>
      </main>
    </div>
  );
}

