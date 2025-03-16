import { useEffect } from 'react';
import { useAuth } from '@/hooks/use-auth';
import { useNavigate } from 'react-router-dom';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { BadgeManagement } from '@/components/badges/BadgeManagement';
import { TeamManagement } from '@/components/admin/TeamManagement';
import { DataExport } from '@/components/admin/DataExport';
import { UserManagement } from '@/components/admin/UserManagement';
import { AdminSetup } from '@/components/admin/AdminSetup';
import { Award, Users, FileSpreadsheet, Settings } from 'lucide-react';

export default function Admin() {
  const { isAdmin } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    // Double-check admin status on component mount
    if (!isAdmin) {
      navigate('/');
    }
  }, [isAdmin, navigate]);

  return (
    <div className="container mx-auto p-4 space-y-6">
      <div>
        <h1 className="text-3xl font-bold mb-2">Admin Dashboard</h1>
        <p className="text-muted-foreground">
          Manage users, teams, and global settings
        </p>
      </div>

      {/* Development-only admin setup */}
      <AdminSetup />

      <Tabs defaultValue="users" className="space-y-4">
        <TabsList className="grid grid-cols-2 md:grid-cols-4 gap-2">
          <TabsTrigger value="users">
            <Users className="w-4 h-4 mr-2" />
            Users
          </TabsTrigger>
          <TabsTrigger value="teams">
            <Users className="w-4 h-4 mr-2" />
            Teams
          </TabsTrigger>
          <TabsTrigger value="badges">
            <Award className="w-4 h-4 mr-2" />
            Global Badges
          </TabsTrigger>
          <TabsTrigger value="export">
            <FileSpreadsheet className="w-4 h-4 mr-2" />
            Data Export
          </TabsTrigger>
        </TabsList>

        <TabsContent value="users" className="space-y-4">
          <UserManagement />
        </TabsContent>

        <TabsContent value="teams" className="space-y-4">
          <TeamManagement />
        </TabsContent>

        <TabsContent value="badges" className="space-y-4">
          <BadgeManagement isGlobalOnly={true} />
        </TabsContent>

        <TabsContent value="export" className="space-y-4">
          <DataExport />
        </TabsContent>
      </Tabs>
    </div>
  );
}