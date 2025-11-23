import { headers } from "next/headers";
import { auth } from "@/lib/auth";

export type AuthUser = {
  id: string;
  email: string;
  name: string;
};

export type AuthSession = {
  user: AuthUser;
};

/**
 * Récupère la session utilisateur pour les server actions
 * @throws Error si l'utilisateur n'est pas authentifié
 */
export async function requireAuth(): Promise<AuthSession> {
  const session = await auth.api.getSession({
    headers: await headers(),
  });

  if (!session?.user) {
    throw new Error("Unauthorized");
  }

  return {
    user: {
      id: session.user.id,
      email: session.user.email,
      name: session.user.name,
    },
  };
}

/**
 * Récupère la session utilisateur pour les server actions (optionnel)
 * @returns La session ou null si non authentifié
 */
export async function getAuth(): Promise<AuthSession | null> {
  try {
    const session = await auth.api.getSession({
      headers: await headers(),
    });

    if (!session?.user) {
      return null;
    }

    return {
      user: {
        id: session.user.id,
        email: session.user.email,
        name: session.user.name,
      },
    };
  } catch {
    return null;
  }
}

