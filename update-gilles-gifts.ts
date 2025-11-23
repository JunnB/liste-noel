import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  console.log('🔄 Mise à jour des cadeaux de Gilles...');

  // Trouver Gilles
  const gillesUser = await prisma.user.findUnique({
    where: { email: 'gilles@test.com' },
  });

  if (!gillesUser) {
    console.log('❌ Utilisateur Gilles non trouvé');
    return;
  }

  // Trouver l'événement Noël 2025
  const event = await prisma.event.findUnique({
    where: { invitationCode: 'NOEL2025' },
  });

  if (!event) {
    console.log('❌ Événement Noël 2025 non trouvé');
    return;
  }

  // Trouver la liste de Gilles
  const gillesList = await prisma.list.findUnique({
    where: {
      eventId_userId: {
        eventId: event.id,
        userId: gillesUser.id,
      },
    },
  });

  if (!gillesList) {
    console.log('❌ Liste de Gilles non trouvée');
    return;
  }

  // Supprimer les anciens cadeaux
  await prisma.item.deleteMany({
    where: { listId: gillesList.id },
  });

  // Ajouter les nouveaux cadeaux
  const gillesGifts = [
    {
      title: 'Grelinette Bio-Fourche Etsy',
      description: 'Grelinette artisanale sur Etsy',
      amazonUrl: 'https://www.etsy.com/fr/listing/748886796/grelinette-bio-fourche',
    },
    {
      title: 'Biofourche 4 dents Devaux JAD Jardin',
      description: 'Grelinette 4 dents - Disponible à Castorama Quimper',
      amazonUrl: 'https://www.castorama.fr/biofourche-4-dents-devaux-jad-jardin/3260770103333_CAFR.prd',
    },
  ];

  for (const gift of gillesGifts) {
    await prisma.item.create({
      data: {
        listId: gillesList.id,
        title: gift.title,
        description: gift.description,
        amazonUrl: gift.amazonUrl,
      },
    });
  }

  console.log(`✅ ${gillesGifts.length} cadeaux mis à jour pour Gilles`);
  console.log('');
  console.log('📋 Nouveaux cadeaux:');
  gillesGifts.forEach((gift, index) => {
    console.log(`   ${index + 1}. ${gift.title}`);
  });
}

main()
  .catch((e) => {
    console.error('❌ Erreur:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
