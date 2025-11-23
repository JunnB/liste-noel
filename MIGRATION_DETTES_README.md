# Migration du Système de Dettes - Instructions

## ⚠️ IMPORTANT

Ce système a été implémenté mais **LA MIGRATION N'A PAS ÉTÉ APPLIQUÉE** pour ne pas impacter la base de données de production.

## Étapes à Suivre (Quand Tu Seras Prêt)

### 1. Appliquer la Migration SQL

```bash
cd /Users/juniorbernard/Documents/Github/liste-noel
npx prisma migrate deploy
```

Cette commande va :
- Ajouter le champ `hasAdvanced` à la table `Contribution`
- Créer la nouvelle table `Debt`

### 2. Regénérer le Client Prisma

```bash
npx prisma generate
```

Cela va mettre à jour les types TypeScript pour inclure les nouveaux champs.

### 3. Migrer les Données Existantes

```bash
npx tsx prisma/seed-debts.ts
```

Ce script va :
- Trouver tous les cadeaux avec plusieurs contributions
- Marquer la **première contribution** (par date) comme ayant avancé l'argent
- Créer les dettes correspondantes

### 4. Rebuild l'Application

```bash
npm run build
```

## Fichiers de Migration Créés

- `prisma/migrations/20251123210852_add_debt_system/migration.sql` - Migration SQL
- `prisma/seed-debts.ts` - Script de migration des données
- `docs/SYSTEME_DETTES.md` - Documentation complète du système

## Changements Implémentés

### Base de Données
✅ Schéma Prisma modifié (hasAdvanced + table Debt)
✅ Migration SQL créée (NON APPLIQUÉE)

### Backend
✅ Use-case `debt.ts` créé
✅ Actions `debts.ts` créées
✅ Use-case `contribution.ts` mis à jour
✅ Repository `contribution.ts` mis à jour

### Frontend
✅ `ContributionModal` avec checkbox "J'ai avancé l'argent"
✅ Page `/contributions` refondée avec 3 onglets
✅ Filtre par événement
✅ Bouton "Marquer comme réglé"

## Erreurs TypeScript Actuelles

⚠️ Il y a actuellement 2 erreurs TypeScript car le client Prisma n'a pas encore été regénéré avec le nouveau schéma.

Ces erreurs disparaîtront automatiquement après :
1. Application de la migration (`npx prisma migrate deploy`)
2. Régénération du client (`npx prisma generate`)

## Test en Local

Si tu veux tester sur une base de données de test :

1. Crée une copie de ta base de données
2. Change `DATABASE_URL` dans `.env` pour pointer vers la copie
3. Applique les étapes 1-4 ci-dessus
4. Teste l'application
5. Restaure `DATABASE_URL` vers la prod

## Rollback (Si Besoin)

Si tu veux annuler la migration :

```bash
# Supprimer la dernière migration
npx prisma migrate resolve --rolled-back 20251123210852_add_debt_system

# Supprimer manuellement les données
# (Se connecter à la DB et exécuter)
DROP TABLE "Debt";
ALTER TABLE "Contribution" DROP COLUMN "hasAdvanced";
```

## Questions ?

Consulte `docs/SYSTEME_DETTES.md` pour la documentation complète du système.

