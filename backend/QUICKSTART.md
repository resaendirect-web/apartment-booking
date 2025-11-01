# 🚀 DÉMARRAGE RAPIDE - Apartment Booking Backend

## Installation et configuration en 5 minutes

### 1️⃣ Installation des dépendances

\`\`\`bash
npm install
\`\`\`

### 2️⃣ Configuration de l'environnement

\`\`\`bash
# Copier le fichier d'exemple
cp .env.example .env

# Éditer le fichier .env et configurer au minimum :
# - DATABASE_URL (connexion PostgreSQL)
# - JWT_SECRET (clé secrète pour JWT)
\`\`\`

### 3️⃣ Configuration de la base de données

\`\`\`bash
# Générer le client Prisma
npm run prisma:generate

# Créer les tables dans la base de données
npm run prisma:migrate

# (Optionnel) Remplir avec des données de test
npm run prisma:seed
\`\`\`

### 4️⃣ Démarrer le serveur

\`\`\`bash
# Mode développement (avec hot-reload)
npm run dev

# Mode production
npm start
\`\`\`

Le serveur démarre sur : **http://localhost:5000**

### 5️⃣ Tester l'API

\`\`\`bash
# Vérifier l'état du serveur
curl http://localhost:5000/api/v1/health
\`\`\`

---

## 📝 Comptes de test (après seed)

Si vous avez exécuté \`npm run prisma:seed\`, vous disposez de ces comptes :

- **Admin** : admin@apartmentbooking.com / Admin@123456
- **Propriétaire** : owner@apartmentbooking.com / Owner@123456
- **Client** : guest@apartmentbooking.com / Guest@123456

---

## 🔑 Premier appel API

### S'inscrire

\`\`\`bash
curl -X POST http://localhost:5000/api/v1/auth/register \\
  -H "Content-Type: application/json" \\
  -d '{
    "email": "test@example.com",
    "password": "Test@123456",
    "firstName": "Test",
    "lastName": "User",
    "role": "GUEST"
  }'
\`\`\`

### Se connecter

\`\`\`bash
curl -X POST http://localhost:5000/api/v1/auth/login \\
  -H "Content-Type: application/json" \\
  -d '{
    "email": "test@example.com",
    "password": "Test@123456"
  }'
\`\`\`

Vous recevrez un token JWT à utiliser dans les requêtes suivantes.

### Lister les propriétés

\`\`\`bash
curl http://localhost:5000/api/v1/properties
\`\`\`

---

## 🔧 Commandes utiles

\`\`\`bash
# Démarrage
npm run dev              # Mode développement
npm start                # Mode production

# Prisma
npm run prisma:generate  # Générer le client Prisma
npm run prisma:migrate   # Créer/appliquer migrations
npm run prisma:studio    # Interface graphique de la DB
npm run prisma:seed      # Remplir avec données de test

# Synchronisation calendriers
npm run sync:calendars   # Synchroniser tous les flux iCal

# Tests et qualité
npm test                 # Lancer les tests
npm run lint            # Vérifier le code
npm run format          # Formater le code
\`\`\`

---

## 🆘 Dépannage

### Erreur de connexion PostgreSQL

Vérifiez votre \`DATABASE_URL\` dans le fichier \`.env\` :

\`\`\`env
DATABASE_URL="postgresql://USER:PASSWORD@HOST:PORT/DATABASE?schema=public"
\`\`\`

### Port 5000 déjà utilisé

Changez le port dans \`.env\` :

\`\`\`env
PORT=3001
\`\`\`

### Erreur Prisma "Client not generated"

Relancez :

\`\`\`bash
npm run prisma:generate
\`\`\`

---

## 📚 Documentation complète

Consultez le fichier README.md pour la documentation complète de l'API.

---

**Bon développement ! 🎉**
