"use server";

import { requireAuth } from "@/lib/server-auth";
import * as listUseCases from "@/lib/use-cases/list";
import { revalidatePath } from "next/cache";

export type ActionResult<T> =
  | { success: true; data: T }
  | { success: false; error: string };

/**
 * Créer une nouvelle liste dans un événement
 */
export async function createList(data: {
  eventId: string;
  title: string;
  description?: string;
}): Promise<ActionResult<{ id: string }>> {
  try {
    const session = await requireAuth();

    const list = await listUseCases.create({
      userId: session.user.id,
      eventId: data.eventId,
      title: data.title,
      description: data.description,
    });

    revalidatePath(`/events/${data.eventId}`);
    revalidatePath("/lists");

    return { success: true, data: { id: list.id } };
  } catch (error) {
    console.error("Error creating list:", error);
    return {
      success: false,
      error: error instanceof Error ? error.message : "Erreur lors de la création de la liste",
    };
  }
}

/**
 * Récupérer toutes les listes de l'utilisateur
 */
export async function getUserLists(): Promise<
  ActionResult<Awaited<ReturnType<typeof listUseCases.getByUserId>>>
> {
  try {
    const session = await requireAuth();
    const lists = await listUseCases.getByUserId(session.user.id);

    return { success: true, data: lists };
  } catch (error) {
    console.error("Error fetching lists:", error);
    return {
      success: false,
      error:
        error instanceof Error
          ? error.message
          : "Erreur lors de la récupération des listes",
    };
  }
}

/**
 * Récupérer une liste par son ID
 */
export async function getListById(
  id: string
): Promise<ActionResult<Awaited<ReturnType<typeof listUseCases.getById>>>> {
  try {
    const session = await requireAuth();
    const list = await listUseCases.getById(id, session.user.id);

    return { success: true, data: list };
  } catch (error) {
    console.error("Error fetching list:", error);
    return {
      success: false,
      error: error instanceof Error ? error.message : "Erreur lors de la récupération de la liste",
    };
  }
}

/**
 * Ajouter un article à une liste
 */
export async function createListItem(data: {
  listId: string;
  title: string;
  description?: string;
  amazonUrl?: string;
}): Promise<ActionResult<{ id: string }>> {
  try {
    const session = await requireAuth();

    const item = await listUseCases.createItem({
      listId: data.listId,
      userId: session.user.id,
      title: data.title,
      description: data.description,
      amazonUrl: data.amazonUrl,
    });

    revalidatePath(`/lists/${data.listId}`);

    return { success: true, data: { id: item.id } };
  } catch (error) {
    console.error("Error creating item:", error);
    return {
      success: false,
      error: error instanceof Error ? error.message : "Erreur lors de la création de l'article",
    };
  }
}


/**
 * Supprimer une liste
 */
export async function deleteList(id: string): Promise<ActionResult<void>> {
  try {
    const session = await requireAuth();
    await listUseCases.deleteById(id, session.user.id);

    revalidatePath("/dashboard");
    revalidatePath("/lists");

    return { success: true, data: undefined };
  } catch (error) {
    console.error("Error deleting list:", error);
    return {
      success: false,
      error: error instanceof Error ? error.message : "Erreur lors de la suppression de la liste",
    };
  }
}

/**
 * Mettre à jour une liste
 */
export async function updateList(
  id: string,
  data: { title?: string; description?: string }
): Promise<ActionResult<void>> {
  try {
    const session = await requireAuth();
    await listUseCases.update(id, session.user.id, data);

    revalidatePath(`/lists/${id}`);
    revalidatePath("/dashboard");

    return { success: true, data: undefined };
  } catch (error) {
    console.error("Error updating list:", error);
    return {
      success: false,
      error:
        error instanceof Error
          ? error.message
          : "Erreur lors de la mise à jour de la liste",
    };
  }
}


