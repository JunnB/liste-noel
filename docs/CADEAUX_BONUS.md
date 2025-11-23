# Fonctionnalité : Cadeaux Bonus Cachés 🎁

## Vue d'ensemble

Cette fonctionnalité permet aux participants d'un événement d'ajouter des cadeaux "bonus" aux listes des autres participants. Ces cadeaux sont **invisibles pour le propriétaire de la liste** mais visibles et partageables entre tous les autres participants.

## Objectif

Permettre aux participants de coordonner des surprises pour un membre du groupe sans que celui-ci ne le sache.

## Fonctionnement

### Pour les participants (non-propriétaires)

1. **Accès** : Lorsqu'un participant consulte la liste d'un autre participant dans l'onglet "Participants"
2. **Ajout** : Un bouton "🎁 Ajouter un cadeau bonus surprise" est visible en haut de la liste
3. **Formulaire** : Le modal d'ajout indique clairement que le cadeau sera invisible pour le propriétaire
4. **Visibilité** : Les cadeaux bonus sont marqués avec un badge "🎁 Bonus" de couleur violette/rose
5. **Contributions** : Les cadeaux bonus fonctionnent exactement comme les cadeaux normaux (contributions partielles, complètes, etc.)

### Pour le propriétaire de la liste

- **Invisibilité totale** : Les cadeaux bonus n'apparaissent jamais dans "Ma Liste"
- **Filtrage automatique** : Le système filtre automatiquement ces items côté serveur
- **Surprise garantie** : Aucune notification, aucun indice

## Architecture technique

### Base de données

**Modèle Item** (prisma/schema.prisma) :
- `isBonus` (Boolean) : Indique si l'item est un cadeau bonus (défaut: false)
- `addedByUserId` (String?) : ID de l'utilisateur qui a ajouté ce bonus (nullable)
- Relation `addedBy` vers User

**Migration** : `20251123230256_add_bonus_items`

### Couche Repository

**src/lib/repositories/item.ts** :
- `create()` : Accepte `isBonus` et `addedByUserId`
- `findManyByListIdForOwner()` : Exclut les items bonus
- `findManyByListIdForParticipants()` : Inclut tous les items

**src/lib/repositories/list.ts** :
- `findByEventIdAndUserId()` : Filtre automatiquement les items bonus pour le propriétaire

### Couche Use Cases

**src/lib/use-cases/item.ts** :
- `createBonus()` : Crée un item bonus avec validations :
  - Vérifie que l'utilisateur n'est PAS le propriétaire de la liste
  - Vérifie que l'utilisateur est participant à l'événement
  - Définit `isBonus: true` et `addedByUserId`

**src/lib/use-cases/list.ts** :
- `getById()` : Filtre les items bonus si le viewer est le propriétaire

### Couche Actions

**src/actions/items.ts** :
- `createBonusItem()` : Action serveur pour créer un cadeau bonus
- Exportée via `src/actions/index.ts`

### Interface Utilisateur

**src/components/events/ParticipantsTab.tsx** :
- Bouton d'ajout de cadeau bonus (visible uniquement pour les non-propriétaires)
- Modal de création avec avertissement clair sur la surprise
- Badge "🎁 Bonus" sur les items bonus
- Style violet/rose pour différencier visuellement

**src/components/events/MyListTab.tsx** :
- Aucune modification nécessaire (filtrage côté serveur)

## Sécurité

1. **Validation côté serveur** : Impossible d'ajouter un bonus à sa propre liste
2. **Vérification des participants** : Seuls les participants de l'événement peuvent ajouter des bonus
3. **Filtrage automatique** : Les items bonus sont filtrés au niveau du repository
4. **Isolation des données** : Le propriétaire ne reçoit jamais les données des items bonus

## Cas d'usage

### Exemple 1 : Anniversaire surprise
Alice, Bob et Charlie participent à un événement "Anniversaire de David". Alice et Bob peuvent ajouter des cadeaux bonus à la liste de David pour coordonner une surprise. David ne voit que sa propre liste sans les bonus.

### Exemple 2 : Noël en famille
Dans un événement familial, les parents peuvent ajouter des cadeaux bonus à la liste des enfants pour compléter leurs souhaits avec des surprises.

## Limitations et considérations

1. **Pas de notification** : Le propriétaire ne sait jamais qu'il a des cadeaux bonus
2. **Contributions visibles** : Les autres participants voient qui contribue aux cadeaux bonus
3. **Permanence** : Une fois ajouté, un cadeau bonus reste bonus (pas de conversion)
4. **Suppression** : Seul l'ajouteur (ou le créateur de l'événement) peut supprimer un item bonus

## Tests recommandés

1. ✅ Créer un cadeau bonus sur la liste d'un autre participant
2. ✅ Vérifier que le propriétaire ne voit pas le cadeau dans "Ma Liste"
3. ✅ Vérifier que les autres participants voient le badge "🎁 Bonus"
4. ✅ Contribuer à un cadeau bonus
5. ✅ Tenter d'ajouter un bonus à sa propre liste (doit échouer)
6. ✅ Vérifier le filtrage après rafraîchissement de la page

## Migration

Pour appliquer cette fonctionnalité sur une base existante :

```bash
# Générer le client Prisma
npx prisma generate

# Appliquer la migration (en production)
npx prisma migrate deploy
```

Les items existants auront automatiquement `isBonus: false` et `addedByUserId: null`.

