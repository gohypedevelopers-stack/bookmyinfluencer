import 'dotenv/config'
import { db } from "../lib/db"
import { authOptions } from "../lib/auth"

async function testCreatorOTP() {
    console.log('--- Testing Creator OTP Flow ---')
    const email = 'dheerajsorout02@gmail.com'

    // Find the otpUser first
    const otpUser = await db.otpUser.findUnique({
        where: { email },
        select: { id: true }
    })
    if (!otpUser) {
        throw new Error(`Creator ${email} not found in database!`)
    }

    console.log(`Creator found: ${email} (ID: ${otpUser.id})`)

    const otp = '777888'
    const expiresAt = new Date(Date.now() + 10 * 60 * 1000)
    const { hashOtp } = require("../lib/otp")
    const otpHash = hashOtp(email, otp)

    await db.emailOtp.upsert({
        where: { userId: otpUser.id },
        update: { otpHash, expiresAt, attempts: 0, lastSentAt: new Date() },
        create: { userId: otpUser.id, otpHash, expiresAt, attempts: 0, lastSentAt: new Date() }
    })
    console.log('OTP successfully generated & saved to emailOtp table.')

    const { constantTimeEqualHex } = require("../lib/otp")
    const stored = await db.emailOtp.findUnique({
        where: { userId: otpUser.id }
    })
    if (!stored) {
        throw new Error('Stored OTP not found!')
    }

    const incomingHash = hashOtp(email, otp)
    const matches = constantTimeEqualHex(incomingHash, stored.otpHash)

    if (matches) {
        console.log('✅ Creator OTP validation success: OTP matches stored hash!')
        await db.emailOtp.delete({ where: { userId: otpUser.id } })
    } else {
        throw new Error('❌ Creator OTP validation failed: hash mismatch!')
    }
}

async function testBrandOTP() {
    console.log('\n--- Testing Brand OTP Flow (NextAuth credentials authorize) ---')
    const email = 'brand@nike.com'
    const normalizedEmail = email.trim().toLowerCase()

    const brandUser = await db.user.findUnique({
        where: { email: normalizedEmail },
        include: { brandProfile: true }
    })
    if (!brandUser) {
        throw new Error(`Brand ${email} not found in user table!`)
    }
    console.log(`Brand found in user table: ${email} (ID: ${brandUser.id})`)

    const otpUser = await db.otpUser.upsert({
        where: { email: normalizedEmail },
        update: {},
        create: { email: normalizedEmail },
        select: { id: true }
    })
    console.log(`OtpUser record in users table: ID is ${otpUser.id}`)

    const otp: string = '999111'
    const expiresAt = new Date(Date.now() + 10 * 60 * 1000)
    const { hashOtp, constantTimeEqualHex } = require("../lib/otp")
    const otpHash = hashOtp(normalizedEmail, otp)

    await db.emailOtp.upsert({
        where: { userId: otpUser.id },
        update: { otpHash, expiresAt, attempts: 0, lastSentAt: new Date() },
        create: { userId: otpUser.id, otpHash, expiresAt, attempts: 0, lastSentAt: new Date() }
    })
    console.log('OTP successfully generated & saved to emailOtp table for Brand.')

    // Execute the authorize steps inline so we can see what fails
    console.log('\n--- Executing authorize() logic inline for debugging ---')

    // Step 1: find otpUser
    const authorize_otpUser = await db.otpUser.findUnique({
        where: { email: normalizedEmail },
        select: { id: true }
    })
    console.log('Step 1 - otpUser findUnique:', authorize_otpUser)
    if (!authorize_otpUser) throw new Error('Authorize failed: otpUser not found')

    // Step 2: find stored OTP
    const stored = await db.emailOtp.findUnique({
        where: { userId: authorize_otpUser.id }
    })
    console.log('Step 2 - stored OTP from db:', stored)
    if (!stored) throw new Error('Authorize failed: stored OTP not found')

    // Step 3: check expiry
    const now = new Date()
    console.log('Step 3 - checking expiry. Now:', now, 'Expires at:', stored.expiresAt)
    if (now > stored.expiresAt) {
        throw new Error('Authorize failed: OTP expired')
    }

    // Step 4: match OTP
    const isDevBypass = process.env.NODE_ENV !== "production" && otp === "123123"
    let matches = isDevBypass
    if (!isDevBypass) {
        const incomingHash = hashOtp(normalizedEmail, otp)
        matches = constantTimeEqualHex(incomingHash, stored.otpHash)
    }
    console.log('Step 4 - matches OTP:', matches, 'isDevBypass:', isDevBypass)
    if (!matches) throw new Error('Authorize failed: OTP hash does not match')

    // Step 5: find user in user table
    const user = await db.user.findUnique({
        where: { email: normalizedEmail }
    })
    console.log('Step 5 - user in main table:', user)
    if (!user) throw new Error('Authorize failed: user not found in main table')

    // Step 6: get database auth user
    console.log('Step 6 - calling getDatabaseAuthUser logic inline...')
    const authUser = await db.user.findUnique({
        where: { email: normalizedEmail },
        include: {
            influencerProfile: { select: { kyc: true } },
            brandProfile: { select: { onboardingCompleted: true } },
        },
    })
    console.log('Step 6 - getDatabaseAuthUser return fields:')
    if (!authUser) throw new Error('Authorize failed: getDatabaseAuthUser returned null')

    let kycStatus = (authUser.influencerProfile?.kyc?.status || "NOT_SUBMITTED")
    let onboardingComplete = false
    if (authUser.role === "INFLUENCER") {
        // ...
    } else if (authUser.role === "BRAND") {
        onboardingComplete = authUser.brandProfile?.onboardingCompleted || false
    }

    console.log({
        id: authUser.id,
        name: authUser.name,
        email: authUser.email,
        role: authUser.role,
        image: authUser.image,
        kycStatus,
        onboardingComplete,
    })

    console.log('Inline authorize logic completed successfully! Attempting NextAuth credentials provider authorize...')
    
    // Cleanup OTP so NextAuth can run fresh
    await db.emailOtp.upsert({
        where: { userId: otpUser.id },
        update: { otpHash, expiresAt, attempts: 0, lastSentAt: new Date() },
        create: { userId: otpUser.id, otpHash, expiresAt, attempts: 0, lastSentAt: new Date() }
    })

    const credentialsProvider = authOptions.providers.find(p => p.id === 'credentials') as any
    console.log('Found credentialsProvider:', credentialsProvider)
    if (!credentialsProvider || !credentialsProvider.authorize) {
        throw new Error('Credentials provider not found in authOptions!')
    }

    const result = await (credentialsProvider as any).options.authorize({
        email,
        otp,
        isOtpLogin: 'true',
        password: ''
    }, {} as any)

    if (result) {
        console.log('✅ NextAuth Credentials authorize success for Brand OTP login!')
        console.log('Resulting session user:', JSON.stringify(result, null, 2))
    } else {
        throw new Error('❌ NextAuth Credentials authorize failed for Brand OTP login!')
    }
}

async function runTests() {
    try {
        await testCreatorOTP()
        await testBrandOTP()
        console.log('\n🎉 All backend OTP verification tests passed successfully!')
    } catch (err: any) {
        console.error('\n❌ Test failed:', err.stack || err.message)
        process.exit(1)
    } finally {
        await db.$disconnect()
    }
}

runTests()
