"use server";

import { requireAuth } from "@/lib/server-auth";
import * as activityUseCases from "@/lib/use-cases/activity";

export type ActionResult<T = void> = { success: true; data: T } | { success: false; error: string };

export async function getRecentActivity(): Promise<ActionResult<activityUseCases.Activity[]>> {
  try {
    const session = await requireAuth();
    const activity = await activityUseCases.getRecentActivity(session.user.id);
    return { success: true, data: activity };
  } catch (error) {
    console.error("Error fetching recent activity:", error);
    return { success: false, error: "Erreur lors de la récupération de l'activité" };
  }
}

export async function getStats(): Promise<ActionResult<{ eventsCount: number; contributionsCount: number; itemsCount: number }>> {
  try {
    const session = await requireAuth();
    const stats = await activityUseCases.getStats(session.user.id);
    return { success: true, data: stats };
  } catch (error) {
    console.error("Error fetching stats:", error);
    return { success: false, error: "Erreur lors de la récupération des statistiques" };
  }
}

