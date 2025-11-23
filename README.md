# 🎄 Liste de Noël Familiale

Une application web moderne et intuitive pour gérer les listes de cadeaux de Noël en famille. Partagez vos souhaits, coordonnez les achats et simplifiez le partage des cadeaux.

## ✨ Fonctionnalités

### Gestion des listes
- ✅ Créer des listes personnelles de cadeaux
- ✅ Ajouter des articles avec descriptions et prix souhaités
- ✅ Intégrer des liens Amazon ou autres boutiques
- ✅ Partager facilement via code d'invitation

### Participation et coordination
- ✅ Rejoindre les listes des autres via code
- ✅ Voir les articles et décider ce qu'on prend
- ✅ Partager les achats à plusieurs (avec montants)
- ✅ Ajouter des notes sur les contributions

### Gestion financière
- ✅ Calcul automatique des débts entre participants
- ✅ Simplification des remboursements circulaires
- ✅ Vue claire de qui doit combien à qui
- ✅ Historique des partages par cadeau

### Sécurité & Intimité
- ✅ Les créateurs de liste ne voient pas qui prend leurs cadeaux
- ✅ Authentification sécurisée par email/password
- ✅ Listes privées accessibles uniquement par code
- ✅ Données persistantes et sécurisées

## 🚀 Démarrage rapide

### Prérequis
- Node.js 18+
- npm ou yarn
- PostgreSQL (local ou sur Vercel)

### Installation

```bash
# Cloner le repo
git clone https://github.com/yourusername/liste-noel.git
cd liste-noel

# Installer les dépendances
npm install

# Configurer les variables d'environnement
cp .env.example .env.local
# Éditer .env.local avec vos valeurs

# Initialiser la base de données
npx prisma migrate dev

# Lancer le serveur de développement
npm run dev
```

Ouvrez [http://localhost:3000](http://localhost:3000) dans votre navigateur.

## 🛠 Stack Technologique

- **Frontend**: Next.js 15 + React 19 + TypeScript
- **Styling**: Tailwind CSS avec palette Noël personnalisée
- **Base de données**: PostgreSQL + Prisma ORM
- **Authentification**: better-auth
- **Déploiement**: Vercel (recommandé)

## 📁 Structure du projet

```
src/
├── app/
│   ├── api/              # API routes (authentification, listes, contributions)
│   ├── auth/             # Pages de login/register
│   ├── dashboard/        # Dashboard principal
│   ├── lists/            # Pages de gestion des listes
│   ├── join/             # Page pour rejoindre une liste
│   ├── contributions/    # Page de vue des débts/partages
│   └── layout.tsx        # Layout racine
├── components/           # Composants réutilisables
├── lib/
│   ├── auth.ts          # Configuration better-auth
│   ├── prisma.ts        # Client Prisma
│   └── debts.ts         # Logique de calcul des débts
└── globals.css          # Styles globaux
```

## 🎨 Palette de couleurs

- **Rouge**: #C9184A (primaire, actions)
- **Vert**: #2D5016 (secondaire, actions)
- **Or**: #F4E4C1 (accentuation)
- **Crème**: #FAFAF8 (fond)
- **Gris**: #2C3E35 (texte)

## 📱 Responsive Design

L'application est conçue mobile-first avec une hiérarchie d'écrans:
- Mobile: < 640px (optimisé)
- Tablet: 640px - 1024px
- Desktop: > 1024px

## 🔒 Sécurité

- Authentification par email/password avec hash sécurisé
- Sessions gérées par better-auth
- Vérification des permissions côté serveur sur toutes les API
- Créateur de liste ne peut pas voir les contributions

## 🚀 Déploiement sur Vercel

```bash
# Lier à Vercel
vercel

# Configurer les variables d'environnement dans Vercel
# DATABASE_URL, BETTER_AUTH_URL, BETTER_AUTH_SECRET

# Déployer
vercel --prod
```

## 📊 Logique de calcul des débts

Quand plusieurs personnes participent au même cadeau:

1. **Calcul de la part équitable**: Total ÷ Nombre de participants
2. **Calcul des débts**: Chaque personne doit (sa part) - (ce qu'elle a payé)
3. **Simplification**: Algorithme pour éviter les remboursements circulaires

### Exemple
- Cadeau coûte 60€
- Alice paie 60€ (elle prend le cadeau)
- Bob paie 20€
- Charlie paie 0€

Part par personne: 60 ÷ 3 = 20€

Débts:
- Bob doit 0€ (il a déjà payé sa part)
- Charlie doit 20€ à Alice

## 🤝 Contribuer

Lorsque vous travaillez sur le projet:

1. Créez une branche pour votre feature
2. Testez localement
3. Créez une Pull Request

## 📝 Licence

MIT - Libre d'utilisation

## 🎄 Bonnes Fêtes!

Amusez-vous bien en gérant vos listes de Noël en famille! 🎁
