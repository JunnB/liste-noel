# Système de Contribution Simplifié

## Vue d'ensemble

Le système de contribution a été repensé pour offrir une expérience plus intuitive et visuelle. Les utilisateurs peuvent maintenant contribuer de trois façons différentes, avec des indicateurs visuels clairs pour suivre l'état des cadeaux.

## Types de Contribution

### 1. 🎁 Je prends en entier (FULL)
- L'utilisateur offre le cadeau seul, sans partage
- Il doit indiquer le prix total du cadeau
- Le montant de sa contribution = prix total
- Aucun autre contributeur ne peut participer

### 2. 🤝 Je veux partager (SHARED)
- L'utilisateur lance un partage et indique sa part
- Il doit spécifier :
  - Le prix total à partager
  - Sa participation personnelle
- D'autres personnes peuvent rejoindre le partage

### 3. ✨ Je participe (PARTIAL)
- L'utilisateur rejoint un partage existant
- Deux options :
  - **Rapide** : Il participe pour le montant restant (pas besoin de taper le prix)
  - **Personnalisé** : Il spécifie un montant personnalisé
- Le prix total doit déjà être renseigné (ou peut l'être à ce moment)

## Indicateurs Visuels

### Badges de Statut

#### ⭕ Non pris (Gris)
- Aucune contribution n'a été faite
- Le cadeau est disponible
- Couleur : Gris

#### 🤝 En partage (Orange)
- Au moins une contribution existe
- Le cadeau n'est pas entièrement financé
- Plusieurs personnes peuvent participer
- Couleur : Orange

#### ✅ Complété (Vert)
- Le cadeau est entièrement financé
- La somme des contributions = prix total
- Plus de contributions possibles
- Couleur : Vert

### Barre de Progression

Une barre de progression colorée affiche :
- Le montant collecté / prix total
- Le pourcentage de financement
- Couleur adaptée au statut (gris, orange, ou vert)

## Modifications Techniques

### Base de données

Ajout d'un champ `contributionType` dans le modèle `Contribution` :
```prisma
model Contribution {
  // ...
  contributionType String @default("PARTIAL") // FULL, SHARED, PARTIAL
  // ...
}
```

### Fichiers Modifiés

1. **Schema Prisma** (`prisma/schema.prisma`)
   - Ajout du champ `contributionType`

2. **Repository** (`src/lib/repositories/contribution.ts`)
   - Ajout du paramètre `contributionType` dans la fonction `upsert`

3. **Use Case** (`src/lib/use-cases/contribution.ts`)
   - Nouvelle logique pour gérer les 3 types de contribution
   - Calcul automatique du montant pour le type PARTIAL sans montant spécifié
   - Validation selon le type de contribution

4. **Actions** (`src/actions/contributions.ts`)
   - Mise à jour de la signature pour accepter `contributionType`
   - Le champ `amount` devient optionnel

5. **Composants UI**
   - `ContributionModal.tsx` : Nouveau modal avec sélection du type de contribution
   - `ContributionStatusBadge.tsx` : Badge et barre de progression
   - `ParticipantsTab.tsx` : Intégration du nouveau modal et des badges
   - `contributions/page.tsx` : Affichage amélioré avec types de contribution

## Avantages

### Pour l'Utilisateur
- ✅ Interface plus simple et intuitive
- ✅ Moins de champs à remplir
- ✅ Bouton "OK" rapide pour participer au reste
- ✅ Indicateurs visuels clairs (badges colorés)
- ✅ Distinction facile entre les statuts

### Pour le Développeur
- ✅ Code plus maintenable
- ✅ Logique métier centralisée dans le use-case
- ✅ Types TypeScript stricts
- ✅ Composants réutilisables

## Migration

La migration Prisma a été créée :
```sql
ALTER TABLE "Contribution" ADD COLUMN "contributionType" TEXT NOT NULL DEFAULT 'PARTIAL';
```

Toutes les contributions existantes sont marquées comme `PARTIAL` par défaut.

## Utilisation

### Créer une contribution

```typescript
await upsertContribution({
  itemId: "...",
  contributionType: "FULL", // ou "SHARED" ou "PARTIAL"
  totalPrice: 49.99, // requis pour FULL et SHARED
  amount: 20.00, // optionnel pour PARTIAL, requis pour SHARED
  note: "Joyeux Noël !", // optionnel
});
```

### Afficher le statut

```tsx
<ContributionStatusBadge
  totalPrice={item.totalPrice}
  contributed={totalContributed}
  contributorsCount={item.contributions.length}
/>
```

## Tests Recommandés

1. ✅ Créer une contribution "Je prends en entier"
2. ✅ Créer une contribution "Je veux partager" avec participation partielle
3. ✅ Rejoindre un partage existant avec le bouton rapide
4. ✅ Rejoindre un partage avec un montant personnalisé
5. ✅ Vérifier les badges de statut (Non pris, En partage, Complété)
6. ✅ Vérifier la barre de progression
7. ✅ Modifier une contribution existante
8. ✅ Supprimer une contribution

## Notes

- Le système empêche de dépasser le prix total
- Les contributions sont toujours positives
- Le prix total est requis pour FULL et SHARED
- Pour PARTIAL, le prix total peut être optionnel si déjà renseigné

