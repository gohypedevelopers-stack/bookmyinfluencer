import nodemailer from 'nodemailer';

const transporter = nodemailer.createTransport({
    host: process.env.SMTP_HOST,
    port: parseInt(process.env.SMTP_PORT || '587'),
    secure: false,
    auth: {
        user: process.env.SMTP_USER,
        pass: process.env.SMTP_PASS,
    },
});

export async function sendVerificationApprovedEmail(email: string, creatorName: string) {
    try {
        await transporter.sendMail({
            from: process.env.FROM_EMAIL,
            to: email,
            subject: '🎉 Your Creator Profile Has Been Verified!',
            html: `
                <!DOCTYPE html>
                <html>
                <head>
                    <style>
                        body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
                        .container { max-width: 600px; margin: 0 auto; padding: 20px; }
                        .header { background: linear-gradient(135deg, #6366f1 0%, #8b5cf6 100%); padding: 30px; text-align: center; border-radius: 10px 10px 0 0; }
                        .header h1 { color: white; margin: 0; }
                        .content { background: #f9f9f9; padding: 30px; border-radius: 0 0 10px 10px; }
                        .button { display: inline-block; background: #6366f1; color: white; padding: 12px 30px; text-decoration: none; border-radius: 5px; margin-top: 20px; }
                        .footer { text-align: center; margin-top: 20px; color: #666; font-size: 12px; }
                    </style>
                </head>
                <body>
                    <div class="container">
                        <div class="header">
                            <h1>✨ Congratulations ${creatorName}!</h1>
                        </div>
                        <div class="content">
                            <h2>Your Profile Is Now Verified</h2>
                            <p>Great news! Your creator profile has been approved by our admin team.</p>
                            <p><strong>What's next?</strong></p>
                            <ul>
                                <li>Your profile is now visible to brands on our discovery page</li>
                                <li>You can start receiving collaboration opportunities</li>
                                <li>Complete your profile setup to maximize your reach</li>
                            </ul>
                            <a href="${process.env.NEXTAUTH_URL}/creator/dashboard" class="button">Go to Dashboard</a>
                        </div>
                        <div class="footer">
                            <p>© 2026 BookMyInfluencer. All rights reserved.</p>
                        </div>
                    </div>
                </body>
                </html>
            `
        });
        console.log(`Verification email sent to ${email}`);
    } catch (error) {
        console.error('Error sending verification email:', error);
        throw error;
    }
}

export async function sendVerificationRejectedEmail(email: string, creatorName: string, reason?: string) {
    try {
        await transporter.sendMail({
            from: process.env.FROM_EMAIL,
            to: email,
            subject: 'Update on Your Creator Verification',
            html: `
                <!DOCTYPE html>
                <html>
                <head>
                    <style>
                        body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
                        .container { max-width: 600px; margin: 0 auto; padding: 20px; }
                        .header { background: #ef4444; padding: 30px; text-align: center; border-radius: 10px 10px 0 0; }
                        .header h1 { color: white; margin: 0; }
                        .content { background: #f9f9f9; padding: 30px; border-radius: 0 0 10px 10px; }
                        .button { display: inline-block; background: #6366f1; color: white; padding: 12px 30px; text-decoration: none; border-radius: 5px; margin-top: 20px; }
                        .footer { text-align: center; margin-top: 20px; color: #666; font-size: 12px; }
                    </style>
                </head>
                <body>
                    <div class="container">
                        <div class="header">
                            <h1>Verification Update</h1>
                        </div>
                        <div class="content">
                            <h2>Hi ${creatorName},</h2>
                            <p>Thank you for submitting your creator profile for verification.</p>
                            <p>Unfortunately, we were unable to approve your profile at this time.</p>
                            ${reason ? `<p><strong>Reason:</strong> ${reason}</p>` : ''}
                            <p><strong>What can you do?</strong></p>
                            <ul>
                                <li>Review your profile information and ensure accuracy</li>
                                <li>Verify your social media accounts are active and public</li>
                                <li>Submit your profile again for review</li>
                            </ul>
                            <a href="${process.env.NEXTAUTH_URL}/creator/profile" class="button">Update Profile</a>
                        </div>
                        <div class="footer">
                            <p>© 2026 BookMyInfluencer. All rights reserved.</p>
                        </div>
                    </div>
                </body>
                </html>
            `
        });
        console.log(`Rejection email sent to ${email}`);
    } catch (error) {
        console.error('Error sending rejection email:', error);
        throw error;
    }
}
