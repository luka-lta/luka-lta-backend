import { Tabs, TabsContent, TabsList } from "@/components/ui/tabs";
import { TabsTrigger } from "@/components/ui/tabs.tsx";
import { useState } from "react";
import ProfileOverview from "@/feature/SelfOverview/components/ProfileOverview.tsx";
import PasswordOverview from "@/feature/SelfOverview/components/PasswordOverview.tsx";
import { useSelfUser } from "@/feature/SelfOverview/hooks/useUserList.ts";
import { Card } from "@/components/ui/card";
import {Lock, User} from "lucide-react";

function SelfOverview() {
    const [activeTab, setActiveTab] = useState("profile");
    const [selfUser] = useSelfUser();

    if (selfUser.isLoading) {
        return <div>Loading...</div>;
    }

    if (selfUser.isError) {
        return <div>Error: {selfUser.error.message}</div>;
    }

    return (
        <div className="max-w-4xl mx-auto p-6 space-y-6">
            <div className="space-y-1">
                <h1 className="text-3xl font-bold tracking-tight">Account Settings</h1>
                <p className="text-muted-foreground">
                    Manage your profile information and password settings
                </p>
            </div>

            <Card className="p-6">
                <Tabs
                    defaultValue="profile"
                    value={activeTab}
                    onValueChange={setActiveTab}
                    className="space-y-6"
                >
                    {/* Tabs Navigation */}
                    <TabsList className="grid w-full grid-cols-2">
                        <TabsTrigger value="profile" className="data-[state=active]:bg-primary/10">
                            <span className="flex items-center gap-2">
                                <User className="h-4 w-4" />
                                Profile
                            </span>
                        </TabsTrigger>
                        <TabsTrigger value="password" className="data-[state=active]:bg-primary/10">
                            <span className="flex items-center gap-2">
                                <Lock className="h-4 w-4" />
                                Password
                            </span>
                        </TabsTrigger>
                    </TabsList>

                    <TabsContent value="profile">
                        <Card className="p-6 border-none shadow-none">
                            <ProfileOverview user={selfUser.data?.user ?? undefined} />
                        </Card>
                    </TabsContent>

                    <TabsContent value="password">
                        <Card className="p-6 border-none shadow-none">
                            <PasswordOverview />
                        </Card>
                    </TabsContent>
                </Tabs>
            </Card>
        </div>
    );
}

export default SelfOverview;