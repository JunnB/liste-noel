# Documentation - Liste de Noël

Bienvenue dans la documentation du projet Liste de Noël !

## 📚 Table des Matières

### Pour les Utilisateurs
- [Guide Utilisateur - Contributions](./GUIDE_UTILISATEUR_CONTRIBUTIONS.md) - Comment utiliser le système de contributions

### Pour les Développeurs
- [Système de Contributions](./CONTRIBUTION_SYSTEM.md) - Documentation technique du système
- [Changelog](./CHANGELOG_CONTRIBUTIONS.md) - Historique des changements
- [Migration Events](./MIGRATION_EVENTS.md) - Documentation de la migration du système d'événements

## 🎯 Aperçu Rapide

### Système de Contributions Simplifié

Le système de contributions a été repensé pour offrir une expérience plus intuitive :

#### 🎁 Je prends en entier
Offrez un cadeau seul, sans partage

#### 🤝 Je veux partager
Lancez un partage et indiquez votre part

#### ✨ Je participe
Rejoignez un partage existant avec un bouton rapide "OK"

### Indicateurs Visuels

- ⭕ **Non pris** (Gris) - Aucune contribution
- 🤝 **En partage** (Orange) - Partiellement financé
- ✅ **Complété** (Vert) - Entièrement financé

## 🚀 Démarrage Rapide

### Installation

```bash
# Installer les dépendances
npm install

# Configurer la base de données
npx prisma migrate deploy
npx prisma generate

# Lancer en développement
npm run dev
```

### Build Production

```bash
# Build
npm run build

# Démarrer
npm start
```

## 📖 Documentation Détaillée

### Guide Utilisateur
Le [Guide Utilisateur](./GUIDE_UTILISATEUR_CONTRIBUTIONS.md) explique en détail :
- Comment contribuer à un cadeau
- Les 3 types de contribution
- Comment lire les indicateurs visuels
- Questions fréquentes

### Documentation Technique
La [Documentation Technique](./CONTRIBUTION_SYSTEM.md) couvre :
- Architecture du système
- Modifications de la base de données
- API et types TypeScript
- Composants React
- Tests recommandés

### Changelog
Le [Changelog](./CHANGELOG_CONTRIBUTIONS.md) documente :
- Nouvelles fonctionnalités
- Modifications techniques
- Breaking changes
- Notes de version

## 🏗️ Architecture

```
src/
├── actions/              # Server Actions
│   └── contributions.ts  # Actions de contribution
├── app/                  # Pages Next.js
│   └── contributions/    # Page des contributions
├── components/           # Composants React
│   ├── events/          # Composants d'événements
│   │   ├── ContributionModal.tsx
│   │   ├── ContributionStatusBadge.tsx
│   │   └── ParticipantsTab.tsx
│   └── ui/              # Composants UI génériques
├── lib/
│   ├── repositories/    # Accès aux données
│   │   └── contribution.ts
│   └── use-cases/       # Logique métier
│       └── contribution.ts
└── prisma/
    └── schema.prisma    # Schéma de base de données
```

## 🎨 Stack Technique

- **Framework** : Next.js 15.5.6
- **Base de données** : PostgreSQL (Supabase)
- **ORM** : Prisma 5.22.0
- **Styling** : Tailwind CSS
- **TypeScript** : Strict mode
- **Architecture** : Clean Architecture (Actions → Use Cases → Repositories)

## 🧪 Tests

### Vérifier le Build
```bash
npm run build
```

### Linter
```bash
npm run lint
```

### Types TypeScript
```bash
npx tsc --noEmit
```

## 📝 Conventions de Code

### Naming
- **Actions** : `action.ts` dans le même dossier que le composant
- **Use Cases** : `entity.ts` (ex: `contribution.ts`)
- **Repositories** : `entity.ts` (ex: `contribution.ts`)
- **Composants** : PascalCase (ex: `ContributionModal.tsx`)

### Architecture
```
Component → Action → Use Case → Repository → Database
```

### Types
- Utiliser des types stricts TypeScript
- Pas de `any`
- Interfaces pour les props de composants

## 🤝 Contribution

### Workflow Git
1. Créer une branche feature
2. Faire les modifications
3. Tester localement
4. Créer une Pull Request
5. Review et merge

### Standards de Code
- ESLint configuré
- Prettier pour le formatage
- Types TypeScript stricts
- Tests pour les fonctionnalités critiques

## 📞 Support

Pour toute question ou problème :
1. Consulter la documentation
2. Vérifier les issues GitHub
3. Contacter l'équipe de développement

## 📄 Licence

Ce projet est privé et confidentiel.

---

## 🎄 Joyeux Noël ! 🎅

Merci d'utiliser Liste de Noël !

