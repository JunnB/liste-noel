import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { auth } from "@/lib/auth";

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ code: string }> }
) {
  try {
    const { code } = await params;
    const session = await auth.api.getSession({
      headers: request.headers,
    });

    if (!session?.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const list = await prisma.list.findUnique({
      where: { invitationCode: code.toUpperCase() },
      include: {
        user: true,
        items: {
          include: {
            contributions: true,
          },
        },
      },
    });

    if (!list) {
      return NextResponse.json(
        { error: "Code d'invitation invalide" },
        { status: 404 }
      );
    }

    // Don't allow accessing own list from this endpoint
    if (list.userId === session.user.id) {
      return NextResponse.json(
        { error: "C'est votre propre liste" },
        { status: 400 }
      );
    }

    return NextResponse.json(list);
  } catch (error) {
    console.error("Error joining list:", error);
    return NextResponse.json(
      { error: "Erreur lors de l'accès à la liste" },
      { status: 500 }
    );
  }
}
