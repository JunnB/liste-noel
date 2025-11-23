import { Skeleton } from "@/components/ui/Skeleton";

export default function EventDetailSkeleton() {
  return (
    <main className="px-4 py-8">
      <div className="max-w-4xl mx-auto">
        {/* Header simple */}
        <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100 mb-6">
          <div className="flex justify-between items-start mb-4">
            <div className="flex-1">
              <Skeleton className="h-8 w-64 mb-2" />
              <Skeleton className="h-4 w-96 mb-3" />
              <Skeleton className="h-12 w-48 rounded-lg" />
            </div>
            <Skeleton className="h-10 w-28 rounded-lg" />
          </div>
        </div>

        {/* Tabs Navigation */}
        <div className="flex p-1 bg-gray-100 rounded-xl mb-6">
          <Skeleton className="flex-1 h-12 rounded-lg mr-1" />
          <Skeleton className="flex-1 h-12 rounded-lg" />
        </div>

        {/* Tab Content - Ma Liste */}
        <div className="space-y-4">
          {/* Bouton ajouter */}
          <Skeleton className="h-12 w-full rounded-lg" />

          {/* Items */}
          {[1, 2, 3].map((i) => (
            <div
              key={i}
              className="bg-white p-5 rounded-xl shadow-sm border border-gray-100"
            >
              <div className="flex justify-between items-start mb-3">
                <div className="flex-1">
                  <Skeleton className="h-6 w-48 mb-2" />
                  <Skeleton className="h-4 w-full mb-1" />
                  <Skeleton className="h-4 w-3/4" />
                </div>
                <div className="flex gap-2">
                  <Skeleton className="h-8 w-20 rounded-lg" />
                  <Skeleton className="h-8 w-8 rounded-lg" />
                </div>
              </div>

              <div className="bg-gray-50 p-3 rounded-lg">
                <Skeleton className="h-4 w-32 mb-2" />
                <div className="flex gap-2">
                  <Skeleton className="h-8 w-24 rounded-full" />
                  <Skeleton className="h-8 w-24 rounded-full" />
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </main>
  );
}

