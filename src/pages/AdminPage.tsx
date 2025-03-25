import { useState } from "react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { UserManagement } from "@/components/admin/UserManagement";
import { AdminSetup } from "@/components/admin/AdminSetup";
import { Shield, Users, Settings } from "lucide-react";
import { useAdminCheck } from "@/hooks/use-admin-check";

export default function AdminPage() {
  const [activeTab, setActiveTab] = useState("users");
  
  // Check admin status on page load
  useAdminCheck();

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold mb-2">Admin Dashboard</h1>
        <p className="text-muted-foreground">
          Manage users, teams, and system settings
        </p>
      </div>

      <Tabs defaultValue="users" value={activeTab} onValueChange={setActiveTab} className="space-y-6">
        <TabsList>
          <TabsTrigger value="users">
            <Users className="h-4 w-4 mr-2" />
            User Management
          </TabsTrigger>
          <TabsTrigger value="settings">
            <Settings className="h-4 w-4 mr-2" />
            System Settings
          </TabsTrigger>
        </TabsList>

        <TabsContent value="users">
          <UserManagement />
        </TabsContent>

        <TabsContent value="settings">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Shield className="h-5 w-5 text-amber-500" />
                Admin Setup
              </CardTitle>
              <CardDescription>
                Configure admin access for development and testing
              </CardDescription>
            </CardHeader>
            <CardContent>
              <AdminSetup />
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}