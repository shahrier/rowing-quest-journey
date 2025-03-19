import { Link, useLocation } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Sheet, SheetContent } from "@/components/ui/sheet";
import {
  Home,
  Map,
  BarChart2,
  Dumbbell,
  Users,
  Award,
  Settings,
  X,
} from "lucide-react";
import { cn } from "@/lib/utils";

interface SidebarProps {
  isOpen: boolean;
  setIsOpen: (open: boolean) => void;
}

export function Sidebar({ isOpen, setIsOpen }: SidebarProps) {
  const location = useLocation();
  const { isAdmin, isTeamManager } = useAuth();

  const routes = [
    {
      title: "Dashboard",
      href: "/",
      icon: Home,
    },
    {
      title: "Journey Map",
      href: "/journey",
      icon: Map,
    },
    {
      title: "Statistics",
      href: "/stats",
      icon: BarChart2,
    },
    {
      title: "Training",
      href: "/training",
      icon: Dumbbell,
    },
    {
      title: "Team",
      href: "/team",
      icon: Users,
    },
    {
      title: "Achievements",
      href: "/achievements",
      icon: Award,
    },
    {
      title: "Settings",
      href: "/settings",
      icon: Settings,
    },
  ];

  // Add admin route if user is admin
  if (isAdmin) {
    routes.push({
      title: "Admin",
      href: "/admin",
      icon: Settings,
    });
  }

  const isActive = (path: string) => {
    if (path === "/" && location.pathname === "/") {
      return true;
    }
    return location.pathname.startsWith(path) && path !== "/";
  };

  // Mobile sidebar (Sheet component)
  const mobileSidebar = (
    <Sheet open={isOpen} onOpenChange={setIsOpen} data-oid="gqwqg:4">
      <SheetContent side="left" className="p-0" data-oid="4fiomrc">
        <div
          className="flex h-16 items-center border-b px-4"
          data-oid="c7a29:q"
        >
          <Link
            to="/"
            className="flex items-center gap-2"
            onClick={() => setIsOpen(false)}
            data-oid="9_591wj"
          >
            <div className="relative w-8 h-8" data-oid="jx9eb8j">
              <div
                className="absolute -inset-0.5 rounded-full bg-gradient-to-r from-blue-500 to-cyan-500 blur opacity-70"
                data-oid="5t8:tri"
              ></div>
              <div
                className="relative flex items-center justify-center h-8 w-8 rounded-full bg-blue-700 text-white text-sm font-bold"
                data-oid="9:zxg-4"
              >
                R
              </div>
            </div>
            <span className="font-bold text-lg" data-oid="9j:_itd">
              RowQuest
            </span>
          </Link>
          <Button
            variant="ghost"
            size="icon"
            className="ml-auto"
            onClick={() => setIsOpen(false)}
            data-oid="l-c974c"
          >
            <X className="h-5 w-5" data-oid="yv9hpvq" />
          </Button>
        </div>
        <ScrollArea className="h-[calc(100vh-4rem)] pb-10" data-oid="upkstk4">
          <div className="px-2 py-4" data-oid="lnltj8m">
            <nav className="flex flex-col gap-1" data-oid="wp2b.12">
              {routes.map((route) => (
                <Link
                  key={route.href}
                  to={route.href}
                  onClick={() => setIsOpen(false)}
                  className={cn(
                    "flex items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium transition-colors",
                    isActive(route.href)
                      ? "bg-primary text-primary-foreground"
                      : "hover:bg-muted",
                  )}
                  data-oid="37cid2g"
                >
                  <route.icon className="h-5 w-5" data-oid="hysqt.1" />
                  {route.title}
                </Link>
              ))}
            </nav>
          </div>
        </ScrollArea>
      </SheetContent>
    </Sheet>
  );

  // Desktop sidebar
  const desktopSidebar = (
    <div className="hidden border-r bg-background md:block" data-oid="zltt1pl">
      <div className="flex h-16 items-center border-b px-4" data-oid="f-hrjt.">
        <Link to="/" className="flex items-center gap-2" data-oid="_znri7k">
          <div className="relative w-8 h-8" data-oid="t_nz-ni">
            <div
              className="absolute -inset-0.5 rounded-full bg-gradient-to-r from-blue-500 to-cyan-500 blur opacity-70"
              data-oid="2h2wumy"
            ></div>
            <div
              className="relative flex items-center justify-center h-8 w-8 rounded-full bg-blue-700 text-white text-sm font-bold"
              data-oid="s6h.5od"
            >
              R
            </div>
          </div>
          <span className="font-bold text-lg" data-oid="2fqm86q">
            RowQuest
          </span>
        </Link>
      </div>
      <ScrollArea className="h-[calc(100vh-4rem)] pb-10" data-oid="u709-fy">
        <div className="px-2 py-4" data-oid="zmhy4:s">
          <nav className="flex flex-col gap-1" data-oid="qwmi96f">
            {routes.map((route) => (
              <Link
                key={route.href}
                to={route.href}
                className={cn(
                  "flex items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium transition-colors",
                  isActive(route.href)
                    ? "bg-primary text-primary-foreground"
                    : "hover:bg-muted",
                )}
                data-oid="fo021z3"
              >
                <route.icon className="h-5 w-5" data-oid="x--gf:s" />
                {route.title}
              </Link>
            ))}
          </nav>
        </div>
      </ScrollArea>
    </div>
  );

  return (
    <>
      {mobileSidebar}
      {desktopSidebar}
    </>
  );
}
