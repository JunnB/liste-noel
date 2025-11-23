import prisma from "@/lib/prisma";

export async function calculateAndCreateDebts(itemId: string) {
  // 1. Récupérer toutes les contributions pour cet item
  const contributions = await prisma.contribution.findMany({
    where: { itemId },
    include: { user: true },
    orderBy: { createdAt: "asc" },
  });

  // 2. Trouver qui a avancé l'argent
  const advancer = contributions.find((c) => c.hasAdvanced);
  if (!advancer) return; // Personne n'a avancé

  // 3. Supprimer les anciennes dettes pour cet item
  await prisma.debt.deleteMany({
    where: { itemId },
  });

  // 4. Créer les dettes pour chaque autre contributeur
  for (const contrib of contributions) {
    if (contrib.userId === advancer.userId) continue;

    // Créer la dette
    await prisma.debt.create({
      data: {
        itemId,
        fromUserId: contrib.userId,
        toUserId: advancer.userId,
        amount: contrib.amount,
      },
    });
  }
}

export async function getMyDebts(userId: string, eventId?: string) {
  const where: any = {
    OR: [
      { fromUserId: userId }, // Ce que je dois
      { toUserId: userId }, // Ce qu'on me doit
    ],
  };

  // Filtrer par événement si spécifié
  if (eventId) {
    where.item = {
      list: {
        eventId,
      },
    };
  }

  return prisma.debt.findMany({
    where,
    include: {
      item: {
        include: {
          list: {
            include: {
              event: true,
              user: true,
            },
          },
        },
      },
      fromUser: true,
      toUser: true,
    },
    orderBy: { createdAt: "desc" },
  });
}

export async function settleDebt(debtId: string, userId: string) {
  // Vérifier que l'utilisateur est concerné par cette dette
  const debt = await prisma.debt.findUnique({
    where: { id: debtId },
  });

  if (!debt || (debt.fromUserId !== userId && debt.toUserId !== userId)) {
    throw new Error(
      "Vous n'êtes pas autorisé à marquer cette dette comme réglée"
    );
  }

  return prisma.debt.update({
    where: { id: debtId },
    data: {
      isSettled: true,
      settledAt: new Date(),
    },
  });
}

