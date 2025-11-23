import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { auth } from "@/lib/auth";

export async function GET(request: NextRequest) {
  try {
    const session = await auth.api.getSession({
      headers: request.headers,
    });

    if (!session?.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // Get lists where user has contributions (joined lists)
    const sharedLists = await prisma.list.findMany({
      where: {
        items: {
          some: {
            contributions: {
              some: {
                userId: session.user.id,
              },
            },
          },
        },
        userId: {
          not: session.user.id, // Don't include own lists
        },
      },
      include: {
        user: true,
        items: {
          include: {
            contributions: {
              where: {
                userId: session.user.id,
              },
            },
          },
        },
      },
      orderBy: {
        createdAt: "desc",
      },
    });

    return NextResponse.json(sharedLists);
  } catch (error) {
    console.error("Error fetching shared lists:", error);
    return NextResponse.json(
      { error: "Erreur lors de la récupération des listes partagées" },
      { status: 500 }
    );
  }
}
