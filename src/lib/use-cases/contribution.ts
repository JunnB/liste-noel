import * as contributionRepository from "@/lib/repositories/contribution";
import * as itemRepository from "@/lib/repositories/item";
import { calculateDebts } from "@/lib/debts";
import { calculateAndCreateDebts } from "@/lib/use-cases/debt";

export type ContributionType = "FULL" | "PARTIAL";

export type CreateInput = {
  itemId: string;
  userId: string;
  amount?: number;
  totalPrice?: number;
  contributionType: ContributionType;
  note?: string;
  hasAdvanced?: boolean;
};

export async function upsert(input: CreateInput) {
  const item = await itemRepository.findById(input.itemId);

  if (!item) {
    throw new Error("Article non trouvé");
  }

  // Récupérer toutes les contributions existantes pour cet item
  const existingContributions = await contributionRepository.findByItemId(input.itemId);
  
  // Vérifier si l'utilisateur a déjà contribué
  const userContribution = existingContributions.find(c => c.userId === input.userId);

  let finalAmount: number;
  let finalTotalPrice: number | null;

  // Logique selon le type de contribution
  if (input.contributionType === "FULL") {
    // Je prends en entier
    if (!input.totalPrice) {
      throw new Error("Le prix total est requis pour prendre en entier");
    }
    
    // Vérifier qu'aucune autre contribution n'existe (sauf la sienne si modification)
    const otherContributions = existingContributions.filter(c => c.userId !== input.userId);
    if (otherContributions.length > 0) {
      throw new Error("Ce cadeau a déjà des contributions, vous ne pouvez pas le prendre en entier");
    }
    
    finalAmount = input.totalPrice;
    finalTotalPrice = input.totalPrice;
  } else {
    // PARTIAL - Je participe
    // Récupérer le prix total existant
    const existingTotal = existingContributions.find(c => c.totalPrice)?.totalPrice;
    
    if (!existingTotal && !input.totalPrice) {
      throw new Error("Le prix total du produit est requis");
    }

    finalTotalPrice = input.totalPrice || existingTotal || null;

    // Si pas de montant spécifié, on calcule le reste à payer
    if (input.amount === undefined || input.amount === 0) {
      const otherContributions = existingContributions.filter(c => c.userId !== input.userId);
      const totalContributed = otherContributions.reduce((sum, c) => sum + c.amount, 0);
      const remaining = (finalTotalPrice || 0) - totalContributed;
      
      if (remaining <= 0) {
        throw new Error("Ce cadeau est déjà entièrement financé");
      }
      
      finalAmount = remaining;
    } else {
      if (input.amount < 0) {
        throw new Error("Le montant doit être positif");
      }
      finalAmount = input.amount;
    }
  }

  // Valider que le montant ne dépasse pas le prix total
  if (finalTotalPrice) {
    const otherContributions = existingContributions.filter(c => c.userId !== input.userId);
    const totalContributed = otherContributions.reduce((sum, c) => sum + c.amount, 0);
    
    if (totalContributed + finalAmount > finalTotalPrice) {
      throw new Error(`Le montant total des contributions ne peut pas dépasser ${finalTotalPrice.toFixed(2)}€`);
    }
  }

  const contribution = await contributionRepository.upsert({
    itemId: input.itemId,
    userId: input.userId,
    amount: finalAmount,
    totalPrice: finalTotalPrice,
    contributionType: input.contributionType,
    note: input.note?.trim() || null,
    hasAdvanced: input.hasAdvanced || false,
  });

  // Si l'utilisateur a avancé l'argent, calculer et créer les dettes
  if (input.hasAdvanced && input.contributionType === "PARTIAL") {
    await calculateAndCreateDebts(input.itemId);
  }

  return contribution;
}

export async function deleteByItemId(itemId: string, userId: string) {
  const item = await itemRepository.findById(itemId);

  if (!item) {
    throw new Error("Article non trouvé");
  }

  return contributionRepository.deleteByItemIdAndUserId(itemId, userId);
}

export async function getDebts(userId: string) {
  const contributions = await contributionRepository.findByUserId(userId);

  // Formater les contributions pour le calcul des dettes
  const formattedContribs = contributions.map((c) => ({
    userId: c.userId,
    userName: c.user.name,
    amount: c.amount,
    itemId: c.item.id,
    itemTitle: c.item.title,
  }));

  // Calculer les dettes
  const debts = calculateDebts(formattedContribs);

  return {
    debts,
    contributorCount: new Set(formattedContribs.map((c) => c.userId)).size,
  };
}

export async function getUserContributions(userId: string) {
  // Récupérer uniquement les contributions de l'utilisateur
  const contributions = await contributionRepository.findByUserId(userId);
  
  // Filtrer pour ne garder que les contributions de l'utilisateur
  return contributions.filter(c => c.userId === userId);
}


