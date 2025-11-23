import Link from "next/link";
import type { Activity } from "@/lib/use-cases/activity";

interface ActivityFeedProps {
  activities: Activity[];
}

function formatRelativeTime(date: Date): string {
  const now = new Date();
  const diffMs = now.getTime() - date.getTime();
  const diffMins = Math.floor(diffMs / 60000);
  const diffHours = Math.floor(diffMs / 3600000);
  const diffDays = Math.floor(diffMs / 86400000);

  if (diffMins < 1) return "À l'instant";
  if (diffMins < 60) return `Il y a ${diffMins} min`;
  if (diffHours < 24) return `Il y a ${diffHours}h`;
  if (diffDays === 1) return "Hier";
  if (diffDays < 7) return `Il y a ${diffDays} jours`;
  return date.toLocaleDateString("fr-FR", { day: "numeric", month: "short" });
}

function getActivityIcon(type: Activity["type"]): string {
  switch (type) {
    case "event_created":
    case "event_joined":
      return "📅";
    case "contribution_made":
    case "contribution_updated":
      return "💰";
    case "item_added":
    case "item_updated":
      return "🎁";
    default:
      return "✨";
  }
}

function getActivityText(activity: Activity): { title: string; subtitle?: string } {
  const { type, metadata } = activity;

  switch (type) {
    case "event_created":
      return {
        title: `Vous avez créé le groupe "${metadata.eventTitle}"`,
      };
    case "event_joined":
      return {
        title: `Vous avez rejoint "${metadata.eventTitle}"`,
      };
    case "contribution_made":
      if (metadata.contributorName) {
        return {
          title: `${metadata.contributorName} a participé`,
          subtitle: `Cadeau pour ${metadata.listOwnerName}: ${metadata.itemTitle} • ${metadata.amount?.toFixed(0)}€`,
        };
      }
      return {
        title: `Vous avez contribué ${metadata.amount?.toFixed(0)}€`,
        subtitle: `Cadeau pour ${metadata.listOwnerName}: ${metadata.itemTitle}`,
      };
    case "contribution_updated":
      if (metadata.contributorName) {
        return {
          title: `${metadata.contributorName} a modifié sa participation`,
          subtitle: `Cadeau pour ${metadata.listOwnerName}: ${metadata.itemTitle} • ${metadata.amount?.toFixed(0)}€`,
        };
      }
      return {
        title: `Vous avez modifié votre participation`,
        subtitle: `Cadeau pour ${metadata.listOwnerName}: ${metadata.itemTitle} • ${metadata.amount?.toFixed(0)}€`,
      };
    case "item_added":
      return {
        title: `Vous avez ajouté "${metadata.itemTitle}"`,
        subtitle: "À votre liste de souhaits",
      };
    case "item_updated":
      return {
        title: `Vous avez modifié "${metadata.itemTitle}"`,
        subtitle: "Dans votre liste de souhaits",
      };
    default:
      return { title: "Activité inconnue" };
  }
}

function getActivityLink(activity: Activity): string | null {
  const { type, metadata } = activity;

  if (type === "event_created" || type === "event_joined") {
    return metadata.eventId ? `/events/${metadata.eventId}` : null;
  }

  if (type === "contribution_made" || type === "contribution_updated") {
    return "/contributions";
  }

  if (type === "item_added" || type === "item_updated") {
    return metadata.eventId ? `/events/${metadata.eventId}` : null;
  }

  return null;
}

export default function ActivityFeed({ activities }: ActivityFeedProps) {
  if (activities.length === 0) {
    return (
      <div className="text-center py-12 text-gray-500">
        <div className="text-5xl mb-4">🎄</div>
        <p className="text-lg font-medium">Aucune activité récente</p>
        <p className="text-sm mt-2">Créez un groupe ou ajoutez des souhaits pour commencer !</p>
      </div>
    );
  }

  return (
    <div className="space-y-3">
      {activities.map((activity) => {
        const { title, subtitle } = getActivityText(activity);
        const icon = getActivityIcon(activity.type);
        const link = getActivityLink(activity);
        const timeAgo = formatRelativeTime(activity.createdAt);

        const content = (
          <div
            className={`flex gap-4 p-4 rounded-xl border bg-white transition-all ${
              link
                ? "hover:border-noel-green hover:shadow-md cursor-pointer"
                : "border-gray-100"
            }`}
          >
            <div className="flex-shrink-0 w-12 h-12 rounded-full bg-gradient-to-br from-noel-green/20 to-emerald-100 flex items-center justify-center text-2xl">
              {icon}
            </div>
            <div className="flex-1 min-w-0">
              <p className="font-medium text-gray-900 mb-1">{title}</p>
              {subtitle && (
                <p className="text-sm text-gray-600 mb-1">{subtitle}</p>
              )}
              <p className="text-xs text-gray-400">{timeAgo}</p>
            </div>
            {link && (
              <div className="flex-shrink-0 text-noel-green">
                <svg
                  className="w-5 h-5"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M9 5l7 7-7 7"
                  />
                </svg>
              </div>
            )}
          </div>
        );

        return link ? (
          <Link key={activity.id} href={link}>
            {content}
          </Link>
        ) : (
          <div key={activity.id}>{content}</div>
        );
      })}
    </div>
  );
}

