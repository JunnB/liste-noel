import prisma from "@/lib/prisma";
import { Contribution } from "@prisma/client";

export type ContributionWithUser = Contribution & {
  user: {
    id: string;
    name: string;
    email: string;
  };
};

export type ContributionWithDetails = Contribution & {
  user: {
    id: string;
    name: string;
    email: string;
  };
  item: {
    id: string;
    title: string;
    list: {
      id: string;
      title: string;
      userId: string;
      event: {
        id: string;
        title: string;
      };
    };
  };
};

export async function upsert(data: {
  itemId: string;
  userId: string;
  amount: number;
  totalPrice?: number | null;
  contributionType: string;
  note?: string | null;
  hasAdvanced?: boolean;
}): Promise<ContributionWithUser> {
  const result = await prisma.contribution.upsert({
    where: {
      itemId_userId: {
        itemId: data.itemId,
        userId: data.userId,
      },
    },
    update: {
      amount: data.amount,
      totalPrice: data.totalPrice !== undefined ? data.totalPrice : undefined,
      contributionType: data.contributionType,
      note: data.note || null,
      hasAdvanced: data.hasAdvanced !== undefined ? data.hasAdvanced : undefined,
    },
    create: {
      itemId: data.itemId,
      userId: data.userId,
      amount: data.amount,
      totalPrice: data.totalPrice || null,
      contributionType: data.contributionType,
      note: data.note || null,
      hasAdvanced: data.hasAdvanced || false,
    },
    include: {
      user: {
        select: {
          id: true,
          name: true,
          email: true,
        },
      },
    },
  });
  
  return result as ContributionWithUser;
}

export async function deleteByItemIdAndUserId(
  itemId: string,
  userId: string
): Promise<Contribution> {
  return prisma.contribution.delete({
    where: {
      itemId_userId: {
        itemId,
        userId,
      },
    },
  });
}

export async function findByUserId(userId: string): Promise<ContributionWithDetails[]> {
  // Optimisation : Requête simplifiée - récupérer uniquement les contributions de l'utilisateur
  return prisma.contribution.findMany({
    where: {
      userId,
    },
    include: {
      user: {
        select: {
          id: true,
          name: true,
          email: true,
        },
      },
      item: {
        include: {
          list: {
            select: {
              id: true,
              title: true,
              userId: true,
              event: {
                select: {
                  id: true,
                  title: true,
                },
              },
            },
          },
        },
      },
    },
    orderBy: {
      createdAt: 'desc',
    },
  });
}

export async function findByItemId(itemId: string): Promise<ContributionWithUser[]> {
  return prisma.contribution.findMany({
    where: { itemId },
    include: {
      user: {
        select: {
          id: true,
          name: true,
          email: true,
        },
      },
    },
  });
}


