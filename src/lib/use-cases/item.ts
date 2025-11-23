import * as itemRepository from "@/lib/repositories/item";
import * as listRepository from "@/lib/repositories/list";
import * as eventRepository from "@/lib/repositories/event";

export type UpdateInput = {
  itemId: string;
  userId: string;
  title?: string;
  description?: string;
  amazonUrl?: string;
};

export type CreateBonusInput = {
  listId: string;
  userId: string;
  title: string;
  description?: string;
  amazonUrl?: string;
};

export async function getById(id: string) {
  const item = await itemRepository.findById(id);

  if (!item) {
    throw new Error("Article non trouvé");
  }

  return item;
}

export async function update(input: UpdateInput) {
  const item = await itemRepository.findById(input.itemId);

  if (!item) {
    throw new Error("Article non trouvé");
  }

  // Vérifier que l'utilisateur possède la liste
  const list = await listRepository.findById(item.listId);

  if (!list) {
    throw new Error("Liste non trouvée");
  }

  // Autoriser la modification si :
  // 1. L'utilisateur est le propriétaire de la liste (item normal)
  // 2. L'utilisateur est celui qui a ajouté le cadeau bonus
  const isOwner = list.userId === input.userId;
  const isBonusAdder = item.isBonus && item.addedByUserId === input.userId;

  if (!isOwner && !isBonusAdder) {
    throw new Error("Vous n'avez pas accès à cet article");
  }

  if (input.title !== undefined && input.title.trim().length === 0) {
    throw new Error("Le titre de l'article est requis");
  }

  return itemRepository.update(input.itemId, {
    title: input.title?.trim(),
    description: input.description?.trim() || null,
    amazonUrl: input.amazonUrl?.trim() || null,
  });
}

export async function deleteById(id: string, userId: string) {
  const item = await itemRepository.findById(id);

  if (!item) {
    throw new Error("Article non trouvé");
  }

  // Vérifier que l'utilisateur possède la liste
  const list = await listRepository.findById(item.listId);

  if (!list) {
    throw new Error("Liste non trouvée");
  }

  // Autoriser la suppression si :
  // 1. L'utilisateur est le propriétaire de la liste (item normal)
  // 2. L'utilisateur est celui qui a ajouté le cadeau bonus
  const isOwner = list.userId === userId;
  const isBonusAdder = item.isBonus && item.addedByUserId === userId;

  if (!isOwner && !isBonusAdder) {
    throw new Error("Vous n'avez pas accès à cet article");
  }

  return itemRepository.deleteById(id);
}

export async function createBonus(input: CreateBonusInput) {
  // Vérifier que la liste existe
  const list = await listRepository.findById(input.listId);

  if (!list) {
    throw new Error("Liste non trouvée");
  }

  // Vérifier que l'utilisateur n'est PAS le propriétaire de la liste
  if (list.userId === input.userId) {
    throw new Error("Vous ne pouvez pas ajouter de cadeau bonus à votre propre liste");
  }

  // Vérifier que l'utilisateur est participant à l'événement
  const isParticipant = await eventRepository.isParticipant(
    list.eventId,
    input.userId
  );

  if (!isParticipant) {
    throw new Error("Vous devez être participant à l'événement pour ajouter un cadeau bonus");
  }

  if (!input.title || input.title.trim().length === 0) {
    throw new Error("Le titre du cadeau est requis");
  }

  // Créer l'item bonus
  return itemRepository.create({
    listId: input.listId,
    title: input.title.trim(),
    description: input.description?.trim() || null,
    amazonUrl: input.amazonUrl?.trim() || null,
    isBonus: true,
    addedByUserId: input.userId,
  });
}


