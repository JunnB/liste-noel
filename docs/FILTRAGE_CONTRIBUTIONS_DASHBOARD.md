# Filtrage des Contributions dans le Dashboard

## Date
23 novembre 2025

## Problème Identifié
Le Dashboard affichait les contributions sur les propres cadeaux de l'utilisateur, ce qui **gâchait la surprise** en révélant qui avait contribué et combien.

## Solution Implémentée

### Règle de Filtrage
**L'utilisateur ne doit JAMAIS voir les contributions sur ses propres cadeaux.**

Le Dashboard affiche maintenant uniquement :
- ✅ Les contributions que **l'utilisateur a faites** sur les cadeaux des autres
- ❌ **JAMAIS** les contributions des autres sur ses propres cadeaux

### Principe de la Surprise
```
┌─────────────────────────────────────────────┐
│ CE QUE JE VOIS :                            │
│ ✅ "Vous avez contribué 20€"                │
│    → Cadeau pour Marie: Nintendo Switch    │
│                                             │
│ CE QUE JE NE VOIS PAS :                     │
│ ❌ "Jean a contribué 35€"                   │
│    → Sur MON cadeau (PlayStation 5)        │
└─────────────────────────────────────────────┘
```

## Modifications Techniques

### 1. Fichier `src/lib/use-cases/activity.ts`

#### Avant :
```typescript
const recentContributions = await prisma.contribution.findMany({
  where: {
    OR: [
      { userId }, // Mes contributions
      {
        // ❌ Contributions sur mes items (PROBLÈME!)
        item: {
          list: { userId },
        },
      },
    ],
  },
  // ...
});
```

#### Après :
```typescript
const recentContributions = await prisma.contribution.findMany({
  where: {
    userId, // Seulement mes contributions
    item: {
      list: {
        userId: { not: userId }, // ✅ EXCLURE mes propres listes
      },
    },
  },
  // ...
});
```

**Changements clés :**
- Suppression du `OR` qui incluait les contributions sur mes items
- Ajout d'un filtre explicite `{ not: userId }` pour exclure mes listes
- Garantit que seules MES contributions apparaissent

### 2. Fichier `src/components/dashboard/ActivityFeed.tsx`

#### Avant :
```typescript
case "contribution_made":
  if (metadata.contributorName) {
    return {
      title: `${metadata.contributorName} a participé`,
      subtitle: `Cadeau: ${metadata.itemTitle} • ${metadata.amount}€`,
    };
  }
  return {
    title: `Vous avez contribué ${metadata.amount}€`,
    subtitle: `Cadeau: ${metadata.itemTitle}`,
  };
```

#### Après :
```typescript
case "contribution_made":
  return {
    title: `Vous avez contribué ${metadata.amount}€`,
    subtitle: `Cadeau pour ${metadata.listOwnerName}: ${metadata.itemTitle}`,
  };
```

**Changements clés :**
- Suppression de la condition `if (metadata.contributorName)`
- Toujours afficher "Vous avez contribué" (car c'est toujours l'utilisateur)
- Ajout du nom du destinataire pour plus de contexte

## Exemples d'Affichage

### Scénario 1 : Jean consulte son Dashboard

**Jean a contribué :**
- 20€ pour le cadeau de Marie (Nintendo Switch)
- 35€ pour le cadeau de Paul (Livre)

**Les autres ont contribué sur les cadeaux de Jean :**
- Sophie a contribué 50€ pour le cadeau de Jean (PlayStation 5)
- Marie a contribué 30€ pour le cadeau de Jean (Casque Audio)

**Ce que Jean voit dans son Dashboard :**
```
📅 Activité Récente

💰 Vous avez contribué 20€
    Cadeau pour Marie: Nintendo Switch
    Il y a 2 heures

💰 Vous avez contribué 35€
    Cadeau pour Paul: Livre
    Il y a 1 jour
```

**Ce que Jean NE voit PAS :**
```
❌ Sophie a contribué 50€ (sur MON cadeau)
❌ Marie a contribué 30€ (sur MON cadeau)
```

### Scénario 2 : Marie consulte son Dashboard

**Marie voit :**
- Ses propres contributions sur les cadeaux des autres
- Ses cadeaux ajoutés à sa liste
- Les événements qu'elle a créés/rejoints

**Marie NE voit PAS :**
- Les contributions de Jean, Sophie, Paul sur SES cadeaux

## Avantages

### 🎁 Préservation de la Surprise
✅ L'utilisateur ne sait pas qui contribue à ses cadeaux
✅ L'utilisateur ne sait pas combien a été collecté
✅ La magie de Noël est préservée !

### 👀 Transparence sur Ses Actions
✅ L'utilisateur voit clairement ce qu'il a contribué
✅ L'utilisateur peut suivre son budget
✅ L'utilisateur sait pour qui il a participé

### 🔒 Confidentialité
✅ Les contributions restent privées jusqu'à l'ouverture des cadeaux
✅ Pas de pression sociale ("Untel a donné plus que moi")
✅ Chacun contribue selon ses moyens en toute discrétion

## Impact sur les Autres Pages

### ✅ Page Événement (`/events/[id]`)
- **Onglet "Ma Liste"** : L'utilisateur ne voit PAS les contributions sur ses cadeaux
- **Onglet "Participants"** : L'utilisateur VOIT et PEUT contribuer aux cadeaux des autres
- **Total des contributions** : Affiche uniquement ce que l'utilisateur a dépensé (pas ce qu'il a reçu)

### ✅ Page Contributions (`/contributions`)
- Affiche uniquement les contributions que l'utilisateur a faites
- Ne montre jamais les contributions reçues sur ses propres cadeaux

### ✅ Dashboard (`/dashboard`)
- Fil d'activité filtré pour ne montrer que les actions de l'utilisateur
- Aucune information sur les contributions reçues

## Tests & Validation

✅ Build Next.js réussi
✅ Aucune erreur de linting
✅ Types TypeScript valides
✅ Filtrage correct des contributions
✅ Affichage cohérent sur toutes les pages

## Cas Limites Gérés

### Cas 1 : Utilisateur sans contributions
- Dashboard affiche "Aucune activité récente"
- Message d'accueil avec CTA pour commencer

### Cas 2 : Utilisateur qui contribue à ses propres cadeaux
- Techniquement possible mais découragé par l'UX
- Si cela arrive, la contribution n'apparaît pas dans le Dashboard

### Cas 3 : Administrateur d'événement
- Même règle : ne voit pas les contributions sur ses propres cadeaux
- Peut voir et gérer les listes des participants

## Notes Importantes

⚠️ **Cette règle est CRITIQUE pour l'expérience utilisateur**
- Ne jamais afficher les contributions sur les propres cadeaux de l'utilisateur
- Garder cette règle en tête pour toute future fonctionnalité
- Tester systématiquement ce cas lors de l'ajout de nouvelles features

## Évolutions Futures

- [ ] Ajouter une notification après Noël pour révéler qui a contribué
- [ ] Permettre à l'utilisateur de remercier anonymement les contributeurs
- [ ] Créer un récapitulatif post-événement avec toutes les contributions

