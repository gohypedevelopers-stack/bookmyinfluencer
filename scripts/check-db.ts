
import { db } from "../lib/db";
import { hash } from "bcryptjs";
import fs from "fs";

async function check() {
    try {
        let user = await db.user.findUnique({
            where: { email: 'dheerajsorout02@gmail.com' }
        });

        let msg = "";
        if (user) {
            const hashedPassword = await hash("Dheeraj@1234", 12);
            await db.user.update({
                where: { id: user.id },
                data: { passwordHash: hashedPassword }
            });
            msg = "SUCCESS: User found, password reset to Dheeraj@1234";
        } else {
            const hashedPassword = await hash("Dheeraj@1234", 12);
            user = await db.user.create({
                data: {
                    email: 'dheerajsorout02@gmail.com',
                    name: 'Dheeraj Test',
                    // @ts-ignore
                    passwordHash: hashedPassword,
                    role: 'INFLUENCER'
                }
            });
            msg = "SUCCESS: User created with password Dheeraj@1234";
        }
        fs.writeFileSync("status.txt", msg);
    } catch (e: any) {
        fs.writeFileSync("status.txt", "FAILURE: " + e.message);
    }
}

check();
