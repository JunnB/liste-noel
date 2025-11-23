/**
 * Script de migration des données pour le système de dettes
 * 
 * Ce script doit être exécuté APRÈS avoir appliqué la migration SQL
 * 
 * Il va :
 * 1. Trouver tous les cadeaux avec plusieurs contributions
 * 2. Marquer la première contribution (par date) comme "hasAdvanced = true"
 * 3. Créer les dettes correspondantes
 * 
 * Usage: npx tsx prisma/seed-debts.ts
 */

import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

async function migrateDebts() {
  console.log("🚀 Début de la migration des dettes...\n");

  try {
    // 1. Récupérer tous les items avec leurs contributions
    const items = await prisma.item.findMany({
      include: {
        contributions: {
          orderBy: { createdAt: "asc" },
          include: { user: true },
        },
      },
    });

    console.log(`📦 ${items.length} cadeaux trouvés\n`);

    let itemsProcessed = 0;
    let debtsCreated = 0;

    for (const item of items) {
      // Ne traiter que les cadeaux avec plusieurs contributions
      if (item.contributions.length <= 1) {
        continue;
      }

      console.log(`\n🎁 Traitement: ${item.title}`);
      console.log(`   ${item.contributions.length} contributions`);

      // 2. Marquer la première contribution comme "hasAdvanced"
      const firstContrib = item.contributions[0];
      
      await prisma.contribution.update({
        where: { id: firstContrib.id },
        data: { hasAdvanced: true },
      });

      console.log(`   ✅ ${firstContrib.user.name} marqué comme ayant avancé l'argent`);

      // 3. Créer les dettes pour les autres contributeurs
      for (const contrib of item.contributions) {
        if (contrib.userId === firstContrib.userId) continue;

        // Vérifier si la dette existe déjà
        const existingDebt = await prisma.debt.findUnique({
          where: {
            itemId_fromUserId_toUserId: {
              itemId: item.id,
              fromUserId: contrib.userId,
              toUserId: firstContrib.userId,
            },
          },
        });

        if (existingDebt) {
          console.log(`   ⏭️  Dette déjà existante pour ${contrib.user.name}`);
          continue;
        }

        // Créer la dette
        await prisma.debt.create({
          data: {
            itemId: item.id,
            fromUserId: contrib.userId,
            toUserId: firstContrib.userId,
            amount: contrib.amount,
          },
        });

        debtsCreated++;
        console.log(`   💰 Dette créée: ${contrib.user.name} doit ${contrib.amount}€ à ${firstContrib.user.name}`);
      }

      itemsProcessed++;
    }

    console.log(`\n\n✅ Migration terminée !`);
    console.log(`   ${itemsProcessed} cadeaux traités`);
    console.log(`   ${debtsCreated} dettes créées`);
  } catch (error) {
    console.error("\n❌ Erreur lors de la migration:", error);
    throw error;
  } finally {
    await prisma.$disconnect();
  }
}

// Exécuter la migration
migrateDebts()
  .then(() => {
    console.log("\n🎉 Migration réussie !");
    process.exit(0);
  })
  .catch((error) => {
    console.error("\n💥 La migration a échoué:", error);
    process.exit(1);
  });

