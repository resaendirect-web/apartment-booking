import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

async function main() {
  console.log('🌱 Starting database seeding...\n');

  // Créer un admin
  const adminPassword = await bcrypt.hash('Admin@123456', 10);
  const admin = await prisma.user.upsert({
    where: { email: 'admin@apartmentbooking.com' },
    update: {},
    create: {
      email: 'admin@apartmentbooking.com',
      password: adminPassword,
      firstName: 'Admin',
      lastName: 'User',
      role: 'ADMIN',
      isActive: true,
      emailVerified: true
    }
  });
  console.log('✅ Admin user created:', admin.email);

  // Créer un propriétaire
  const ownerPassword = await bcrypt.hash('Owner@123456', 10);
  const owner = await prisma.user.upsert({
    where: { email: 'owner@apartmentbooking.com' },
    update: {},
    create: {
      email: 'owner@apartmentbooking.com',
      password: ownerPassword,
      firstName: 'John',
      lastName: 'Doe',
      phone: '+33612345678',
      role: 'OWNER',
      isActive: true,
      emailVerified: true
    }
  });
  console.log('✅ Owner user created:', owner.email);

  // Créer un guest
  const guestPassword = await bcrypt.hash('Guest@123456', 10);
  const guest = await prisma.user.upsert({
    where: { email: 'guest@apartmentbooking.com' },
    update: {},
    create: {
      email: 'guest@apartmentbooking.com',
      password: guestPassword,
      firstName: 'Jane',
      lastName: 'Smith',
      phone: '+33687654321',
      role: 'GUEST',
      isActive: true,
      emailVerified: true
    }
  });
  console.log('✅ Guest user created:', guest.email);

  // Créer une propriété
  const property = await prisma.property.create({
    data: {
      name: 'Résidence du Parc',
      description: 'Belle résidence moderne située en plein centre-ville, proche de toutes commodités.',
      address: '123 Rue de la République',
      city: 'Lyon',
      country: 'France',
      zipCode: '69001',
      latitude: 45.767299,
      longitude: 4.834277,
      amenities: {
        wifi: true,
        parking: true,
        elevator: true,
        airConditioning: true,
        heating: true,
        washer: true,
        dryer: false
      },
      images: [
        'https://images.unsplash.com/photo-1522708323590-d24dbb6b0267',
        'https://images.unsplash.com/photo-1502672260066-6bc34f9c1a71'
      ],
      ownerId: owner.id,
      isActive: true
    }
  });
  console.log('✅ Property created:', property.name);

  // Créer des unités
  const unit1 = await prisma.unit.create({
    data: {
      name: 'Appartement T2 - Étage 3',
      description: 'Charmant T2 de 45m² avec balcon vue parc',
      type: 'APARTMENT',
      maxGuests: 4,
      bedrooms: 1,
      beds: 2,
      bathrooms: 1,
      surface: 45,
      floor: 3,
      basePrice: 89.00,
      cleaningFee: 30.00,
      amenities: {
        wifi: true,
        tv: true,
        kitchen: true,
        balcony: true,
        coffee: true
      },
      images: [
        'https://images.unsplash.com/photo-1522708323590-d24dbb6b0267'
      ],
      propertyId: property.id,
      isActive: true
    }
  });
  console.log('✅ Unit created:', unit1.name);

  const unit2 = await prisma.unit.create({
    data: {
      name: 'Studio - Étage 2',
      description: 'Studio cosy de 28m² idéal pour 2 personnes',
      type: 'STUDIO',
      maxGuests: 2,
      bedrooms: 0,
      beds: 1,
      bathrooms: 1,
      surface: 28,
      floor: 2,
      basePrice: 65.00,
      cleaningFee: 25.00,
      amenities: {
        wifi: true,
        tv: true,
        kitchenette: true
      },
      images: [
        'https://images.unsplash.com/photo-1502672260066-6bc34f9c1a71'
      ],
      propertyId: property.id,
      isActive: true
    }
  });
  console.log('✅ Unit created:', unit2.name);

  // Créer des tarifs
  const today = new Date();
  const nextMonth = new Date(today);
  nextMonth.setMonth(today.getMonth() + 1);
  const threeMonths = new Date(today);
  threeMonths.setMonth(today.getMonth() + 3);

  await prisma.rate.create({
    data: {
      name: 'Tarif standard',
      type: 'STANDARD',
      pricePerNight: 89.00,
      startDate: today,
      endDate: threeMonths,
      unitId: unit1.id
    }
  });

  await prisma.rate.create({
    data: {
      name: 'Tarif standard',
      type: 'STANDARD',
      pricePerNight: 65.00,
      startDate: today,
      endDate: threeMonths,
      unitId: unit2.id
    }
  });
  console.log('✅ Rates created');

  // Créer des disponibilités
  await prisma.availability.create({
    data: {
      startDate: today,
      endDate: threeMonths,
      isAvailable: true,
      minNights: 2,
      maxNights: 30,
      unitId: unit1.id
    }
  });

  await prisma.availability.create({
    data: {
      startDate: today,
      endDate: threeMonths,
      isAvailable: true,
      minNights: 1,
      maxNights: 30,
      unitId: unit2.id
    }
  });
  console.log('✅ Availabilities created');

  // Créer une réservation test
  const bookingStart = new Date(today);
  bookingStart.setDate(today.getDate() + 7);
  const bookingEnd = new Date(bookingStart);
  bookingEnd.setDate(bookingStart.getDate() + 3);

  await prisma.booking.create({
    data: {
      checkIn: bookingStart,
      checkOut: bookingEnd,
      numGuests: 2,
      totalPrice: 267.00 + 30.00, // 3 nuits à 89€ + frais de ménage
      cleaningFee: 30.00,
      serviceFee: 0,
      status: 'CONFIRMED',
      source: 'DIRECT',
      guestNotes: 'Arrivée prévue vers 15h',
      unitId: unit1.id,
      guestId: guest.id
    }
  });
  console.log('✅ Booking created');

  console.log('\n🎉 Database seeding completed successfully!\n');
  console.log('📝 Test accounts created:');
  console.log('   Admin: admin@apartmentbooking.com / Admin@123456');
  console.log('   Owner: owner@apartmentbooking.com / Owner@123456');
  console.log('   Guest: guest@apartmentbooking.com / Guest@123456\n');
}

main()
  .catch((e) => {
    console.error('❌ Error seeding database:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
