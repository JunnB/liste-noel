import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { auth } from "@/lib/auth";
import { calculateDebts } from "@/lib/debts";

export async function GET(request: NextRequest) {
  try {
    const session = await auth.api.getSession({
      headers: request.headers,
    });

    if (!session?.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // Get all contributions for lists where user is a participant
    const contributions = await prisma.contribution.findMany({
      where: {
        item: {
          list: {
            OR: [
              { userId: session.user.id }, // Lists created by user
              {
                // Lists where user has contributed
                items: {
                  some: {
                    contributions: {
                      some: {
                        userId: session.user.id,
                      },
                    },
                  },
                },
              },
            ],
          },
        },
      },
      include: {
        user: true,
        item: {
          include: {
            list: true,
          },
        },
      },
    });

    // Format contributions for debt calculation
    const formattedContribs = contributions.map((c: any) => ({
      userId: c.userId,
      userName: c.user.name,
      amount: c.amount,
      itemId: c.item.id,
      itemTitle: c.item.title,
    }));

    // Calculate debts
    const debts = calculateDebts(formattedContribs);

    return NextResponse.json({
      debts,
      contributorCount: new Set(formattedContribs.map((c: any) => c.userId)).size,
    });
  } catch (error) {
    console.error("Error calculating debts:", error);
    return NextResponse.json(
      { error: "Erreur lors du calcul des débts" },
      { status: 500 }
    );
  }
}
