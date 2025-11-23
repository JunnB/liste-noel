# 🚀 Guide de déploiement - Liste de Noël Familiale

## Déploiement sur Vercel (Recommandé)

### Prérequis
- Un compte [Vercel](https://vercel.com) (gratuit)
- Une base de données PostgreSQL:
  - [Neon](https://neon.tech) (gratuit, recommandé pour Vercel)
  - [Railway](https://railway.app)
  - [Supabase](https://supabase.com)

### Étapes

#### 1. **Préparer la base de données**

Créez une nouvelle base de données PostgreSQL sur Neon:

1. Allez sur [neon.tech](https://neon.tech)
2. Inscrivez-vous gratuitement
3. Créez un nouveau projet `liste-noel`
4. Copie la chaîne de connexion (DATABASE_URL)

#### 2. **Connecter le repo à Vercel**

```bash
npm i -g vercel
vercel
```

Ou directement sur [vercel.com](https://vercel.com/dashboard):
1. Cliquez sur "Add New..." > "Project"
2. Sélectionnez votre repository GitHub
3. Cliquez sur "Import"

#### 3. **Configurer les variables d'environnement**

Dans les paramètres du projet Vercel:

**Settings** > **Environment Variables**, ajoutez:

| Variable | Valeur |
|----------|--------|
| `DATABASE_URL` | Votre URL PostgreSQL de Neon |
| `BETTER_AUTH_URL` | `https://votre-domaine.vercel.app` |
| `BETTER_AUTH_SECRET` | Générez une clé aléatoire (min 32 caractères) |

**Pour générer BETTER_AUTH_SECRET:**
```bash
node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"
```

#### 4. **Deployer**

```bash
vercel --prod
```

Ou via l'interface Vercel:
- Push sur GitHub > Vercel déploie automatiquement

#### 5. **Initialiser la base de données**

Après le premier déploiement, migrez la base:

```bash
# En local avec la DATABASE_URL de production
DATABASE_URL="votre_url_neon" npx prisma migrate deploy
```

Ou accédez via SSH Vercel et exécutez dans les logs.

---

## Déploiement local pour développement

### Prérequis
- Node.js 18+
- PostgreSQL local (ou Docker)

### Installation

```bash
# Cloner et installer
git clone <votre-repo>
cd liste-noel
npm install

# Configurer .env.local
cp .env.example .env.local
# Éditer avec votre DATABASE_URL locale

# Initialiser la base de données
npx prisma migrate dev --name init

# Lancer le serveur
npm run dev
```

Ouvrez [http://localhost:3000](http://localhost:3000)

---

## Autres plateformes

### Railway
1. Créez un projet Railway
2. Ajoutez PostgreSQL
3. Connectez votre repo GitHub
4. Configurez les variables d'environnement
5. Déployez

### Supabase + Heroku
1. Créez une base sur Supabase
2. Déployez sur Heroku avec `npm install -g heroku`
3. Configurez les ENV vars

---

## Dépannage

### Erreur: "Prisma Client not found"
```bash
npx prisma generate
npm run build
```

### Erreur de base de données
- Vérifiez que DATABASE_URL est correcte
- Vérifiez que la base est accessible
- Essayez les migrations: `npx prisma migrate reset`

### Erreur d'authentification
- Générez un nouveau BETTER_AUTH_SECRET
- Assurez-vous que BETTER_AUTH_URL correspond à votre domaine

---

## Domaine personnalisé

Sur Vercel:
1. **Settings** > **Domains**
2. Ajoutez votre domaine
3. Mettez à jour vos DNS selon les instructions Vercel
4. Mettez à jour `BETTER_AUTH_URL` dans les variables d'environnement

---

## Maintenance

### Sauvegarder la base de données
```bash
# Neon: Utilisez l'interface web
# Railway: Utilisez le plugin PostgreSQL backup
# Supabase: Automatic backups inclus
```

### Mettre à jour le code
```bash
git push origin main
# Vercel déploiera automatiquement
```

### Migrer la base de données
```bash
npx prisma migrate deploy
```

---

## Bonus: Configuration pour production

1. **Activer HTTPS** (automatique sur Vercel)
2. **Configurer les CORS** si API externe
3. **Ajouter monitoring** (Sentry, LogRocket)
4. **Configurer les backups** de base de données
5. **Ajouter des tests CI/CD**

---

Bon déploiement! 🎄
