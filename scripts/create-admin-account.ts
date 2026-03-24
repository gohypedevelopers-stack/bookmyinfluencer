import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

async function main() {
    const email = 'admin@bookmyinfluencer.com';
    const password = 'AdminPassword123!';
    const name = 'System Admin';

    console.log(`Creating admin account for ${email}...`);

    const passwordHash = await bcrypt.hash(password, 10);

    const admin = await prisma.user.upsert({
        where: { email },
        update: {
            role: 'ADMIN',
            name,
            passwordHash
        },
        create: {
            email,
            name,
            passwordHash,
            role: 'ADMIN'
        }
    });

    console.log('--- Admin Account Created ---');
    console.log('Email:', admin.email);
    console.log('Name:', admin.name);
    console.log('Role:', admin.role);
    console.log('Password:', password);
    console.log('-----------------------------');
    console.log('You can now log in using these credentials.');
}

main()
    .catch((e) => {
        console.error(e);
        process.exit(1);
    })
    .finally(async () => {
        await prisma.$disconnect();
    });
