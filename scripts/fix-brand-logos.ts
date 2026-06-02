import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

const BRAND_UPDATES = [
    {
        companyName: 'Nike',
        userId: 'cmmk9azid00056dsjpzalyixw',
        image: 'https://images.unsplash.com/photo-1542291026-7eec264c27ff?w=500&auto=format&fit=crop&q=80' // High-quality red athletic running shoe
    },
    {
        companyName: 'Air',
        userId: 'cmmvvmdbb00004slz0dwr5q7y',
        image: 'https://images.unsplash.com/photo-1436491865332-7a61a109cc05?w=500&auto=format&fit=crop&q=80' // Sleek white airplane wing in blue sky
    },
    {
        companyName: 'OPPO',
        userId: 'cmmx91dme0000nxmw8qy867ut',
        image: 'https://images.unsplash.com/photo-1511707171634-5f897ff02aa9?w=500&auto=format&fit=crop&q=80' // Sleek phone on table
    },
    {
        companyName: 'VIVO',
        userId: 'cmn2rr4l90000362ykfje5hnt',
        image: 'https://images.unsplash.com/photo-1598327105666-5b89351aff97?w=500&auto=format&fit=crop&q=80' // Sleek blue smartphone camera panel
    },
    {
        companyName: 'Boat',
        userId: 'cmpnwrw5o0000jo4oko8kgyv9',
        image: 'https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=500&auto=format&fit=crop&q=80' // Stylish audio headphones
    }
];

async function main() {
    console.log("Updating Brand User logos in the database...");
    
    for (const update of BRAND_UPDATES) {
        // Update the User table (where image is stored)
        const updatedUser = await prisma.user.update({
            where: { id: update.userId },
            data: {
                image: update.image
            }
        });
        
        console.log(`✅ Updated ${update.companyName} (User ID: ${update.userId}) with logo: ${update.image}`);
    }
    
    console.log("\nAll brand logos updated successfully!");
}

main()
    .catch((e) => {
        console.error("Failed to update brand logos:", e);
        process.exit(1);
    })
    .finally(() => prisma.$disconnect());
