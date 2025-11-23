import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

/**
 * Script pour recalculer toutes les dettes basées sur les contributions avec hasAdvanced
 * 
 * Mode dry-run par défaut pour vérifier avant d'exécuter
 * Utiliser: npm run recalculate-debts -- --execute pour exécuter réellement
 */

interface DebtToCreate {
  itemId: string;
  itemTitle: string;
  fromUserId: string;
  fromUserName: string;
  toUserId: string;
  toUserName: string;
  amount: number;
}

async function recalculateDebts(dryRun: boolean = true) {
  console.log("\n🔄 Recalcul des dettes...\n");
  console.log(`Mode: ${dryRun ? "🔍 DRY-RUN (simulation)" : "⚠️  EXECUTION RÉELLE"}\n`);

  try {
    // 1. Récupérer toutes les contributions avec hasAdvanced = true
    const advancedContributions = await prisma.contribution.findMany({
      where: {
        hasAdvanced: true,
        contributionType: "PARTIAL",
      },
      include: {
        user: true,
        item: {
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

    console.log(`📊 Trouvé ${advancedContributions.length} contribution(s) avec hasAdvanced = true\n`);

    if (advancedContributions.length === 0) {
      console.log("✅ Aucune dette à recalculer\n");
      return;
    }

    // 2. Grouper par item pour éviter les doublons
    const itemsWithAdvancer = new Map<string, typeof advancedContributions[0]>();
    
    for (const contrib of advancedContributions) {
      if (!itemsWithAdvancer.has(contrib.itemId)) {
        itemsWithAdvancer.set(contrib.itemId, contrib);
      }
    }

    console.log(`🎁 ${itemsWithAdvancer.size} cadeau(x) concerné(s)\n`);

    // 3. Pour chaque item, calculer les dettes
    const debtsToCreate: DebtToCreate[] = [];
    const existingDebts = await prisma.debt.findMany({
      include: {
        fromUser: true,
        toUser: true,
        item: true,
      },
    });

    console.log(`📋 Dettes actuelles en base: ${existingDebts.length}\n`);
    console.log("Détail des dettes actuelles:");
    for (const debt of existingDebts) {
      console.log(`  - ${debt.fromUser.name} → ${debt.toUser.name}: ${debt.amount}€ (${debt.item.title}) ${debt.isSettled ? "✅ Réglée" : "⏳ En attente"}`);
    }
    console.log("");

    for (const [itemId, advancerContrib] of itemsWithAdvancer) {
      const allContributions = advancerContrib.item.contributions;
      
      console.log(`\n📦 Cadeau: "${advancerContrib.item.title}"`);
      console.log(`   Avanceur: ${advancerContrib.user.name} (${advancerContrib.amount}€)`);
      console.log(`   Contributions totales: ${allContributions.length}`);

      // Pour chaque autre contributeur, créer une dette
      for (const contrib of allContributions) {
        if (contrib.userId === advancerContrib.userId) {
          console.log(`   ✓ ${contrib.user.name}: ${contrib.amount}€ (avanceur)`);
          continue;
        }

        console.log(`   → ${contrib.user.name}: ${contrib.amount}€ (doit rembourser)`);

        debtsToCreate.push({
          itemId: itemId,
          itemTitle: advancerContrib.item.title,
          fromUserId: contrib.userId,
          fromUserName: contrib.user.name,
          toUserId: advancerContrib.userId,
          toUserName: advancerContrib.user.name,
          amount: contrib.amount,
        });
      }
    }

    console.log(`\n\n📊 RÉSUMÉ:`);
    console.log(`   Dettes actuelles: ${existingDebts.length}`);
    console.log(`   Dettes à créer: ${debtsToCreate.length}\n`);

    if (debtsToCreate.length === 0) {
      console.log("✅ Aucune nouvelle dette à créer\n");
      return;
    }

    console.log("📝 Dettes qui seront créées:");
    for (const debt of debtsToCreate) {
      console.log(`   - ${debt.fromUserName} → ${debt.toUserName}: ${debt.amount}€ (${debt.itemTitle})`);
    }
    console.log("");

    if (dryRun) {
      console.log("⚠️  MODE DRY-RUN: Aucune modification effectuée");
      console.log("   Pour exécuter réellement, lancez:");
      console.log("   npm run recalculate-debts -- --execute\n");
      return;
    }

    // 4. Supprimer toutes les anciennes dettes (sauf celles réglées)
    console.log("\n🗑️  Suppression des anciennes dettes non réglées...");
    const deleteResult = await prisma.debt.deleteMany({
      where: {
        isSettled: false,
      },
    });
    console.log(`   ✓ ${deleteResult.count} dette(s) supprimée(s)`);

    // 5. Créer les nouvelles dettes
    console.log("\n✨ Création des nouvelles dettes...");
    let created = 0;
    for (const debt of debtsToCreate) {
      try {
        await prisma.debt.create({
          data: {
            itemId: debt.itemId,
            fromUserId: debt.fromUserId,
            toUserId: debt.toUserId,
            amount: debt.amount,
          },
        });
        created++;
        console.log(`   ✓ ${debt.fromUserName} → ${debt.toUserName}: ${debt.amount}€`);
      } catch (error: any) {
        // Ignorer les erreurs de contrainte unique (dette déjà existante)
        if (error.code === "P2002") {
          console.log(`   ⚠️  Dette déjà existante: ${debt.fromUserName} → ${debt.toUserName}`);
        } else {
          console.error(`   ❌ Erreur: ${error.message}`);
        }
      }
    }

    console.log(`\n✅ Recalcul terminé: ${created} dette(s) créée(s)\n`);

  } catch (error) {
    console.error("\n❌ Erreur lors du recalcul:", error);
    throw error;
  } finally {
    await prisma.$disconnect();
  }
}

// Exécution
const args = process.argv.slice(2);
const execute = args.includes("--execute");

recalculateDebts(!execute)
  .then(() => {
    process.exit(0);
  })
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });

