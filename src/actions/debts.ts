"use server";

import { requireAuth } from "@/lib/server-auth";
import * as debtUseCases from "@/lib/use-cases/debt";

export type ActionResult<T = void> =
  | { success: true; data: T }
  | { success: false; error: string };

export async function getMyDebts(eventId?: string): Promise<ActionResult<any[]>> {
  try {
    const session = await requireAuth();
    const debts = await debtUseCases.getMyDebts(session.user.id, eventId);
    return { success: true, data: debts };
  } catch (error) {
    console.error("Error fetching debts:", error);
    return {
      success: false,
      error: "Erreur lors de la récupération des dettes",
    };
  }
}

export async function settleDebt(debtId: string): Promise<ActionResult> {
  try {
    const session = await requireAuth();
    await debtUseCases.settleDebt(debtId, session.user.id);
    return { success: true, data: undefined };
  } catch (error: any) {
    console.error("Error settling debt:", error);
    return { success: false, error: error.message || "Erreur lors du règlement de la dette" };
  }
}

