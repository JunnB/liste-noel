"use server";

import { requireAuth } from "@/lib/server-auth";
import * as eventUseCases from "@/lib/use-cases/event";
import { revalidatePath } from "next/cache";

export type ActionResult<T> =
  | { success: true; data: T }
  | { success: false; error: string };

/**
 * Créer un nouvel événement
 */
export async function createEvent(data: {
  title: string;
  description?: string;
}): Promise<ActionResult<{ id: string; invitationCode: string }>> {
  try {
    const session = await requireAuth();

    const event = await eventUseCases.create({
      title: data.title,
      description: data.description,
      creatorId: session.user.id,
    });

    revalidatePath("/events");
    revalidatePath("/dashboard");

    return {
      success: true,
      data: { id: event.id, invitationCode: event.invitationCode },
    };
  } catch (error) {
    console.error("Error creating event:", error);
    return {
      success: false,
      error:
        error instanceof Error
          ? error.message
          : "Erreur lors de la création de l'événement",
    };
  }
}

/**
 * Rejoindre un événement via code d'invitation
 */
export async function joinEvent(
  invitationCode: string
): Promise<ActionResult<{ id: string }>> {
  try {
    const session = await requireAuth();

    const event = await eventUseCases.join({
      invitationCode,
      userId: session.user.id,
      userName: session.user.name,
    });

    revalidatePath("/events");
    revalidatePath("/dashboard");

    return { success: true, data: { id: event.id } };
  } catch (error) {
    console.error("Error joining event:", error);
    return {
      success: false,
      error:
        error instanceof Error
          ? error.message
          : "Erreur lors de la participation à l'événement",
    };
  }
}

/**
 * Récupérer tous les événements de l'utilisateur
 */
export async function getMyEvents(): Promise<
  ActionResult<Awaited<ReturnType<typeof eventUseCases.getByUserId>>>
> {
  try {
    const session = await requireAuth();
    const events = await eventUseCases.getByUserId(session.user.id);

    return { success: true, data: events };
  } catch (error) {
    console.error("Error fetching events:", error);
    return {
      success: false,
      error:
        error instanceof Error
          ? error.message
          : "Erreur lors de la récupération des événements",
    };
  }
}

/**
 * Récupérer les détails d'un événement
 */
export async function getEventById(
  id: string
): Promise<ActionResult<Awaited<ReturnType<typeof eventUseCases.getById>>>> {
  try {
    const session = await requireAuth();
    const event = await eventUseCases.getById(id, session.user.id);

    return { success: true, data: event };
  } catch (error) {
    console.error("Error fetching event:", error);
    return {
      success: false,
      error:
        error instanceof Error
          ? error.message
          : "Erreur lors de la récupération de l'événement",
    };
  }
}

/**
 * Récupérer un événement avec toutes les listes des autres participants
 */
export async function getEventWithLists(id: string): Promise<
  ActionResult<Awaited<ReturnType<typeof eventUseCases.getEventWithLists>>>
> {
  try {
    const session = await requireAuth();
    const event = await eventUseCases.getEventWithLists(id, session.user.id);

    return { success: true, data: event };
  } catch (error) {
    console.error("Error fetching event with lists:", error);
    return {
      success: false,
      error:
        error instanceof Error
          ? error.message
          : "Erreur lors de la récupération de l'événement",
    };
  }
}

/**
 * Récupérer les listes des autres participants
 */
export async function getOtherLists(
  eventId: string
): Promise<
  ActionResult<Awaited<ReturnType<typeof eventUseCases.getOtherLists>>>
> {
  try {
    const session = await requireAuth();
    const lists = await eventUseCases.getOtherLists(eventId, session.user.id);

    return { success: true, data: lists };
  } catch (error) {
    console.error("Error fetching other lists:", error);
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
 * Récupérer ma liste personnelle dans un événement
 */
export async function getMyList(
  eventId: string
): Promise<ActionResult<Awaited<ReturnType<typeof eventUseCases.getMyList>>>> {
  try {
    const session = await requireAuth();
    const list = await eventUseCases.getMyList(eventId, session.user.id);

    return { success: true, data: list };
  } catch (error) {
    console.error("Error fetching my list:", error);
    return {
      success: false,
      error:
        error instanceof Error
          ? error.message
          : "Erreur lors de la récupération de votre liste",
    };
  }
}

/**
 * Récupérer les participants d'un événement
 */
export async function getEventParticipants(
  eventId: string
): Promise<
  ActionResult<Awaited<ReturnType<typeof eventUseCases.getParticipants>>>
> {
  try {
    const session = await requireAuth();
    const participants = await eventUseCases.getParticipants(
      eventId,
      session.user.id
    );

    return { success: true, data: participants };
  } catch (error) {
    console.error("Error fetching participants:", error);
    return {
      success: false,
      error:
        error instanceof Error
          ? error.message
          : "Erreur lors de la récupération des participants",
    };
  }
}

/**
 * Supprimer un événement
 */
export async function deleteEvent(id: string): Promise<ActionResult<void>> {
  try {
    const session = await requireAuth();
    await eventUseCases.deleteById(id, session.user.id);

    revalidatePath("/events");
    revalidatePath("/dashboard");

    return { success: true, data: undefined };
  } catch (error) {
    console.error("Error deleting event:", error);
    return {
      success: false,
      error:
        error instanceof Error
          ? error.message
          : "Erreur lors de la suppression de l'événement",
    };
  }
}

/**
 * Mettre à jour un événement
 */
export async function updateEvent(
  id: string,
  data: { title?: string; description?: string }
): Promise<ActionResult<void>> {
  try {
    const session = await requireAuth();
    await eventUseCases.update(id, session.user.id, data);

    revalidatePath(`/events/${id}`);
    revalidatePath("/events");
    revalidatePath("/dashboard");

    return { success: true, data: undefined };
  } catch (error) {
    console.error("Error updating event:", error);
    return {
      success: false,
      error:
        error instanceof Error
          ? error.message
          : "Erreur lors de la mise à jour de l'événement",
    };
  }
}

