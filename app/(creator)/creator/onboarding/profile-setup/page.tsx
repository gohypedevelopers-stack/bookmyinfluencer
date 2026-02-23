import { redirect } from 'next/navigation'
import { getAuthenticatedCreatorId } from '@/lib/onboarding-auth'
import ProfileSetupClient from './ProfileSetupClient'

export default async function ProfileSetupPage() {
    const userId = await getAuthenticatedCreatorId()
    if (!userId) redirect('/verify')

    return (
        <div className="min-h-screen bg-gradient-to-br from-slate-950 via-indigo-950 to-purple-950 flex flex-col">
            <ProfileSetupClient userId={userId} />
        </div>
    )
}
