import { db } from "../lib/db";

async function main() {
    console.log("Restoring real creators...");

    // 1. Gourav
    await db.creator.updateMany({
        where: { email: "guptagourav298@gmail.com" },
        data: { displayName: "Gourav Gupta", fullName: "Gourav Gupta", profileImageUrl: "" }
    });
    const p1 = await db.user.findFirst({ where: { email: "guptagourav298@gmail.com" } });
    if (p1) {
        await db.user.update({ where: { id: p1.id }, data: { name: "Gourav Gupta", image: "" } });
    }

    // 2. Dheeraj
    await db.creator.updateMany({
        where: { email: "dheerajsorout16500@gmail.com" },
        data: { displayName: "Dheeraj Sorout", fullName: "Dheeraj Sorout", profileImageUrl: "" }
    });
    const p2 = await db.user.findFirst({ where: { email: "dheerajsorout16500@gmail.com" } });
    if (p2) {
        await db.user.update({ where: { id: p2.id }, data: { name: "Dheeraj Sorout", image: "" } });
    }

    // 3. Vikram Nair (Null email) -> Lalit
    await db.creator.updateMany({
        where: { id: "39347323-ca51-4a78-a99d-c42e2983fedc" },
        data: { displayName: "Lalit", fullName: "Lalit", profileImageUrl: "" }
    });

    // 4. Rishav (archived user)
    const p3 = await db.user.findFirst({ where: { email: "removed+user-cmmk8dw1e0001itpljdba3h64@archived.local" } });
    if (p3) {
        await db.user.update({ where: { id: p3.id }, data: { name: "Rishav", image: "" } });
    }

    console.log("Restore complete.");
}

main().catch(console.error).finally(() => db.$disconnect());
