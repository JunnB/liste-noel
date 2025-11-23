import * as itemRepository from "@/lib/repositories/item";
import * as listRepository from "@/lib/repositories/list";

export type UpdateInput = {
  itemId: string;
  userId: string;
  title?: string;
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

  if (list.userId !== input.userId) {
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

  if (list.userId !== userId) {
    throw new Error("Vous n'avez pas accès à cet article");
  }

  return itemRepository.deleteById(id);
}


