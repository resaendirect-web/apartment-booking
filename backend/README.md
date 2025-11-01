# Backend - Apartment Booking API

## Stack Technique

- **Runtime**: Node.js
- **Framework**: Express.js
- **Base de données**: PostgreSQL
- **ORM**: Prisma
- **Authentification**: JWT (JSON Web Tokens)
- **Validation**: Joi ou Zod
- **Documentation API**: Swagger/OpenAPI

## Plan de l'API

### Endpoints Authentification

#### `POST /api/auth/register`
- Inscription d'un nouvel utilisateur
- Body: `{ email, password, firstName, lastName, role }`
- Response: `{ user, token }`

#### `POST /api/auth/login`
- Connexion utilisateur
- Body: `{ email, password }`
- Response: `{ user, token }`

#### `POST /api/auth/refresh`
- Rafraîchir le token
- Headers: `Authorization: Bearer <token>`
- Response: `{ token }`

### Endpoints Apartments

#### `GET /api/apartments`
- Lister tous les appartements (avec filtres)
- Query params: `?city=&minPrice=&maxPrice=&bedrooms=&available=`
- Response: `{ apartments: [], total, page, limit }`

#### `GET /api/apartments/:id`
- Détails d'un appartement
- Response: `{ apartment }`

#### `POST /api/apartments` (Admin/Owner)
- Créer un appartement
- Body: `{ title, description, address, city, price, bedrooms, bathrooms, amenities, images }`
- Response: `{ apartment }`

#### `PUT /api/apartments/:id` (Admin/Owner)
- Mettre à jour un appartement
- Body: `{ ... }`
- Response: `{ apartment }`

#### `DELETE /api/apartments/:id` (Admin/Owner)
- Supprimer un appartement
- Response: `{ message }`

### Endpoints Bookings

#### `GET /api/bookings` (Authenticated)
- Lister les réservations de l'utilisateur
- Response: `{ bookings: [] }`

#### `GET /api/bookings/:id` (Authenticated)
- Détails d'une réservation
- Response: `{ booking }`

#### `POST /api/bookings`
- Créer une réservation
- Body: `{ apartmentId, checkIn, checkOut, guests, totalPrice }`
- Response: `{ booking }`

#### `PUT /api/bookings/:id` (Authenticated)
- Modifier une réservation
- Body: `{ checkIn, checkOut, guests }`
- Response: `{ booking }`

#### `DELETE /api/bookings/:id` (Authenticated)
- Annuler une réservation
- Response: `{ message }`

#### `GET /api/bookings/apartment/:apartmentId` (Owner)
- Lister les réservations d'un appartement
- Response: `{ bookings: [] }`

### Endpoints Users

#### `GET /api/users/profile` (Authenticated)
- Profil utilisateur
- Response: `{ user }`

#### `PUT /api/users/profile` (Authenticated)
- Mettre à jour le profil
- Body: `{ firstName, lastName, phone, avatar }`
- Response: `{ user }`

#### `GET /api/users/:id` (Admin)
- Détails utilisateur (admin)
- Response: `{ user }`

### Endpoints Reviews

#### `GET /api/reviews/apartment/:apartmentId`
- Lister les avis d'un appartement
- Response: `{ reviews: [], averageRating }`

#### `POST /api/reviews` (Authenticated)
- Créer un avis
- Body: `{ apartmentId, bookingId, rating, comment }`
- Response: `{ review }`

#### `PUT /api/reviews/:id` (Authenticated)
- Modifier un avis
- Body: `{ rating, comment }`
- Response: `{ review }`

#### `DELETE /api/reviews/:id` (Authenticated)
- Supprimer un avis
- Response: `{ message }`

## Modèles de données

### User
```
- id: UUID
- email: string (unique)
- password: string (hashed)
- firstName: string
- lastName: string
- phone: string?
- avatar: string?
- role: enum (user, owner, admin)
- createdAt: timestamp
- updatedAt: timestamp
```

### Apartment
```
- id: UUID
- ownerId: UUID (FK -> User)
- title: string
- description: text
- address: string
- city: string
- zipCode: string
- price: decimal
- bedrooms: integer
- bathrooms: integer
- maxGuests: integer
- amenities: json
- images: json
- available: boolean
- createdAt: timestamp
- updatedAt: timestamp
```

### Booking
```
- id: UUID
- userId: UUID (FK -> User)
- apartmentId: UUID (FK -> Apartment)
- checkIn: date
- checkOut: date
- guests: integer
- totalPrice: decimal
- status: enum (pending, confirmed, cancelled, completed)
- createdAt: timestamp
- updatedAt: timestamp
```

### Review
```
- id: UUID
- userId: UUID (FK -> User)
- apartmentId: UUID (FK -> Apartment)
- bookingId: UUID (FK -> Booking)
- rating: integer (1-5)
- comment: text
- createdAt: timestamp
- updatedAt: timestamp
```

## Installation

```bash
cd backend
npm install
```

## Configuration

Créer un fichier `.env`:
```
DATABASE_URL="postgresql://user:password@localhost:5432/apartment_booking"
JWT_SECRET="your-secret-key"
PORT=3000
```

## Démarrage

```bash
# Development
npm run dev

# Production
npm start
```
