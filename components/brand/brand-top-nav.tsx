"use client"

import { usePathname, useRouter } from "next/navigation"
import { useState, useEffect, useRef, useCallback } from "react"
import { Search, Users, Loader2, X } from "lucide-react"
import { NotificationPopover } from "./NotificationPopover"
import Image from "next/image"
import Link from "next/link"

interface SearchResult {
    id: string
    profileId: string
    name: string
    handle: string
    niche: string
    avatar: string | null
    followers: number
    type: 'influencer' | 'creator'
}

export function BrandTopNav() {
    const pathname = usePathname()
    const router = useRouter()
    const [mounted, setMounted] = useState(false)
    const [query, setQuery] = useState("")
    const [results, setResults] = useState<SearchResult[]>([])
    const [isSearching, setIsSearching] = useState(false)
    const [showDropdown, setShowDropdown] = useState(false)
    const searchRef = useRef<HTMLDivElement>(null)
    const debounceRef = useRef<ReturnType<typeof setTimeout> | undefined>(undefined)

    useEffect(() => {
        setMounted(true)
    }, [])

    // Close dropdown when clicking outside
    useEffect(() => {
        function handleClickOutside(e: MouseEvent) {
            if (searchRef.current && !searchRef.current.contains(e.target as Node)) {
                setShowDropdown(false)
            }
        }
        document.addEventListener("mousedown", handleClickOutside)
        return () => document.removeEventListener("mousedown", handleClickOutside)
    }, [])

    const search = useCallback(async (q: string) => {
        if (q.length < 2) {
            setResults([])
            setShowDropdown(false)
            return
        }
        setIsSearching(true)
        try {
            const res = await fetch(`/api/search/influencers?q=${encodeURIComponent(q)}`)
            const data = await res.json()
            setResults(data.results || [])
            setShowDropdown(true)
        } catch {
            setResults([])
        } finally {
            setIsSearching(false)
        }
    }, [])

    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const val = e.target.value
        setQuery(val)
        clearTimeout(debounceRef.current)
        debounceRef.current = setTimeout(() => search(val), 350)
    }

    const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
        if (e.key === "Enter" && query.trim().length > 0) {
            setShowDropdown(false)
            router.push(`/brand/discover?q=${encodeURIComponent(query.trim())}`)
        }
        if (e.key === "Escape") {
            setShowDropdown(false)
        }
    }

    const clearSearch = () => {
        setQuery("")
        setResults([])
        setShowDropdown(false)
    }

    const getPageTitle = () => {
        if (pathname === "/brand") return "Dashboard"
        if (pathname?.includes("/brand/campaigns")) return "Campaigns"

        if (pathname?.includes("/brand/discover")) return "Marketplace"
        if (pathname?.includes("/brand/analytics")) return "Analytics"
        if (pathname?.includes("/brand/wallet")) return "Wallet"
        if (pathname?.includes("/brand/settings")) return "Settings"
        return "Dashboard"
    }

    function formatFollowers(n: number) {
        if (!n) return ""
        if (n >= 1_000_000) return (n / 1_000_000).toFixed(1) + "M"
        if (n >= 1_000) return (n / 1_000).toFixed(1) + "K"
        return String(n)
    }

    return (
        <header className="bg-white border-b border-gray-200 sticky top-0 z-50">
            <div className="max-w-[1400px] mx-auto px-6 h-16 flex items-center justify-between gap-8">
                {/* Left: Title */}
                <div className="flex items-center gap-10">
                    <h1 className="text-xl font-bold text-gray-800">{getPageTitle()}</h1>
                </div>

                {/* Right: Search + Notification */}
                <div className="flex items-center gap-4">
                    {/* Search Box */}
                    <div ref={searchRef} className="relative hidden md:block">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400 pointer-events-none" />
                        <input
                            value={query}
                            onChange={handleChange}
                            onKeyDown={handleKeyDown}
                            onFocus={() => { if (results.length > 0) setShowDropdown(true) }}
                            placeholder="Search influencers..."
                            className="pl-10 pr-8 w-64 h-10 bg-gray-50 border border-gray-200 rounded-lg text-sm outline-none focus:ring-2 focus:ring-teal-500 focus:border-transparent transition-all"
                        />
                        {/* Clear / Spinner */}
                        <div className="absolute right-3 top-1/2 -translate-y-1/2">
                            {isSearching ? (
                                <Loader2 className="w-4 h-4 text-gray-400 animate-spin" />
                            ) : query ? (
                                <button onClick={clearSearch} className="text-gray-400 hover:text-gray-600">
                                    <X className="w-3.5 h-3.5" />
                                </button>
                            ) : null}
                        </div>

                        {/* Dropdown */}
                        {showDropdown && (
                            <div className="absolute top-full mt-2 left-0 w-80 bg-white rounded-xl shadow-xl border border-gray-100 z-50 overflow-hidden animate-in fade-in slide-in-from-top-2 duration-150">
                                {results.length === 0 && !isSearching ? (
                                    <div className="p-6 text-center">
                                        <Users className="w-8 h-8 text-gray-300 mx-auto mb-2" />
                                        <p className="text-sm text-gray-500">No influencers found for <span className="font-semibold">"{query}"</span></p>
                                    </div>
                                ) : (
                                    <>
                                        <div className="px-4 pt-3 pb-1.5 border-b border-gray-50">
                                            <p className="text-[11px] font-semibold text-gray-400 uppercase tracking-wider">Influencers</p>
                                        </div>
                                        <ul>
                                            {results.map((r) => (
                                                <li key={r.id}>
                                                    <Link
                                                        href={`/brand/influencers/${r.profileId}`}
                                                        onClick={() => { setShowDropdown(false); setQuery("") }}
                                                        className="flex items-center gap-3 px-4 py-3 hover:bg-gray-50 transition-colors"
                                                    >
                                                        {/* Avatar */}
                                                        <div className="w-9 h-9 rounded-full bg-gradient-to-br from-teal-400 to-indigo-500 flex items-center justify-center shrink-0 overflow-hidden">
                                                            {r.avatar ? (
                                                                <Image src={r.avatar} alt={r.name} width={36} height={36} className="object-cover" />
                                                            ) : (
                                                                <span className="text-white font-bold text-sm">{r.name.charAt(0)}</span>
                                                            )}
                                                        </div>
                                                        {/* Info */}
                                                        <div className="flex-1 min-w-0">
                                                            <p className="font-semibold text-sm text-gray-900 truncate">{r.name}</p>
                                                            <p className="text-xs text-gray-400 truncate">
                                                                {r.niche && <span className="font-medium text-teal-600">{r.niche}</span>}
                                                                {r.followers > 0 && <span className="ml-1 text-gray-400">· {formatFollowers(r.followers)} followers</span>}
                                                            </p>
                                                        </div>
                                                        <span className="text-xs text-gray-300 shrink-0">View →</span>
                                                    </Link>
                                                </li>
                                            ))}
                                        </ul>
                                        {/* View all */}
                                        <div className="border-t border-gray-50 px-4 py-2.5">
                                            <Link
                                                href={`/brand/discover?q=${encodeURIComponent(query)}`}
                                                onClick={() => { setShowDropdown(false); setQuery("") }}
                                                className="text-xs font-semibold text-teal-600 hover:text-teal-700 flex items-center gap-1"
                                            >
                                                <Search className="w-3 h-3" />
                                                See all results for "{query}"
                                            </Link>
                                        </div>
                                    </>
                                )}
                            </div>
                        )}
                    </div>

                    {mounted && (
                        <NotificationPopover />
                    )}
                </div>
            </div>
        </header>
    )
}
