const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function main() {
    const threads = await prisma.chatThread.findMany({
        where: {
            candidateId: { not: null }
        },
        include: {
            candidate: {
                include: {
                    campaign: { include: { brand: true } },
                    influencer: { include: { user: true } },
                    contract: true
                }
            }
        },
        take: 5
    });

    threads.forEach(t => {
        console.log(`Thread: ${t.id}`);
        console.log(`  Brand: ${t.candidate.campaign.brand.userId}`);
        console.log(`  Creator: ${t.candidate.influencer.user.email}`);
        console.log(`  Contract Status: ${t.candidate.contract?.status || 'NONE'}`);
        console.log(`  Candidate Status: ${t.candidate.status}`);
        console.log('---');
    });
}

main()
    .catch(e => console.error(e))
    .finally(async () => await prisma.$disconnect());
