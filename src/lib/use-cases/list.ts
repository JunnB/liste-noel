import * as listRepository from "@/lib/repositories/list";
import * as itemRepository from "@/lib/repositories/item";

export type CreateInput = {
  userId: string;
  eventId: string;
  title: string;
  description?: string;
};

export type CreateItemInput = {
  listId: string;
  userId: string;
  title: string;
  description?: string;
  amazonUrl?: string;
};

export async function create(input: CreateInput) {
  if (!input.title || input.title.trim().length === 0) {
    throw new Error("Le titre est requis");
  }

  return listRepository.create({
    userId: input.userId,
    eventId: input.eventId,
    title: input.title.trim(),
    description: input.description?.trim() || null,
  });
}

export async function getByUserId(userId: string) {
  return listRepository.findManyByUserId(userId);
}

export async function getById(id: string, userId: string, viewerUserId?: string) {
  const list = await listRepository.findByIdWithItems(id);

  if (!list) {
    throw new Error("Liste non trouvée");
  }

  // Vérifier que l'utilisateur a accès à cette liste
  if (list.userId !== userId) {
    throw new Error("Vous n'avez pas accès à cette liste");
  }

  // Si le viewer est le propriétaire, filtrer les items bonus
  const actualViewerId = viewerUserId || userId;
  if (actualViewerId === list.userId) {
    return {
      ...list,
      items: list.items.filter((item) => !item.isBonus),
    };
  }

  return list;
}

export async function createItem(input: CreateItemInput) {
  // Vérifier que la liste existe et appartient à l'utilisateur
  const list = await listRepository.findById(input.listId);

  if (!list) {
    throw new Error("Liste non trouvée");
  }

  if (list.userId !== input.userId) {
    throw new Error("Vous n'avez pas accès à cette liste");
  }

  if (!input.title || input.title.trim().length === 0) {
    throw new Error("Le titre de l'article est requis");
  }

  return itemRepository.create({
    listId: input.listId,
    title: input.title.trim(),
    description: input.description?.trim() || null,
    amazonUrl: input.amazonUrl?.trim() || null,
  });
}


export async function deleteById(id: string, userId: string) {
  const list = await listRepository.findById(id);

  if (!list) {
    throw new Error("Liste non trouvée");
  }

  if (list.userId !== userId) {
    throw new Error("Vous n'avez pas accès à cette liste");
  }

  return listRepository.deleteById(id);
}

export async function update(
  id: string,
  userId: string,
  data: { title?: string; description?: string }
) {
  const list = await listRepository.findById(id);

  if (!list) {
    throw new Error("Liste non trouvée");
  }

  if (list.userId !== userId) {
    throw new Error("Vous n'avez pas accès à cette liste");
  }

  if (data.title !== undefined && data.title.trim().length === 0) {
    throw new Error("Le titre est requis");
  }

  return listRepository.update(id, {
    title: data.title?.trim(),
    description: data.description?.trim() || null,
  });
}


