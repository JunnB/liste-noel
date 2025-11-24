import * as eventRepository from "@/lib/repositories/event";
import * as listRepository from "@/lib/repositories/list";
import prisma from "@/lib/prisma";

export type CreateInput = {
  title: string;
  description?: string;
  creatorId: string;
};

export type JoinInput = {
  invitationCode: string;
  userId: string;
  userName: string;
};

/**
 * Créer un nouvel événement
 */
export async function create(input: CreateInput) {
  if (!input.title || input.title.trim().length === 0) {
    throw new Error("Le titre de l'événement est requis");
  }

  const event = await eventRepository.create({
    title: input.title.trim(),
    description: input.description?.trim() || null,
    creatorId: input.creatorId,
  });

  // Ajouter le créateur comme participant
  await eventRepository.addParticipant({
    eventId: event.id,
    userId: input.creatorId,
  });

  // Créer automatiquement la liste du créateur
  await listRepository.create({
    userId: input.creatorId,
    eventId: event.id,
    title: `Ma liste`, // Sera affiché comme "Liste de [nom]" dans l'UI
    description: null,
  });

  return event;
}

/**
 * Rejoindre un événement via code d'invitation
 */
export async function join(input: JoinInput) {
  const code = input.invitationCode.trim();

  if (!code || code.length === 0) {
    throw new Error("Le code d'invitation est requis");
  }

  // Trouver l'événement
  const event = await eventRepository.findByInvitationCode(code);

  if (!event) {
    throw new Error("Code d'invitation invalide");
  }

  // Vérifier si l'utilisateur est déjà participant
  const isAlreadyParticipant = await eventRepository.isParticipant(
    event.id,
    input.userId
  );

  if (isAlreadyParticipant) {
    // Si déjà participant, retourner l'événement
    return event;
  }

  // Ajouter comme participant
  await eventRepository.addParticipant({
    eventId: event.id,
    userId: input.userId,
  });

  // Créer automatiquement la liste personnelle
  await listRepository.create({
    userId: input.userId,
    eventId: event.id,
    title: `Ma liste`,
    description: null,
  });

  return event;
}

/**
 * Récupérer tous les événements d'un utilisateur (créés + rejoints) - ULTRA OPTIMISÉ
 * Une seule requête au lieu de deux !
 */
export async function getByUserId(userId: string) {
  // OPTIMISATION MAJEURE : Une seule requête avec OR au lieu de 2 requêtes séparées
  const events = await prisma.event.findMany({
    where: {
      OR: [
        { creatorId: userId },
        { participants: { some: { userId } } },
      ],
    },
    select: {
      id: true,
      title: true,
      description: true,
      invitationCode: true,
      createdAt: true,
      updatedAt: true,
      creatorId: true,
      creator: {
        select: {
          id: true,
          name: true,
          email: true,
        },
      },
      participants: {
        select: {
          id: true,
          eventId: true,
          userId: true,
          joinedAt: true,
          user: {
            select: {
              id: true,
              name: true,
              email: true,
            },
          },
        },
      },
    },
    orderBy: {
      createdAt: "desc",
    },
  });

  // Ajouter le flag isCreator
  return events.map((event) => ({
    ...event,
    isCreator: event.creatorId === userId,
  }));
}

/**
 * Récupérer les détails d'un événement
 */
export async function getById(eventId: string, userId: string) {
  const event = await eventRepository.findByIdWithCreator(eventId);

  if (!event) {
    throw new Error("Événement non trouvé");
  }

  // Vérifier que l'utilisateur est participant
  const isParticipant = await eventRepository.isParticipant(eventId, userId);

  if (!isParticipant) {
    throw new Error("Vous n'avez pas accès à cet événement");
  }

  return event;
}

/**
 * Récupérer les listes des autres participants d'un événement
 */
export async function getOtherLists(eventId: string, userId: string) {
  // Vérifier que l'utilisateur est participant
  const isParticipant = await eventRepository.isParticipant(eventId, userId);

  if (!isParticipant) {
    throw new Error("Vous n'avez pas accès à cet événement");
  }

  // Récupérer toutes les listes sauf celle de l'utilisateur
  return listRepository.findByEventIdExcludingUser(eventId, userId);
}

/**
 * Récupérer la liste personnelle d'un utilisateur dans un événement
 */
export async function getMyList(eventId: string, userId: string) {
  // Vérifier que l'utilisateur est participant
  const isParticipant = await eventRepository.isParticipant(eventId, userId);

  if (!isParticipant) {
    throw new Error("Vous n'avez pas accès à cet événement");
  }

  const list = await listRepository.findByEventIdAndUserId(eventId, userId);

  if (!list) {
    throw new Error("Liste non trouvée");
  }

  return list;
}

/**
 * Récupérer les participants d'un événement
 */
export async function getParticipants(eventId: string, userId: string) {
  // Vérifier que l'utilisateur est participant
  const isParticipant = await eventRepository.isParticipant(eventId, userId);

  if (!isParticipant) {
    throw new Error("Vous n'avez pas accès à cet événement");
  }

  return eventRepository.getParticipants(eventId);
}

/**
 * Récupérer un événement complet avec toutes les listes (sauf celle de l'utilisateur)
 * OPTIMISÉ avec agrégation des totaux côté serveur
 */
export async function getEventWithLists(eventId: string, userId: string) {
  // Vérifier que l'utilisateur est participant
  const isParticipant = await eventRepository.isParticipant(eventId, userId);

  if (!isParticipant) {
    throw new Error("Vous n'avez pas accès à cet événement");
  }

  const event = await eventRepository.findByIdWithListsExcludingUser(
    eventId,
    userId
  );

  if (!event) {
    throw new Error("Événement non trouvé");
  }

  // OPTIMISATION : Calculer le total des contributions de l'utilisateur côté serveur
  const myTotalContributions = await prisma.contribution.aggregate({
    where: {
      userId,
      item: {
        list: {
          eventId,
        },
      },
    },
    _sum: {
      amount: true,
    },
  });

  return {
    ...event,
    myTotalContributions: myTotalContributions._sum.amount || 0,
  };
}

/**
 * Supprimer un événement (uniquement par le créateur)
 */
export async function deleteById(eventId: string, userId: string) {
  const event = await eventRepository.findById(eventId);

  if (!event) {
    throw new Error("Événement non trouvé");
  }

  if (event.creatorId !== userId) {
    throw new Error("Seul le créateur peut supprimer cet événement");
  }

  return eventRepository.deleteById(eventId);
}

/**
 * Mettre à jour un événement (uniquement par le créateur)
 */
export async function update(
  eventId: string,
  userId: string,
  data: { title?: string; description?: string }
) {
  const event = await eventRepository.findById(eventId);

  if (!event) {
    throw new Error("Événement non trouvé");
  }

  if (event.creatorId !== userId) {
    throw new Error("Seul le créateur peut modifier cet événement");
  }

  if (data.title !== undefined && data.title.trim().length === 0) {
    throw new Error("Le titre est requis");
  }

  return eventRepository.update(eventId, {
    title: data.title?.trim(),
    description: data.description?.trim() || null,
  });
}

