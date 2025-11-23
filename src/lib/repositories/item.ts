import prisma from "@/lib/prisma";
import { Item } from "@prisma/client";

export async function create(data: {
  listId: string;
  title: string;
  description?: string | null;
  amazonUrl?: string | null;
}): Promise<Item> {
  return prisma.item.create({
    data: {
      listId: data.listId,
      title: data.title,
      description: data.description || null,
      amazonUrl: data.amazonUrl || null,
    },
  });
}

export async function findById(id: string): Promise<Item | null> {
  return prisma.item.findUnique({
    where: { id },
  });
}

export async function findManyByListId(listId: string): Promise<Item[]> {
  return prisma.item.findMany({
    where: { listId },
    orderBy: {
      createdAt: "asc",
    },
  });
}

export async function update(
  id: string,
  data: {
    title?: string;
    description?: string | null;
    amazonUrl?: string | null;
  }
): Promise<Item> {
  return prisma.item.update({
    where: { id },
    data,
  });
}

export async function deleteById(id: string): Promise<Item> {
  return prisma.item.delete({
    where: { id },
  });
}


