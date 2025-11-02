-- CreateEnum
CREATE TYPE "Role" AS ENUM ('GUEST', 'OWNER', 'ADMIN');

-- CreateEnum
CREATE TYPE "UnitType" AS ENUM ('APARTMENT', 'ROOM', 'STUDIO', 'HOUSE', 'VILLA');

-- CreateEnum
CREATE TYPE "BookingStatus" AS ENUM ('PENDING', 'CONFIRMED', 'CANCELLED', 'COMPLETED', 'NO_SHOW');

-- CreateEnum
CREATE TYPE "BookingSource" AS ENUM ('DIRECT', 'AIRBNB', 'BOOKING_COM', 'VRBO', 'HOMEAWAY', 'OTHER');

-- CreateEnum
CREATE TYPE "SyncStatus" AS ENUM ('PENDING', 'SUCCESS', 'ERROR');

-- CreateEnum
CREATE TYPE "RateType" AS ENUM ('STANDARD', 'WEEKEND', 'HOLIDAY', 'SEASON_HIGH', 'SEASON_LOW', 'SPECIAL');

-- CreateTable
CREATE TABLE "users" (
    "id" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "password" TEXT NOT NULL,
    "firstName" TEXT NOT NULL,
    "lastName" TEXT NOT NULL,
    "phone" TEXT,
    "role" "Role" NOT NULL DEFAULT 'GUEST',
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "emailVerified" BOOLEAN NOT NULL DEFAULT false,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "lastLoginAt" TIMESTAMP(3),

    CONSTRAINT "users_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "properties" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "description" TEXT,
    "address" TEXT NOT NULL,
    "city" TEXT NOT NULL,
    "country" TEXT NOT NULL,
    "zipCode" TEXT,
    "latitude" DOUBLE PRECISION,
    "longitude" DOUBLE PRECISION,
    "amenities" JSONB,
    "images" JSONB,
    "ownerId" TEXT NOT NULL,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "properties_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "units" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "description" TEXT,
    "type" "UnitType" NOT NULL DEFAULT 'APARTMENT',
    "maxGuests" INTEGER NOT NULL DEFAULT 2,
    "bedrooms" INTEGER NOT NULL DEFAULT 1,
    "beds" INTEGER NOT NULL DEFAULT 1,
    "bathrooms" INTEGER NOT NULL DEFAULT 1,
    "surface" DOUBLE PRECISION,
    "floor" INTEGER,
    "basePrice" DOUBLE PRECISION NOT NULL,
    "cleaningFee" DOUBLE PRECISION DEFAULT 0,
    "amenities" JSONB,
    "images" JSONB,
    "propertyId" TEXT NOT NULL,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "units_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "bookings" (
    "id" TEXT NOT NULL,
    "checkIn" TIMESTAMP(3) NOT NULL,
    "checkOut" TIMESTAMP(3) NOT NULL,
    "numGuests" INTEGER NOT NULL,
    "totalPrice" DOUBLE PRECISION NOT NULL,
    "cleaningFee" DOUBLE PRECISION NOT NULL DEFAULT 0,
    "serviceFee" DOUBLE PRECISION NOT NULL DEFAULT 0,
    "status" "BookingStatus" NOT NULL DEFAULT 'PENDING',
    "guestNotes" TEXT,
    "ownerNotes" TEXT,
    "source" "BookingSource" NOT NULL DEFAULT 'DIRECT',
    "externalId" TEXT,
    "unitId" TEXT NOT NULL,
    "guestId" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "cancelledAt" TIMESTAMP(3),

    CONSTRAINT "bookings_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "calendar_feeds" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "url" TEXT NOT NULL,
    "source" TEXT NOT NULL,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "unitId" TEXT NOT NULL,
    "lastSyncAt" TIMESTAMP(3),
    "syncStatus" "SyncStatus" NOT NULL DEFAULT 'PENDING',
    "syncError" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "calendar_feeds_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "calendar_events" (
    "id" TEXT NOT NULL,
    "summary" TEXT NOT NULL,
    "description" TEXT,
    "startDate" TIMESTAMP(3) NOT NULL,
    "endDate" TIMESTAMP(3) NOT NULL,
    "bookingId" TEXT,
    "feedId" TEXT NOT NULL,
    "externalId" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "calendar_events_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "availabilities" (
    "id" TEXT NOT NULL,
    "startDate" TIMESTAMP(3) NOT NULL,
    "endDate" TIMESTAMP(3) NOT NULL,
    "isAvailable" BOOLEAN NOT NULL DEFAULT true,
    "minNights" INTEGER,
    "maxNights" INTEGER,
    "unitId" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "availabilities_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "rates" (
    "id" TEXT NOT NULL,
    "startDate" TIMESTAMP(3) NOT NULL,
    "endDate" TIMESTAMP(3) NOT NULL,
    "pricePerNight" DOUBLE PRECISION NOT NULL,
    "type" "RateType" NOT NULL DEFAULT 'STANDARD',
    "name" TEXT,
    "unitId" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "rates_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "users_email_key" ON "users"("email");

-- CreateIndex
CREATE INDEX "properties_ownerId_idx" ON "properties"("ownerId");

-- CreateIndex
CREATE INDEX "properties_city_idx" ON "properties"("city");

-- CreateIndex
CREATE INDEX "units_propertyId_idx" ON "units"("propertyId");

-- CreateIndex
CREATE INDEX "units_type_idx" ON "units"("type");

-- CreateIndex
CREATE INDEX "bookings_unitId_idx" ON "bookings"("unitId");

-- CreateIndex
CREATE INDEX "bookings_guestId_idx" ON "bookings"("guestId");

-- CreateIndex
CREATE INDEX "bookings_status_idx" ON "bookings"("status");

-- CreateIndex
CREATE INDEX "bookings_checkIn_checkOut_idx" ON "bookings"("checkIn", "checkOut");

-- CreateIndex
CREATE INDEX "calendar_feeds_unitId_idx" ON "calendar_feeds"("unitId");

-- CreateIndex
CREATE INDEX "calendar_feeds_source_idx" ON "calendar_feeds"("source");

-- CreateIndex
CREATE INDEX "calendar_events_feedId_idx" ON "calendar_events"("feedId");

-- CreateIndex
CREATE INDEX "calendar_events_bookingId_idx" ON "calendar_events"("bookingId");

-- CreateIndex
CREATE INDEX "calendar_events_startDate_endDate_idx" ON "calendar_events"("startDate", "endDate");

-- CreateIndex
CREATE UNIQUE INDEX "calendar_events_feedId_externalId_key" ON "calendar_events"("feedId", "externalId");

-- CreateIndex
CREATE INDEX "availabilities_unitId_idx" ON "availabilities"("unitId");

-- CreateIndex
CREATE INDEX "availabilities_startDate_endDate_idx" ON "availabilities"("startDate", "endDate");

-- CreateIndex
CREATE INDEX "rates_unitId_idx" ON "rates"("unitId");

-- CreateIndex
CREATE INDEX "rates_startDate_endDate_idx" ON "rates"("startDate", "endDate");

-- AddForeignKey
ALTER TABLE "properties" ADD CONSTRAINT "properties_ownerId_fkey" FOREIGN KEY ("ownerId") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "units" ADD CONSTRAINT "units_propertyId_fkey" FOREIGN KEY ("propertyId") REFERENCES "properties"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "bookings" ADD CONSTRAINT "bookings_unitId_fkey" FOREIGN KEY ("unitId") REFERENCES "units"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "bookings" ADD CONSTRAINT "bookings_guestId_fkey" FOREIGN KEY ("guestId") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "calendar_feeds" ADD CONSTRAINT "calendar_feeds_unitId_fkey" FOREIGN KEY ("unitId") REFERENCES "units"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "calendar_events" ADD CONSTRAINT "calendar_events_bookingId_fkey" FOREIGN KEY ("bookingId") REFERENCES "bookings"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "calendar_events" ADD CONSTRAINT "calendar_events_feedId_fkey" FOREIGN KEY ("feedId") REFERENCES "calendar_feeds"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "availabilities" ADD CONSTRAINT "availabilities_unitId_fkey" FOREIGN KEY ("unitId") REFERENCES "units"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "rates" ADD CONSTRAINT "rates_unitId_fkey" FOREIGN KEY ("unitId") REFERENCES "units"("id") ON DELETE CASCADE ON UPDATE CASCADE;
