export const DEFAULT_NOTIFICATION_SETTINGS = {
    campaigns: {
        opportunities: { push: false, email: true, sms: false },
        approvals: { push: true, email: false, sms: false }
    },
    payments: {
        processed: { push: true, email: true, sms: true },
        taxes: { push: false, email: true, sms: false }
    },
    social: {
        visits: { push: true, email: false, sms: false },
        messages: { push: true, email: true, sms: false }
    }
}
