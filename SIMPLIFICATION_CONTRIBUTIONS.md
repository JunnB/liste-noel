# Simplification du Système de Contributions

## Date : 23 Novembre 2025

## Résumé des Modifications

Le système de contributions a été simplifié pour améliorer l'expérience utilisateur selon les retours suivants :
- Fusion des types SHARED et PARTIAL en un seul type PARTIAL
- Note uniquement pour lancer un partage (première contribution)
- Message clair quand un cadeau est pris en entier
- Badge et barre de progression intégrés pour une meilleure UX
- Rafraîchissement automatique après toutes les actions

---

## 1. Modal de Contribution Simplifié

### Fichier : `src/components/events/ContributionModal.tsx`

**Détection automatique du contexte :**
- Si `existingTotalPrice` existe → Mode "Je participe" uniquement
- Sinon → Choix entre "Je prends en entier" OU "Je lance un partage"

**Changements clés :**
- Suppression du type SHARED (fusionné avec PARTIAL)
- Bouton "Prendre le reste" visible et fonctionnel
- Note uniquement affichée en mode "lancer un partage"
- Interface adaptée au contexte

**Cas d'usage :**

1. **Rejoindre un partage existant :**
   - Prix total affiché (non modifiable)
   - Champ montant + bouton "Prendre le reste"
   - Pas de note

2. **Première contribution :**
   - Choix : "Je prends en entier" OU "Je lance un partage"
   - Si "en entier" : juste le prix total
   - Si "partage" : prix total + montant + note optionnelle

3. **Modification :**
   - Formulaire simple avec le montant actuel

---

## 2. Gestion du Cas "Pris en Entier"

### Fichier : `src/components/events/ParticipantsTab.tsx`

**Détection :**
```typescript
const isTakenFull = item.contributions.some(c => c.contributionType === 'FULL');
const takenByUser = isTakenFull ? item.contributions.find(c => c.contributionType === 'FULL')?.user.name : null;
```

**Affichage :**
- Si quelqu'un a pris en entier → Message "Déjà pris par [nom]"
- Sinon → Bouton "Participer" normal

**Passage du montant déjà contribué :**
```typescript
alreadyContributed={
  selectedItem.contributions
    .filter(c => c.userId !== currentUser?.id)
    .reduce((sum, c) => sum + c.amount, 0)
}
```

---

## 3. Badge de Statut Amélioré

### Fichier : `src/components/events/ContributionStatusBadge.tsx`

**Amélioration UX :**
- Si pas de prix total → Badge simple "Non pris"
- Si prix total existe → Badge + montants + barre de progression intégrés

**Structure :**
```
[Badge: 🤝 En partage]    [150€ / 300€]
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
```

**Avantages :**
- Plus compact
- Moins de charge visuelle
- Information claire en un coup d'œil

---

## 4. Rafraîchissement Automatique

### Fichiers modifiés :
- `src/app/events/[id]/page.tsx`
- `src/components/events/EventView.tsx`
- `src/components/events/MyListTab.tsx` (déjà en place)
- `src/components/events/ParticipantsTab.tsx` (déjà en place)

**Changements :**
1. Extraction de `fetchData()` dans la page principale
2. Création de `handleRefresh()` qui appelle `fetchData()`
3. Passage de `onRefresh` à EventView
4. EventView transmet `onRefresh` aux onglets

**Résultat :**
- Ajout/modification/suppression de souhait → Rafraîchissement automatique
- Contribution → Rafraîchissement automatique
- Plus besoin de recharger la page manuellement

---

## 5. Logique Backend Simplifiée

### Fichier : `src/lib/use-cases/contribution.ts`

**Type simplifié :**
```typescript
export type ContributionType = "FULL" | "PARTIAL";
```

**Logique :**

**FULL (Je prends en entier) :**
- Validation : aucune autre contribution ne doit exister
- `amount = totalPrice`
- Pas de note

**PARTIAL (Je participe / Je lance un partage) :**
- Si montant non spécifié → Calcul automatique du reste
- Si montant spécifié → Utilisation du montant
- Note optionnelle uniquement pour première contribution

**Validation :**
- Empêche de prendre en entier si d'autres ont déjà contribué
- Empêche de dépasser le prix total
- Montants toujours positifs

---

## 6. Types d'Actions Mis à Jour

### Fichier : `src/actions/contributions.ts`

**Type mis à jour :**
```typescript
contributionType: "FULL" | "PARTIAL"
```

**Cohérence :**
- Tous les fichiers utilisent maintenant les mêmes types
- Pas de SHARED dans le code

---

## Résumé des Avantages

### Pour l'Utilisateur

**Avant :**
- 3 options confuses (FULL, SHARED, PARTIAL)
- Note toujours demandée
- Pas de message si cadeau pris en entier
- Badge et barre séparés = visuellement chargé
- Besoin de recharger manuellement

**Après :**
- 2 options claires selon le contexte
- Note uniquement pour lancer un partage
- Message clair "Déjà pris par [nom]"
- Badge intégré = plus épuré
- Rafraîchissement automatique

### Pour le Développeur

**Avant :**
- 3 types de contribution à gérer
- Logique complexe dans le modal
- Code dupliqué

**Après :**
- 2 types seulement (FULL, PARTIAL)
- Détection automatique du contexte
- Code plus maintenable
- Moins de conditions

---

## Tests Recommandés

### Scénarios à Tester

1. **Première contribution - Prendre en entier**
   - Créer un cadeau
   - Cliquer sur "Participer"
   - Choisir "Je prends en entier"
   - Vérifier : montant = prix total, badge "Complété"

2. **Première contribution - Lancer un partage**
   - Créer un cadeau
   - Cliquer sur "Participer"
   - Choisir "Je lance un partage"
   - Entrer prix total + montant + note
   - Vérifier : badge "En partage", note visible

3. **Rejoindre un partage**
   - Sur un cadeau avec partage existant
   - Cliquer sur "Participer"
   - Voir le prix total affiché
   - Utiliser "Prendre le reste"
   - Vérifier : montant calculé automatiquement

4. **Cadeau pris en entier**
   - Sur un cadeau pris en entier par quelqu'un
   - Vérifier : message "Déjà pris par [nom]"
   - Pas de bouton "Participer"

5. **Rafraîchissement automatique**
   - Ajouter un souhait → Vérifier apparition immédiate
   - Contribuer → Vérifier mise à jour immédiate
   - Supprimer → Vérifier disparition immédiate

---

## Fichiers Modifiés

### Frontend
1. ✅ `src/components/events/ContributionModal.tsx` - Refonte complète
2. ✅ `src/components/events/ParticipantsTab.tsx` - Détection "pris en entier" + passage montant
3. ✅ `src/components/events/ContributionStatusBadge.tsx` - Badge intégré
4. ✅ `src/components/events/EventView.tsx` - Transmission onRefresh
5. ✅ `src/app/events/[id]/page.tsx` - Fonction handleRefresh
6. ✅ `src/app/contributions/page.tsx` - Type mis à jour

### Backend
7. ✅ `src/lib/use-cases/contribution.ts` - Logique simplifiée
8. ✅ `src/actions/contributions.ts` - Type mis à jour

---

## Build et Validation

**Build Next.js :** ✅ Réussi
**Linter :** ✅ Aucune erreur
**Types TypeScript :** ✅ Valides

---

## Prochaines Étapes

1. Tester manuellement tous les scénarios
2. Vérifier le comportement sur mobile
3. Déployer sur Vercel
4. Recueillir les retours utilisateurs

---

**Développé avec ❤️ pour une meilleure UX**

