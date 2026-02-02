"use client"

import { Card } from "@/components/ui/card"
import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Plus, Loader2 } from "lucide-react"
import { addPaymentRecord } from "./actions"
import { useRouter } from "next/navigation"

import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
    DialogTrigger,
    DialogFooter,
} from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"

export default function PaymentHistory({ initialHistory }: { initialHistory: any[] }) {
    // Calculate Total Payouts (YTD)
    // Assuming amount strings might look like "₹2,400" or just numbers.
    // We'll normalize to numbers for calculation.
    const totalPayouts = initialHistory.reduce((acc, item) => {
        const amountStr = String(item.amount).replace(/[^0-9.]/g, '')
        const val = parseFloat(amountStr)
        return acc + (isNaN(val) ? 0 : val)
    }, 0)

    const formattedTotal = new Intl.NumberFormat('en-IN', {
        style: 'currency',
        currency: 'INR',
        minimumFractionDigits: 2
    }).format(totalPayouts)

    return (
        <Card className="rounded-[2rem] border-gray-100 shadow-sm p-6 bg-white">
            <div className="flex items-center justify-between mb-6">
                <h3 className="font-bold text-gray-900 text-sm">Payment History</h3>
                {/* For now, just a view all button, but maybe we can make this 'Add' for demo? */}
                <div className="flex gap-2">
                    <AddPaymentDialog />
                    <button className="text-[10px] font-bold text-blue-600 uppercase hover:underline">View All</button>
                </div>
            </div>

            <div className="space-y-6">
                {initialHistory.length === 0 && (
                    <p className="text-gray-400 text-xs italic text-center py-4">No payment history yet.</p>
                )}
                {initialHistory.slice(0, 5).map((item, i) => (
                    <div key={i} className="flex justify-between items-start">
                        <div>
                            <p className="font-bold text-xs text-gray-900 mb-0.5">{item.title}</p>
                            <p className="text-[10px] text-gray-400">{item.date}</p>
                        </div>
                        <div className="text-right">
                            <p className="font-bold text-xs text-gray-900 mb-1">{item.amount}</p>
                            <span className={`text-[8px] font-bold px-1.5 py-0.5 rounded ${item.status === 'COMPLETED' ? 'text-green-600 bg-green-50' :
                                    item.status === 'PROCESSING' ? 'text-blue-600 bg-blue-50' : 'text-gray-600 bg-gray-50'
                                }`}>
                                {item.status}
                            </span>
                        </div>
                    </div>
                ))}
            </div>

            <div className="mt-8 bg-purple-50 rounded-2xl p-6 text-center">
                <p className="text-[10px] font-bold text-purple-400 uppercase tracking-wide mb-1">TOTAL PAYOUTS (YTD)</p>
                <p className="text-2xl font-bold text-gray-900">{formattedTotal}</p>
            </div>
        </Card>
    )
}

function AddPaymentDialog() {
    const [open, setOpen] = useState(false)
    const [title, setTitle] = useState("")
    const [amount, setAmount] = useState("")
    const [date, setDate] = useState("")
    const [status, setStatus] = useState("COMPLETED")
    const [loading, setLoading] = useState(false)
    const router = useRouter()

    const handleSubmit = async () => {
        setLoading(true)
        // Format amount with currency symbol if missing
        const formattedAmount = amount.startsWith('₹') ? amount : `₹${amount}`

        await addPaymentRecord({
            title,
            amount: formattedAmount,
            date: date || new Date().toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' }),
            status
        })
        setLoading(false)
        setOpen(false)
        router.refresh()
    }

    return (
        <Dialog open={open} onOpenChange={setOpen}>
            <DialogTrigger asChild>
                <button className="text-[10px] font-bold text-purple-600 uppercase hover:underline mr-2">
                    + Add
                </button>
            </DialogTrigger>
            <DialogContent>
                <DialogHeader>
                    <DialogTitle>Add Payment Record</DialogTitle>
                </DialogHeader>
                <div className="space-y-4 py-4">
                    <Input placeholder="Campaign Title" value={title} onChange={e => setTitle(e.target.value)} />
                    <Input placeholder="Amount (e.g. 2500)" type="number" value={amount} onChange={e => setAmount(e.target.value)} />
                    <Input placeholder="Date (e.g. Oct 12, 2023)" value={date} onChange={e => setDate(e.target.value)} />
                    <Select value={status} onValueChange={setStatus}>
                        <SelectTrigger>
                            <SelectValue placeholder="Status" />
                        </SelectTrigger>
                        <SelectContent>
                            <SelectItem value="COMPLETED">Completed</SelectItem>
                            <SelectItem value="PROCESSING">Processing</SelectItem>
                            <SelectItem value="PENDING">Pending</SelectItem>
                        </SelectContent>
                    </Select>
                </div>
                <DialogFooter>
                    <Button onClick={handleSubmit} disabled={loading}>
                        {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : "Add Record"}
                    </Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    )
}
