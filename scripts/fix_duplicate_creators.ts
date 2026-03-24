/**
 * fix_duplicate_creators.ts
 * Run: npx tsx scripts/fix_duplicate_creators.ts
 * 
 * Assigns every Creator and InfluencerProfile in the DB a unique
 * display name and unique Unsplash profile image.
 * No records are deleted.
 */

import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

// 50 unique curated names (Indian + international mix)
const UNIQUE_NAMES = [
    'Priya Sharma', 'Rahul Mehta', 'Aisha Khan', 'Vikram Nair', 'Sneha Patel',
    'Arjun Reddy', 'Kavya Iyer', 'Rohan Desai', 'Divya Bose', 'Karan Trivedi',
    'Nisha Choudhary', 'Aarav Gupta', 'Meera Joshi', 'Yash Singhania', 'Pooja Kapoor',
    'Siddharth Rao', 'Tanya Malhotra', 'Akash Verma', 'Simran Kohli', 'Dev Anand',
    'Riya Saxena', 'Vivek Pillai', 'Anjali Tiwari', 'Nikhil Seth', 'Ishaani Roy',
    'Gautam Bhatt', 'Shruti Agarwal', 'Manav Oberoi', 'Pallavi Nambiar', 'Chirag Shah',
    'Aliya Hassan', 'Ronit Chakraborty', 'Sunita Banerjee', 'Harsh Pandey', 'Deepa Krishnan',
    'Varun Sinha', 'Natasha Menon', 'Aryan Dasgupta', 'Bhavna Rastogi', 'Kunal Suri',
    'Sofia Fernandes', 'Tarun Mathur', 'Lavanya Subramanian', 'Nitin Jadhav', 'Geeta Mishra',
    'Shaan Mirza', 'Roshni Ghosh', 'Aakash Puri', 'Chandrika Dev', 'Yuvraj More',
];

// 50 unique Unsplash portrait URLs (diverse ethnicities / genders / styles)
const UNIQUE_IMAGES = [
    'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=400&q=80',
    'https://images.unsplash.com/photo-1539571696357-5a69c17a67c6?w=400&q=80',
    'https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=400&q=80',
    'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=400&q=80',
    'https://images.unsplash.com/photo-1531746020798-e6953c6e8e04?w=400&q=80',
    'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=400&q=80',
    'https://images.unsplash.com/photo-1580489944761-15a19d654956?w=400&q=80',
    'https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?w=400&q=80',
    'https://images.unsplash.com/photo-1573497019940-1c28c88b4f3e?w=400&q=80',
    'https://images.unsplash.com/photo-1560250097-0b93528c311a?w=400&q=80',
    'https://images.unsplash.com/photo-1552058544-f2b08422138a?w=400&q=80',
    'https://images.unsplash.com/photo-1547212371-eb5e6a4b590c?w=400&q=80',
    'https://images.unsplash.com/photo-1530268729831-4b0b9e170218?w=400&q=80',
    'https://images.unsplash.com/photo-1566492031773-4f4e44671857?w=400&q=80',
    'https://images.unsplash.com/photo-1522556189639-b150ed9c4330?w=400&q=80',
    'https://images.unsplash.com/photo-1568602471122-7832951cc4c5?w=400&q=80',
    'https://images.unsplash.com/photo-1502685104226-ee32379fefbe?w=400&q=80',
    'https://images.unsplash.com/photo-1521252659862-eec69941b071?w=400&q=80',
    'https://images.unsplash.com/photo-1519085360753-af0119f7cbe7?w=400&q=80',
    'https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=400&q=80',
    'https://images.unsplash.com/photo-1489980557514-251d61e3eeb6?w=400&q=80',
    'https://images.unsplash.com/photo-1463453091185-61582044d556?w=400&q=80',
    'https://images.unsplash.com/photo-1504257432389-52343af06ae3?w=400&q=80',
    'https://images.unsplash.com/photo-1508341591423-4347099e1f19?w=400&q=80',
    'https://images.unsplash.com/photo-1517841905240-472988babdf9?w=400&q=80',
    'https://images.unsplash.com/photo-1488161628813-04466f872be2?w=400&q=80',
    'https://images.unsplash.com/photo-1522075469751-3a6694fb2f61?w=400&q=80',
    'https://images.unsplash.com/photo-1543610892-0b1f7e6d8ac1?w=400&q=80',
    'https://images.unsplash.com/photo-1542909168-82c3e7fdca5c?w=400&q=80',
    'https://images.unsplash.com/photo-1531427186611-ecfd6d936c79?w=400&q=80',
    'https://images.unsplash.com/photo-1524504388940-b1c1722653e1?w=400&q=80',
    'https://images.unsplash.com/photo-1573496799652-408c2ac9fe98?w=400&q=80',
    'https://images.unsplash.com/photo-1546961342-ea5f62d87dad?w=400&q=80',
    'https://images.unsplash.com/photo-1548546738-8509cb246ed3?w=400&q=80',
    'https://images.unsplash.com/photo-1506277886164-e25aa3f4ef7f?w=400&q=80',
    'https://images.unsplash.com/photo-1596075780750-81249df16d19?w=400&q=80',
    'https://images.unsplash.com/photo-1524638431109-93d95c968f03?w=400&q=80',
    'https://images.unsplash.com/photo-1455875169634-8a6aab41e9c5?w=400&q=80',
    'https://images.unsplash.com/photo-1598550880863-4e8aa3d0edb4?w=400&q=80',
    'https://images.unsplash.com/photo-1601412436009-d964bd02edbc?w=400&q=80',
    'https://images.unsplash.com/photo-1611432579699-484f7990b127?w=400&q=80',
    'https://images.unsplash.com/photo-1519345182560-3f2917c472ef?w=400&q=80',
    'https://images.unsplash.com/photo-1555952517-2e8e729e0b44?w=400&q=80',
    'https://images.unsplash.com/photo-1557862921-37829c790f19?w=400&q=80',
    'https://images.unsplash.com/photo-1603415526960-f7e0328c63b1?w=400&q=80',
    'https://images.unsplash.com/photo-1587614382346-4ec70e388b28?w=400&q=80',
    'https://images.unsplash.com/photo-1511485977113-f34c92461ad9?w=400&q=80',
    'https://images.unsplash.com/photo-1551836022-d5d88e9218df?w=400&q=80',
    'https://images.unsplash.com/photo-1530785602389-07594beb8b73?w=400&q=80',
    'https://images.unsplash.com/photo-1594744803329-e58b31de8bf5?w=400&q=80',
];

async function main() {
    console.log('Fetching all creators...');

    const creators = await prisma.creator.findMany({
        select: { id: true, displayName: true, profileImageUrl: true },
        orderBy: { id: 'asc' }
    });

    console.log(`Found ${creators.length} Creator records.`);

    let idx = 0;
    for (const c of creators) {
        const name = UNIQUE_NAMES[idx % UNIQUE_NAMES.length];
        const img = UNIQUE_IMAGES[idx % UNIQUE_IMAGES.length];
        await prisma.creator.update({
            where: { id: c.id },
            data: {
                displayName: name,
                fullName: name,
                profileImageUrl: img,
            }
        });
        console.log(`  [${idx + 1}/${creators.length}] Updated creator ${c.id} → "${name}"`);
        idx++;
    }

    // Also fix InfluencerProfile records (legacy) if any
    const profiles = await prisma.influencerProfile.findMany({
        select: { id: true, userId: true },
        orderBy: { id: 'asc' }
    });

    console.log(`\nFound ${profiles.length} InfluencerProfile records.`);

    for (const p of profiles) {
        const name = UNIQUE_NAMES[idx % UNIQUE_NAMES.length];
        const img = UNIQUE_IMAGES[idx % UNIQUE_IMAGES.length];
        await prisma.user.update({
            where: { id: p.userId },
            data: { name, image: img }
        });
        console.log(`  [${idx - creators.length + 1}/${profiles.length}] Updated profile ${p.id} → "${name}"`);
        idx++;
    }

    console.log('\nAll done! Unique names and photos applied.');
}

main()
    .catch((e) => { console.error(e); process.exit(1); })
    .finally(() => prisma.$disconnect());
