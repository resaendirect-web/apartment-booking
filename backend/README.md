# 🏠 Apartment Booking - Backend API

API REST complète pour système de réservation d'appartements avec synchronisation iCal automatique.

## 📋 Table des matières

- [Technologies](#technologies)
- [Fonctionnalités](#fonctionnalités)
- [Installation](#installation)
- [Configuration](#configuration)
- [Utilisation](#utilisation)
- [Structure du projet](#structure-du-projet)
- [API Endpoints](#api-endpoints)
- [Synchronisation iCal](#synchronisation-ical)

## 🚀 Technologies

- **Node.js** 18+ / Express.js
- **Prisma ORM** avec PostgreSQL
- **JWT** pour l'authentification
- **Zod** pour la validation des données
- **ical.js** pour le parsing des calendriers iCal
- **Nodemailer** pour les emails
- **Bcrypt** pour le hashage des mots de passe

## ✨ Fonctionnalités

- ✅ Authentification JWT (inscription, connexion, profil)
- ✅ Gestion des propriétés et unités (appartements/chambres)
- ✅ Système de réservation avec vérification de disponibilité
- ✅ Synchronisation automatique avec calendriers iCal externes (Airbnb, Booking.com, etc.)
- ✅ Export iCal pour intégration avec autres plateformes
- ✅ Gestion des tarifs par période
- ✅ Gestion des disponibilités
- ✅ Rôles utilisateurs (Guest, Owner, Admin)
- ✅ API RESTful complète avec pagination
- ✅ Sécurité (Helmet, CORS, Rate Limiting)

## 📦 Installation

### 1. Cloner le projet

\`\`\`bash
git clone https://github.com/resaendirect-web/apartment-booking.git
cd apartment-booking/backend
\`\`\`

### 2. Installer les dépendances

\`\`\`bash
npm install
\`\`\`

### 3. Installer et configurer PostgreSQL

Assurez-vous d'avoir PostgreSQL installé et créez une base de données :

\`\`\`sql
CREATE DATABASE apartment_booking;
\`\`\`

## ⚙️ Configuration

### 1. Variables d'environnement

Copiez le fichier \`.env.example\` vers \`.env\` et configurez vos variables :

\`\`\`bash
cp .env.example .env
\`\`\`

Éditez le fichier \`.env\` avec vos valeurs :

\`\`\`env
DATABASE_URL="postgresql://username:password@localhost:5432/apartment_booking"
JWT_SECRET=your-secret-key-here
SMTP_HOST=smtp.gmail.com
SMTP_USER=your-email@gmail.com
SMTP_PASS=your-app-password
\`\`\`

### 2. Initialiser Prisma

\`\`\`bash
# Générer le client Prisma
npm run prisma:generate

# Créer les migrations
npm run prisma:migrate

# (Optionnel) Ouvrir Prisma Studio pour visualiser la DB
npm run prisma:studio
\`\`\`

## 🎯 Utilisation

### Démarrer le serveur en développement

\`\`\`bash
npm run dev
\`\`\`

Le serveur démarre sur \`http://localhost:5000\`

### Démarrer le serveur en production

\`\`\`bash
npm start
\`\`\`

### Lancer la synchronisation des calendriers

\`\`\`bash
npm run sync:calendars
\`\`\`

### Vérifier l'état du serveur

\`\`\`bash
curl http://localhost:5000/api/v1/health
\`\`\`

## 📁 Structure du projet

\`\`\`
backend/
├── prisma/
│   └── schema.prisma          # Schéma de la base de données
├── src/
│   ├── controllers/           # Logique métier
│   │   ├── authController.js
│   │   ├── bookingController.js
│   │   ├── calendarController.js
│   │   ├── healthController.js
│   │   └── propertyController.js
│   ├── middlewares/           # Middlewares Express
│   │   └── auth.js            # Authentification JWT
│   ├── routes/
│   │   └── api/               # Routes API
│   │       ├── index.js
│   │       ├── authRoutes.js
│   │       ├── bookingRoutes.js
│   │       ├── calendarRoutes.js
│   │       └── propertyRoutes.js
│   ├── scripts/               # Scripts utilitaires
│   │   └── syncCalendars.js   # Script de synchro iCal
│   ├── app.js                 # Configuration Express
│   └── index.js               # Point d'entrée
├── .env.example               # Variables d'environnement (template)
├── .gitignore
├── package.json
└── README.md
\`\`\`

## 🔌 API Endpoints

### Authentication

| Méthode | Endpoint | Description | Auth |
|---------|----------|-------------|------|
| POST | /api/v1/auth/register | Inscription | ❌ |
| POST | /api/v1/auth/login | Connexion | ❌ |
| GET | /api/v1/auth/me | Profil utilisateur | ✅ |
| PUT | /api/v1/auth/update-profile | Mise à jour profil | ✅ |
| PUT | /api/v1/auth/change-password | Changement mot de passe | ✅ |

### Properties

| Méthode | Endpoint | Description | Auth |
|---------|----------|-------------|------|
| GET | /api/v1/properties | Liste des propriétés | ❌ |
| GET | /api/v1/properties/:id | Détail d'une propriété | ❌ |
| POST | /api/v1/properties | Créer une propriété | ✅ Owner/Admin |
| PUT | /api/v1/properties/:id | Modifier une propriété | ✅ Owner/Admin |
| DELETE | /api/v1/properties/:id | Supprimer une propriété | ✅ Owner/Admin |
| GET | /api/v1/properties/:id/units | Liste des unités | ❌ |

### Bookings

| Méthode | Endpoint | Description | Auth |
|---------|----------|-------------|------|
| GET | /api/v1/bookings | Liste des réservations | ✅ Owner/Admin |
| GET | /api/v1/bookings/my-bookings | Mes réservations | ✅ |
| POST | /api/v1/bookings | Créer une réservation | ✅ |
| GET | /api/v1/bookings/:id | Détail réservation | ✅ |
| PUT | /api/v1/bookings/:id/cancel | Annuler réservation | ✅ |
| PUT | /api/v1/bookings/:id/status | Changer statut | ✅ Owner/Admin |

### Calendars

| Méthode | Endpoint | Description | Auth |
|---------|----------|-------------|------|
| GET | /api/v1/calendars/feeds | Liste des flux iCal | ✅ Owner/Admin |
| POST | /api/v1/calendars/feeds | Créer un flux iCal | ✅ Owner/Admin |
| GET | /api/v1/calendars/feeds/:id | Détail d'un flux | ✅ Owner/Admin |
| PUT | /api/v1/calendars/feeds/:id | Modifier un flux | ✅ Owner/Admin |
| DELETE | /api/v1/calendars/feeds/:id | Supprimer un flux | ✅ Owner/Admin |
| POST | /api/v1/calendars/feeds/:id/sync | Synchroniser un flux | ✅ Owner/Admin |
| POST | /api/v1/calendars/sync-all | Synchroniser tous | ✅ Admin |
| GET | /api/v1/calendars/export/:unitId | Export iCal unité | ❌ |

### Health Check

| Méthode | Endpoint | Description | Auth |
|---------|----------|-------------|------|
| GET | /api/v1/health | État du serveur | ❌ |

## 📅 Synchronisation iCal

### Configuration d'un flux iCal

1. **Obtenir l'URL iCal** depuis Airbnb/Booking.com :
   - Airbnb : Paramètres → Calendrier → Export
   - Booking.com : Extranet → Calendrier → Sync calendrier

2. **Créer le flux via l'API** :

\`\`\`bash
curl -X POST http://localhost:5000/api/v1/calendars/feeds \\
  -H "Authorization: Bearer YOUR_JWT_TOKEN" \\
  -H "Content-Type: application/json" \\
  -d '{
    "name": "Airbnb - Apartment 1",
    "url": "https://www.airbnb.com/calendar/ical/xxxxx.ics",
    "source": "AIRBNB",
    "unitId": "unit-uuid-here"
  }'
\`\`\`

3. **Synchronisation automatique** :
   - Configurez un cron job pour exécuter la synchro périodiquement
   - Ou utilisez l'endpoint manuel \`/calendars/feeds/:id/sync\`

### Script de synchronisation

\`\`\`bash
# Synchroniser tous les flux actifs
npm run sync:calendars

# Ou via l'API
curl -X POST http://localhost:5000/api/v1/calendars/sync-all \\
  -H "Authorization: Bearer YOUR_ADMIN_TOKEN"
\`\`\`

### Cron Job (Linux/Mac)

\`\`\`bash
# Éditer crontab
crontab -e

# Ajouter une tâche qui s'exécute toutes les 30 minutes
*/30 * * * * cd /path/to/backend && npm run sync:calendars
\`\`\`

## 📊 Base de données - Schéma Prisma

Le schéma comprend 8 modèles principaux :

1. **User** - Utilisateurs (guests, owners, admin)
2. **Property** - Propriétés/Établissements
3. **Unit** - Unités de location (appartements, chambres)
4. **Booking** - Réservations
5. **CalendarFeed** - Flux iCal externes
6. **CalendarEvent** - Événements importés
7. **Availability** - Règles de disponibilité
8. **Rate** - Tarification par période

## 🔐 Sécurité

- ✅ Mots de passe hashés avec bcrypt
- ✅ JWT avec expiration configurable
- ✅ CORS configuré
- ✅ Helmet.js pour sécuriser les headers
- ✅ Rate limiting sur l'API
- ✅ Validation des données avec Zod
- ✅ Protection contre les injections SQL (Prisma)

## 🧪 Tests

\`\`\`bash
npm test
\`\`\`

## 📝 License

MIT

## 👥 Auteurs

Resaendirect Web Team

## 🤝 Contribution

Les contributions sont les bienvenues ! N'hésitez pas à ouvrir une issue ou une pull request.

---

**Note** : Ce projet est en développement actif. Certaines fonctionnalités peuvent être ajoutées ou modifiées.
