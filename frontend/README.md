# Frontend - Apartment Booking

## Stack Technique

- **Framework**: React 18
- **Build Tool**: Vite
- **Langage**: TypeScript
- **Routing**: React Router v6
- **State Management**: 
  - React Query (pour les données serveur)
  - Zustand (pour l'état global client)
- **UI Components**: 
  - Tailwind CSS
  - Headless UI
  - React Icons
- **Formulaires**: React Hook Form + Zod
- **Dates**: date-fns
- **HTTP Client**: Axios
- **Maps**: Leaflet / React Leaflet (pour afficher les appartements)
- **Images**: React Image Gallery

## Structure du Projet

```
frontend/
├── public/
│   └── assets/
├── src/
│   ├── components/
│   │   ├── common/          # Composants réutilisables
│   │   │   ├── Button.tsx
│   │   │   ├── Input.tsx
│   │   │   ├── Modal.tsx
│   │   │   ├── Card.tsx
│   │   │   └── Spinner.tsx
│   │   ├── layout/          # Layout components
│   │   │   ├── Header.tsx
│   │   │   ├── Footer.tsx
│   │   │   └── Sidebar.tsx
│   │   ├── auth/            # Authentification
│   │   │   ├── LoginForm.tsx
│   │   │   └── RegisterForm.tsx
│   │   ├── apartments/      # Appartements
│   │   │   ├── ApartmentCard.tsx
│   │   │   ├── ApartmentList.tsx
│   │   │   ├── ApartmentDetails.tsx
│   │   │   ├── ApartmentForm.tsx
│   │   │   └── ApartmentFilters.tsx
│   │   ├── bookings/        # Réservations
│   │   │   ├── BookingForm.tsx
│   │   │   ├── BookingCard.tsx
│   │   │   └── BookingList.tsx
│   │   └── reviews/         # Avis
│   │       ├── ReviewForm.tsx
│   │       ├── ReviewCard.tsx
│   │       └── ReviewList.tsx
│   ├── pages/
│   │   ├── Home.tsx
│   │   ├── ApartmentSearch.tsx
│   │   ├── ApartmentDetails.tsx
│   │   ├── Profile.tsx
│   │   ├── MyBookings.tsx
│   │   ├── MyApartments.tsx
│   │   ├── Login.tsx
│   │   └── Register.tsx
│   ├── hooks/               # Custom hooks
│   │   ├── useAuth.ts
│   │   ├── useApartments.ts
│   │   ├── useBookings.ts
│   │   └── useDebounce.ts
│   ├── services/            # API services
│   │   ├── api.ts
│   │   ├── auth.service.ts
│   │   ├── apartments.service.ts
│   │   ├── bookings.service.ts
│   │   └── users.service.ts
│   ├── store/               # State management
│   │   ├── authStore.ts
│   │   └── filterStore.ts
│   ├── types/               # TypeScript types
│   │   ├── user.types.ts
│   │   ├── apartment.types.ts
│   │   └── booking.types.ts
│   ├── utils/               # Utilities
│   │   ├── formatters.ts
│   │   ├── validators.ts
│   │   └── constants.ts
│   ├── App.tsx
│   ├── main.tsx
│   └── router.tsx
├── .env.example
├── .eslintrc.json
├── .prettierrc
├── index.html
├── package.json
├── tsconfig.json
├── tailwind.config.js
└── vite.config.ts
```

## Fonctionnalités Principales

### Pages Publiques
- **Home**: Page d'accueil avec recherche rapide
- **Search**: Liste d'appartements avec filtres
- **Apartment Details**: Détails d'un appartement avec galerie photos
- **Login/Register**: Authentification

### Pages Authentifiées
- **Profile**: Profil utilisateur
- **My Bookings**: Liste des réservations
- **My Apartments** (Owner): Gestion des appartements
- **Create/Edit Apartment** (Owner): Formulaire d'appartement

### Composants Clés

#### ApartmentCard
```tsx
interface ApartmentCardProps {
  apartment: Apartment;
  onFavorite?: (id: string) => void;
}
```

#### ApartmentFilters
```tsx
interface FilterOptions {
  city?: string;
  minPrice?: number;
  maxPrice?: number;
  bedrooms?: number;
  amenities?: string[];
}
```

#### BookingForm
```tsx
interface BookingFormData {
  checkIn: Date;
  checkOut: Date;
  guests: number;
}
```

## Installation

```bash
cd frontend
npm install
```

## Configuration

Créer un fichier `.env`:
```
VITE_API_URL=http://localhost:3000/api
VITE_MAP_API_KEY=your-map-api-key
```

## Développement

```bash
# Démarrer le serveur de dev
npm run dev

# Build pour production
npm run build

# Preview du build
npm run preview

# Linter
npm run lint

# Tests
npm run test
```

## Scripts NPM

- `dev`: Lance le serveur de développement
- `build`: Build pour la production
- `preview`: Prévisualise le build de production
- `lint`: Vérifie le code avec ESLint
- `format`: Formate le code avec Prettier

## Routes

- `/` - Home
- `/search` - Recherche d'appartements
- `/apartments/:id` - Détails appartement
- `/login` - Connexion
- `/register` - Inscription
- `/profile` - Profil utilisateur
- `/bookings` - Mes réservations
- `/my-apartments` - Mes appartements (Owner)
- `/apartments/new` - Nouvel appartement (Owner)
- `/apartments/:id/edit` - Éditer appartement (Owner)
