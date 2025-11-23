import * as eventRepository from "@/lib/repositories/event";
import * as listRepository from "@/lib/repositories/list";

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
 * Récupérer tous les événements d'un utilisateur (créés + rejoints)
 */
export async function getByUserId(userId: string) {
  const [createdEvents, joinedEvents] = await Promise.all([
    eventRepository.findByCreatorId(userId),
    eventRepository.findByParticipantId(userId),
  ]);

  // Fusionner et dédupliquer (un créateur est aussi participant)
  const allEventsMap = new Map();

  createdEvents.forEach((event) => {
    allEventsMap.set(event.id, { ...event, isCreator: true });
  });

  joinedEvents.forEach((event) => {
    if (!allEventsMap.has(event.id)) {
      allEventsMap.set(event.id, { ...event, isCreator: false });
    }
  });

  return Array.from(allEventsMap.values()).sort(
    (a, b) => b.createdAt.getTime() - a.createdAt.getTime()
  );
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

  return event;
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

