import { Skeleton } from "@/components/ui/Skeleton";

export default function DashboardSkeleton() {
  return (
    <main className="max-w-4xl mx-auto px-4 py-8 space-y-8">
      {/* Section 1: Bienvenue */}
      <div className="bg-gradient-to-r from-noel-red/10 via-noel-gold/10 to-noel-green/10 p-6 rounded-xl border border-noel-red/20">
        <Skeleton className="h-9 w-64 mb-2" />
        <Skeleton className="h-5 w-48" />
      </div>

      {/* Section 2: Stats Cards */}
      <div className="grid grid-cols-3 gap-4">
        {[1, 2, 3].map((i) => (
          <div
            key={i}
            className="bg-gradient-to-br from-gray-50 to-gray-100 p-6 rounded-xl border border-gray-200 text-center"
          >
            <Skeleton className="h-10 w-10 mx-auto mb-2 rounded-full" />
            <Skeleton className="h-8 w-12 mx-auto mb-1" />
            <Skeleton className="h-4 w-20 mx-auto" />
          </div>
        ))}
      </div>

      {/* Section 3: Activité Récente */}
      <div>
        <div className="flex justify-between items-center mb-4">
          <Skeleton className="h-8 w-48" />
        </div>
        <div className="space-y-3">
          {[1, 2, 3, 4, 5].map((i) => (
            <div
              key={i}
              className="flex gap-4 p-4 rounded-xl border bg-white"
            >
              <Skeleton className="flex-shrink-0 w-12 h-12 rounded-full" />
              <div className="flex-1 min-w-0">
                <Skeleton className="h-5 w-3/4 mb-2" />
                <Skeleton className="h-4 w-1/2 mb-1" />
                <Skeleton className="h-3 w-24" />
              </div>
              <Skeleton className="flex-shrink-0 w-5 h-5" />
            </div>
          ))}
        </div>
      </div>

      {/* Section 4: Raccourcis Rapides */}
      <div>
        <Skeleton className="h-8 w-48 mb-4" />
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          {[1, 2, 3].map((i) => (
            <div
              key={i}
              className="bg-white p-6 rounded-xl border border-gray-200 text-center"
            >
              <Skeleton className="h-12 w-12 mx-auto mb-3 rounded-full" />
              <Skeleton className="h-5 w-32 mx-auto mb-2" />
              <Skeleton className="h-4 w-40 mx-auto" />
            </div>
          ))}
        </div>
      </div>
    </main>
  );
}

