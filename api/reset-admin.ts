import { PrismaClient, UserRole } from '@prisma/client';
import * as argon2 from 'argon2';

const prisma = new PrismaClient();

async function main() {
  const email = 'admin@example.com';
  const passwordHash = await argon2.hash('ChangeMe123!');

  await prisma.user.upsert({
    where: { email },
    update: { passwordHash, role: UserRole.SUPER_ADMIN },
    create: {
      email,
      passwordHash,
      role: UserRole.SUPER_ADMIN,
    },
  });
  
  console.log(`Admin credentials updated successfully!`);
  console.log(`Email: ${email}`);
  console.log(`Password: ChangeMe123!`);
}

main()
  .then(async () => prisma.$disconnect())
  .catch(async (error) => {
    console.error(error);
    await prisma.$disconnect();
    process.exit(1);
  });
