import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { auth } from "@/lib/auth";

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const session = await auth.api.getSession({
      headers: request.headers,
    });

    if (!session?.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const list = await prisma.list.findUnique({
      where: { invitationCode: id },
      include: {
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
    });

    if (!list) {
      return NextResponse.json(
        { error: "Code d'invitation invalide" },
        { status: 404 }
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
