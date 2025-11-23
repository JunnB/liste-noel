import prisma from "@/lib/prisma";

export type ActivityType =
  | "event_created"
  | "event_joined"
  | "contribution_made"
  | "contribution_updated"
  | "item_added"
  | "item_updated";

export interface Activity {
  id: string;
  type: ActivityType;
  createdAt: Date;
  metadata: {
    eventId?: string;
    eventTitle?: string;
    itemId?: string;
    itemTitle?: string;
    amount?: number;
    contributorName?: string;
    listOwnerName?: string;
  };
}

export async function getRecentActivity(
  userId: string,
  limit = 10
): Promise<Activity[]> {
  // Optimisation : Paralléliser toutes les requêtes
  const [recentEvents, recentContributions, recentItems] = await Promise.all([
    // Récupérer les événements récents (créés ou rejoints)
    prisma.event.findMany({
      where: {
        OR: [
          { creatorId: userId },
          { participants: { some: { userId } } },
        ],
      },
      orderBy: { createdAt: "desc" },
      take: 5,
      select: {
        id: true,
        title: true,
        createdAt: true,
        creatorId: true,
      },
    }),
    // Récupérer les contributions récentes
    prisma.contribution.findMany({
      where: {
        OR: [
          // Mes contributions sur les cadeaux des autres
          {
            userId,
            item: {
              list: {
                userId: { not: userId },
              },
            },
          },
          // Les contributions des autres sur les cadeaux des autres (pas les miens)
          {
            userId: { not: userId },
            item: {
              list: {
                userId: { not: userId },
              },
            },
          },
        ],
      },
      orderBy: { createdAt: "desc" },
      take: 10,
      select: {
        id: true,
        userId: true,
        amount: true,
        createdAt: true,
        updatedAt: true,
        user: { select: { name: true } },
        item: {
          select: {
            id: true,
            title: true,
            list: {
              select: {
                user: { select: { name: true } },
              },
            },
          },
        },
      },
    }),
    // Récupérer les items récemment ajoutés à ma liste (SAUF les bonus - c'est une surprise!)
    prisma.item.findMany({
      where: {
        list: {
          userId,
        },
        isBonus: false, // Ne jamais montrer les items bonus au propriétaire
      },
      orderBy: { createdAt: "desc" },
      take: 5,
      select: {
        id: true,
        title: true,
        createdAt: true,
        updatedAt: true,
      },
    }),
  ]);

  const activities: Activity[] = [];

  // Ajouter les événements aux activités
  recentEvents.forEach((event) => {
    const isCreator = event.creatorId === userId;
    activities.push({
      id: `event-${event.id}`,
      type: isCreator ? "event_created" : "event_joined",
      createdAt: event.createdAt,
      metadata: {
        eventId: event.id,
        eventTitle: event.title,
      },
    });
  });

  // Ajouter les contributions aux activités
  recentContributions.forEach((contrib) => {
    const isMyContribution = contrib.userId === userId;
    activities.push({
      id: `contribution-${contrib.id}`,
      type:
        contrib.createdAt.getTime() === contrib.updatedAt.getTime()
          ? "contribution_made"
          : "contribution_updated",
      createdAt: contrib.createdAt,
      metadata: {
        itemId: contrib.item.id,
        itemTitle: contrib.item.title,
        amount: contrib.amount,
        contributorName: isMyContribution ? undefined : contrib.user.name,
        listOwnerName: contrib.item.list.user.name,
      },
    });
  });

  // Ajouter les items aux activités
  recentItems.forEach((item) => {
    activities.push({
      id: `item-${item.id}`,
      type:
        item.createdAt.getTime() === item.updatedAt.getTime()
          ? "item_added"
          : "item_updated",
      createdAt: item.createdAt,
      metadata: {
        itemId: item.id,
        itemTitle: item.title,
      },
    });
  });

  // Trier par date décroissante et limiter
  return activities
    .sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime())
    .slice(0, limit);
}

export async function getStats(userId: string) {
  // Optimisation : Paralléliser toutes les requêtes
  const [eventsCount, contributionsCount, itemsCount] = await Promise.all([
    // Compter les événements
    prisma.event.count({
      where: {
        OR: [
          { creatorId: userId },
          { participants: { some: { userId } } },
        ],
      },
    }),
    // Compter les contributions
    prisma.contribution.count({
      where: { userId },
    }),
    // Compter les items dans mes listes (SAUF les bonus - en une seule requête)
    prisma.item.count({
      where: {
        list: {
          userId,
        },
        isBonus: false, // Ne jamais compter les items bonus
      },
    }),
  ]);

  return {
    eventsCount,
    contributionsCount,
    itemsCount,
  };
}

