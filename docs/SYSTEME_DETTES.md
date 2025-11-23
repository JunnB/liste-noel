# Système de Gestion des Avances et Remboursements

## Vue d'ensemble

Le système de dettes permet de gérer les avances d'argent pour les cadeaux partagés et de suivre qui doit rembourser qui.

## Fonctionnement

### 1. Contribution avec Avance

Quand un utilisateur contribue à un cadeau partagé, il peut cocher "💳 J'ai avancé l'argent pour ce cadeau". Cela signifie qu'il a payé le cadeau et que les autres participants devront le rembourser.

### 2. Calcul Automatique des Dettes

Quand quelqu'un marque qu'il a avancé l'argent :
- Le système crée automatiquement une dette pour chaque autre participant
- Le montant de la dette = le montant que le participant a contribué
- La dette est enregistrée dans la table `Debt`

### 3. Page Contributions avec 3 Onglets

#### Onglet "Mes contributions"
- Affiche toutes les contributions de l'utilisateur
- Badge spécial si l'utilisateur a avancé l'argent

#### Onglet "Je dois"
- Affiche les montants que l'utilisateur doit rembourser
- Bouton "Marquer comme réglé" pour confirmer le remboursement

#### Onglet "On me doit"
- Affiche les montants que les autres doivent à l'utilisateur
- Bouton "Marquer comme réglé" pour confirmer la réception

### 4. Filtre par Événement

L'utilisateur peut filtrer les contributions et dettes par événement pour mieux s'organiser.

## Migration des Données Existantes

### Étape 1 : Appliquer la Migration SQL

```bash
# Appliquer la migration (ajoute hasAdvanced et table Debt)
npx prisma migrate deploy
```

### Étape 2 : Migrer les Données

```bash
# Exécuter le script de migration
npx tsx prisma/seed-debts.ts
```

Ce script va :
1. Trouver tous les cadeaux avec plusieurs contributions
2. Marquer la **première contribution** (par date) comme ayant avancé l'argent
3. Créer les dettes correspondantes

### Étape 3 : Regénérer le Client Prisma

```bash
npx prisma generate
```

## Structure de la Base de Données

### Table `Contribution`

Nouveau champ :
- `hasAdvanced` (Boolean) : Indique si l'utilisateur a avancé l'argent

### Table `Debt` (Nouvelle)

- `id` : Identifiant unique
- `itemId` : Référence au cadeau
- `fromUserId` : Qui doit l'argent
- `toUserId` : À qui l'argent est dû
- `amount` : Montant de la dette
- `isSettled` : Dette réglée ou non
- `settledAt` : Date du règlement

## Exemple d'Utilisation

### Scénario : Cadeau à 100€ pour Marie

1. **Jean lance un partage** :
   - Prix total : 100€
   - Sa participation : 40€
   - ✅ Coche "J'ai avancé l'argent"

2. **Sophie participe** :
   - Sa participation : 30€
   - → Dette créée : Sophie doit 30€ à Jean

3. **Paul participe** :
   - Sa participation : 30€
   - → Dette créée : Paul doit 30€ à Jean

4. **Page Contributions de Jean** :
   - Onglet "On me doit" :
     - Sophie doit 30€
     - Paul doit 30€

5. **Page Contributions de Sophie** :
   - Onglet "Je dois" :
     - Je dois 30€ à Jean
   - Bouton "Marquer comme réglé" après remboursement

## Règles Importantes

1. **Une seule personne peut avancer** : Si quelqu'un a déjà avancé, les autres ne peuvent pas cocher cette option
2. **Montant de la dette = Montant contribué** : Chacun rembourse ce qu'il a promis de payer
3. **Marquage bilatéral** : Les deux parties (celui qui doit et celui qui reçoit) peuvent marquer la dette comme réglée
4. **Historique conservé** : Les dettes réglées restent visibles avec la date de règlement

## Interface Utilisateur

### Modal de Contribution

Nouvelle checkbox :
```
💳 J'ai avancé l'argent pour ce cadeau
Les autres participants devront vous rembourser leur part
```

### Page Contributions

3 onglets :
- 📋 Mes contributions (X)
- 💸 Je dois (Y)
- 💰 On me doit (Z)

Filtre par événement pour s'organiser.

## API

### Actions Serveur

#### `getMyDebts(eventId?: string)`
Récupère les dettes de l'utilisateur (ce qu'il doit + ce qu'on lui doit)

#### `settleDebt(debtId: string)`
Marque une dette comme réglée

### Use Cases

#### `calculateAndCreateDebts(itemId: string)`
Calcule et crée les dettes pour un cadeau donné

#### `getMyDebts(userId: string, eventId?: string)`
Récupère les dettes d'un utilisateur

#### `settleDebt(debtId: string, userId: string)`
Marque une dette comme réglée (avec vérification des permissions)

## Sécurité

- ✅ Seules les personnes concernées peuvent marquer une dette comme réglée
- ✅ Les dettes sont automatiquement supprimées si le cadeau est supprimé (CASCADE)
- ✅ Validation des montants pour éviter les incohérences

## Évolutions Futures Possibles

- [ ] Notifications quand quelqu'un marque une dette comme réglée
- [ ] Export PDF des dettes pour un événement
- [ ] Statistiques : "Vous avez avancé X€ au total"
- [ ] Rappels automatiques pour les dettes non réglées
- [ ] Intégration avec des systèmes de paiement (Lydia, PayPal, etc.)

