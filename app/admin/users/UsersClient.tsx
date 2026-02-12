"use client";

import { useState } from "react";
import { User, UserRole } from "@prisma/client";
import { format } from "date-fns";
import {
    Search,
    Trash2,
    ShieldAlert,
    MoreHorizontal,
    UserCog,
    UserCheck,
    Eye
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuTrigger,
    DropdownMenuLabel,
    DropdownMenuSeparator
} from "@/components/ui/dropdown-menu";
import { toast } from "sonner";
import { deleteUser, updateUserRole, getFullProfileByEmail } from "../actions";
import { UserDetailsModal } from "../components/UserDetailsModal";

// Define a type compatible with serializable props
interface SerializedUser extends Omit<User, 'createdAt' | 'updatedAt' | 'lastSeenAt'> {
    createdAt: string | Date;
    updatedAt: string | Date;
    lastSeenAt: string | Date | null;
}

interface UsersClientProps {
    initialUsers: SerializedUser[];
}

export default function UsersClient({ initialUsers }: UsersClientProps) {
    const [users, setUsers] = useState<SerializedUser[]>(initialUsers);
    const [searchTerm, setSearchTerm] = useState("");
    const [loadingId, setLoadingId] = useState<string | null>(null);
    const [selectedUser, setSelectedUser] = useState<any | null>(null);
    const [selectedCreator, setSelectedCreator] = useState<any | null>(null);
    const [isDetailsOpen, setIsDetailsOpen] = useState(false);

    const filteredUsers = users.filter(user =>
        (user.name?.toLowerCase() || "").includes(searchTerm.toLowerCase()) ||
        (user.email || "").toLowerCase().includes(searchTerm.toLowerCase())
    );

    const handleDelete = async (userId: string) => {
        if (!confirm("Are you sure you want to delete this user? This cannot be undone.")) return;

        setLoadingId(userId);
        try {
            const result = await deleteUser(userId);
            if (result.success) {
                setUsers(users.filter(u => u.id !== userId));
                toast.success("User deleted successfully");
            } else {
                toast.error("Failed to delete user");
            }
        } catch (error) {
            toast.error("An error occurred");
        } finally {
            setLoadingId(null);
        }
    };

    const handleRoleUpdate = async (userId: string, newRole: UserRole) => {
        setLoadingId(userId);
        try {
            const result = await updateUserRole(userId, newRole);
            if (result.success) {
                setUsers(users.map(u => u.id === userId ? { ...u, role: newRole } : u));
                toast.success(`User role updated to ${newRole}`);
            } else {
                toast.error("Failed to update role");
            }
        } catch (error) {
            toast.error("An error occurred");
        } finally {
            setLoadingId(null);
        }
    };

    const handleViewDetails = async (user: SerializedUser) => {
        setLoadingId(user.id);
        const loadingToast = toast.loading("Loading details...");
        try {
            const result = await getFullProfileByEmail(user.email);
            if (result.success) {
                setSelectedUser(result.user);
                setSelectedCreator(result.creator);
                setIsDetailsOpen(true);
                toast.dismiss(loadingToast);
            } else {
                toast.error("Failed to load details");
            }
        } catch (e) {
            toast.error("Error loading details");
        } finally {
            setLoadingId(null);
            toast.dismiss(loadingToast);
        }
    };

    return (
        <div className="space-y-6">
            <UserDetailsModal
                isOpen={isDetailsOpen}
                onClose={() => setIsDetailsOpen(false)}
                user={selectedUser}
                creator={selectedCreator}
                onUpdate={() => {
                    // Refresh logic if needed, currently manual refresh usually required or use router.refresh() 
                    // but here we just close modal.
                    // Ideally we should reload this user row but full reload is safer
                    // For now, let's keep it simple.
                    handleViewDetails(selectedUser); // Reload data to reflect changes
                }}
            />
            <div className="flex items-center justify-between">
                <div>
                    <h2 className="text-2xl font-bold text-gray-900">User Management</h2>
                    <p className="text-gray-500">Manage user accounts, roles, and permissions.</p>
                </div>
                <div className="relative w-72">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                    <input
                        type="text"
                        placeholder="Search users..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        className="w-full pl-10 pr-4 py-2 bg-white border border-gray-200 rounded-lg text-sm focus:ring-2 focus:ring-blue-100 focus:border-blue-500 transition-all outline-none"
                    />
                </div>
            </div>

            <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
                <div className="overflow-x-auto">
                    <table className="w-full text-sm text-left">
                        <thead className="bg-gray-50 text-xs uppercase font-bold text-gray-500 border-b border-gray-100">
                            <tr>
                                <th className="px-6 py-4">User</th>
                                <th className="px-6 py-4">Role</th>
                                <th className="px-6 py-4">Status</th>
                                <th className="px-6 py-4">Created At</th>
                                <th className="px-6 py-4 text-right">Actions</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-50">
                            {filteredUsers.map((user) => (
                                <tr key={user.id} className="hover:bg-gray-50/50 transition-colors group">
                                    <td className="px-6 py-4">
                                        <div className="flex items-center gap-3">
                                            <div className="w-8 h-8 rounded-full bg-blue-100 text-blue-600 flex items-center justify-center text-xs font-bold uppercase">
                                                {user.name ? user.name.charAt(0) : user.email.charAt(0)}
                                            </div>
                                            <div>
                                                <div className="font-bold text-gray-900">{user.name || "No Name"}</div>
                                                <div className="text-xs text-gray-500">{user.email}</div>
                                            </div>
                                        </div>
                                    </td>
                                    <td className="px-6 py-4">
                                        <Badge variant={user.role === 'ADMIN' ? 'default' : 'secondary'} className={
                                            user.role === 'ADMIN' ? 'bg-purple-100 text-purple-700 hover:bg-purple-200 border-none' :
                                                user.role === 'BRAND' ? 'bg-blue-50 text-blue-700 hover:bg-blue-100 border-none' :
                                                    'bg-amber-50 text-amber-700 hover:bg-amber-100 border-none'
                                        }>
                                            {user.role}
                                        </Badge>
                                    </td>
                                    <td className="px-6 py-4">
                                        <div className="flex items-center gap-1.5 text-xs font-bold text-green-600">
                                            <div className="w-1.5 h-1.5 rounded-full bg-green-500"></div>
                                            Active
                                        </div>
                                    </td>
                                    <td className="px-6 py-4 text-gray-500">
                                        {format(new Date(user.createdAt), "MMM d, yyyy")}
                                    </td>
                                    <td className="px-6 py-4 text-right">
                                        <DropdownMenu>
                                            <DropdownMenuTrigger asChild>
                                                <Button variant="ghost" size="sm" className="h-8 w-8 p-0" disabled={loadingId === user.id}>
                                                    <MoreHorizontal className="h-4 w-4" />
                                                </Button>
                                            </DropdownMenuTrigger>
                                            <DropdownMenuContent align="end">
                                                <DropdownMenuLabel>Actions</DropdownMenuLabel>
                                                <DropdownMenuSeparator />
                                                <DropdownMenuItem onClick={() => handleViewDetails(user)}>
                                                    <Eye className="mr-2 h-4 w-4" />
                                                    View Details
                                                </DropdownMenuItem>
                                                <DropdownMenuSeparator />
                                                <DropdownMenuItem onClick={() => handleRoleUpdate(user.id, 'ADMIN')}>
                                                    <ShieldAlert className="mr-2 h-4 w-4" />
                                                    Make Admin
                                                </DropdownMenuItem>
                                                <DropdownMenuItem onClick={() => handleRoleUpdate(user.id, 'BRAND')}>
                                                    <UserCheck className="mr-2 h-4 w-4" />
                                                    Make Brand
                                                </DropdownMenuItem>
                                                <DropdownMenuItem onClick={() => handleRoleUpdate(user.id, 'INFLUENCER')}>
                                                    <UserCog className="mr-2 h-4 w-4" />
                                                    Make Influencer
                                                </DropdownMenuItem>
                                                <DropdownMenuSeparator />
                                                <DropdownMenuItem onClick={() => handleDelete(user.id)} className="text-red-600 focus:text-red-600">
                                                    <Trash2 className="mr-2 h-4 w-4" />
                                                    Delete User
                                                </DropdownMenuItem>
                                            </DropdownMenuContent>
                                        </DropdownMenu>
                                    </td>
                                </tr>
                            ))}
                            {filteredUsers.length === 0 && (
                                <tr>
                                    <td colSpan={5} className="px-6 py-8 text-center text-gray-500">
                                        No users found matching "{searchTerm}"
                                    </td>
                                </tr>
                            )}
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    );
}
