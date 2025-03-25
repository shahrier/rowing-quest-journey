import { Link, useLocation } from "react-router-dom";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Sheet, SheetContent } from "@/components/ui/sheet";
import { useAuth } from "@/hooks/use-auth";
import {
  Home,
  Users,
  Settings,
  User,
  Shield,
  HelpCircle,
  X,
} from "lucide-react";

interface SidebarProps {
  isOpen: boolean;
  setIsOpen: (open: boolean) => void;
}

export function Sidebar({ isOpen, setIsOpen }: SidebarProps) {
  const { user, isAdmin } = useAuth();
  const location = useLocation();

  const routes = [
    {
      label: "Dashboard",
      icon: Home,
      href: "/",
      requireAuth: true,
    },
    {
      label: "Team",
      icon: Users,
      href: "/team",
      requireAuth: true,
    },
    {
      label: "Profile",
      icon: User,
      href: "/profile",
      requireAuth: true,
    },
    {
      label: "Settings",
      icon: Settings,
      href: "/settings",
      requireAuth: true,
    },
    {
      label: "Admin",
      icon: Shield,
      href: "/admin",
      requireAuth: true,
      requireAdmin: true,
    },
    {
      label: "Troubleshooting",
      icon: HelpCircle,
      href: "/troubleshooting",
      requireAuth: false,
    },
  ];

  const filteredRoutes = routes.filter((route) => {
    if (route.requireAuth && !user) return false;
    if (route.requireAdmin && !isAdmin) return false;
    return true;
  });

  return (
    <>
      {/* Mobile Sidebar */}
      <Sheet open={isOpen} onOpenChange={setIsOpen}>
        <SheetContent side="left" className="p-0">
          <div className="flex h-16 items-center border-b px-4">
            <Link to="/" className="flex items-center gap-2" onClick={() => setIsOpen(false)}>
              <div className="relative w-8 h-8">
                <div className="absolute -inset-1 rounded-full bg-gradient-to-r from-blue-500 to-green-500 blur opacity-70"></div>
                <div className="relative flex items-center justify-center h-8 w-8 rounded-full bg-blue-700 text-white text-sm font-bold">
                  R
                </div>
              </div>
              <span className="font-bold">RowQuest</span>
            </Link>
            <Button
              variant="ghost"
              size="icon"
              className="ml-auto"
              onClick={() => setIsOpen(false)}
            >
              <X className="h-5 w-5" />
            </Button>
          </div>
          <ScrollArea className="h-[calc(100vh-4rem)] pb-10">
            <div className="flex flex-col gap-2 p-4">
              {filteredRoutes.map((route) => (
                <Button
                  key={route.href}
                  variant={location.pathname === route.href ? "secondary" : "ghost"}
                  className={cn(
                    "justify-start",
                    location.pathname === route.href && "bg-secondary"
                  )}
                  asChild
                  onClick={() => setIsOpen(false)}
                >
                  <Link to={route.href}>
                    <route.icon className="mr-2 h-5 w-5" />
                    {route.label}
                  </Link>
                </Button>
              ))}
            </div>
          </ScrollArea>
        </SheetContent>
      </Sheet>

      {/* Desktop Sidebar */}
      <div className="hidden border-r bg-background md:block">
        <div className="flex h-16 items-center border-b px-4">
          <Link to="/" className="flex items-center gap-2">
            <div className="relative w-8 h-8">
              <div className="absolute -inset-1 rounded-full bg-gradient-to-r from-blue-500 to-green-500 blur opacity-70"></div>
              <div className="relative flex items-center justify-center h-8 w-8 rounded-full bg-blue-700 text-white text-sm font-bold">
                R
              </div>
            </div>
            <span className="font-bold">RowQuest</span>
          </Link>
        </div>
        <ScrollArea className="h-[calc(100vh-4rem)] w-64">
          <div className="flex flex-col gap-2 p-4">
            {filteredRoutes.map((route) => (
              <Button
                key={route.href}
                variant={location.pathname === route.href ? "secondary" : "ghost"}
                className={cn(
                  "justify-start",
                  location.pathname === route.href && "bg-secondary"
                )}
                asChild
              >
                <Link to={route.href}>
                  <route.icon className="mr-2 h-5 w-5" />
                  {route.label}
                </Link>
              </Button>
            ))}
          </div>
        </ScrollArea>
      </div>
    </>
  );
}