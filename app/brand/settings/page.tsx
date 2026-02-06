import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Separator } from "@/components/ui/separator"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"

export default function BrandSettingsPage() {
    return (
        <div className="max-w-[1400px] mx-auto px-6 py-8">
            <h1 className="text-3xl font-bold text-gray-900 mb-8">Settings</h1>

            <Tabs defaultValue="profile" className="w-full">
                <TabsList className="mb-8">
                    <TabsTrigger value="profile">Profile Settings</TabsTrigger>
                    <TabsTrigger value="account">Account</TabsTrigger>
                    <TabsTrigger value="notifications">Notifications</TabsTrigger>
                </TabsList>

                <TabsContent value="profile">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                        <Card>
                            <CardHeader>
                                <CardTitle>Brand Profile</CardTitle>
                                <CardDescription>Update your brand's public profile information.</CardDescription>
                            </CardHeader>
                            <CardContent className="space-y-4">
                                <div className="space-y-2">
                                    <Label htmlFor="brandName">Brand Name</Label>
                                    <Input id="brandName" placeholder="Enter brand name" />
                                </div>
                                <div className="space-y-2">
                                    <Label htmlFor="website">Website</Label>
                                    <Input id="website" placeholder="https://example.com" />
                                </div>
                                <div className="space-y-2">
                                    <Label htmlFor="description">Description</Label>
                                    <Input id="description" placeholder="A brief description of your brand" />
                                </div>
                                <Button className="w-full bg-blue-600 hover:bg-blue-700">Save Changes</Button>
                            </CardContent>
                        </Card>
                    </div>
                </TabsContent>

                <TabsContent value="account">
                    <Card>
                        <CardHeader>
                            <CardTitle>Account Settings</CardTitle>
                            <CardDescription>Manage your account credentials and preferences.</CardDescription>
                        </CardHeader>
                        <CardContent>
                            <p className="text-sm text-gray-500">Account management features coming soon.</p>
                        </CardContent>
                    </Card>
                </TabsContent>

                <TabsContent value="notifications">
                    <Card>
                        <CardHeader>
                            <CardTitle>Notification Preferences</CardTitle>
                            <CardDescription>Choose how you want to be notified.</CardDescription>
                        </CardHeader>
                        <CardContent>
                            <p className="text-sm text-gray-500">Notification settings coming soon.</p>
                        </CardContent>
                    </Card>
                </TabsContent>
            </Tabs>
        </div>
    )
}
