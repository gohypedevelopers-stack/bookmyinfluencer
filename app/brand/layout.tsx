import { BrandTopNav } from "@/components/brand/brand-top-nav"
import { BrandSidebar } from "@/components/brand/brand-sidebar"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import { redirect } from "next/navigation"
import { BrandSessionProvider } from "@/components/brand/brand-session-provider"

export default async function BrandLayout({
    children,
}: {
    children: React.ReactNode
}) {
    const session = await getServerSession(authOptions)

    if (!session) {
        redirect("/brand/login")
    }

    // ALLOW INFLUENCER FOR DEMO/TESTING PURPOSES
    if (session.user.role !== "BRAND" && session.user.role !== "ADMIN" && session.user.role !== "INFLUENCER") {
        // Debugging: Show why access is denied instead of redirecting
        return (
            <div className="flex min-h-screen flex-col items-center justify-center bg-gray-50 p-4">
                <div className="bg-white p-8 rounded-lg shadow-md max-w-md w-full text-center">
                    <h1 className="text-2xl font-bold text-red-600 mb-4">Access Denied</h1>
                    <p className="mb-4 text-gray-700">You do not have permission to view the Brand Dashboard.</p>
                    <div className="bg-gray-100 p-4 rounded text-left font-mono text-sm overflow-auto mb-6">
                        <p><strong>User ID:</strong> {session.user.id}</p>
                        <p><strong>Role:</strong> {session.user.role || "undefined"}</p>
                    </div>
                    <a href="/api/auth/signout" className="inline-block bg-blue-600 text-white px-6 py-2 rounded font-bold hover:bg-blue-700">
                        Sign Out
                    </a>
                </div>
            </div>
        )
    }

    return (
        <BrandSessionProvider session={session}>
            <div className="flex h-screen bg-gray-50 overflow-hidden">
                <BrandSidebar />
                <div className="flex-1 flex flex-col min-w-0 overflow-hidden">
                    <BrandTopNav />
                    <main className="flex-1 overflow-y-auto">
                        {children}
                        <footer className="border-t border-gray-200 bg-white py-6 mt-12 px-6">
                            <div className="max-w-[1400px] mx-auto flex flex-col md:flex-row items-center justify-between gap-4 text-sm text-gray-500">
                                <span>© 2024 BrandCRM. All rights reserved.</span>
                                <div className="flex items-center gap-6">
                                    <a href="#" className="hover:text-gray-700">Help Center</a>
                                    <a href="#" className="hover:text-gray-700">Privacy Policy</a>
                                    <a href="#" className="hover:text-gray-700">Terms of Service</a>
                                </div>
                            </div>
                        </footer>
                    </main>
                </div>
            </div>
        </BrandSessionProvider>
    )
}
