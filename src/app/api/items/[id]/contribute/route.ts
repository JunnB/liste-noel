import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { auth } from "@/lib/auth";

export async function POST(
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

    const { amount, note } = await request.json();

    if (amount === undefined || amount < 0) {
      return NextResponse.json(
        { error: "Le montant doit être positif" },
        { status: 400 }
      );
    }

    const item = await prisma.item.findUnique({
      where: { id },
    });

    if (!item) {
      return NextResponse.json(
        { error: "Article non trouvé" },
        { status: 404 }
      );
    }

    // Upsert contribution
    const contribution = await prisma.contribution.upsert({
      where: {
        itemId_userId: {
          itemId: id,
          userId: session.user.id,
        },
      },
      update: {
        amount: parseFloat(amount),
        note: note || null,
      },
      create: {
        itemId: id,
        userId: session.user.id,
        amount: parseFloat(amount),
        note: note || null,
      },
      include: {
        user: true,
      },
    });

    return NextResponse.json(contribution, { status: 200 });
  } catch (error) {
    console.error("Error creating contribution:", error);
    return NextResponse.json(
      { error: "Erreur lors de la création de la contribution" },
      { status: 500 }
    );
  }
}

export async function DELETE(
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

    const contribution = await prisma.contribution.delete({
      where: {
        itemId_userId: {
          itemId: id,
          userId: session.user.id,
        },
      },
    });

    return NextResponse.json(contribution);
  } catch (error) {
    console.error("Error deleting contribution:", error);
    return NextResponse.json(
      { error: "Erreur lors de la suppression de la contribution" },
      { status: 500 }
    );
  }
}
