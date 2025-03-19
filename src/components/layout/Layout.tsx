import { Outlet } from "react-router-dom";
import { Navbar } from "./Navbar";
import { Sidebar } from "./Sidebar";
import { useState, useEffect } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/lib/supabase";

export function Layout() {
  const { user } = useAuth();
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [hasTeam, setHasTeam] = useState<boolean | null>(null);

  useEffect(() => {
    const checkTeam = async () => {
      if (!user) {
        setHasTeam(false);
        return;
      }

      try {
        const { data, error } = await supabase
          .from("profiles")
          .select("team_id")
          .eq("user_id", user.id)
          .single();

        if (error) throw error;
        setHasTeam(!!data.team_id);
      } catch (error) {
        console.error("Error checking team:", error);
        setHasTeam(false);
      }
    };

    checkTeam();
  }, [user]);

  const toggleSidebar = () => {
    setIsSidebarOpen(!isSidebarOpen);
  };

  return (
    <div className="flex min-h-screen bg-background" data-oid="b0a55tr">
      <Sidebar
        isOpen={isSidebarOpen}
        setIsOpen={setIsSidebarOpen}
        data-oid="tid2jm7"
      />

      <div className="flex-1 flex flex-col" data-oid="bmyjz4b">
        <Navbar toggleSidebar={toggleSidebar} data-oid="0ixhma9" />

        <main className="flex-1 p-4 md:p-6 overflow-auto" data-oid="f48u63h">
          {hasTeam === false && user ? (
            <div
              className="mb-6 p-4 bg-yellow-50 dark:bg-yellow-900/30 rounded-lg border border-yellow-200 dark:border-yellow-800"
              data-oid="0toj98h"
            >
              <h2
                className="text-lg font-semibold text-yellow-800 dark:text-yellow-300"
                data-oid="ft2zp4d"
              >
                Welcome to RowQuest!
              </h2>
              <p
                className="text-yellow-700 dark:text-yellow-400"
                data-oid="gpmww-y"
              >
                You're not part of a team yet. Please join or create a team to
                start tracking your progress.
              </p>
            </div>
          ) : null}

          <Outlet data-oid="thqkn48" />
        </main>
      </div>
    </div>
  );
}
