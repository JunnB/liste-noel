import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

async function main() {
  console.log('🌱 Début du seeding...');

  // Hash du mot de passe commun
  const hashedPassword = await bcrypt.hash('azerty123', 10);

  // Création des utilisateurs
  const participants = [
    { name: 'Iris', email: 'iris@noel2025.local' },
    { name: 'Anne', email: 'anne@noel2025.local' },
    { name: 'Junior', email: 'junior@noel2025.local' },
    { name: 'Syham', email: 'syham@noel2025.local' },
    { name: 'Soren', email: 'soren@noel2025.local' },
    { name: 'Luce', email: 'luce@noel2025.local' },
    { name: 'Gilles', email: 'gilles@noel2025.local' },
    { name: 'Andrée', email: 'andree@noel2025.local' },
  ];

  console.log('👥 Création des utilisateurs...');
  const users = [];
  
  for (const participant of participants) {
    const user = await prisma.user.upsert({
      where: { email: participant.email },
      update: {},
      create: {
        email: participant.email,
        name: participant.name,
        emailVerified: true,
      },
    });

    // Création du compte avec mot de passe
    await prisma.account.upsert({
      where: {
        userId_accountId: {
          userId: user.id,
          accountId: user.id,
        },
      },
      update: {},
      create: {
        userId: user.id,
        accountId: user.id,
        providerId: 'credential',
        password: hashedPassword,
      },
    });

    users.push(user);
    console.log(`✅ Utilisateur créé: ${user.name} (${user.email})`);
  }

  // Création de l'événement Noël 2025
  console.log('🎄 Création de l\'événement Noël 2025...');
  const juniorUser = users.find((u) => u.name === 'Junior');
  
  if (!juniorUser) {
    throw new Error('Utilisateur Junior non trouvé');
  }

  const event = await prisma.event.upsert({
    where: { invitationCode: 'NOEL2025' },
    update: {},
    create: {
      title: 'Noël 2025',
      description: 'Échange de cadeaux pour Noël 2025',
      creatorId: juniorUser.id,
      invitationCode: 'NOEL2025',
    },
  });

  console.log(`✅ Événement créé: ${event.title} (Code: ${event.invitationCode})`);

  // Ajout de tous les participants à l'événement
  console.log('🎁 Ajout des participants à l\'événement...');
  for (const user of users) {
    await prisma.eventParticipant.upsert({
      where: {
        eventId_userId: {
          eventId: event.id,
          userId: user.id,
        },
      },
      update: {},
      create: {
        eventId: event.id,
        userId: user.id,
      },
    });
    console.log(`✅ ${user.name} ajouté(e) à l'événement`);
  }

  // Création des listes pour chaque participant
  console.log('📝 Création des listes...');
  for (const user of users) {
    await prisma.list.upsert({
      where: {
        eventId_userId: {
          eventId: event.id,
          userId: user.id,
        },
      },
      update: {},
      create: {
        userId: user.id,
        eventId: event.id,
        title: `Liste de ${user.name}`,
        description: `Liste de cadeaux de ${user.name} pour Noël 2025`,
      },
    });
    console.log(`✅ Liste créée pour ${user.name}`);
  }

  // Ajout des cadeaux pour Anne
  console.log('🎁 Ajout des cadeaux pour Anne...');
  const anneUser = users.find((u) => u.name === 'Anne');
  if (anneUser) {
    const anneList = await prisma.list.findUnique({
      where: {
        eventId_userId: {
          eventId: event.id,
          userId: anneUser.id,
        },
      },
    });

    if (anneList) {
      const anneGifts = [
        {
          title: 'Trousse de toilette Cabaïa',
          description: 'Trousse de toilette Cabaïa rose totelé Gold Coast',
        },
        {
          title: 'La famille d\'en face',
          description: 'Roman de Nicole Trope',
        },
        {
          title: 'Tome 7 de la saga des sept sœurs',
          description: 'Lucinda Riley',
        },
        {
          title: 'Paire de mitaines',
          description: 'Rose beige léopard au choix chez Promod ou Etam',
        },
        {
          title: 'Pochette ordinateur 16 pouces',
          description: 'Cabaïa modèle léopard',
        },
      ];

      for (const gift of anneGifts) {
        await prisma.item.create({
          data: {
            listId: anneList.id,
            title: gift.title,
            description: gift.description,
          },
        });
      }
      console.log(`✅ ${anneGifts.length} cadeaux ajoutés pour Anne`);
    }
  }

  // Ajout des cadeaux pour Iris
  console.log('🎁 Ajout des cadeaux pour Iris...');
  const irisUser = users.find((u) => u.name === 'Iris');
  if (irisUser) {
    const irisList = await prisma.list.findUnique({
      where: {
        eventId_userId: {
          eventId: event.id,
          userId: irisUser.id,
        },
      },
    });

    if (irisList) {
      const irisGifts = [
        {
          title: 'Cape à étoiles et paillettes blanc',
          description: 'Sur Vertbaudet',
        },
        {
          title: 'Set de maquillage Beauty Rose Souza',
          description: 'Vertbaudet',
        },
        {
          title: 'Blopens',
          description: 'Stitch ou Gaby la maison magique sur Amazon',
        },
        {
          title: 'Déguisement robe de princesse rose',
          description: 'Taille 6 ans',
        },
        {
          title: 'Malette de feutres crayons',
          description: 'Adaptée aux enfants',
        },
      ];

      for (const gift of irisGifts) {
        await prisma.item.create({
          data: {
            listId: irisList.id,
            title: gift.title,
            description: gift.description,
          },
        });
      }
      console.log(`✅ ${irisGifts.length} cadeaux ajoutés pour Iris`);
    }
  }

  // Ajout des cadeaux pour Luce
  console.log('🎁 Ajout des cadeaux pour Luce...');
  const luceUser = users.find((u) => u.name === 'Luce');
  if (luceUser) {
    const luceList = await prisma.list.findUnique({
      where: {
        eventId_userId: {
          eventId: event.id,
          userId: luceUser.id,
        },
      },
    });

    if (luceList) {
      const luceGifts = [
        {
          title: 'Gilet sans manche sherpa noir',
          description: 'Taille 40 ou M - Promod, Bonobo, Kiabi, etc. (en ligne)',
        },
        {
          title: 'Carte cadeau pour des plantes',
          description: 'Chez Ladan - Voir avec Gilles pour qu\'il aille si vous choisissez cette option',
        },
        {
          title: 'Nappe imprimée en coton rectangulaire',
          description: '250cm x 150cm',
        },
        {
          title: 'Gouttes illuminatrices',
          description: 'Acide hyaluronique et vitamine C - Aromazone',
        },
        {
          title: 'Elixir de fleurs précieuses de rose de damas',
          description: 'Aromazone',
        },
        {
          title: 'Chaussures Montana Blackfox',
          description: 'Disponible sur Gamm Vert',
          amazonUrl: 'https://www.gammvert.fr/p/chaussures-montana-blackfox-2002620',
        },
      ];

      for (const gift of luceGifts) {
        await prisma.item.create({
          data: {
            listId: luceList.id,
            title: gift.title,
            description: gift.description,
            amazonUrl: gift.amazonUrl,
          },
        });
      }
      console.log(`✅ ${luceGifts.length} cadeaux ajoutés pour Luce`);
    }
  }

  // Ajout des cadeaux pour Gilles
  console.log('🎁 Ajout des cadeaux pour Gilles...');
  const gillesUser = users.find((u) => u.name === 'Gilles');
  if (gillesUser) {
    const gillesList = await prisma.list.findUnique({
      where: {
        eventId_userId: {
          eventId: event.id,
          userId: gillesUser.id,
        },
      },
    });

    if (gillesList) {
      const gillesGifts = [
        {
          title: 'Biofourche 4 dents Devaux JAD Jardin',
          description: 'Grelinette 4 dents - Disponible à Castorama Quimper (Syham peut la récupérer)',
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
      console.log(`✅ ${gillesGifts.length} cadeau(x) ajouté(s) pour Gilles`);
    }
  }

  console.log('');
  console.log('🎉 Seeding terminé avec succès !');
  console.log('');
  console.log('📋 Récapitulatif:');
  console.log(`   - ${users.length} utilisateurs créés`);
  console.log(`   - 1 événement créé: ${event.title}`);
  console.log(`   - Code d'invitation: ${event.invitationCode}`);
  console.log(`   - Mot de passe pour tous: azerty123`);
  console.log('');
  console.log('👤 Utilisateurs créés:');
  users.forEach((user) => {
    console.log(`   - ${user.name}: ${user.email}`);
  });
}

main()
  .catch((e) => {
    console.error('❌ Erreur lors du seeding:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });

