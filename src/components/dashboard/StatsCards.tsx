interface StatsCardsProps {
  eventsCount: number;
  contributionsCount: number;
  itemsCount: number;
}

export default function StatsCards({
  eventsCount,
  contributionsCount,
  itemsCount,
}: StatsCardsProps) {
  return (
    <div className="grid grid-cols-3 gap-4">
      <div className="bg-gradient-to-br from-noel-green/10 to-emerald-50 p-6 rounded-xl border border-noel-green/20 text-center">
        <div className="text-4xl mb-2">🎁</div>
        <div className="text-2xl font-bold text-noel-text mb-1">{eventsCount}</div>
        <div className="text-sm text-gray-600">
          {eventsCount > 1 ? "Événements" : "Événement"}
        </div>
      </div>

      <div className="bg-gradient-to-br from-noel-gold/10 to-amber-50 p-6 rounded-xl border border-noel-gold/20 text-center">
        <div className="text-4xl mb-2">💰</div>
        <div className="text-2xl font-bold text-noel-text mb-1">{contributionsCount}</div>
        <div className="text-sm text-gray-600">
          {contributionsCount > 1 ? "Contributions" : "Contribution"}
        </div>
      </div>

      <div className="bg-gradient-to-br from-noel-red/10 to-red-50 p-6 rounded-xl border border-noel-red/20 text-center">
        <div className="text-4xl mb-2">✨</div>
        <div className="text-2xl font-bold text-noel-text mb-1">{itemsCount}</div>
        <div className="text-sm text-gray-600">
          {itemsCount > 1 ? "Cadeaux" : "Cadeau"}
        </div>
      </div>
    </div>
  );
}

