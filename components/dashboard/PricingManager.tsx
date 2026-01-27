'use client'

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Trash2, Plus, DollarSign } from "lucide-react"
import { updateCreatorPricing } from "@/app/(creator)/creator/dashboard/actions"

interface PricingPackage {
    title: string
    price: number
    description: string
}

export function PricingManager({ initialPricing }: { initialPricing?: string }) {
    const [packages, setPackages] = useState<PricingPackage[]>(() => {
        if (!initialPricing) return []
        try {
            return JSON.parse(initialPricing)
        } catch {
            return []
        }
    })
    const [saving, setSaving] = useState(false)

    const addPackage = () => {
        setPackages([...packages, { title: "", price: 0, description: "" }])
    }

    const removePackage = (index: number) => {
        setPackages(packages.filter((_, i) => i !== index))
    }

    const updatePackage = (index: number, field: keyof PricingPackage, value: string | number) => {
        const updated = [...packages]
        updated[index] = { ...updated[index], [field]: value }
        setPackages(updated)
    }

    const handleSave = async () => {
        setSaving(true)
        try {
            const result = await updateCreatorPricing(JSON.stringify(packages))
            if (result.success) {
                alert("Pricing updated successfully!")
            } else {
                alert("Error: " + result.error)
            }
        } catch (error) {
            alert("Failed to save pricing")
        } finally {
            setSaving(false)
        }
    }

    return (
        <Card className="bg-gray-800 border-gray-700">
            <CardHeader>
                <CardTitle className="text-white">Pricing Packages</CardTitle>
                <CardDescription className="text-gray-400">
                    Define your service packages and rates for brand collaborations.
                </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
                {packages.map((pkg, index) => (
                    <div key={index} className="p-4 border rounded-lg space-y-3 bg-slate-50">
                        <div className="flex items-start justify-between">
                            <div className="font-medium text-sm text-slate-600">Package {index + 1}</div>
                            <Button
                                variant="ghost"
                                size="sm"
                                onClick={() => removePackage(index)}
                                className="h-8 w-8 p-0"
                                title="Delete this package"
                                aria-label="Delete package"
                            >
                                <Trash2 className="h-4 w-4 text-red-600" />
                            </Button>
                        </div>

                        <div className="grid gap-3">
                            <div>
                                <Label htmlFor={`title-${index}`}>Service Title</Label>
                                <Input
                                    id={`title-${index}`}
                                    placeholder="e.g., Instagram Reel"
                                    value={pkg.title}
                                    onChange={(e) => updatePackage(index, 'title', e.target.value)}
                                />
                            </div>

                            <div>
                                <Label htmlFor={`price-${index}`}>Price ($)</Label>
                                <div className="relative">
                                    <DollarSign className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
                                    <Input
                                        id={`price-${index}`}
                                        type="number"
                                        placeholder="500"
                                        value={pkg.price || ''}
                                        onChange={(e) => updatePackage(index, 'price', parseFloat(e.target.value) || 0)}
                                        className="pl-9"
                                    />
                                </div>
                            </div>

                            <div>
                                <Label htmlFor={`desc-${index}`}>Description</Label>
                                <Textarea
                                    id={`desc-${index}`}
                                    placeholder="What's included in this package?"
                                    value={pkg.description}
                                    onChange={(e) => updatePackage(index, 'description', e.target.value)}
                                    rows={2}
                                />
                            </div>
                        </div>
                    </div>
                ))}

                <div className="flex flex-col gap-3 pt-2">
                    <Button onClick={addPackage} variant="outline" className="w-full">
                        <Plus className="h-4 w-4 mr-2" />
                        Add Package
                    </Button>
                    <Button onClick={handleSave} disabled={saving} className="w-full">
                        {saving ? "Saving..." : "Save Pricing"}
                    </Button>
                </div>
            </CardContent>
        </Card>
    )
}
