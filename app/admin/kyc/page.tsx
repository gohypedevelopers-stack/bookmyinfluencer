"use client"

import { useEffect, useState } from 'react'
import { Card } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { CheckCircle, XCircle, Instagram, Youtube, TrendingUp } from "lucide-react"

interface Verification {
    id: string
    submittedAt: string
    instagramFollowers: number | null
    youtubeSubscribers: number | null
    totalPosts: number | null
    engagementRate: number | null
    creator: {
        id: string
        fullName: string | null
        instagramUrl: string | null
        youtubeUrl: string | null
        user: {
            email: string
        }
        metrics: Array<{
            provider: string
            followersCount: number
            engagementRate: number
        }>
    }
}

export default function AdminKYCPage() {
    const [verifications, setVerifications] = useState<Verification[]>([])
    const [loading, setLoading] = useState(true)
    const [processingId, setProcessingId] = useState<string | null>(null)

    useEffect(() => {
        fetchPendingVerifications()
    }, [])

    const fetchPendingVerifications = async () => {
        try {
            const response = await fetch('/api/admin/kyc/pending')
            const data = await response.json()
            if (data.success) {
                setVerifications(data.verifications)
            }
        } catch (error) {
            console.error('Failed to fetch verifications:', error)
        } finally {
            setLoading(false)
        }
    }

    const handleApprove = async (submissionId: string) => {
        if (!confirm('Are you sure you want to approve this creator?')) return

        const notes = prompt('Add admin notes (optional):')
        setProcessingId(submissionId)

        try {
            const response = await fetch('/api/admin/kyc/approve', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ submissionId, adminNotes: notes })
            })

            const data = await response.json()
            if (data.success) {
                alert('Creator approved successfully! Email sent.')
                fetchPendingVerifications() // Refresh list
            } else {
                alert('Error: ' + data.error)
            }
        } catch (error) {
            console.error('Approval error:', error)
            alert('Failed to approve creator')
        } finally {
            setProcessingId(null)
        }
    }

    const handleReject = async (submissionId: string) => {
        const reason = prompt('Enter reason for rejection:')
        if (!reason) return

        setProcessingId(submissionId)

        try {
            const response = await fetch('/api/admin/kyc/reject', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ submissionId, adminNotes: reason })
            })

            const data = await response.json()
            if (data.success) {
                alert('Creator rejected. Email sent.')
                fetchPendingVerifications() // Refresh list
            } else {
                alert('Error: ' + data.error)
            }
        } catch (error) {
            console.error('Rejection error:', error)
            alert('Failed to reject creator')
        } finally {
            setProcessingId(null)
        }
    }

    if (loading) {
        return (
            <div className="flex items-center justify-center h-96">
                <div className="text-lg text-gray-500">Loading verifications...</div>
            </div>
        )
    }

    return (
        <div className="space-y-6">
            <div>
                <h2 className="text-2xl font-bold text-gray-900">KYC Verifications</h2>
                <p className="text-gray-500">Review and approve creator verification requests</p>
            </div>

            {verifications.length === 0 ? (
                <Card className="p-12 text-center border-none shadow-sm bg-white">
                    <p className="text-gray-500">No pending verifications</p>
                </Card>
            ) : (
                <div className="space-y-4">
                    {verifications.map((verification) => (
                        <Card key={verification.id} className="p-6 border-none shadow-sm bg-white">
                            <div className="flex items-start justify-between">
                                <div className="flex-1 space-y-4">
                                    {/* Creator Info */}
                                    <div>
                                        <h3 className="text-lg font-bold text-gray-900">
                                            {verification.creator.fullName || 'Unknown Creator'}
                                        </h3>
                                        <p className="text-sm text-gray-500">{verification.creator.user.email}</p>
                                        <p className="text-xs text-gray-400 mt-1">
                                            Submitted: {new Date(verification.submittedAt).toLocaleDateString()}
                                        </p>
                                    </div>

                                    {/* Social Links */}
                                    <div className="flex gap-3">
                                        {verification.creator.instagramUrl && (
                                            <a
                                                href={verification.creator.instagramUrl}
                                                target="_blank"
                                                rel="noopener noreferrer"
                                                className="flex items-center gap-2 text-sm text-purple-600 hover:underline"
                                            >
                                                <Instagram className="w-4 h-4" />
                                                Instagram
                                            </a>
                                        )}
                                        {verification.creator.youtubeUrl && (
                                            <a
                                                href={verification.creator.youtubeUrl}
                                                target="_blank"
                                                rel="noopener noreferrer"
                                                className="flex items-center gap-2 text-sm text-red-600 hover:underline"
                                            >
                                                <Youtube className="w-4 h-4" />
                                                YouTube
                                            </a>
                                        )}
                                    </div>

                                    {/* Metrics */}
                                    <div className="grid grid-cols-4 gap-4">
                                        <div className="bg-blue-50 p-3 rounded-lg">
                                            <p className="text-xs text-gray-500 font-medium">Instagram Followers</p>
                                            <p className="text-xl font-bold text-gray-900">
                                                {verification.instagramFollowers?.toLocaleString() || 'N/A'}
                                            </p>
                                        </div>
                                        <div className="bg-red-50 p-3 rounded-lg">
                                            <p className="text-xs text-gray-500 font-medium">YouTube Subscribers</p>
                                            <p className="text-xl font-bold text-gray-900">
                                                {verification.youtubeSubscribers?.toLocaleString() || 'N/A'}
                                            </p>
                                        </div>
                                        <div className="bg-green-50 p-3 rounded-lg">
                                            <p className="text-xs text-gray-500 font-medium">Total Posts</p>
                                            <p className="text-xl font-bold text-gray-900">
                                                {verification.totalPosts || 'N/A'}
                                            </p>
                                        </div>
                                        <div className="bg-purple-50 p-3 rounded-lg">
                                            <p className="text-xs text-gray-500 font-medium">Engagement Rate</p>
                                            <p className="text-xl font-bold text-gray-900">
                                                {verification.engagementRate ? `${verification.engagementRate}%` : 'N/A'}
                                            </p>
                                        </div>
                                    </div>
                                </div>

                                {/* Action Buttons */}
                                <div className="flex gap-2 ml-6">
                                    <Button
                                        onClick={() => handleApprove(verification.id)}
                                        disabled={processingId === verification.id}
                                        className="bg-green-600 hover:bg-green-700 text-white"
                                    >
                                        <CheckCircle className="w-4 h-4 mr-2" />
                                        {processingId === verification.id ? 'Processing...' : 'Approve'}
                                    </Button>
                                    <Button
                                        onClick={() => handleReject(verification.id)}
                                        disabled={processingId === verification.id}
                                        variant="outline"
                                        className="border-red-300 text-red-600 hover:bg-red-50"
                                    >
                                        <XCircle className="w-4 h-4 mr-2" />
                                        Reject
                                    </Button>
                                </div>
                            </div>
                        </Card>
                    ))}
                </div>
            )}
        </div>
    )
}
