"use server";

import { requireAuth } from "@/lib/server-auth";
import * as itemUseCases from "@/lib/use-cases/item";
import { revalidatePath } from "next/cache";

export type ActionResult<T> =
  | { success: true; data: T }
  | { success: false; error: string };

/**
 * Mettre à jour un article
 */
export async function updateItem(
  itemId: string,
  data: {
    title?: string;
    description?: string;
    amazonUrl?: string;
  }
): Promise<ActionResult<void>> {
  try {
    const session = await requireAuth();

    const item = await itemUseCases.update({
      itemId,
      userId: session.user.id,
      ...data,
    });

    revalidatePath(`/lists/${item.listId}`);

    return { success: true, data: undefined };
  } catch (error) {
    console.error("Error updating item:", error);
    return {
      success: false,
      error:
        error instanceof Error
          ? error.message
          : "Erreur lors de la mise à jour de l'article",
    };
  }
}

/**
 * Supprimer un article
 */
export async function deleteItem(itemId: string): Promise<ActionResult<void>> {
  try {
    const session = await requireAuth();
    const item = await itemUseCases.deleteById(itemId, session.user.id);

    revalidatePath(`/lists/${item.listId}`);

    return { success: true, data: undefined };
  } catch (error) {
    console.error("Error deleting item:", error);
    return {
      success: false,
      error:
        error instanceof Error
          ? error.message
          : "Erreur lors de la suppression de l'article",
    };
  }
}


