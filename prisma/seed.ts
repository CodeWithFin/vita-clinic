import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

async function main() {
  console.log('Starting database seed...');

  // Create admin user
  const adminPassword = await bcrypt.hash('admin123', 10);
  const admin = await prisma.user.upsert({
    where: { email: 'admin@vitapharm.com' },
    update: {},
    create: {
      email: 'admin@vitapharm.com',
      username: 'admin',
      password: adminPassword,
      fullName: 'System Administrator',
      phone: '+254700000000',
      role: 'ADMIN',
    },
  });
  console.log('✓ Admin user created');

  // Create receptionist
  const receptionistPassword = await bcrypt.hash('receptionist123', 10);
  const receptionist = await prisma.user.upsert({
    where: { email: 'receptionist@vitapharm.com' },
    update: {},
    create: {
      email: 'receptionist@vitapharm.com',
      username: 'receptionist',
      password: receptionistPassword,
      fullName: 'Jane Receptionist',
      phone: '+254700000001',
      role: 'RECEPTIONIST',
    },
  });
  console.log('✓ Receptionist user created');

  // Create service providers
  const aestheticianPassword = await bcrypt.hash('aesthetician123', 10);
  const aesthetician = await prisma.user.upsert({
    where: { email: 'aesthetician@vitapharm.com' },
    update: {},
    create: {
      email: 'aesthetician@vitapharm.com',
      username: 'aesthetician',
      password: aestheticianPassword,
      fullName: 'Sarah Aesthetician',
      phone: '+254700000002',
      role: 'SERVICE_PROVIDER',
      providerType: 'AESTHETICIAN',
    },
  });

  const therapistPassword = await bcrypt.hash('therapist123', 10);
  const therapist = await prisma.user.upsert({
    where: { email: 'therapist@vitapharm.com' },
    update: {},
    create: {
      email: 'therapist@vitapharm.com',
      username: 'therapist',
      password: therapistPassword,
      fullName: 'Mike Therapist',
      phone: '+254700000003',
      role: 'SERVICE_PROVIDER',
      providerType: 'MASSAGE_THERAPIST',
    },
  });
  console.log('✓ Service provider users created');

  // Create service categories
  const facialCategory = await prisma.serviceCategory.upsert({
    where: { id: 'facial-treatments' },
    update: {},
    create: {
      id: 'facial-treatments',
      name: 'Facial Treatments',
      description: 'Professional facial and skin treatments',
      order: 1,
    },
  });

  const massageCategory = await prisma.serviceCategory.upsert({
    where: { id: 'massage-therapies' },
    update: {},
    create: {
      id: 'massage-therapies',
      name: 'Massage Therapies',
      description: 'Relaxing and therapeutic massage services',
      order: 2,
    },
  });

  const advancedCategory = await prisma.serviceCategory.upsert({
    where: { id: 'advanced-treatments' },
    update: {},
    create: {
      id: 'advanced-treatments',
      name: 'Body & Advanced Treatments',
      description: 'Advanced aesthetic procedures',
      order: 3,
    },
  });
  console.log('✓ Service categories created');

  // Create services
  const services = [
    {
      categoryId: facialCategory.id,
      name: 'Deep Cleansing Facial',
      description: 'Deep cleanse and purify your skin',
      duration: 60,
      price: 3500,
      isFeatured: true,
    },
    {
      categoryId: facialCategory.id,
      name: 'Anti-Aging Facial',
      description: 'Reduce fine lines and wrinkles',
      duration: 75,
      price: 5000,
      isFeatured: true,
    },
    {
      categoryId: massageCategory.id,
      name: 'Swedish Massage',
      description: 'Relaxing full body massage',
      duration: 60,
      price: 4000,
      isFeatured: false,
    },
    {
      categoryId: massageCategory.id,
      name: 'Deep Tissue Massage',
      description: 'Therapeutic deep muscle massage',
      duration: 75,
      price: 4500,
      isFeatured: true,
    },
    {
      categoryId: advancedCategory.id,
      name: 'Skin Analysis',
      description: 'Professional skin consultation and analysis',
      duration: 30,
      price: 2000,
      isFeatured: false,
    },
  ];

  for (const service of services) {
    await prisma.service.create({ data: service });
  }
  console.log('✓ Services created');

  console.log('Database seed completed successfully!');
  console.log('\nLogin Credentials:');
  console.log('Admin: username=admin, password=admin123');
  console.log('Receptionist: username=receptionist, password=receptionist123');
  console.log('Aesthetician: username=aesthetician, password=aesthetician123');
  console.log('Therapist: username=therapist, password=therapist123');
}

main()
  .catch((e) => {
    console.error('Error seeding database:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
