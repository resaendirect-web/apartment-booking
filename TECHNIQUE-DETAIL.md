# Documentation Technique Complète - Plateforme Resa en Direct

## 1. Vision du Projet

### Objectif Commercial
Créer une plateforme de réservation directe (resa-en-direct.fr) permettant au propriétaire de louer 6-10 appartements en courte durée sans passer par Booking ou Airbnb, économisant ainsi les frais de commission (typiquement 15-20%).

### Spécifications Métier
- **Nombre d'apartements** : 6 à 10 initialement
- **Utilisateurs simultanés** : ~500 max
- **Réservations prévues** : ~60 par mois
- **Synchronisation calendaire** : 3 sources (Booking, Airbnb, site direct)
- **Paiements acceptés** : Carte bancaire (Stripe), virement bancaire, espèces
- **Annulation** : Gratuite jusqu'à 2 jours avant check-in
- **Dépôt de garantie** : 15% du prix total (ajustable)
- **Communications clients** : Email, WhatsApp (clients étrangers)
- **Taxes/TVA** : Calcul standard à ajouter au prix (ajustable)
- **Langues** : Français + multilingue (via traducteur navigateur ou i18n futur)
- **Disponibilités** : Import iCal depuis Booking et Airbnb (flux unidirectionnel pour MVP)

### MVP (Minimum Viable Product)
Phase 1 prioritaire : vitrine + calendrier de disponibilités + formulaire de réservation simple + numéro WhatsApp pour confirmer

---

## 2. Architecture Générale

### Philosophie d'Architecture
- **Hexagonale** : Séparation claire entre couches HTTP, métier, données, infra
- **Domaine** : Groupement par entités (users, properties, bookings, calendars, availability)
- **Scalabilité** : Redis pour locks/cache, Prisma pour queries optimisées
- **Sécurité** : JWT + roles, validation stricte, hashage bcrypt, secrets en env vars
- **Observabilité** : Logs structurés (pino), possibilité OpenTelemetry futur

### Stack Technologique

#### Infrastructure & Hébergement
| Composant | Technologie | Justification | Coût |
|-----------|-------------|---------------|------|
| Frontend Hosting | Vercel | Auto-déploiement GitHub, CDN global, gratuit tier | Gratuit/Pro |
| Backend Hosting | Railway | Déploiement simple, PostgreSQL managée, gratuit tier | ~$7-20/mois |
| Base de données | PostgreSQL 15+ | Fiable, ACID, full-text search, JSONB | Inclus Railway |
| Cache/Locks | Redis | Verrous de disponibilité, cache session | Optionnel (~$7/mois) |
| Domaine | OVH | Registrar FR, support FR, bon marché | ~12€/an |
| Email SMTP | Gmail API | Gratuit, intégration simple Nodemailer | Gratuit |
| SMS/WhatsApp | Twilio (optionnel MVP) | API flexible, pricing à l'usage | ~0,02€ par message |

#### Backend - Stack Node.js
| Composant | Package | Version | Justification |
|-----------|---------|---------|---------------|
| Runtime | Node.js | v18+ LTS | Support long terme, perf |
| Framework HTTP | express | ^4.18 | Industry standard, middleware rich |
| ORM | @prisma/client | ^5.0 | Type-safe, migrations, seed |
| DB Client | pg | ^8.11 | Driver PostgreSQL natif |
| Authentification | jsonwebtoken | ^9.0 | JWT standard, refresh flow |
| Hash Mot de passe | bcryptjs | ^2.4 | OWASP compliant |
| Validation | zod | ^3.22 | TypeScript-first, schemas |
| Email | nodemailer | ^6.9 | Multi-transport, SMTP |
| iCal Parsing | ical.js | ^2.0 | Parse/generate iCal RFC 5545 |
| Planification | node-cron | ^3.0 | Sync iCal périodique |
| Queue (opt) | bull | ^4.11 | BullMQ pour jobs async |
| Redis (opt) | redis | ^4.6 | Client Redis |
| Sécurité HTTP | helmet | ^7.0 | Security headers |
| CORS | cors | ^2.8 | Contrôle CORS |
| Logging | pino | ^8.14 | Structured logs |
| Validation env | dotenv | ^16.0 | Variables d'environnement |
| Admin Panel (opt) | @adminjs/express | ^6.0 | Dashboard admin auto-généré |
| Documentation | swagger-ui-express | ^4.6 | Swagger/OpenAPI UI |

#### Frontend - Stack React
| Composant | Package | Version | Justification |
|-----------|---------|---------|---------------|
| Build Tool | Vite | ^5.0 | Instant HMR, optimisation ES |
| Framework | react | ^18.2 | Hooks, context, perf |
| Routing | react-router-dom | ^6.0 | SPA routing standard |
| Styling | tailwindcss | ^3.3 | Utility-first, responsive |
| UI Components | headlessui | ^1.7 | Unstyled accessible components |
| State Management | zustand | ^4.4 | Lightweight, non-intrusive |
| Server State | @tanstack/react-query | ^5.0 | Cache, sync, fetch management |
| Forms | react-hook-form | ^7.4 | Lightweight, performance |
| Validation | zod | ^3.22 | Schemas côté client |
| Calendar | react-big-calendar | ^1.8 | Affichage calendrier |
| Date Utils | date-fns | ^2.30 | Manipulation dates |
| HTTP Client | axios | ^1.5 | Promise-based, interceptors |
| Icons | react-icons | ^4.11 | Icon library diverse |
| Image Gallery | react-image-gallery | ^1.2 | Galerie responsive |
| Maps (opt) | react-leaflet | ^4.2 | Maps interactives |
| Modal | react-modal | ^3.16 | Modales accessible |
| Loading | react-spinners | ^0.13 | Spinners/loaders |
| i18n (optionnel) | i18next | ^23.0 | Internationalisation |
| Testing | vitest, @testing-library | ^1.0 | Unit/component tests |

---

## 3. Modèle de Données - Détails Prisma

### Users (Authentification & Autorisation)
```prisma
model User {
  id              String    @id @default(cuid())
  email           String    @unique
  passwordHash    String
  firstName       String?
  lastName        String?
  phone           String?
  role            UserRole  @default(USER) // USER, MANAGER, ADMIN
  properties      Property[]
  createdAt       DateTime  @default(now())
  updatedAt       DateTime  @updatedAt
  refreshTokens   RefreshToken[]
}

enum UserRole {
  USER
  MANAGER
  ADMIN
}

model RefreshToken {
  id        String   @id @default(cuid())
  userId    String
  user      User     @relation(fields: [userId], references: [id], onDelete: Cascade)
  token     String   @unique
  expiresAt DateTime
  createdAt DateTime @default(now())
}
```

### Properties & Units (Bien Immobilier)
```prisma
model Property {
  id           String    @id @default(cuid())
  ownerId      String
  owner        User      @relation(fields: [ownerId], references: [id], onDelete: Cascade)
  name         String
  description  String?
  address      String
  city         String
  zipCode      String
  country      String
  latitude     Float?
  longitude    Float?
  photos       Photo[]
  units        Unit[]
  createdAt    DateTime  @default(now())
  updatedAt    DateTime  @updatedAt
}

model Photo {
  id         String   @id @default(cuid())
  propertyId String
  property   Property @relation(fields: [propertyId], references: [id], onDelete: Cascade)
  url        String
  altText    String?
  order      Int      @default(0)
}

model Unit {
  id              String          @id @default(cuid())
  propertyId      String
  property        Property        @relation(fields: [propertyId], references: [id], onDelete: Cascade)
  name            String          // "Appart T2", "Studio", etc.
  capacity        Int             // nb personnes max
  bedrooms        Int
  bathrooms       Int
  amenities       String[]        // @db.Text
  description     String?
  
  // Tarification
  basePrice       Float           // € par nuit
  currency        String          @default("EUR")
  
  // Règles
  minStay         Int             @default(1)
  maxStay         Int?
  checkInTime     String          @default("15:00")
  checkOutTime    String          @default("11:00")
  
  // Données
  bookings        Booking[]
  availability    Availability[]
  rates           Rate[]
  calendarFeeds   CalendarFeed[]
  createdAt       DateTime        @default(now())
  updatedAt       DateTime        @updatedAt
}
```

### Tarification (Pricing & Rates)
```prisma
model Rate {
  id      String   @id @default(cuid())
  unitId  String
  unit    Unit     @relation(fields: [unitId], references: [id], onDelete: Cascade)
  date    DateTime @db.Date
  price   Float    // EUR
  
  // Règles spéciales
  minStay Int?
  maxStay Int?
  
  createdAt DateTime @default(now())
  updatedAt DateTime @updatedAt
  
  @@unique([unitId, date])
  @@index([unitId, date])
}
```

### Disponibilités (Inventory)
```prisma
model Availability {
  id        String     @id @default(cuid())
  unitId    String
  unit      Unit       @relation(fields: [unitId], references: [id], onDelete: Cascade)
  date      DateTime   @db.Date
  status    AvailStatus @default(OPEN)
  
  // Metadata
  source    String?    // "internal", "booking", "airbnb"
  
  createdAt DateTime   @default(now())
  updatedAt DateTime   @updatedAt
  
  @@unique([unitId, date])
  @@index([unitId, date, status])
}

enum AvailStatus {
  OPEN      // Disponible
  CLOSED    // Bloqué (sync externe ou owner)
  BLOCKED   // Bloqué intentionnellement
}
```

### Réservations (Bookings)
```prisma
model Booking {
  id              String       @id @default(cuid())
  unitId          String
  unit            Unit         @relation(fields: [unitId], references: [id], onDelete: Cascade)
  
  // Dates
  checkIn         DateTime     @db.Date
  checkOut        DateTime     @db.Date
  
  // Guest
  guestName       String
  guestEmail      String
  guestPhone      String
  guests          Int
  
  // Pricing
  pricePerNight   Float
  nbNights        Int
  subtotal        Float        // (nbNights * price)
  depositAmount   Float        // 15% de subtotal
  taxAmount       Float
  totalPrice      Float
  currency        String       @default("EUR")
  
  // Statut
  status          BookingStatus @default(PENDING)
  paymentStatus   PaymentStatus @default(PENDING)
  paymentMethod   PaymentMethod @default(CASH) // CARD, WIRE, CASH
  
  // Metadata
  notes           String?
  externalRef     String?      // ref Booking/Airbnb si sync
  createdAt       DateTime     @default(now())
  updatedAt       DateTime     @updatedAt
  
  @@index([unitId, checkIn, checkOut])
  @@index([status, paymentStatus])
}

enum BookingStatus {
  PENDING           // En attente de paiement/confirmation
  CONFIRMED         // Confirmée
  CHECKED_IN        // Client arrivé
  COMPLETED         // Réservation terminée
  CANCELLED         // Annulée
}

enum PaymentStatus {
  PENDING
  PROCESSING
  COMPLETED
  FAILED
  REFUNDED
}

enum PaymentMethod {
  CARD      // Stripe
  WIRE      // Virement bancaire
  CASH      // Espèces
}
```

### Synchronisation iCal (Calendar Sync)
```prisma
model CalendarFeed {
  id         String        @id @default(cuid())
  unitId     String
  unit       Unit          @relation(fields: [unitId], references: [id], onDelete: Cascade)
  
  direction  FeedDirection // IMPORT ou EXPORT
  url        String?       // URL iCal (si IMPORT)
  token      String?       // Token d'auth si besoin
  
  source     String?       // "booking.com", "airbnb.com", "direct"
  
  lastSyncAt DateTime?
  status     SyncStatus    @default(PENDING)
  
  events     CalendarEvent[]
  
  createdAt  DateTime      @default(now())
  updatedAt  DateTime      @updatedAt
}

enum FeedDirection {
  IMPORT    // Pull depuis Booking/Airbnb
  EXPORT    // Publish notre flux
}

enum SyncStatus {
  PENDING
  SYNCING
  SUCCESS
  ERROR
}

model CalendarEvent {
  id        String        @id @default(cuid())
  feedId    String
  feed      CalendarFeed  @relation(fields: [feedId], references: [id], onDelete: Cascade)
  
  uid       String        // Unique ID iCal
  summary   String        // Description de l'événement
  
  dtStart   DateTime      // Format ISO UTC
  dtEnd     DateTime
  
  // Tentative de matching booking
  bookingId String?
  booking   Booking?      @relation(fields: [bookingId], references: [id], onDelete: SetNull)
  
  createdAt DateTime      @default(now())
  updatedAt DateTime      @updatedAt
  
  @@unique([feedId, uid])
}

model Booking {
  // ... autres champs ...
  calendarEvents CalendarEvent[]
}
```

---

## 4. Architecture des Services Backend

### Domaines & Packages
```
backend/src/
├── controllers/
│   ├── authController.js
│   ├── propertyController.js
│   ├── bookingController.js
│   ├── calendarController.js
│   ├── healthController.js
│   └── adminController.js
├── routes/
│   ├── auth.js
│   ├── properties.js
│   ├── bookings.js
│   ├── calendars.js
│   └── admin.js
├── services/
│   ├── authService.js
│   ├── propertyService.js
│   ├── bookingService.js
│   ├── availabilityService.js
│   ├── calendarSyncService.js
│   ├── pricingService.js
│   ├── emailService.js
│   └── paymentService.js
├── middleware/
│   ├── auth.js (JWT verification)
│   ├── errorHandler.js
│   ├── validation.js (Zod)
│   └── logging.js
├── utils/
│   ├── ical.js (parse/generate iCal)
│   ├── dateHelpers.js
│   ├── constants.js
│   └── validators.js
├── prisma/
│   ├── schema.prisma
│   └── seed.js
├── jobs/
│   ├── syncCalendarJob.js (cron/queue)
│   └── emailJob.js
├── app.js (Express app setup)
└── index.js (entry point)
```

### Services Clés

#### CalendarSyncService
- **Fonction** : Synchroniser iCal depuis Booking/Airbnb toutes les 15 min
- **Logique** :
  1. Fetch URL iCal du feed
  2. Parse iCal.js → liste d'événements {uid, dtStart, dtEnd, summary}
  3. Normaliser dates en UTC
  4. Déduire nuits fermées (CLOSED) en Availability
  5. Upsert CalendarEvent par uid
  6. Mettre à jour lastSyncAt
  7. Log erreurs, métriques
- **Sécurité** : Whitelisting URLs http/https, timeout, max size .ics
- **Gestion de conflits** : Bookings CONFIRMED internes conservent priorité

#### BookingService
- **Quote** : POST /api/bookings/quote
  - Input : {unitId, checkIn, checkOut, guests}
  - Output : {priceBreakdown, total, currency, policies}
  - Calcul : base price * nuits + taxes + dépôt de garantie
- **Create** : POST /api/bookings
  - Prend verrou Redis sur [unitId, checkIn, checkOut]
  - Vérifie pas de chevauchement Booking existant
  - Crée Booking status=PENDING
  - Envoie email de confirmation
  - Relâche verrou
- **Cancel** : PATCH /api/bookings/:id/cancel
  - Vérifie date annulation (2j avant check-in)
  - Status → CANCELLED
  - Libère nuits en Availability

#### AvailabilityService
- **getAvailability** : GET /api/units/:id/availability?from=...&to=...
  - Cherche toutes Availability + Rate pour période
  - Applique règles : status=OPEN && minStay/maxStay
  - Retourne calendrier (jour à jour, prix)
- **updateBatch** : PUT /api/units/:id/availability
  - Bulk update Availability (status, minStay, maxStay)

#### PricingService
- **calculatePrice** : Calcul complet du prix
  - Base price × nbNights
  - + taxes (TVA standard)
  - + dépôt garantie 15%
  - − réductions éventuelles (early bird, long stay)

#### EmailService
- **confirmationEmail** : Booking confirmée
- **reminderEmail** : 1j avant check-in
- **cancelEmail** : Confirmation annulation
- Utilise Nodemailer + Gmail SMTP

---

## 5. Endpoints REST API

### Authentification
```
POST   /api/auth/register
Body:  { email, password, firstName?, lastName? }
Response: { data: { user, token, refreshToken } }

POST   /api/auth/login
Body:  { email, password }
Response: { data: { user, token, refreshToken } }

POST   /api/auth/refresh
Body:  { refreshToken }
Response: { data: { token } }

POST   /api/auth/logout
Response: { data: {} }
```

### Propriétés
```
GET    /api/properties                (publique)
GET    /api/properties/:id            (publique)
POST   /api/properties                (authentifié, MANAGER+)
PATCH  /api/properties/:id            (owner ou ADMIN)

GET    /api/properties/:id/units      (publique)
POST   /api/properties/:id/units      (owner ou ADMIN)
GET    /api/units/:id                 (publique)
PATCH  /api/units/:id                 (owner ou ADMIN)
```

### Disponibilités & Tarifs
```
GET    /api/units/:id/availability?from=YYYY-MM-DD&to=YYYY-MM-DD
PUT    /api/units/:id/availability    (bulk update)

GET    /api/units/:id/rates?from=...&to=...
PUT    /api/units/:id/rates           (bulk update)
```

### Réservations
```
POST   /api/bookings/quote
Body:  { unitId, checkIn, checkOut, guests }
Response: { data: { priceBreakdown, total, currency, policies } }

POST   /api/bookings
Body:  { unitId, checkIn, checkOut, guests, guestInfo, paymentMethod? }
Response: { data: { booking } }

GET    /api/bookings/:id              (authentifié)
PATCH  /api/bookings/:id/cancel       (authentifié, client ou owner)

GET    /api/admin/bookings            (ADMIN+, paginated)
PATCH  /api/admin/bookings/:id        (ADMIN+, forcer status)
```

### Synchronisation iCal
```
POST   /api/calendar/feeds
Body:  { unitId, direction: "IMPORT"|"EXPORT", url? }
Response: { data: { feed } }

GET    /api/calendar/feeds?unitId=...
DELETE /api/calendar/feeds/:id

POST   /api/calendar/sync/:feedId     (sync manuel)
GET    /api/calendar/export/:unitId.ics (flux public ICS)
```

### Admin
```
GET    /api/admin/dashboard           (stats: occupancy, revenue, etc.)
GET    /api/admin/bookings?status=...&page=...
PATCH  /api/admin/bookings/:id
GET    /api/health                    (health check)
```

---

## 6. Flux de Synchronisation iCal - Détail Complet

### Import (Pull) - Toutes les 15 minutes
```
1. Récupérer URL iCal du feed (CalendarFeed.url)
2. Télécharger .ics avec timeout 10s, max 5MB
3. Parser ical.js → array VEVENT
4. Pour chaque événement:
   a. Extraire: uid, dtStart (UTC), dtEnd (UTC), summary
   b. Normaliser fuso horaire
   c. Boucle dtStart → dtEnd (jour par jour):
      - Créer/update Availability { unitId, date, status: CLOSED, source: "booking" }
   d. Upsert CalendarEvent { feedId, uid, summary, dtStart, dtEnd }
5. Mettre à jour CalendarFeed.lastSyncAt = now()
6. Mettre à jour CalendarFeed.status = SUCCESS
7. Si erreur: mettre à jour status = ERROR + log
```

### Export (Push) - À la demande + webhook
```
1. Récupérer tous les Bookings CONFIRMED du Unit
2. Récupérer tous les blocs CLOSED du Unit
3. Générer .ics avec ical.js:
   - Header: PRODID, VERSION:2.0, CALSCALE:GREGORIAN
   - Pour chaque Booking CONFIRMED:
     * VEVENT uid=booking_{id}
     * DTSTART: checkIn en UTC
     * DTEND: checkOut en UTC
     * SUMMARY: "Réservation {guestName}"
   - Pour chaque CLOSED:
     * VEVENT uid=closed_{date}
     * DTSTART/DTEND: date en UTC
     * SUMMARY: "Bloqué"
4. Signer le flux avec token (query ?token=...)
5. Retourner Content-Type: text/calendar
```

### Gestion des Conflits
- Un Booking CONFIRMED interne **ne sera jamais écrasé** par un import iCal
- Un import iCal peut bloquer les nuits restantes sauf si Booking CONFIRMED
- Priorité : CONFIRMED interne > CLOSED import > OPEN

---

## 7. Sécurité - Détails

### Authentification
- JWT access token courte durée (15 min)
- JWT refresh token longue durée (7j) en httpOnly cookie (ou localStorage)
- Rotation refresh tokens : old token révoqué après utilisation
- Rôles : USER, MANAGER (propriétaire), ADMIN

### Validation
- Tous les inputs validés avec Zod schemas
- Emails validés (format RFC 5322 simple)
- Dates validées (format ISO 8601)
- Nombres positifs, strings nullables explicites
- Trim/sanitize strings

### Protection Contre les Attaques
- **CSRF** : Pas d'enjeu pour Bearer token JWT (API stateless)
- **Rate Limiting** : 100 req/15min par IP, plus stricte pour auth (10 req/15min)
- **CORS** : Whitelist originss http://localhost:3000 + domain resa-en-direct.fr
- **Helmet** : Headers de sécurité (X-Frame-Options, CSP, etc.)
- **SQL Injection** : N/A (Prisma parameterized queries)
- **XSS** : N/A backend, validé frontend

### Gestion des Secrets
- Variables d'env jamais committées (.env dans .gitignore)
- Utilisées via dotenv
- Railway configure les secrets en env vars

### Mot de Passe
- Hashé avec bcryptjs (salt rounds=10)
- Jamais stocké en clair
- Jamais loggé

### Verrous de Disponibilité
- Redis SET NX PX (atomic check-and-set) pendant booking creation
- Évite surbooking en cas de race condition
- Clé format : `booking:lock:{unitId}:{checkIn}:{checkOut}`
- TTL 30s

---

## 8. Déploiement & Configuration

### Variables d'Environnement Backend (.env)
```
# Database
DATABASE_URL=postgresql://user:pass@host:port/db

# JWT
JWT_SECRET=your_secret_long_string_here
JWT_REFRESH_SECRET=another_secret_long_string
JWT_EXPIRE_IN=15m
JWT_REFRESH_EXPIRE_IN=7d

# Server
NODE_ENV=development|production
PORT=5000
BASE_URL=http://localhost:5000 (ou https://resa-en-direct.fr)

# Email SMTP
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_USER=resaendirect@gmail.com
SMTP_PASSWORD=your_gmail_app_password
ADMIN_EMAIL=resaendirect@gmail.com
MAIL_FROM_NAME=Resa en Direct

# WhatsApp/SMS (optionnel)
TWILIO_ACCOUNT_SID=your_sid
TWILIO_AUTH_TOKEN=your_token
TWILIO_PHONE_NUMBER=+1234567890

# Payment (optionnel)
STRIPE_SECRET_KEY=sk_...
STRIPE_WEBHOOK_SECRET=whsec_...

# iCal
ICAL_SYNC_INTERVAL=15  # minutes
ICAL_TIMEOUT=10000      # ms
ICAL_MAX_SIZE=5242880   # bytes (5MB)
ICS_TOKEN_SECRET=token_secret_for_export

# Redis (optionnel)
REDIS_URL=redis://localhost:6379

# Logging
LOG_LEVEL=debug|info|warn|error
```

### Déploiement Vercel (Frontend)
1. Push code vers GitHub
2. Connecter repo dans Vercel
3. Configurer root directory: `./frontend`
4. Variables d'env frontend :
   ```
   VITE_API_URL=https://api.resa-en-direct.fr
   VITE_MAP_API_KEY=...
   ```
5. Deploy automatique à chaque push

### Déploiement Railway (Backend)
1. Créer projet Railway
2. Ajouter PostgreSQL plugin
3. Ajouter container Node.js
4. Connecter repo GitHub
5. Configurer variables d'env (copier du .env)
6. Deploy automatique

### DNS & Domaine (OVH)
1. Enregistrer A record : resa-en-direct.fr → IP Vercel (ou CNAME)
2. Enregistrer MX record pour Gmail
3. Enregistrer TXT pour SPF/DKIM
4. Attendre propagation DNS (~24h)

---

## 9. Installation & Initialisation

### Prérequis
- Node.js v18+ LTS
- PostgreSQL v14+
- Git

### Setup Local (Voir backend/INSTALLATION.md)
```bash
# 1. Cloner repo
git clone https://github.com/resaendirect-web/apartment-booking.git
cd apartment-booking/backend

# 2. Installer dépendances
npm install

# 3. Configurer .env (copier .env.example)
cp .env.example .env
# Éditer .env avec vos valeurs

# 4. Setup DB
npx prisma migrate dev --name init
npx prisma db seed

# 5. Lancer serveur dev
npm run dev
# Server sur http://localhost:5000
```

### Vérification
- `GET http://localhost:5000/api/health` → OK
- `POST http://localhost:5000/api/auth/register` → token reçu

---

## 10. Roadmap & Étapes Futures

### Phase 2 (Court terme)
- [ ] Compléter frontend (Search, Details, Booking, Admin dashboard)
- [ ] Intégration Stripe paiements CB
- [ ] Intégration Twilio WhatsApp notifications
- [ ] Tests unitaires + e2e
- [ ] Monitoring & alertes

### Phase 3 (Moyen terme)
- [ ] Webhooks OTA (Booking, Airbnb push)
- [ ] Channel Manager (push vers autres OTA)
- [ ] Règles tarifaires avancées (séjour, saisonnalité)
- [ ] Multi-langues i18n
- [ ] Mobile app React Native

### Phase 4 (Long terme)
- [ ] Systèmes de reviews & ratings
- [ ] Intégrations BI (analytics, revenue reports)
- [ ] APIs partenaires (agences immobilières)
- [ ] Gestion locataires LT (lease management)

---

## 11. Documents & Fichiers Clés

Lire dans cet ordre pour onboarding :
1. **backend/README.md** - Architecture générale
2. **backend/INSTALLATION.md** - Setup technique
3. **backend/QUICKSTART.md** - Premier pas avec Postman
4. **backend/SYNTHÈSE.md** - Résumé features
5. **frontend/README.md** - Stack React
6. **Ce fichier** - Vue globale technique

---

## 12. Contacts & Support

- **Repository** : https://github.com/resaendirect-web/apartment-booking
- **Domaine** : resa-en-direct.fr
- **Email Admin** : resaendirect@gmail.com
- **Propriétaire** : À définir
- **Développeur Lead** : IA Claude (orchestration Perplexity)
