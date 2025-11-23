interface ContributionData {
  userId: string;
  userName: string;
  amount: number;
  itemId: string;
  itemTitle: string;
}

interface DebtEntry {
  fromUser: string;
  fromUserId: string;
  toUser: string;
  toUserId: string;
  amount: number;
  items: Array<{ itemId: string; itemTitle: string }>;
}

/**
 * Calcule les débts entre utilisateurs pour les cadeaux partagés
 * Utilise un algorithme simplifié pour éviter les remboursements circulaires
 */
export function calculateDebts(contributions: ContributionData[]): DebtEntry[] {
  // Group contributions by item
  const itemsByContribution = new Map<
    string,
    Array<{ userId: string; userName: string; amount: number }>
  >();

  for (const contrib of contributions) {
    if (!itemsByContribution.has(contrib.itemId)) {
      itemsByContribution.set(contrib.itemId, []);
    }
    itemsByContribution.get(contrib.itemId)!.push({
      userId: contrib.userId,
      userName: contrib.userName,
      amount: contrib.amount,
    });
  }

  // Calculate debts for each item
  const debts = new Map<string, DebtEntry>();

  for (const [itemId, contributors] of itemsByContribution.entries()) {
    const itemTitle =
      contributions.find((c) => c.itemId === itemId)?.itemTitle || "Unknown";

    if (contributors.length <= 1) continue; // No sharing

    // Calculate total and who owes whom
    const total = contributors.reduce((sum, c) => sum + c.amount, 0);
    const perPerson = total / contributors.length;

    // Calculate who owes whom
    for (const contributor of contributors) {
      const owedAmount = perPerson - contributor.amount;

      if (Math.abs(owedAmount) > 0.01) {
        // Someone else needs to pay this person
        if (owedAmount > 0) {
          // This person is owed money
          for (const other of contributors) {
            if (other.userId !== contributor.userId) {
              const otherOwes = perPerson - other.amount;
              if (otherOwes > 0) {
                // Other person owes money
                const key = `${other.userId}->${contributor.userId}`;
                if (!debts.has(key)) {
                  debts.set(key, {
                    fromUser: other.userName,
                    fromUserId: other.userId,
                    toUser: contributor.userName,
                    toUserId: contributor.userId,
                    amount: 0,
                    items: [],
                  });
                }

                const debt = debts.get(key)!;
                debt.amount += Math.min(otherOwes, owedAmount);
                debt.items.push({ itemId, itemTitle });
              }
            }
          }
        }
      }
    }
  }

  // Remove duplicates and simplify
  return Array.from(debts.values()).filter((d) => d.amount > 0.01);
}
