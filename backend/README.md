# Backend - Apartment Booking API

Ce document décrit l’architecture du backend, les endpoints REST, les flux de synchronisation iCal, la gestion des disponibilités, la sécurité, la stack technique et un exemple de workflow de réservation.

## Stack technique
- Runtime: Node.js (LTS)
- Framework HTTP: Express.js
- Base de données: PostgreSQL
- ORM: Prisma
- Cache/queues: Redis (pour verrous de disponibilité, caches de calendrier, files de jobs)
- Authentification: JWT (access + refresh tokens)
- Validation: Zod (ou Joi)
- Documentation API: OpenAPI/Swagger (via swagger-ui-express)
- Logs/Observabilité: pino + pino-pretty, OpenTelemetry (optionnel)
- Tâches planifiées: node-cron / BullMQ (sur Redis)

## Architecture
Couche hexagonale simple:
- Interface HTTP (Express): routes, middlewares, validation, auth, sérialisation
- Services applicatifs: logique métier (disponibilités, tarification, réservations, synchronisation iCal)
- Repositories (Prisma): accès DB, transactions
- Intégrations: iCal (import/export), webhooks (optionnel), emails
- Infra: Redis (locks, cache), tâches asynchrones (BullMQ)

Séparation par domaines:
- users (authentification/autorisation)
- properties (biens), units (logements/annonces), ratePlans/pricing
- availability (inventaire, règles de séjour, fermetures)
- bookings (réservations, paiements si applicable)
- calendar-sync (fetch/parse iCal, export iCal)

## Conventions générales
- Préfixe API: /api
- Réponses JSON enveloppées { data, meta?, error? }
- Codes HTTP standard: 200/201/204, 400, 401, 403, 404, 409, 422, 429, 500
- Dates au format ISO 8601 en UTC (YYYY-MM-DD ou YYYY-MM-DDTHH:mm:ssZ)
- Pagination: query params page, limit (meta: total, page, limit)
- Filtrage: query params simples (ex: from, to, propertyId)

## Authentification & Sécurité
- JWT access (courte durée) dans Authorization: Bearer <token>
- Refresh token persistant (httpOnly cookie ou storage côté app-admin)
- RBAC simple: roles [admin, manager, user] + vérification par middleware
- Protection CSRF non requise pour APIs Bearer, rate limiting par IP/clé
- Validation stricte des inputs (Zod), en-têtes de sécurité (helmet)
- Mot de passe hashé (bcrypt), rotation des refresh tokens, revoke list (Redis)
- Verrous de disponibilité via Redis (SET NX PX) pour éviter le surbooking

## Modèles principaux (schéma logique)
- User { id, email, passwordHash, role, createdAt }
- Property { id, name, timezone }
- Unit { id, propertyId, name, capacity }
- Availability { id, unitId, date, status: OPEN|CLOSED, minStay, maxStay }
- Rate { id, unitId, date, price, currency }
- Booking { id, unitId, checkIn, checkOut, status: PENDING|CONFIRMED|CANCELLED, guest, total, currency, externalRef? }
- CalendarFeed { id, unitId, direction: IMPORT|EXPORT, url?, token?, lastSyncAt }
- CalendarEvent { id, feedId, uid, start, end, summary, source }

## Endpoints REST (extrait)

### Auth
- POST /api/auth/register
  Body: { email, password, firstName?, lastName?, role? }
  Réponse: { data: { user, token, refreshToken } }

- POST /api/auth/login
  Body: { email, password }
  Réponse: { data: { user, token, refreshToken } }

- POST /api/auth/refresh
  Body: { refreshToken }
  Réponse: { data: { token } }

- POST /api/auth/logout
  Invalide le refresh token courant

### Properties & Units
- GET /api/properties
- POST /api/properties
- GET /api/properties/:id
- PATCH /api/properties/:id
- GET /api/properties/:id/units
- POST /api/properties/:id/units
- GET /api/units/:id
- PATCH /api/units/:id

### Disponibilités & Tarifs
- GET /api/units/:id/availability?from=YYYY-MM-DD&to=YYYY-MM-DD
- PUT /api/units/:id/availability (batch)
  Body: { items: [{ date, status, minStay?, maxStay? }] }
- GET /api/units/:id/rates?from=...&to=...
- PUT /api/units/:id/rates (batch)
  Body: { items: [{ date, price, currency }] }

### Réservations
- POST /api/bookings/quote
  Body: { unitId, checkIn, checkOut, guests }
  Réponse: { data: { priceBreakdown, total, currency, policies } }

- POST /api/bookings
  Body: { unitId, checkIn, checkOut, guests, guestInfo, payment? }
  Réponse: { data: { booking } }

- GET /api/bookings/:id
- PATCH /api/bookings/:id/cancel

### Synchronisation iCal
- POST /api/calendar/feeds
  Body: { unitId, direction: "IMPORT"|"EXPORT", url? }
- GET /api/calendar/feeds?unitId=...
- DELETE /api/calendar/feeds/:id

- POST /api/calendar/sync/:feedId (déclenche un sync manuel)
- GET /api/calendar/export/:unitId.ics (flux public export)

## Flux de synchronisation iCal (détails)
- Import (pull):
  1) Récupérer l’URL iCal du channel externe (Airbnb/Booking/etc.)
  2) Télécharger le .ics, parser les VEVENT (DTSTART/DTEND, UID, SUMMARY)
  3) Normaliser fuseau (TZ) vers UTC et dates
  4) Déduire indisponibilités: pour chaque événement, marquer les nuits [start, end) comme CLOSED
  5) Upsert CalendarEvent par UID; mettre à jour Availability correspondante
  6) Marquer Booking externe si identifiable (externalRef)
  7) Enregistrer lastSyncAt, métriques, et erreurs
  Politique de conflits: les réservations CONFIRMED internes priment; un import ne supprime pas une réservation confirmée mais peut fermer l’inventaire restant.

- Export (push):
  1) Générer un .ics par unitId (flux authentifié via token ou public si choisi)
  2) Inclure événements représentant réservations internes CONFIRMED et fermetures planifiées
  3) UID stable par bookingId, SUMMARY descriptif, DTSTART/DTEND en UTC
  4) Header iCal: PRODID, VERSION:2.0, CALSCALE:GREGORIAN

- Planification:
  - Cron: import toutes les 15 min par feed (backoff en cas d’erreur)
  - Déclencheur manuel via /api/calendar/sync/:feedId
  - File BullMQ pour paralléliser et limiter taux par domaine

- Sécurité des flux:
  - Import: whitelisting de schémas http/https, taille max du .ics, timeout
  - Export: token signé en query (?token=...), ou URL secrète, rate limit

## Gestion des disponibilités (inventaire)
- Source de vérité: table Availability par unitId/date
- Règles appliquées dans l’ordre: fermetures (CLOSED) > minStay/maxStay > prix
- Locking: pendant un quote et la création de booking, prendre un verrou Redis par [unitId, date range]
- Validation de chevauchement: empêcher overlap de réservations CONFIRMED
- Dérivation calendrier: si un booking est CONFIRMED, marquer les nuits CLOSED
- Recalcul batch sur sync iCal: idem, tout en respectant les bookings internes

## Sécurité (détails)
- Helmet, CORS restrictif (origines admin + frontend), Rate limit (ex: 100 req/15min/IP)
- Journalisation des accès sensibles (auth, bookings create/cancel)
- Entrées utilisateur validées et typées, sanitation des strings
- Secrets via variables d’environnement (dotenv), jamais commit
- Migrations DB via Prisma Migrate, transactions atomiques pour booking create/cancel

## Exemple de workflow de réservation
1) Client consulte unitaire: GET /api/units/:id/availability?from=2025-07-01&to=2025-07-31
2) Devis: POST /api/bookings/quote { unitId, checkIn: "2025-07-12", checkOut: "2025-07-15", guests: 2 }
   - Service calcule admissibilité (ouvertures, minStay) + prix total
3) Création: POST /api/bookings { unitId, checkIn, checkOut, guests, guestInfo }
   - Prend un verrou Redis, revérifie inventaire, crée la réservation, relâche le verrou
4) Paiement (si externe): webhook confirme puis PATCH /api/bookings/:id -> status CONFIRMED
5) Sync export iCal inclut l’événement; import iCal externe ferment les dates

## Déploiement & Config
- Variables: DATABASE_URL, REDIS_URL, JWT_SECRET, JWT_REFRESH_SECRET, BASE_URL, ICS_TOKEN_SECRET
- Santé: GET /api/health
- Seeds de dev via Prisma
- Dockerfile + docker-compose exemples (DB, Redis)

## Roadmap
- Webhooks OTA, channel manager
- Règles de prix avancées (séjour, saisonnalité)
- Multi-propriétés et permissions fines
