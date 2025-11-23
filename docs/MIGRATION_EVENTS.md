# Migration vers le système d'événements

## ✅ Changements implémentés

Le système de partage de listes individuelles a été remplacé par un système d'événements collectifs plus simple et intuitif.

### Nouveau concept

Au lieu de partager chaque liste individuellement, vous créez maintenant des **événements** (ex: "Noël 2025") où :
- Une personne crée l'événement et obtient un lien d'invitation
- Tous les participants rejoignent via ce lien unique
- Chaque participant obtient automatiquement sa propre liste
- Tout le monde voit les listes des autres (sauf la sienne) pour contribuer

## 🗄️ Modifications de la base de données

### Nouveaux modèles

1. **Event** - Représente un événement (ex: Noël 2025)
   - `id`, `title`, `description`
   - `creatorId` (créateur de l'événement)
   - `invitationCode` (code unique pour rejoindre)
   - `createdAt`, `updatedAt`

2. **EventParticipant** - Lien entre un événement et ses participants
   - `id`, `eventId`, `userId`
   - `joinedAt`
   - Index unique sur `[eventId, userId]`

### Modifications du modèle List

- ✅ Ajout de `eventId` (obligatoire)
- ❌ Suppression de `invitationCode` (remplacé par le code de l'événement)
- ✅ Ajout d'un index unique sur `[eventId, userId]` (une seule liste par utilisateur par événement)

## 📁 Nouveaux fichiers créés

### Backend

- `src/lib/repositories/event.ts` - Repository pour les événements
- `src/lib/use-cases/event.ts` - Logique métier des événements
- `src/actions/events.ts` - Server actions pour les événements
- `src/types/index.ts` - Types TypeScript mis à jour

### Frontend

- `src/app/events/page.tsx` - Liste des événements
- `src/app/events/[id]/page.tsx` - Détail d'un événement avec toutes les listes
- `src/app/events/join/page.tsx` - Page pour rejoindre un événement

### Scripts

- `scripts/migrate-to-events.ts` - Script de migration des données existantes

## 🗑️ Fichiers supprimés

- `src/app/join/page.tsx` (remplacé par `/events/join`)
- `src/app/lists/shared/[id]/page.tsx` (remplacé par la vue événement)

## 📝 Fichiers modifiés

### Backend
- `src/lib/repositories/list.ts` - Adapté pour les événements
- `src/lib/use-cases/list.ts` - Suppression des méthodes de partage obsolètes
- `src/actions/lists.ts` - Nettoyage des actions obsolètes
- `src/actions/index.ts` - Ajout des exports pour les événements

### Frontend
- `src/app/dashboard/page.tsx` - Affiche maintenant les événements au lieu des listes
- `src/app/lists/[id]/ListDetailClient.tsx` - Lien de retour vers l'événement
- `src/app/lists/[id]/ListDetailWrapper.tsx` - Types mis à jour

## 🚀 Déploiement

### 1. Appliquer la migration de base de données

```bash
npx prisma migrate deploy
```

Ou si vous êtes en développement :

```bash
npx prisma migrate dev
```

### 2. Migrer les données existantes (optionnel)

Si vous avez des listes existantes à migrer :

```bash
npx tsx scripts/migrate-to-events.ts
```

Ce script va :
- Créer un événement pour chaque utilisateur ayant des listes
- Associer toutes ses listes à cet événement
- Ajouter automatiquement les contributeurs comme participants

### 3. Régénérer le client Prisma

```bash
npx prisma generate
```

### 4. Rebuild l'application

```bash
npm run build
```

## 🎯 Nouveau flux utilisateur

### Créer un événement
1. Aller sur `/events`
2. Cliquer sur "Créer un événement"
3. Entrer le nom (ex: "Noël 2025")
4. Copier le lien d'invitation

### Rejoindre un événement
1. Recevoir le lien d'invitation
2. Cliquer sur le lien (ou aller sur `/events/join` et entrer le code)
3. Votre liste personnelle est créée automatiquement
4. Vous êtes redirigé vers la page de l'événement

### Participer aux cadeaux
1. Sur la page de l'événement, voir toutes les listes des autres participants
2. Cliquer sur "Je participe à ce cadeau"
3. Entrer le montant et une note optionnelle
4. La contribution est enregistrée

### Gérer sa liste
1. Sur la page de l'événement, cliquer sur "Gérer ma liste"
2. Ajouter/modifier/supprimer des articles
3. Les autres participants voient les changements en temps réel

## 🔄 Compatibilité

### ⚠️ Breaking Changes

- Les anciens liens de partage de listes (`/join/[code]`) ne fonctionnent plus
- Les routes `/lists/shared/[id]` n'existent plus
- Le champ `invitationCode` sur les listes n'existe plus

### ✅ Rétrocompatibilité

- Les listes existantes peuvent être migrées automatiquement
- Les contributions existantes sont préservées
- Les utilisateurs et leurs données restent intacts

## 📊 Avantages du nouveau système

1. **Plus simple** - Un seul lien à partager pour tout le groupe
2. **Plus intuitif** - Concept d'événement familier pour tous
3. **Meilleur UX** - Vue d'ensemble de tous les participants
4. **Moins de confusion** - Plus besoin de partager chaque liste individuellement
5. **Surprise préservée** - Chacun ne voit pas sa propre liste dans la vue partagée

## 🐛 En cas de problème

### La migration échoue

Vérifiez que :
- La base de données est accessible
- Vous avez les droits nécessaires
- Le schéma Prisma est à jour

### Les anciennes routes ne fonctionnent plus

C'est normal ! Redirigez les utilisateurs vers :
- `/events` pour voir leurs événements
- `/events/join` pour rejoindre un événement

### Erreur "eventId is required"

Assurez-vous d'avoir :
1. Appliqué la migration de base de données
2. Exécuté le script de migration des données
3. Régénéré le client Prisma

## 📞 Support

Pour toute question ou problème, consultez :
- Le plan détaillé : `refonte.plan.md`
- Les exemples de code dans les nouveaux fichiers
- Les commentaires dans le code source

