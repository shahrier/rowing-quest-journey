
import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import {
  Award,
  BarChart2,
  Dumbbell,
  Home,
  LogOut,
  Map,
  Settings,
  User,
  Users,
} from "lucide-react";

export function Sidebar() {
  const menuItems = [
    { icon: Home, label: "Home", href: "/" },
    { icon: Map, label: "Journey Map", href: "/journey" },
    { icon: BarChart2, label: "Stats", href: "/stats" },
    { icon: Dumbbell, label: "Training", href: "/training" },
    { icon: Users, label: "Team", href: "/team" },
    { icon: Award, label: "Achievements", href: "/achievements" },
    { icon: User, label: "Profile", href: "/profile" },
    { icon: Settings, label: "Settings", href: "/settings" },
  ];

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
              <item.icon className="h-5 w-5" />
              <span>{item.label}</span>
            </Link>
          ))}
        </nav>
      </div>

      <div className="mt-auto px-3">
        <Button
          variant="ghost"
          className="w-full justify-start text-sidebar-foreground hover:bg-sidebar-accent/10"
        >
          <LogOut className="mr-2 h-5 w-5" />
          Logout
        </Button>
      </div>
    </div>
  );
}
