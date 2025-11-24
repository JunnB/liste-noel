import prisma from "@/lib/prisma";
import { Event, EventParticipant } from "@prisma/client";

export type EventWithCreator = Event & {
  creator: {
    id: string;
    name: string;
    email: string;
  };
};

export type EventWithParticipants = Event & {
  creator: {
    id: string;
    name: string;
    email: string;
  };
  participants: (EventParticipant & {
    user: {
      id: string;
      name: string;
      email: string;
    };
  })[];
};

export type EventWithLists = Event & {
  creator: {
    id: string;
    name: string;
    email: string;
  };
  participants: (EventParticipant & {
    user: {
      id: string;
      name: string;
      email: string;
    };
  })[];
  lists: {
    id: string;
    userId: string;
    eventId: string;
    title: string;
    description: string | null;
    createdAt: Date;
    updatedAt: Date;
    user: {
      id: string;
      name: string;
      email: string;
    };
    items: {
      id: string;
      listId: string;
      title: string;
      description: string | null;
      amazonUrl: string | null;
      createdAt: Date;
      updatedAt: Date;
      contributions: {
        id: string;
        itemId: string;
        userId: string;
        amount: number;
        totalPrice: number | null;
        note: string | null;
        createdAt: Date;
        updatedAt: Date;
        user: {
          id: string;
          name: string;
          email: string;
        };
      }[];
    }[];
  }[];
};

/**
 * Créer un nouvel événement
 */
export async function create(data: {
  title: string;
  description?: string | null;
  creatorId: string;
}): Promise<Event> {
  return prisma.event.create({
    data: {
      title: data.title,
      description: data.description || null,
      creatorId: data.creatorId,
    },
  });
}

/**
 * Trouver un événement par son ID
 */
export async function findById(id: string): Promise<Event | null> {
  return prisma.event.findUnique({
    where: { id },
  });
}

/**
 * Trouver un événement par son ID avec le créateur
 */
export async function findByIdWithCreator(
  id: string
): Promise<EventWithCreator | null> {
  return prisma.event.findUnique({
    where: { id },
    include: {
      creator: {
        select: {
          id: true,
          name: true,
          email: true,
        },
      },
    },
  });
}

/**
 * Trouver un événement par son code d'invitation
 */
export async function findByInvitationCode(
  code: string
): Promise<EventWithCreator | null> {
  return prisma.event.findUnique({
    where: { invitationCode: code },
    include: {
      creator: {
        select: {
          id: true,
          name: true,
          email: true,
        },
      },
    },
  });
}

/**
 * Trouver tous les événements créés par un utilisateur - OPTIMISÉ
 */
export async function findByCreatorId(
  userId: string
): Promise<EventWithParticipants[]> {
  return prisma.event.findMany({
    where: {
      creatorId: userId,
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
  }) as Promise<EventWithParticipants[]>;
}

/**
 * Trouver tous les événements où un utilisateur est participant - OPTIMISÉ
 */
export async function findByParticipantId(
  userId: string
): Promise<EventWithParticipants[]> {
  return prisma.event.findMany({
    where: {
      participants: {
        some: {
          userId,
        },
      },
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
  }) as Promise<EventWithParticipants[]>;
}

/**
 * Ajouter un participant à un événement
 */
export async function addParticipant(data: {
  eventId: string;
  userId: string;
}): Promise<EventParticipant> {
  return prisma.eventParticipant.create({
    data: {
      eventId: data.eventId,
      userId: data.userId,
    },
  });
}

/**
 * Vérifier si un utilisateur est participant d'un événement
 */
export async function isParticipant(
  eventId: string,
  userId: string
): Promise<boolean> {
  const participant = await prisma.eventParticipant.findUnique({
    where: {
      eventId_userId: {
        eventId,
        userId,
      },
    },
  });
  return participant !== null;
}

/**
 * Récupérer les participants d'un événement
 */
export async function getParticipants(eventId: string) {
  return prisma.eventParticipant.findMany({
    where: {
      eventId,
    },
    include: {
      user: {
        select: {
          id: true,
          name: true,
          email: true,
        },
      },
    },
    orderBy: {
      joinedAt: "asc",
    },
  });
}

/**
 * Récupérer un événement avec toutes ses listes (sauf celle de l'utilisateur courant)
 * Optimisé avec select pour réduire les données transférées
 */
export async function findByIdWithListsExcludingUser(
  eventId: string,
  userId: string
): Promise<EventWithLists | null> {
  return prisma.event.findUnique({
    where: { id: eventId },
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
          user: {
            select: {
              id: true,
              name: true,
              email: true,
            },
          },
        },
      },
      lists: {
        where: {
          userId: {
            not: userId,
          },
        },
        select: {
          id: true,
          userId: true,
          eventId: true,
          title: true,
          description: true,
          createdAt: true,
          updatedAt: true,
          user: {
            select: {
              id: true,
              name: true,
              email: true,
            },
          },
          items: {
            select: {
              id: true,
              listId: true,
              title: true,
              description: true,
              amazonUrl: true,
              createdAt: true,
              updatedAt: true,
              contributions: {
                select: {
                  id: true,
                  itemId: true,
                  userId: true,
                  amount: true,
                  totalPrice: true,
                  note: true,
                  createdAt: true,
                  updatedAt: true,
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
          },
        },
      },
    },
  }) as Promise<EventWithLists | null>;
}

/**
 * Supprimer un événement
 */
export async function deleteById(id: string): Promise<Event> {
  return prisma.event.delete({
    where: { id },
  });
}

/**
 * Mettre à jour un événement
 */
export async function update(
  id: string,
  data: {
    title?: string;
    description?: string | null;
  }
): Promise<Event> {
  return prisma.event.update({
    where: { id },
    data,
  });
}

