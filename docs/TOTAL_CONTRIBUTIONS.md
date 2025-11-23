# Affichage du Total des Contributions par Événement

## Date
23 novembre 2025

## Objectif
Permettre à l'utilisateur de voir facilement combien il a dépensé au total pour un événement donné.

## Fonctionnalité Implémentée

### Affichage du Total
Sur la page d'un événement (`/events/[id]`), l'utilisateur voit maintenant :
- **Son total de contributions** pour cet événement spécifique
- Affiché dans un badge doré avec l'icône 💰
- Visible uniquement si l'utilisateur a au moins une contribution

### Calcul du Total
Le système parcourt automatiquement :
1. Toutes les listes de l'événement
2. Tous les items de chaque liste
3. Toutes les contributions de chaque item
4. Additionne les montants des contributions de l'utilisateur

### Design
```
┌─────────────────────────────────────────┐
│ Titre de l'Événement                    │
│ Description...                          │
│                                         │
│ 💰 Mes contributions : 125€             │
└─────────────────────────────────────────┘
```

**Caractéristiques visuelles :**
- Badge avec dégradé doré (`from-noel-gold/10 to-amber-50`)
- Bordure dorée subtile (`border-noel-gold/20`)
- Montant en gras et arrondi (sans décimales)
- Icône 💰 pour identification rapide

## Fichier Modifié

### `src/components/events/EventView.tsx`

**Nouvelle fonction :**
```typescript
const calculateMyTotalContributions = () => {
  let total = 0;
  
  event.lists.forEach((list: any) => {
    list.items?.forEach((item: any) => {
      item.contributions?.forEach((contribution: any) => {
        if (contribution.userId === user.id) {
          total += contribution.amount;
        }
      });
    });
  });
  
  return total;
};
```

**Affichage conditionnel :**
```typescript
{myTotalContributions > 0 && (
  <div className="inline-flex items-center gap-2 bg-gradient-to-r from-noel-gold/10 to-amber-50 px-4 py-2 rounded-lg border border-noel-gold/20">
    <span className="text-xl">💰</span>
    <div>
      <span className="text-xs text-gray-600 font-medium">Mes contributions :</span>
      <span className="ml-2 text-lg font-bold text-noel-olive">
        {myTotalContributions.toFixed(0)}€
      </span>
    </div>
  </div>
)}
```

## Cas d'Usage

### Exemple 1 : Événement "Noël Famille"
- Jean a contribué 20€ pour le cadeau de Marie
- Jean a contribué 35€ pour le cadeau de Paul
- Jean a contribué 70€ pour le cadeau de Sophie
- **Total affiché : 125€**

### Exemple 2 : Nouvel Événement
- L'utilisateur n'a encore fait aucune contribution
- **Badge non affiché** (évite d'afficher "0€")

### Exemple 3 : Contributions Multiples
- L'utilisateur a participé à 10 cadeaux différents
- Montants variés (10€, 15€, 20€, etc.)
- **Le total est calculé automatiquement** et affiché

## Avantages

### Pour l'Utilisateur
✅ **Visibilité immédiate** du budget dépensé par événement
✅ **Aide à la gestion** du budget cadeaux
✅ **Transparence** sur ses participations
✅ **Motivation** à contribuer (voir le total augmenter)

### Pour l'UX
✅ **Information contextuelle** : visible sur la page de l'événement
✅ **Design cohérent** avec la charte graphique
✅ **Non intrusif** : badge compact et élégant
✅ **Conditionnel** : n'apparaît que si pertinent

## Performance

- **Calcul léger** : simple parcours de tableaux
- **Pas d'appel API supplémentaire** : utilise les données déjà chargées
- **Recalculé automatiquement** lors du refresh de la page

## Tests

✅ Build Next.js réussi
✅ Pas d'erreurs de linting
✅ Types TypeScript valides
✅ Calcul correct du total
✅ Affichage conditionnel fonctionnel

## Évolutions Possibles

- [ ] Ajouter un détail des contributions au survol
- [ ] Afficher le total par participant (pour les admins)
- [ ] Ajouter un graphique de répartition des contributions
- [ ] Exporter un récapitulatif des contributions
- [ ] Comparer avec le budget prévu (si défini)

## Notes Techniques

- Le calcul est fait côté client avec les données déjà chargées
- Pas d'impact sur les performances de chargement
- Compatible avec le système de refresh existant
- Fonctionne avec tous les types de contributions (FULL, PARTIAL)

