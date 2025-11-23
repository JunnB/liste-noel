"use client";

interface ContributionStatusBadgeProps {
  totalPrice?: number;
  contributed: number;
  contributorsCount: number;
}

export default function ContributionStatusBadge({
  totalPrice,
  contributed,
  contributorsCount,
}: ContributionStatusBadgeProps) {
  // Calculer le pourcentage
  const percent = totalPrice && totalPrice > 0 
    ? Math.min((contributed / totalPrice) * 100, 100) 
    : 0;

  // Déterminer le statut
  let status: "untouched" | "partial" | "completed";
  let statusText: string;
  let statusColor: string;
  let badgeClasses: string;
  let icon: string;
  let progressColor: string;

  if (contributorsCount === 0) {
    status = "untouched";
    statusText = "Pas encore pris";
    statusColor = "text-gray-600";
    badgeClasses = "bg-gray-100 border-gray-200";
    icon = "○";
    progressColor = "bg-gray-300";
  } else if (totalPrice && contributed >= totalPrice) {
    status = "completed";
    statusText = "Financé";
    statusColor = "text-green-700";
    badgeClasses = "bg-green-100 border-green-300";
    icon = "✓";
    progressColor = "bg-gradient-to-r from-green-500 to-green-600";
  } else {
    status = "partial";
    statusText = "En cours";
    statusColor = "text-orange-700";
    badgeClasses = "bg-orange-100 border-orange-300";
    icon = "⏳";
    progressColor = "bg-gradient-to-r from-orange-400 to-orange-500";
  }

  // Si pas de prix total, afficher uniquement le badge
  if (!totalPrice || totalPrice === 0) {
    return (
      <div
        className={`inline-flex items-center gap-2 px-3 py-1.5 rounded-full border ${badgeClasses} ${statusColor} text-xs font-bold`}
      >
        <span>{icon}</span>
        <span>{statusText}</span>
      </div>
    );
  }

  // Sinon, afficher barre de progression avec badge intégré
  return (
    <div className="space-y-2">
      {/* Header: Badge + Montants */}
      <div className="flex justify-between items-center">
        <div
          className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full border ${badgeClasses} ${statusColor} text-xs font-bold`}
        >
          <span>{icon}</span>
          <span>{statusText}</span>
        </div>
        <div className="text-xs font-bold text-gray-700">
          {contributed.toFixed(0)}€ / {totalPrice.toFixed(0)}€
        </div>
      </div>

      {/* Barre de progression */}
      <div className="w-full bg-gray-200 rounded-full h-2.5 overflow-hidden">
        <div
          className={`h-full rounded-full transition-all duration-500 ${progressColor}`}
          style={{ width: `${percent}%` }}
        />
      </div>
    </div>
  );
}
