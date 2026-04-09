import { PrismaClient, Role,TaskStatus } from '@prisma/client';
import * as bcrypt from 'bcrypt';

const prisma = new PrismaClient();

async function main() {
  console.log('🌱 Seeding database...');

  // Create admin user
  const adminPassword = await bcrypt.hash('admin123', 10);
  const admin = await prisma.user.upsert({
    where: { email: 'admin@example.com' },
    update: {},
    create: {
      email: 'admin@example.com',
      password: adminPassword,
      name: 'Admin User',
      role: Role.ADMIN,
    },
  });
  console.log(`✅ Created admin: ${admin.email}`);

  // Create normal user
  const userPassword = await bcrypt.hash('user123', 10);
  const user = await prisma.user.upsert({
    where: { email: 'user@example.com' },
    update: {},
    create: {
      email: 'user@example.com',
      password: userPassword,
      name: 'Normal User',
      role: Role.USER,
    },
  });
  console.log(`✅ Created user: ${user.email}`);

  // Create sample tasks
  const sampleTasks = [
    {
      title: 'Complete project documentation',
      description: 'Write comprehensive documentation for the task management system',
      status: 'DONE',
      assignedTo: user.id,
      createdBy: admin.id,
    },
    {
      title: 'Review pull requests',
      description: 'Review and merge pending pull requests from the development team',
      status: 'PROCESSING',
      assignedTo: admin.id,
      createdBy: admin.id,
    },
    {
      title: 'Setup CI/CD pipeline',
      description: 'Configure GitHub Actions for automated testing and deployment',
      status: 'PENDING',
      assignedTo: user.id,
      createdBy: admin.id,
    },
  ];

  for (const task of sampleTasks) {
    await prisma.task.create({
    data: {
      title: task.title,
      description: task.description,
      status: task.status as TaskStatus,
      assignedTo: task.assignedTo,
      createdBy: task.createdBy, // Make sure this is a string
    },
    });
  }
  console.log(`✅ Created ${sampleTasks.length} sample tasks`);

  console.log('🎉 Seeding completed!');
}

main()
  .catch((e) => {
    console.error('❌ Seeding failed:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });