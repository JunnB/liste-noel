/**
 * Script de migration pour transformer les listes existantes en système d'événements
 * 
 * Ce script :
 * 1. Crée un événement "Migration - Listes existantes" pour chaque utilisateur ayant des listes
 * 2. Associe toutes les listes de cet utilisateur à cet événement
 * 3. Ajoute l'utilisateur comme participant de son événement
 * 4. Crée des participants pour tous les utilisateurs ayant contribué aux listes
 */

import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

async function main() {
  console.log("🚀 Début de la migration vers le système d'événements...\n");

  try {
    // 1. Récupérer toutes les listes existantes avec leurs propriétaires
    const lists = await prisma.list.findMany({
      include: {
        user: true,
        items: {
          include: {
            contributions: {
              include: {
                user: true,
              },
            },
          },
        },
      },
    });

    console.log(`📋 ${lists.length} listes trouvées\n`);

    if (lists.length === 0) {
      console.log("✅ Aucune liste à migrer");
      return;
    }

    // 2. Grouper les listes par utilisateur
    const listsByUser = new Map<string, typeof lists>();
    lists.forEach((list) => {
      const userId = list.userId;
      if (!listsByUser.has(userId)) {
        listsByUser.set(userId, []);
      }
      listsByUser.get(userId)!.push(list);
    });

    console.log(`👥 ${listsByUser.size} utilisateurs avec des listes\n`);

    // 3. Pour chaque utilisateur, créer un événement et migrer ses listes
    for (const [userId, userLists] of listsByUser.entries()) {
      const user = userLists[0].user;
      console.log(`\n🔄 Migration des listes de ${user.name} (${user.email})`);

      // Créer un événement pour cet utilisateur
      const event = await prisma.event.create({
        data: {
          title: `Mes listes de cadeaux`,
          description: "Événement créé automatiquement lors de la migration",
          creatorId: userId,
        },
      });

      console.log(`  ✓ Événement créé: ${event.title} (${event.id})`);

      // Ajouter le créateur comme participant
      await prisma.eventParticipant.create({
        data: {
          eventId: event.id,
          userId: userId,
        },
      });

      console.log(`  ✓ Créateur ajouté comme participant`);

      // Collecter tous les contributeurs uniques
      const contributorIds = new Set<string>();
      userLists.forEach((list) => {
        list.items.forEach((item) => {
          item.contributions.forEach((contrib) => {
            if (contrib.userId !== userId) {
              contributorIds.add(contrib.userId);
            }
          });
        });
      });

      // Ajouter les contributeurs comme participants
      for (const contributorId of contributorIds) {
        try {
          await prisma.eventParticipant.create({
            data: {
              eventId: event.id,
              userId: contributorId,
            },
          });
        } catch (error) {
          // Ignorer les doublons
          console.log(`  ⚠ Participant déjà ajouté: ${contributorId}`);
        }
      }

      if (contributorIds.size > 0) {
        console.log(`  ✓ ${contributorIds.size} contributeur(s) ajouté(s) comme participants`);
      }

      // Associer toutes les listes à cet événement
      for (const list of userLists) {
        await prisma.list.update({
          where: { id: list.id },
          data: { eventId: event.id },
        });
      }

      console.log(`  ✓ ${userLists.length} liste(s) associée(s) à l'événement`);
    }

    console.log("\n\n✅ Migration terminée avec succès !");
    console.log("\n📊 Résumé:");
    console.log(`  - ${listsByUser.size} événements créés`);
    console.log(`  - ${lists.length} listes migrées`);

  } catch (error) {
    console.error("\n❌ Erreur lors de la migration:", error);
    throw error;
  }
}

main()
  .then(async () => {
    await prisma.$disconnect();
  })
  .catch(async (e) => {
    console.error(e);
    await prisma.$disconnect();
    process.exit(1);
  });

