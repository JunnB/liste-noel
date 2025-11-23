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

    const list = await prisma.list.findUnique({
      where: { id },
    });

    if (!list) {
      return NextResponse.json(
        { error: "Liste non trouvée" },
        { status: 404 }
      );
    }

    if (list.userId !== session.user.id) {
      return NextResponse.json(
        { error: "Vous n'avez pas accès à cette liste" },
        { status: 403 }
      );
    }

    const { title, description, amazonUrl, desiredAmount } = await request.json();

    if (!title || title.trim().length === 0) {
      return NextResponse.json(
        { error: "Le titre de l'article est requis" },
        { status: 400 }
      );
    }

    const item = await prisma.item.create({
      data: {
        listId: id,
        title,
        description: description || null,
        amazonUrl: amazonUrl || null,
        desiredAmount: desiredAmount ? parseFloat(desiredAmount) : null,
      },
    });

    return NextResponse.json(item, { status: 201 });
  } catch (error) {
    console.error("Error creating item:", error);
    return NextResponse.json(
      { error: "Erreur lors de la création de l'article" },
      { status: 500 }
    );
  }
}

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
      where: { id },
      include: {
        items: true,
      },
    });

    if (!list) {
      return NextResponse.json(
        { error: "Liste non trouvée" },
        { status: 404 }
      );
    }

    return NextResponse.json(list);
  } catch (error) {
    console.error("Error fetching items:", error);
    return NextResponse.json(
      { error: "Erreur lors de la récupération des articles" },
      { status: 500 }
    );
  }
}
