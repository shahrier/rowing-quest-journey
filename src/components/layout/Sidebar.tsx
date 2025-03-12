import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/contexts/AuthContext";
import { useAuth } from "@/contexts/AuthContext";

export function Sidebar() {
  const { signOut, isAdmin } = useAuth();
  
  const menuItems = [
    { icon: () => <span>H</span>, label: "Home", href: "/" },
    { icon: () => <span>M</span>, label: "Journey Map", href: "/journey" },
    { icon: () => <span>S</span>, label: "Stats", href: "/stats" },
    { icon: () => <span>T</span>, label: "Training", href: "/training" },
    { icon: () => <span>TM</span>, label: "Team", href: "/team" },
    { icon: () => <span>A</span>, label: "Achievements", href: "/achievements" },
    { icon: () => <span>P</span>, label: "Profile", href: "/profile" },
    { icon: () => <span>ST</span>, label: "Settings", href: "/settings" },
  ];

  // Add admin dashboard link for admin users
  if (isAdmin) {
    menuItems.push({ icon: () => <span>AD</span>, label: "Admin", href: "/admin" });
  }

  return (
    <div className="h-full flex flex-col bg-sidebar text-sidebar-foreground pt-5 pb-10 w-64">
      <div className="flex items-center gap-2 px-6 py-3">
        <div className="relative">
          <div className="absolute -inset-0.5 rounded-full bg-gradient-to-r from-ocean-500 to-energy-500 blur opacity-70 group-hover:opacity-100 transition"></div>
          <div className="relative flex items-center justify-center h-8 w-8 rounded-full bg-ocean-700 text-white font-bold">
            R
          </div>
        </div>
        <span className="text-lg font-semibold">RowQuest</span>
      </div>

      <div className="mt-10 px-3 flex-1">
        <nav className="space-y-1">
          {menuItems.map((item) => (
            <Link
              key={item.label}
              to={item.href}
              className="flex items-center gap-3 px-3 py-2 rounded-md text-sidebar-foreground hover:bg-sidebar-accent/10 transition-colors"
            >
              <item.icon />
              <span>{item.label}</span>
            </Link>
          ))}
        </nav>
      </div>

      <div className="mt-auto px-3">
        <Button
          variant="ghost"
          className="w-full justify-start text-sidebar-foreground hover:bg-sidebar-accent/10"
          onClick={signOut}
        >
          <span className="mr-2">LO</span>
          Logout
        </Button>
      </div>
    </div>
  );
}