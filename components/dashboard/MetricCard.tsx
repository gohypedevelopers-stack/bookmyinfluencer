'use client'

import { TrendingUp, TrendingDown, Minus } from "lucide-react"

interface MetricCardProps {
    title: string
    value: string | number
    change?: number
    subtitle?: string
    icon?: React.ReactNode
    gradient?: string
}

export function MetricCard({ title, value, change, subtitle, icon, gradient = "from-cyan-500 to-blue-500" }: MetricCardProps) {
    const getTrendIcon = () => {
        if (!change) return <Minus className="h-4 w-4 text-gray-400" />
        if (change > 0) return <TrendingUp className="h-4 w-4 text-green-400" />
        return <TrendingDown className="h-4 w-4 text-red-400" />
    }

    const getTrendColor = () => {
        if (!change) return "text-gray-400"
        return change > 0 ? "text-green-400" : "text-red-400"
    }

    return (
        <div className="relative overflow-hidden rounded-lg bg-gray-800 border border-gray-700 p-6">
            {/* Gradient Background */}
            <div className={`absolute top-0 right-0 w-32 h-32 bg-gradient-to-br ${gradient} opacity-10 blur-3xl`}></div>

            <div className="relative">
                <div className="flex items-center justify-between mb-3">
                    <div className="flex items-center gap-2 text-gray-400 text-sm">
                        {icon}
                        <span>{title}</span>
                    </div>
                    {change !== undefined && (
                        <div className={`flex items-center gap-1 text-sm font-medium ${getTrendColor()}`}>
                            {getTrendIcon()}
                            <span>{change > 0 ? '+' : ''}{change}%</span>
                        </div>
                    )}
                </div>

                <div className="text-3xl font-bold text-white mb-1">
                    {value}
                </div>

                {subtitle && (
                    <div className="text-xs text-gray-500">
                        {subtitle}
                    </div>
                )}
            </div>
        </div>
    )
}
