import { Button } from "@/components/ui/button"
import { FileText, Mail, DollarSign, CheckCircle, Clock } from "lucide-react"
import Link from "next/link"

type ActivityType = 'DRAFT_SUBMITTED' | 'APPLICATION_RECEIVED' | 'PAYMENT_RELEASED' | 'CAMPAIGN_COMPLETED' | string

interface Activity {
    id: string
    type: string
    title: string
    subtitle: string
    time: string
    actionLabel?: string
    actionLink?: string
}

interface RecentActivityProps {
    activities: Activity[]
}

export function RecentActivity({ activities }: RecentActivityProps) {
    const getIcon = (type: string) => {
        switch (type) {
            case 'DRAFT_SUBMITTED':
            case 'MESSAGE':
                return <FileText className="w-5 h-5 text-blue-600" />
            case 'APPLICATION_RECEIVED':
            case 'OFFER':
            case 'COLLAB_REQUEST':
                return <Mail className="w-5 h-5 text-green-600" />
            case 'PAYMENT_RELEASED':
            case 'ESCROW':
                return <DollarSign className="w-5 h-5 text-orange-600" />
            case 'CAMPAIGN_COMPLETED':
                return <CheckCircle className="w-5 h-5 text-purple-600" />
            case 'SYSTEM':
            default:
                return <Clock className="w-5 h-5 text-gray-600" />
        }
    }

    const getBgColor = (type: string) => {
        switch (type) {
            case 'DRAFT_SUBMITTED':
            case 'MESSAGE': return 'bg-blue-100'
            case 'APPLICATION_RECEIVED':
            case 'OFFER':
            case 'COLLAB_REQUEST': return 'bg-green-100'
            case 'PAYMENT_RELEASED':
            case 'ESCROW': return 'bg-orange-100'
            case 'CAMPAIGN_COMPLETED': return 'bg-purple-100'
            case 'SYSTEM':
            default: return 'bg-gray-100'
        }
    }

    return (
        <div className="bg-white rounded-2xl border border-gray-100 p-6 shadow-sm">
            <div className="flex justify-between items-center mb-6">
                <h3 className="font-bold text-gray-900 text-lg">Recent Activity</h3>
                <Button variant="ghost" className="text-blue-600 font-semibold hover:bg-blue-50">View all activity</Button>
            </div>

            <div className="space-y-4">
                {activities.map((activity) => (
                    <div key={activity.id} className="flex items-center justify-between p-4 bg-gray-50 rounded-xl hover:bg-gray-100 transition-colors">
                        <div className="flex items-center gap-4">
                            <div className={`w-10 h-10 rounded-lg flex items-center justify-center shrink-0 ${getBgColor(activity.type)}`}>
                                {getIcon(activity.type)}
                            </div>
                            <div>
                                <p className="text-gray-900 font-medium text-sm line-clamp-1">{activity.title}</p>
                                <p className="text-xs text-gray-500">{activity.time} • {activity.subtitle}</p>
                            </div>
                        </div>
                        {activity.actionLabel && activity.actionLink && activity.actionLink !== '#' ? (
                            <Link href={activity.actionLink}>
                                <Button variant="secondary" size="sm" className="bg-white border border-gray-200 shadow-sm text-gray-700 hover:bg-gray-50 shrink-0">
                                    {activity.actionLabel}
                                </Button>
                            </Link>
                        ) : activity.actionLabel ? (
                            <Button variant="secondary" size="sm" disabled className="bg-white border border-gray-200 shadow-sm text-gray-700 hover:bg-gray-50 shrink-0 opacity-50 cursor-not-allowed">
                                {activity.actionLabel}
                            </Button>
                        ) : null}
                    </div>
                ))}

                {activities.length === 0 && (
                    <div className="text-center py-8 text-gray-500">
                        No recent activity.
                    </div>
                )}
            </div>
        </div>
    )
}
