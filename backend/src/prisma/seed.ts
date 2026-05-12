import 'dotenv/config';

import { PrismaClient, Role } from '@prisma/client';
import { PrismaPg } from '@prisma/adapter-pg';
import { Pool } from 'pg';
import * as bcrypt from 'bcrypt';

import { defaultEmailTemplates } from '../mailer/default-email-templates';

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
});

const adapter = new PrismaPg(pool);

const prisma = new PrismaClient({
  adapter,
});

async function seedEmailTemplates() {
  for (const template of defaultEmailTemplates) {
    await prisma.emailTemplate.upsert({
      where: {
        key: template.key,
      },
      update: {
        name: template.name,
        subject: template.subject,
        bodyHtml: template.bodyHtml,
        isActive: template.isActive,
      },
      create: {
        key: template.key,
        name: template.name,
        subject: template.subject,
        bodyHtml: template.bodyHtml,
        isActive: template.isActive,
      },
    });
  }

  console.log('✅ Email templates seeded');
}

async function seedSuperAdmin() {
  const email = process.env.SUPER_ADMIN_EMAIL;

  if (!email) {
    throw new Error('SUPER_ADMIN_EMAIL is missing');
  }

  const existingUser = await prisma.user.findUnique({
    where: { email },
  });

  if (existingUser) {
    console.log('ℹ️ Super admin already exists');
    return;
  }

  const hashedPassword = await bcrypt.hash(
    process.env.SUPER_ADMIN_PASSWORD || 'Admin123!',
    10,
  );

  await prisma.user.create({
    data: {
      email,
      password: hashedPassword,

      firstName: process.env.SUPER_ADMIN_FIRST_NAME || 'Super',
      lastName: process.env.SUPER_ADMIN_LAST_NAME || 'Admin',

      role: Role.ADMIN,
      isSuperAdmin: true,

      mustChangePassword: false,
      notificationsEnabled: true,
    },
  });

  console.log('✅ Super admin created');
}

async function main() {
  await seedEmailTemplates();
  await seedSuperAdmin();
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
    await pool.end();
  });