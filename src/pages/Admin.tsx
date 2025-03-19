import { useEffect } from "react";
import { useAuth } from "@/hooks/use-auth";
import { useNavigate } from "react-router-dom";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { BadgeManagement } from "@/components/badges/BadgeManagement";
import { TeamManagement } from "@/components/admin/TeamManagement";
import { DataExport } from "@/components/admin/DataExport";
import { UserManagement } from "@/components/admin/UserManagement";
import { AdminSetup } from "@/components/admin/AdminSetup";
import { Award, Users, FileSpreadsheet, Settings } from "lucide-react";

export default function Admin() {
  const { isAdmin } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    // Double-check admin status on component mount
    if (!isAdmin) {
      navigate("/");
    }
  }, [isAdmin, navigate]);

  return (
    <div className="container mx-auto p-4 space-y-6" data-oid="hfy.be0">
      <div data-oid="g4obgbv">
        <h1 className="text-3xl font-bold mb-2" data-oid=":d.w32w">
          Admin Dashboard
        </h1>
        <p className="text-muted-foreground" data-oid="l7jk90u">
          Manage users, teams, and global settings
        </p>
      </div>

      {/* Development-only admin setup */}
      <AdminSetup data-oid="-vd4268" />

      <Tabs defaultValue="users" className="space-y-4" data-oid="jassq2z">
        <TabsList
          className="grid grid-cols-2 md:grid-cols-4 gap-2"
          data-oid="wmbttnf"
        >
          <TabsTrigger value="users" data-oid="1mrucnb">
            <Users className="w-4 h-4 mr-2" data-oid="nkigclj" />
            Users
          </TabsTrigger>
          <TabsTrigger value="teams" data-oid="q2:wn9k">
            <Users className="w-4 h-4 mr-2" data-oid=".s88kqt" />
            Teams
          </TabsTrigger>
          <TabsTrigger value="badges" data-oid=".nr221.">
            <Award className="w-4 h-4 mr-2" data-oid="1vjmwf8" />
            Global Badges
          </TabsTrigger>
          <TabsTrigger value="export" data-oid="dshry5k">
            <FileSpreadsheet className="w-4 h-4 mr-2" data-oid="7-v0.mw" />
            Data Export
          </TabsTrigger>
        </TabsList>

        <TabsContent value="users" className="space-y-4" data-oid="05ozu7_">
          <UserManagement data-oid="og--ths" />
        </TabsContent>

        <TabsContent value="teams" className="space-y-4" data-oid="_rou.91">
          <TeamManagement data-oid="neelyta" />
        </TabsContent>

        <TabsContent value="badges" className="space-y-4" data-oid="sbs8wag">
          <BadgeManagement isGlobalOnly={true} data-oid="t00wpgh" />
        </TabsContent>

        <TabsContent value="export" className="space-y-4" data-oid="dcma_kb">
          <DataExport data-oid="eobb2xr" />
        </TabsContent>
      </Tabs>
    </div>
  );
}
