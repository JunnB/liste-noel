import * as contributionRepository from "@/lib/repositories/contribution";
import * as itemRepository from "@/lib/repositories/item";
import { calculateDebts } from "@/lib/debts";

export type CreateInput = {
  itemId: string;
  userId: string;
  amount: number;
  totalPrice?: number;
  note?: string;
};

export async function upsert(input: CreateInput) {
  if (input.amount === undefined || input.amount < 0) {
    throw new Error("Le montant doit être positif");
  }

  const item = await itemRepository.findById(input.itemId);

  if (!item) {
    throw new Error("Article non trouvé");
  }

  // Récupérer toutes les contributions existantes pour cet item
  const existingContributions = await contributionRepository.findByItemId(input.itemId);
  
  // Vérifier si c'est la première contribution
  const isFirstContribution = existingContributions.length === 0;
  
  // Vérifier si l'utilisateur a déjà contribué
  const userContribution = existingContributions.find(c => c.userId === input.userId);
  const isUpdate = !!userContribution;

  // Si c'est la première contribution, le prix total est requis
  if (isFirstContribution && !input.totalPrice) {
    throw new Error("Le prix total du produit est requis pour la première contribution");
  }

  // Récupérer le prix total actuel (soit depuis une contribution existante, soit depuis l'input)
  let currentTotalPrice = input.totalPrice;
  if (!isFirstContribution && !input.totalPrice) {
    // Chercher le prix total dans les contributions existantes
    const contributionWithPrice = existingContributions.find(c => c.totalPrice !== null);
    if (contributionWithPrice) {
      currentTotalPrice = contributionWithPrice.totalPrice;
    }
  }

  // Valider que le montant ne dépasse pas le prix total
  if (currentTotalPrice) {
    // Calculer la somme des contributions (en excluant la contribution actuelle de l'utilisateur si c'est une mise à jour)
    const otherContributions = existingContributions.filter(c => c.userId !== input.userId);
    const totalContributed = otherContributions.reduce((sum, c) => sum + c.amount, 0);
    
    if (totalContributed + input.amount > currentTotalPrice) {
      throw new Error(`Le montant total des contributions ne peut pas dépasser ${currentTotalPrice.toFixed(2)}€`);
    }
  }

  return contributionRepository.upsert({
    itemId: input.itemId,
    userId: input.userId,
    amount: input.amount,
    totalPrice: input.totalPrice || null,
    note: input.note?.trim() || null,
  });
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


