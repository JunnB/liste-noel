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
  const activities: Activity[] = [];

  // Récupérer les événements récents (créés ou rejoints)
  const recentEvents = await prisma.event.findMany({
    where: {
      OR: [
        { creatorId: userId },
        { participants: { some: { userId } } },
      ],
    },
    orderBy: { createdAt: "desc" },
    take: 5,
    include: {
      creator: { select: { id: true, name: true } },
    },
  });

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

  // Récupérer les contributions récentes
  const recentContributions = await prisma.contribution.findMany({
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
    include: {
      user: { select: { id: true, name: true } },
      item: {
        select: {
          id: true,
          title: true,
          list: {
            select: {
              userId: true,
              user: { select: { name: true } },
            },
          },
        },
      },
    },
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

  // Récupérer les items récemment ajoutés à ma liste
  const myLists = await prisma.list.findMany({
    where: { userId },
    select: { id: true },
  });

  if (myLists.length > 0) {
    const recentItems = await prisma.item.findMany({
      where: {
        listId: { in: myLists.map((l) => l.id) },
      },
      orderBy: { createdAt: "desc" },
      take: 5,
    });

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
  }

  // Trier par date décroissante et limiter
  return activities
    .sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime())
    .slice(0, limit);
}

export async function getStats(userId: string) {
  // Compter les événements
  const eventsCount = await prisma.event.count({
    where: {
      OR: [
        { creatorId: userId },
        { participants: { some: { userId } } },
      ],
    },
  });

  // Compter les contributions
  const contributionsCount = await prisma.contribution.count({
    where: { userId },
  });

  // Compter les items dans mes listes
  const myLists = await prisma.list.findMany({
    where: { userId },
    select: { id: true },
  });

  const itemsCount = await prisma.item.count({
    where: {
      listId: { in: myLists.map((l) => l.id) },
    },
  });

  return {
    eventsCount,
    contributionsCount,
    itemsCount,
  };
}

