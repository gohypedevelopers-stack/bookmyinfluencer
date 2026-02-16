"use client"

import { useState } from "react";
import {
    Search,
    Filter,
    MoreHorizontal,
    UserPlus,
    Check
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from "@/components/ui/table";
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select";
import { toast } from "sonner";
import { assignManagerToCampaign } from "../actions";
import { useRouter } from "next/navigation";

interface AdminCampaignsClientProps {
    campaigns: any[];
    managers: any[];
}

export default function AdminCampaignsClient({ campaigns, managers }: AdminCampaignsClientProps) {
    const router = useRouter();
    const [searchQuery, setSearchQuery] = useState("");
    const [statusFilter, setStatusFilter] = useState("ALL");
    const [loadingMap, setLoadingMap] = useState<Record<string, boolean>>({});

    const filteredCampaigns = campaigns.filter(c => {
        const matchesSearch = c.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
            c.brand.companyName.toLowerCase().includes(searchQuery.toLowerCase());
        const matchesStatus = statusFilter === "ALL" || c.status === statusFilter;
        return matchesSearch && matchesStatus;
    });

    const handleAssign = async (campaignId: string, managerId: string) => {
        setLoadingMap(prev => ({ ...prev, [campaignId]: true }));
        try {
            const result = await assignManagerToCampaign(campaignId, managerId);
            if (result.success) {
                toast.success("Manager assigned successfully");
                router.refresh();
            } else {
                toast.error(result.error || "Failed to assign manager");
            }
        } catch (error) {
            toast.error("An error occurred");
        } finally {
            setLoadingMap(prev => ({ ...prev, [campaignId]: false }));
        }
    };

    return (
        <div className="space-y-6">
            <div className="flex justify-between items-center">
                <h1 className="text-2xl font-bold text-gray-900">Campaign Management</h1>
            </div>

            <div className="flex items-center gap-4 bg-white p-4 rounded-xl border border-gray-100 shadow-sm">
                <div className="relative flex-1">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                    <Input
                        placeholder="Search campaigns or brands..."
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        className="pl-9 bg-gray-50 border-gray-200"
                    />
                </div>
                <Select value={statusFilter} onValueChange={setStatusFilter}>
                    <SelectTrigger className="w-[180px]">
                        <SelectValue placeholder="Status" />
                    </SelectTrigger>
                    <SelectContent>
                        <SelectItem value="ALL">All Status</SelectItem>
                        <SelectItem value="ACTIVE">Active</SelectItem>
                        <SelectItem value="DRAFT">Draft</SelectItem>
                        <SelectItem value="COMPLETED">Completed</SelectItem>
                    </SelectContent>
                </Select>
            </div>

            <div className="bg-white rounded-xl border border-gray-100 shadow-sm overflow-hidden">
                <Table>
                    <TableHeader>
                        <TableRow className="bg-gray-50/50 hover:bg-gray-50/50">
                            <TableHead className="font-bold text-gray-500 text-xs uppercase tracking-wider">Brand</TableHead>
                            <TableHead className="font-bold text-gray-500 text-xs uppercase tracking-wider">Campaign</TableHead>
                            <TableHead className="font-bold text-gray-500 text-xs uppercase tracking-wider">Status</TableHead>
                            <TableHead className="font-bold text-gray-500 text-xs uppercase tracking-wider">Created At</TableHead>
                            <TableHead className="font-bold text-gray-500 text-xs uppercase tracking-wider">Assigned Manager</TableHead>
                            <TableHead className="text-right font-bold text-gray-500 text-xs uppercase tracking-wider">Actions</TableHead>
                        </TableRow>
                    </TableHeader>
                    <TableBody>
                        {filteredCampaigns.map((campaign) => (
                            <TableRow key={campaign.id} className="hover:bg-gray-50">
                                <TableCell>
                                    <div className="flex items-center gap-3">
                                        <div className="w-8 h-8 rounded-lg bg-gray-100 flex items-center justify-center font-bold text-xs">
                                            {campaign.brand.companyName.substring(0, 2).toUpperCase()}
                                        </div>
                                        <span className="font-medium text-gray-900">{campaign.brand.companyName}</span>
                                    </div>
                                </TableCell>
                                <TableCell className="font-medium text-gray-900">{campaign.title}</TableCell>
                                <TableCell>
                                    <span className={`px-2.5 py-1 rounded-full text-xs font-bold ${campaign.status === 'ACTIVE' ? 'bg-green-100 text-green-700' :
                                            campaign.status === 'COMPLETED' ? 'bg-blue-100 text-blue-700' :
                                                'bg-gray-100 text-gray-700'
                                        }`}>
                                        {campaign.status}
                                    </span>
                                </TableCell>
                                <TableCell className="text-gray-500 text-xs">
                                    {new Date(campaign.createdAt).toLocaleDateString()}
                                </TableCell>
                                <TableCell>
                                    <Select
                                        value={campaign.assignment?.managerId || "unassigned"}
                                        onValueChange={(val) => handleAssign(campaign.id, val)}
                                        disabled={loadingMap[campaign.id]}
                                    >
                                        <SelectTrigger className="w-[200px] h-8 text-xs border-gray-200 bg-gray-50/50">
                                            <SelectValue placeholder="Assign Manager" />
                                        </SelectTrigger>
                                        <SelectContent>
                                            <SelectItem value="unassigned" disabled>Select Manager</SelectItem>
                                            {managers.map((m) => (
                                                <SelectItem key={m.id} value={m.id}>
                                                    <div className="flex items-center gap-2">
                                                        {m.image && <img src={m.image} className="w-4 h-4 rounded-full" />}
                                                        <span>{m.name || m.email}</span>
                                                    </div>
                                                </SelectItem>
                                            ))}
                                        </SelectContent>
                                    </Select>
                                </TableCell>
                                <TableCell className="text-right">
                                    <Button variant="ghost" size="icon" className="h-8 w-8 text-gray-400">
                                        <MoreHorizontal className="w-4 h-4" />
                                    </Button>
                                </TableCell>
                            </TableRow>
                        ))}
                    </TableBody>
                </Table>
                {filteredCampaigns.length === 0 && (
                    <div className="p-10 text-center text-gray-400 text-sm">No campaigns found</div>
                )}
            </div>
        </div>
    );
}
