import prisma from "@/lib/prisma";
import { List, Item, Contribution } from "@prisma/client";

export type ListWithItems = List & {
  items: Item[];
};

export type ListWithUser = List & {
  user: {
    id: string;
    name: string;
    email: string;
  };
  items: (Item & {
    contributions: Contribution[];
  })[];
};

export type ListWithItemsAndContributions = List & {
  items: (Item & {
    contributions: (Contribution & {
      user: {
        id: string;
        name: string;
        email: string;
      };
    })[];
  })[];
};

export async function create(data: {
  userId: string;
  eventId: string;
  title: string;
  description?: string | null;
}): Promise<List> {
  return prisma.list.create({
    data: {
      userId: data.userId,
      eventId: data.eventId,
      title: data.title,
      description: data.description || null,
    },
  });
}

export async function findManyByUserId(userId: string): Promise<ListWithItems[]> {
  return prisma.list.findMany({
    where: {
      userId,
    },
    include: {
      items: true,
    },
    orderBy: {
      createdAt: "desc",
    },
  });
}

export async function findById(id: string): Promise<List | null> {
  return prisma.list.findUnique({
    where: { id },
  });
}

export async function findByIdWithItems(id: string): Promise<ListWithItems | null> {
  return prisma.list.findUnique({
    where: { id },
    include: {
      items: true,
    },
  });
}

export async function findByEventIdExcludingUser(
  eventId: string,
  userId: string
): Promise<ListWithItemsAndContributions[]> {
  return prisma.list.findMany({
    where: {
      eventId,
      userId: {
        not: userId,
      },
    },
    include: {
      items: {
        include: {
          contributions: {
            include: {
              user: {
                select: {
                  id: true,
                  name: true,
                  email: true,
                },
              },
            },
          },
        },
      },
    },
    orderBy: {
      createdAt: "asc",
    },
  });
}

export async function findByEventIdAndUserId(
  eventId: string,
  userId: string
): Promise<ListWithItems | null> {
  const list = await prisma.list.findUnique({
    where: {
      eventId_userId: {
        eventId,
        userId,
      },
    },
    include: {
      items: true,
    },
  });

  // Si la liste existe et que c'est le propriétaire qui la consulte,
  // filtrer les items bonus (surprise!)
  if (list && list.userId === userId) {
    return {
      ...list,
      items: list.items.filter((item) => !item.isBonus),
    };
  }

  return list;
}

export async function deleteById(id: string): Promise<List> {
  return prisma.list.delete({
    where: { id },
  });
}

export async function update(
  id: string,
  data: {
    title?: string;
    description?: string | null;
  }
): Promise<List> {
  return prisma.list.update({
    where: { id },
    data,
  });
}


