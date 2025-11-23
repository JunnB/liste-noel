# Guide de Seeding - Noël 2025

Ce guide explique comment initialiser la base de données avec l'événement Noël 2025 et tous les participants.

## 📋 Contenu du Seed

Le script de seed crée automatiquement :

### 👥 Utilisateurs (8 participants)
Tous les utilisateurs ont le même mot de passe : **azerty123**

| Nom | Email |
|-----|-------|
| Iris | iris@noel2025.local |
| Anne | anne@noel2025.local |
| Junior | junior@noel2025.local |
| Syham | syham@noel2025.local |
| Soren | soren@noel2025.local |
| Luce | luce@noel2025.local |
| Gilles | gilles@noel2025.local |
| Andrée | andree@noel2025.local |

### 🎄 Événement
- **Titre** : Noël 2025
- **Description** : Échange de cadeaux pour Noël 2025
- **Code d'invitation** : NOEL2025
- **Créateur** : Junior

### 📝 Listes de cadeaux

#### Anne (5 cadeaux)
1. **Trousse de toilette Cabaïa** - Rose totelé Gold Coast
2. **La famille d'en face** - Roman de Nicole Trope
3. **Tome 7 de la saga des sept sœurs** - Lucinda Riley
4. **Paire de mitaines** - Rose beige léopard au choix chez Promod ou Etam
5. **Pochette ordinateur 16 pouces** - Cabaïa modèle léopard

#### Iris (5 cadeaux)
1. **Cape à étoiles et paillettes blanc** - Sur Vertbaudet
2. **Set de maquillage Beauty Rose Souza** - Vertbaudet
3. **Blopens** - Stitch ou Gaby la maison magique sur Amazon
4. **Déguisement robe de princesse rose** - Taille 6 ans
5. **Malette de feutres crayons** - Adaptée aux enfants

#### Luce (6 cadeaux)
1. **Gilet sans manche sherpa noir** - Taille 40 ou M (Promod, Bonobo, Kiabi, etc.)
2. **Carte cadeau pour des plantes** - Chez Ladan (voir avec Gilles)
3. **Nappe imprimée en coton rectangulaire** - 250cm x 150cm
4. **Gouttes illuminatrices** - Acide hyaluronique et vitamine C (Aromazone)
5. **Elixir de fleurs précieuses de rose de damas** - Aromazone
6. **Chaussures Montana Blackfox** - Gamm Vert

#### Gilles (1 cadeau)
1. **Biofourche 4 dents Devaux JAD Jardin** - Grelinette disponible à Castorama Quimper

## 🚀 Installation

### 1. Installer les dépendances

```bash
npm install
```

### 2. Configurer la base de données

Assurez-vous que votre fichier `.env` contient les variables de connexion à la base de données :

```env
POSTGRES_PRISMA_URL="votre_url_de_connexion"
POSTGRES_URL_NON_POOLING="votre_url_directe"
```

### 3. Appliquer les migrations

```bash
npx prisma migrate dev
```

### 4. Exécuter le seed

```bash
npm run db:seed
```

Ou avec Prisma directement :

```bash
npx prisma db seed
```

## ✅ Vérification

Après l'exécution du script, vous devriez voir :

```
🌱 Début du seeding...
👥 Création des utilisateurs...
✅ Utilisateur créé: Iris (iris@noel2025.local)
✅ Utilisateur créé: Anne (anne@noel2025.local)
...
🎄 Création de l'événement Noël 2025...
✅ Événement créé: Noël 2025 (Code: NOEL2025)
🎁 Ajout des participants à l'événement...
...
📝 Création des listes...
...
🎁 Ajout des cadeaux pour Anne...
✅ 5 cadeaux ajoutés pour Anne
🎁 Ajout des cadeaux pour Iris...
✅ 5 cadeaux ajoutés pour Iris
🎁 Ajout des cadeaux pour Luce...
✅ 6 cadeaux ajoutés pour Luce
🎁 Ajout des cadeaux pour Gilles...
✅ 1 cadeau(x) ajouté(s) pour Gilles

🎉 Seeding terminé avec succès !
```

## 🔐 Connexion

Vous pouvez maintenant vous connecter avec n'importe quel utilisateur :

- **Email** : Un des emails listés ci-dessus (ex: anne@noel2025.local)
- **Mot de passe** : azerty123

## 🔄 Réinitialiser les données

Si vous voulez réinitialiser complètement la base de données :

```bash
# Réinitialiser la base de données
npx prisma migrate reset

# Le seed sera automatiquement exécuté après le reset
```

## 📝 Notes

- Les emails utilisés sont des emails locaux (*.local) pour éviter les conflits avec de vrais emails
- Tous les utilisateurs sont automatiquement vérifiés (emailVerified: true)
- Tous les participants sont automatiquement ajoutés à l'événement Noël 2025
- Une liste vide est créée pour chaque participant (sauf Anne, Iris, Luce et Gilles qui ont déjà des cadeaux)

## 🛠️ Personnalisation

Pour ajouter des cadeaux pour d'autres participants, modifiez le fichier `prisma/seed.ts` en suivant le modèle utilisé pour Anne, Iris, Luce et Gilles.

## 💡 Notes importantes

- **Nappe de Syham** : La nappe initialement sur la liste d'Andrée ne doit pas être prise car Syham en a déjà acheté une
- **Grelinette de Gilles** : Préférence pour le modèle 4 dents de Castorama (Syham peut la récupérer à Quimper)
- **Carte cadeau plantes de Luce** : Voir avec Gilles pour l'achat chez Ladan

