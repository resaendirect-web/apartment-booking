# Documentation Technique Complète - IMMOSTRASBOURG

**Dernière mise à jour :** 09 novembre 2025  
**Statut du projet :** En développement - Phase 2 (Frontend)  
**Backend :** Fonctionnel sur http://localhost:5000/

---

## 📋 Table des matières

1. [Vue d'ensemble du projet](#vue-densemble)
2. [Informations sur l'entreprise](#informations-entreprise)
3. [Catalogue des appartements](#catalogue-appartements)
4. [Architecture technique](#architecture-technique)
5. [Spécifications Frontend](#frontend)
6. [Spécifications Backend](#backend)
7. [Fonctionnalités prioritaires](#priorités)
8. [Politique de réservation](#politique)

---

## Vue d'ensemble

### 🎯 Objectif principal

Créer une **plateforme de réservation d'appartements en ligne** permettant à DIMO (marque IMMOSTRASBOURG) de gérer directement les réservations de ses 5 appartements situés à Strasbourg, sans passer par Airbnb ou Booking pour éviter les frais de commission.

### ✨ Avantages pour les clients

La plateforme affichera le message : **"Réservez directement et économisez ! Les tarifs directs sont plus avantageux que via Airbnb ou Booking"**

### 🔄 Synchronisation multi-plateformes

Le système doit synchroniser les disponibilités avec :
- **Airbnb** (import/export calendrier)
- **Booking.com** (import/export calendrier)
- **LeBonCoin** (pour référence)

---

## 📌 Informations Entreprise

| Information | Valeur |
|---|---|
| **Raison sociale** | DIMO |
| **Marque commerciale** | IMMOSTRASBOURG |
| **SIRET** | 881304562 |
| **Email** | dimolocation@gmail.com |
| **Téléphone** | +33 7 62 14 48 81 |
| **Localisation** | Strasbourg (Grand Est, France) |
| **Logo** | https://immostrasbourg.com/assets/logo_v-9otjQWd0.jpg |

### À propos

**Texte de présentation suggéré :**  
IMMOSTRASBOURG offre une sélection d'appartements haut de gamme dans le quartier de l'Orangerie et Koenigshoeffen à Strasbourg. Réservez directement auprès de nous pour bénéficier de meilleurs tarifs et d'un service client personnalisé. Nos appartements sont entièrement équipés et idéalement situés à proximité du centre-ville, des institutions européennes et des transports en commun.

---

## 🏠 Catalogue des appartements

Tous les appartements sont situés à : **40 route des Romaines, 67200 STRASBOURG**

### Appartement 1 : "0G"

| Propriété | Détail |
|---|---|
| **Référence interne** | 0G |
| **Code Airbnb** | 53765981 |
| **Titre** | Logement classé + garage - proche centre |
| **Localisation** | Résidence Romains - Rez-de-chaussée (RDCH) |
| **Capacité** | 4 voyageurs max |
| **Chambres** | 2 chambres |
| **Lits** | 2 lits (1 double + 1 canapé convertible) |
| **Salles de bain** | 1 salle de bain |
| **Surface** | Non spécifiée |
| **Aménagement** | Grand salon, salle à manger, cuisine avec table de bar, chambre, douche italienne, WC |
| **Équipements clés** | WiFi, TV HD 43", garage privatif gratuit, lave-linge gratuit, climatisation, lit bébé, lit parapluie, chaise haute |
| **Parking** | Garage résidentiel privatif gratuit |
| **Proximité transport** | 10 min de la gare, 2 min arrêt tram F "Comptes" |
| **Points forts** | Résidence calme, garage privatif, proximité tram et centre-ville |
| **Arrivée** | Entre 16h00 et 20h00 |
| **Départ** | Avant 11h00 |
| **Classification** | 3 étoiles (ministère du tourisme) |
| **Note Airbnb** | 4,57/5 (30 avis) |
| **Lien Airbnb** | https://www.airbnb.fr/rooms/53765981 |

**Équipements complets :** Cuisine, WiFi, garage gratuit, TV HD, lave-linge gratuit, climatisation, lit bébé, lit parapluie, chaise haute, cafetière filtre, réfrigérateur, four micro-ondes, sèche-cheveux, détecteur de fumée (51 équipements au total)

---

### Appartement 2 : "1G"

| Propriété | Détail |
|---|---|
| **Référence interne** | 1G |
| **Code Airbnb** | 596901901780994599 |
| **Titre** | Logement classé + garage - proche centre |
| **Localisation** | Résidence Romains - 1er étage gauche |
| **Capacité** | 4 voyageurs max |
| **Chambres** | 2 chambres |
| **Lits** | 2 lits (1 double + 1 canapé convertible) |
| **Salles de bain** | 1 salle de bain |
| **Surface** | Non spécifiée |
| **Aménagement** | Grand salon, salle à manger, cuisine avec table de bar, chambre, douche italienne, WC |
| **Équipements clés** | WiFi, TV HD 43", garage privatif gratuit, lave-linge gratuit, climatisation centrale |
| **Parking** | Garage fermé privatif |
| **Proximité transport** | 10 min de la gare, 2 min arrêt tram F "Comptes" |
| **Points forts** | Résidence calme, garage fermé, proximité tram et centre-ville |
| **Arrivée** | Entre 16h00 et 21h00 |
| **Départ** | Avant 11h00 |
| **Note Airbnb** | 4,52/5 (29 avis) |
| **Lien Airbnb** | https://www.airbnb.fr/rooms/596901901780994599 |

**Équipements complets :** Vue cour/jardin, cuisine, WiFi, parking gratuit, TV HD, lave-linge gratuit, climatisation, lit bébé, caméras de surveillance extérieures (27 équipements au total)

**À noter :** Interdiction de fumer/vapoter, pas de fête/soirée, interdiction du protoxyde d'azote

---

### Appartement 3 : "22RMA"

| Propriété | Détail |
|---|---|
| **Référence interne** | 22RMA |
| **Code Airbnb** | 1050048649889366864 |
| **Titre** | Logement classé + parking - proche tram F |
| **Localisation** | Quartier résidentiel (construction en prolongation villa) |
| **Capacité** | 4 voyageurs max |
| **Chambres** | 1 chambre |
| **Lits** | 1 lit double |
| **Salles de bain** | 1 salle de bain |
| **Surface** | Non spécifiée |
| **Aménagement** | Logement élégant partiellement en pente, douche italienne, cuisine équipée, lave-linge, table et chaises de bar, petite terrasse, parking privatif |
| **Équipements clés** | WiFi, cuisine, parking gratuit sur place, TV, lave-linge, climatisation, terrasse |
| **Parking** | Parking privatif gratuit |
| **Proximité transport** | Proche tram F |
| **Points forts** | Résidence calme, prestations haute de gamme, parking privatif, terrasse |
| **Arrivée** | À partir de 16h00 |
| **Départ** | Avant 11h00 |
| **Note Airbnb** | 4,9/5 (10 avis) - Coup de cœur voyageurs |
| **Lien Airbnb** | https://www.airbnb.fr/rooms/1050048649889366864 |

**Équipements complets :** Cuisine, WiFi, parking gratuit, TV, lave-linge, climatisation, lit parapluie sur demande, sèche-cheveux, réfrigérateur (42 équipements au total)

---

### Appartement 4 : "1A"

| Propriété | Détail |
|---|---|
| **Référence interne** | 1A |
| **Code Airbnb** | 1108488068701410163 |
| **Titre** | Studio moderne - 1A Logement classé proche centre ville et CE |
| **Localisation** | Quartier Orangerie, 1er étage |
| **Capacité** | 2 voyageurs max |
| **Chambres** | 1 chambre |
| **Lits** | 1 lit double |
| **Salles de bain** | 1 salle de bain |
| **Surface** | Non spécifiée |
| **Aménagement** | Studio moderne, prestations haute de gamme : douche italienne en marbre, cuisine équipée avec crédence en marbre |
| **Équipements clés** | WiFi, TV HD 43", lave-linge gratuit, ascenseur, sèche-cheveux, réfrigérateur, four micro-ondes |
| **Parking** | Stationnement payant dans la rue |
| **Proximité transport** | 15 min à pied centre-ville, 15 min institutions européennes, 20 min bus gare |
| **Points forts** | Proximité centre et institutions européennes, immeuble bourgeois, prestations haute de gamme |
| **Arrivée** | À partir de 16h00 |
| **Départ** | Avant 11h00 |
| **Note Airbnb** | 4,6/5 (5 avis) |
| **Lien Airbnb** | https://www.airbnb.fr/rooms/1108488068701410163 |

**Équipements complets :** Cuisine, WiFi, TV HD, ascenseur, lave-linge gratuit, sèche-cheveux, réfrigérateur, four micro-ondes, cafetière manuelle, séjours longue durée autorisés, stationnement payant rue (44 équipements au total)

---

### Appartement 5 : "1B"

| Propriété | Détail |
|---|---|
| **Référence interne** | 1B |
| **Code Airbnb** | 1108086655734026184 |
| **Titre** | Studio Immostrasbourg 1B proche centre ville et CE |
| **Localisation** | Quartier Orangerie, 1er étage |
| **Capacité** | 2 voyageurs max |
| **Chambres** | 1 chambre |
| **Lits** | 1 lit double |
| **Salles de bain** | 1,5 salles de bain |
| **Surface** | Non spécifiée |
| **Aménagement** | Studio moderne, prestations haute de gamme : douche italienne en marbre, cuisine équipée avec crédence en marbre |
| **Équipements clés** | WiFi, TV HD 43", lave-linge gratuit, ascenseur, sèche-cheveux, réfrigérateur, four micro-ondes |
| **Parking** | Pas de parking fourni (centre-ville) |
| **Proximité transport** | 15 min à pied centre-ville, 15 min institutions européennes, 20 min bus gare |
| **Points forts** | Proximité centre et institutions européennes, immeuble bourgeois, prestations haute de gamme |
| **Arrivée** | Entre 16h00 et 21h00 |
| **Départ** | Avant 11h00 |
| **Note Airbnb** | 4,25/5 (4 avis) |
| **Lien Airbnb** | https://www.airbnb.fr/rooms/1108086655734026184 |

**Équipements complets :** Cuisine, WiFi, TV HD, ascenseur, lave-linge gratuit, sèche-cheveux, réfrigérateur, four micro-ondes, séjours longue durée autorisés (46 équipements au total)

---

## 🏗️ Architecture technique

### Stack technologique recommandé

| Couche | Technologie | Statut |
|---|---|---|
| **Backend** | Node.js + Express | ✅ Fonctionnel |
| **Base de données** | PostgreSQL | ✅ Configurée |
| **Frontend** | React / Next.js | 🔄 À développer |
| **API** | REST | ✅ Existante |
| **Authentification** | JWT | ✅ Implémentée |
| **Paiement** | Stripe | 🔄 À intégrer |
| **Synchronisation iCal** | Librairie iCalendar | 🔄 À développer |

### Infrastructure

- **Backend :** http://localhost:5000 (développement)
- **Base de données :** PostgreSQL local
- **Frontend :** À déployer (Vercel ou Railway recommandé)
- **Hébergement futur :** Scalable sur cloud (OVH, AWS, etc.)

---

## 💻 Spécifications Frontend (Phase 2)

### 1. Pages essentielles (Phase 2 - Prioritaire)

#### Page d'accueil
- **Objectif :** Présenter IMMOSTRASBOURG et la liste des appartements
- **Éléments :**
  - Logo et tagline "Réservez directement et économisez !"
  - Présentation courte de l'entreprise
  - Galerie des 5 appartements avec photos, prix/nuit, capacité
  - Moteur de recherche : dates + nombre de personnes
  - Lien "À propos" et "Contact"

#### Page détail d'un appartement
- **Contenu :**
  - Galerie photos (max 25 images)
  - Titre, localisation, note Airbnb
  - Nombre de chambres, lits, capacité max
  - Description détaillée
  - Équipements/services
  - Localisation sur carte
  - Calendrier de disponibilité
  - Avis clients
  - **Bouton "Réserver maintenant"** → page réservation

#### Page de réservation
- **Étapes du processus :**
  1. Confirmation des dates (calendrier)
  2. Nombre d'adultes et enfants
  3. Résumé tarifaire (détail des frais) :
     - Prix de base (X nuits)
     - Frais de séjour (40€ si configuré)
     - Taxe de séjour (% sur les adultes)
     - **Total**
  4. Formulaire client :
     - Nom, prénom
     - Email
     - Numéro WhatsApp (pour notifications)
     - Adresse
  5. Condition d'annulation affichée
  6. **Paiement :** Acompte (10% par défaut) + empreinte carte
  7. Confirmation de réservation

#### Pages secondaires (Phase 3)

- **À propos :** Présentation détaillée de DIMO/IMMOSTRASBOURG
- **Contact :** Formulaire de contact + infos (email, téléphone, adresse)
- **Mentions légales :** DIMO - SIRET 881304562 - dimolocation@gmail.com
- **Conditions générales de vente**
- **Politique de confidentialité**

### 2. Design et styles

- **Couleurs :** Bleu harmonisé avec le logo (couleur principale)
- **Style :** Moderne, minimaliste, simple et efficace
- **Logo :** À utiliser depuis https://immostrasbourg.com/assets/logo_v-9otjQWd0.jpg
- **Responsive :** Compatible mobile, tablette, desktop
- **Inspiration :** UI épurée, focus sur la lisibilité et facilité de navigation

---

## 🔧 Dashboard Admin (Spécifications détaillées)

### Authentification
- Login sécurisé avec email/mot de passe
- Session persistante

### 1. Gestion des prix

#### Vue d'ensemble
- Tableau listant les 5 appartements
- Pour chaque appartement : affichage prix standard actuel

#### Modification des prix par calendrier
- **Sélection d'dates :** Mini-calendrier pour choisir plage de dates
- **Types de tarifs :** 3 options configurables pour chaque date :
  - ✅ **Tarif standard** (remboursable si annulation)
  - ✅ **Tarif semaine** (réduction pour 7+ nuits)
  - ✅ **Tarif non-remboursable** (pas d'annulation possible)
- **Tarif de référence :** Champ configurable par appartement = tarif par défaut appliqué partout
- **Action en masse :** Pouvoir modifier plusieurs appartements à la fois

#### Frais de séjour
- **Configuration :** Section dédiée
- **Montant :** 40€ par défaut (modifiable)
- **Applicabilité :** 1 fois par séjour, quelque soit la durée
- **Action en masse :** Modifier pour plusieurs appartements simultanément

#### Taxe de séjour
- **Configuration :** Section spécifique par appartement
- **Expression :** En pourcentage (%) du prix total
- **Application :** Uniquement sur les adultes (pas les enfants)
- **Affichage client :** Uniquement lors de la réservation
- **Tableau de synthèse :** Vue du total des taxes collectées (obligation légale État)
- **Action en masse :** Modifier pour plusieurs appartements à la fois

### 2. Gestion des appartements

#### Modification des noms
- Pouvoir renommer chaque appartement manuellement

#### Création d'un nouvel appartement
- **Champs requis :**
  - Référence interne
  - Titre de l'annonce
  - Adresse
  - Nombre de chambres
  - Nombre de couchages (capacité max)
  - Surface m²
  - Description détaillée
  - Équipements (checkboxes standards + champ libre)
  - Photos (upload jusqu'à 25 images)
  - Prix par nuit (tarif de base)
  - Localisation GPS (latitude/longitude)
  - Heure d'arrivée standard
  - Heure de départ standard

#### Configuration liens iCal
- **Champs :**
  - Lien iCal Airbnb (import)
  - Lien iCal Booking (import)
  - Bouton : Générer lien iCal interne (à transmettre à Airbnb/Booking)
- **Synchronisation :** Vérifier disponibilités depuis ces liens

### 3. Paramétrage des messages automatiques

#### Création de modèles de messages
- **Type d'envoi :** Email + WhatsApp
- **Champs du message :** Texte libre avec variables :
  - {PRENOM_CLIENT}
  - {EMAIL_CLIENT}
  - {NUMERO_RESERVATION}
  - {DATE_ARRIVEE}
  - {DATE_DEPART}
  - {NOM_APPARTEMENT}
  - {PRIX_TOTAL}

#### Programmation d'envoi
- **Moments disponibles :**
  - À la confirmation de réservation
  - 7 jours avant arrivée
  - 1 jour avant arrivée
  - Jour de l'arrivée
  - Jour du départ
  - X jours après départ (satisfaction)
- **Personnalisation :** Créer plusieurs modèles pour différents moments

### 4. Configuration annulation

- **Politique par défaut :** Celle de Booking (afficher texte pré-rempli modifiable)
- **Délai de remboursement :** Configurable (ex: 14 jours)
- **Conditions spéciales :** Champ libre pour conditions personnalisées

### 5. Configuration paiement

#### Accompte
- **Montant :** 10% par défaut (modifiable)
- **Timing :** À la réservation

#### Système de paiement par carte bancaire
- **Process :**
  1. Client entre ses coordonnées lors de la réservation
  2. Enregistrement empreinte de la carte
  3. Débit immédiat de l'acompte
  4. Débit automatique du solde (total - acompte) à J+1 date de réservation
  5. Débits sécurisés via **Stripe**

#### Gestion caution
- **Montant :** 500€ par défaut (modifiable par appartement)
- **Déclenchement :** En cas de litiges/dégâts
- **Litige (dispute):**
  - Bouton "Déclencher un litige" dans la réservation
  - Upload photos comme preuves
  - Saisie du montant des dégâts demandé
  - Validation = initié du paiement de la caution
  - **Section "Litiges"** historique de tous les litiges + preuves photos

#### Compte bancaire Stripe
- **Configuration :** Champ pour chaque appartement
- **Info :** IBAN/BIC ou connexion Stripe directe
- **Autorisation :** Permettre virements automatiques sur le compte configuré

### 6. Configuration arrivée/départ
- **Heure d'arrivée :** Paramétrable par appartement (ex: 16h00)
- **Heure de départ :** Paramétrable par appartement (ex: 11h00)

---

## 🗄️ Spécifications Backend (Existant)

Le backend est déjà fonctionnel sur **http://localhost:5000**

### API Endpoints principaux

#### Appartements
- `GET /api/apartments` → liste tous les appartements
- `GET /api/apartments/:id` → détail d'un appartement
- `POST /api/apartments` → créer (admin)
- `PUT /api/apartments/:id` → modifier (admin)

#### Réservations
- `POST /api/bookings` → créer une réservation
- `GET /api/bookings/:id` → détail d'une réservation
- `GET /api/bookings` → liste réservations (admin)
- `PUT /api/bookings/:id` → modifier (admin)

#### Disponibilités
- `GET /api/availability/:apartmentId` → calendrier disponibilités
- `POST /api/availability/sync` → sync iCal (Airbnb/Booking)

#### Tarification
- `GET /api/pricing/:apartmentId/:date` → prix pour date
- `PUT /api/pricing` → modifier tarifs (admin)

#### Paiements
- `POST /api/payments/deposit` → traiter acompte
- `POST /api/payments/full` → traiter solde
- `POST /api/disputes` → créer un litige

---

## ⭐ Fonctionnalités prioritaires

### Phase 2 (Frontend) - ACTUELLE
- ✅ Page d'accueil
- ✅ Page détail appartement
- ✅ Page réservation (formulaire + paiement)
- ✅ Dashboard admin complet (tarifs, messages, etc.)
- ✅ Synchronisation iCal

### Phase 3 (Polish + Pages secondaires)
- Pages "À propos", "Contact"
- Conditions générales, Politique confidentialité
- Intégration SMS (Twilio) pour WhatsApp
- Analytics et reporting
- Système de notation/avis clients

### Phase 4 (Optimisations)
- Tests utilisateur
- SEO & marketing
- Multilingue (EN/DE)
- Progressive Web App (PWA)
- Intégration IA (chatbot support)

---

## 📋 Politique de réservation

### Annulation
Voir configuration Admin + capture d'écran fournie (par défaut : politique Booking)

### Paiement
- Acompte : 10% à la réservation
- Solde : Total - acompte, débité à J+1
- Caution : 500€ (en cas de dégâts)
- Tous les paiements via Stripe

### Horaires standards
| Paramètre | Défaut | Modifiable |
|---|---|---|
| **Heure d'arrivée** | 16h00 | ✅ Par appartement |
| **Heure de départ** | 11h00 | ✅ Par appartement |

---

## 📞 Contact & Support

- **Email :** dimolocation@gmail.com
- **Téléphone :** +33 7 62 14 48 81
- **Support clients :** Via plateforme + email/WhatsApp

---

## 📝 Notes importantes

1. **Non-développeur :** Toutes les sections peuvent être gérées via le dashboard admin, pas besoin d'accès code
2. **Synchronisation :** Assurez-vous d'avoir les liens iCal d'Airbnb et Booking pour chaque appartement
3. **Conformité légale :** La taxe de séjour est obligatoire - tableau de synthèse nécessaire pour déclarations État
4. **Sécurité paiement :** Tous les paiements via Stripe (PCI compliant)
5. **Data RGPD :** Politique confidentialité requise avant lancement

---

**Version :** 1.0  
**Dernière mise à jour :** 09/11/2025  
**Auteur technique :** Ingénieur projet IMMOSTRASBOURG
