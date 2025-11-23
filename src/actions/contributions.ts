"use server";

import { requireAuth } from "@/lib/server-auth";
import * as contributionUseCases from "@/lib/use-cases/contribution";
import * as itemRepository from "@/lib/repositories/item";
import { revalidatePath } from "next/cache";

export type ActionResult<T> =
  | { success: true; data: T }
  | { success: false; error: string };

/**
 * Créer ou mettre à jour une contribution
 */
export async function upsertContribution(data: {
  itemId: string;
  amount?: number;
  totalPrice?: number;
  contributionType: "FULL" | "PARTIAL";
  note?: string;
  hasAdvanced?: boolean;
}): Promise<ActionResult<void>> {
  try {
    const session = await requireAuth();

    const contribution = await contributionUseCases.upsert({
      itemId: data.itemId,
      userId: session.user.id,
      amount: data.amount,
      totalPrice: data.totalPrice,
      contributionType: data.contributionType,
      note: data.note,
      hasAdvanced: data.hasAdvanced,
    });

    // Récupérer l'item pour revalider la bonne page
    const item = await itemRepository.findById(data.itemId);
    if (item) {
      revalidatePath(`/lists/shared/${item.listId}`);
      revalidatePath(`/events`);
    }
    revalidatePath("/contributions");

    return { success: true, data: undefined };
  } catch (error) {
    console.error("Error creating contribution:", error);
    return {
      success: false,
      error:
        error instanceof Error
          ? error.message
          : "Erreur lors de la création de la contribution",
    };
  }
}

/**
 * Supprimer une contribution
 */
export async function deleteContribution(itemId: string): Promise<ActionResult<void>> {
  try {
    const session = await requireAuth();
    await contributionUseCases.deleteByItemId(itemId, session.user.id);

    // Récupérer l'item pour revalider la bonne page
    const item = await itemRepository.findById(itemId);
    if (item) {
      revalidatePath(`/lists/shared/${item.listId}`);
    }
    revalidatePath("/contributions");

    return { success: true, data: undefined };
  } catch (error) {
    console.error("Error deleting contribution:", error);
    return {
      success: false,
      error:
        error instanceof Error
          ? error.message
          : "Erreur lors de la suppression de la contribution",
    };
  }
}

/**
 * Récupérer les dettes de l'utilisateur
 */
export async function getDebts(): Promise<
  ActionResult<Awaited<ReturnType<typeof contributionUseCases.getDebts>>>
> {
  try {
    const session = await requireAuth();
    const debts = await contributionUseCases.getDebts(session.user.id);

    return { success: true, data: debts };
  } catch (error) {
    console.error("Error calculating debts:", error);
    return {
      success: false,
      error:
        error instanceof Error ? error.message : "Erreur lors du calcul des dettes",
    };
  }
}

/**
 * Récupérer toutes les contributions de l'utilisateur
 */
export async function getUserContributions(): Promise<
  ActionResult<Awaited<ReturnType<typeof contributionUseCases.getUserContributions>>>
> {
  try {
    const session = await requireAuth();
    const contributions = await contributionUseCases.getUserContributions(session.user.id);

    return { success: true, data: contributions };
  } catch (error) {
    console.error("Error fetching contributions:", error);
    return {
      success: false,
      error:
        error instanceof Error ? error.message : "Erreur lors de la récupération des contributions",
    };
  }
}


