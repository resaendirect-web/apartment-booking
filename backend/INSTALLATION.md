# 📦 RÉCAPITULATIF - Backend Apartment Booking

## ✅ Fichiers générés

Tous les fichiers suivants ont été créés et sont prêts à l'emploi :

### 📄 Configuration
- `package.json` - Dépendances et scripts npm
- `.env.example` - Template des variables d'environnement
- `.gitignore` - Fichiers à ignorer dans Git
- `README.md` - Documentation complète
- `QUICKSTART.md` - Guide de démarrage rapide

### 🗄️ Base de données (Prisma)
- `prisma/schema.prisma` - Schéma complet avec 8 modèles
- `prisma/seed.js` - Script de remplissage avec données de test

### 🎯 Application Express
- `src/index.js` - Point d'entrée du serveur
- `src/app.js` - Configuration Express (middlewares, routes, erreurs)

### 🛣️ Routes API
- `src/routes/api/index.js` - Router principal
- `src/routes/api/authRoutes.js` - Routes d'authentification
- `src/routes/api/propertyRoutes.js` - Routes des propriétés
- `src/routes/api/bookingRoutes.js` - Routes des réservations
- `src/routes/api/calendarRoutes.js` - Routes des calendriers iCal

### 🎮 Controllers
- `src/controllers/healthController.js` - Health check
- `src/controllers/authController.js` - Authentification complète
- `src/controllers/propertyController.js` - Gestion des propriétés et unités
- `src/controllers/bookingController.js` - Gestion des réservations
- `src/controllers/calendarController.js` - Synchronisation iCal

### 🔐 Middlewares
- `src/middlewares/auth.js` - Authentification JWT et autorisation

### 🔧 Scripts
- `src/scripts/syncCalendars.js` - Script de synchronisation iCal avancé

---

## 🚀 ORDRE D'INSTALLATION

### Étape 1 : Installation des dépendances

\`\`\`bash
cd backend
npm install
\`\`\`

**Dépendances installées** :
- express (serveur web)
- @prisma/client (ORM)
- bcryptjs (hashage mots de passe)
- jsonwebtoken (authentification)
- zod (validation)
- ical.js (parsing iCal)
- nodemailer (emails)
- cors, helmet (sécurité)
- dotenv (variables d'environnement)

### Étape 2 : Configuration

\`\`\`bash
# Copier le template d'environnement
cp .env.example .env

# Éditer .env et configurer :
nano .env
\`\`\`

**Variables OBLIGATOIRES à configurer** :
\`\`\`env
DATABASE_URL="postgresql://username:password@localhost:5432/apartment_booking"
JWT_SECRET=your-super-secret-key-change-this
\`\`\`

**Variables OPTIONNELLES** (pour emails et autres) :
\`\`\`env
SMTP_HOST=smtp.gmail.com
SMTP_USER=your-email@gmail.com
SMTP_PASS=your-app-password
\`\`\`

### Étape 3 : Base de données PostgreSQL

\`\`\`bash
# Créer la base de données PostgreSQL
createdb apartment_booking

# Ou via psql :
psql -U postgres
CREATE DATABASE apartment_booking;
\\q
\`\`\`

### Étape 4 : Prisma - Génération et migrations

\`\`\`bash
# Générer le client Prisma
npm run prisma:generate

# Créer les tables
npm run prisma:migrate

# (Optionnel) Remplir avec des données de test
npm run prisma:seed
\`\`\`

### Étape 5 : Démarrage du serveur

\`\`\`bash
# Mode développement (avec nodemon)
npm run dev

# OU mode production
npm start
\`\`\`

Le serveur démarre sur **http://localhost:5000**

### Étape 6 : Test de l'API

\`\`\`bash
# Vérifier que le serveur fonctionne
curl http://localhost:5000/api/v1/health

# Vous devriez voir :
# {
#   "success": true,
#   "status": "healthy",
#   "database": {
#     "status": "connected"
#   }
# }
\`\`\`

---

## 📊 Modèles de données (Prisma Schema)

### 1. User
- Utilisateurs avec rôles (GUEST, OWNER, ADMIN)
- Authentification JWT
- Profils complets

### 2. Property
- Propriétés/Établissements
- Géolocalisation
- Équipements

### 3. Unit
- Unités de location (appartements, chambres, studios)
- Capacité, tarifs
- Images

### 4. Booking
- Réservations avec statuts
- Calcul automatique des prix
- Vérification de disponibilité

### 5. CalendarFeed
- Flux iCal externes
- Synchronisation Airbnb/Booking.com
- Statut de sync

### 6. CalendarEvent
- Événements importés depuis iCal
- Liaison avec réservations

### 7. Availability
- Règles de disponibilité
- Min/max nuits

### 8. Rate
- Tarification par période
- Types de tarifs (standard, weekend, haute saison)

---

## 🔌 Endpoints API principaux

### Health Check
- `GET /api/v1/health` - État du serveur

### Authentification
- `POST /api/v1/auth/register` - Inscription
- `POST /api/v1/auth/login` - Connexion
- `GET /api/v1/auth/me` - Profil utilisateur (authentifié)

### Propriétés
- `GET /api/v1/properties` - Liste des propriétés
- `POST /api/v1/properties` - Créer une propriété (owner/admin)
- `GET /api/v1/properties/:id` - Détail propriété

### Réservations
- `POST /api/v1/bookings` - Créer une réservation
- `GET /api/v1/bookings/my-bookings` - Mes réservations
- `PUT /api/v1/bookings/:id/cancel` - Annuler une réservation

### Calendriers iCal
- `POST /api/v1/calendars/feeds` - Ajouter un flux iCal
- `POST /api/v1/calendars/feeds/:id/sync` - Synchroniser un flux
- `GET /api/v1/calendars/export/:unitId` - Export iCal

---

## 🔧 Synchronisation iCal

### Configuration manuelle d'un flux

\`\`\`bash
# 1. Se connecter et récupérer le token
TOKEN=$(curl -s -X POST http://localhost:5000/api/v1/auth/login \\
  -H "Content-Type: application/json" \\
  -d '{"email":"owner@apartmentbooking.com","password":"Owner@123456"}' \\
  | jq -r '.data.token')

# 2. Créer un flux iCal
curl -X POST http://localhost:5000/api/v1/calendars/feeds \\
  -H "Authorization: Bearer $TOKEN" \\
  -H "Content-Type: application/json" \\
  -d '{
    "name": "Airbnb - Mon Appartement",
    "url": "https://www.airbnb.com/calendar/ical/xxxxx.ics",
    "source": "AIRBNB",
    "unitId": "votre-unit-id"
  }'
\`\`\`

### Script automatique

\`\`\`bash
# Synchroniser tous les flux actifs
npm run sync:calendars
\`\`\`

### Cron Job (automatisation)

\`\`\`bash
# Éditer crontab
crontab -e

# Ajouter (sync toutes les 30 minutes)
*/30 * * * * cd /path/to/backend && npm run sync:calendars >> /var/log/calendar-sync.log 2>&1
\`\`\`

---

## 🔐 Sécurité implémentée

✅ Hashage des mots de passe (bcrypt)
✅ JWT avec expiration
✅ CORS configuré
✅ Helmet.js (headers HTTP sécurisés)
✅ Rate limiting (100 requêtes / 15 min)
✅ Validation des données (Zod)
✅ Protection contre injections SQL (Prisma)
✅ Middlewares d'autorisation par rôle

---

## 📚 Documentation

- **README.md** : Documentation complète de l'API
- **QUICKSTART.md** : Guide de démarrage rapide
- **Ce fichier** : Récapitulatif et ordre d'installation

---

## 🎉 Comptes de test (après seed)

Si vous avez exécuté \`npm run prisma:seed\` :

| Rôle | Email | Mot de passe |
|------|-------|--------------|
| Admin | admin@apartmentbooking.com | Admin@123456 |
| Owner | owner@apartmentbooking.com | Owner@123456 |
| Guest | guest@apartmentbooking.com | Guest@123456 |

---

## 🆘 Support

En cas de problème :

1. Vérifiez que PostgreSQL est bien lancé
2. Vérifiez votre fichier `.env`
3. Consultez les logs du serveur
4. Consultez le README.md pour plus de détails

---

## ✨ Prochaines étapes

1. Déploiement (Heroku, AWS, Render, etc.)
2. Configuration SMTP pour les emails
3. Intégration de Stripe pour les paiements
4. Tests unitaires et d'intégration
5. Documentation OpenAPI/Swagger
6. CI/CD (GitHub Actions)

---

**Projet créé avec ❤️ pour Resaendirect**
