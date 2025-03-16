import { Link, useLocation } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { Button } from '@/components/ui/button';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Sheet, SheetContent } from '@/components/ui/sheet';
import { 
  Home, 
  Map, 
  BarChart2, 
  Dumbbell, 
  Users, 
  Award, 
  Settings, 
  X 
} from 'lucide-react';
import { cn } from '@/lib/utils';

interface SidebarProps {
  isOpen: boolean;
  setIsOpen: (open: boolean) => void;
}

export function Sidebar({ isOpen, setIsOpen }: SidebarProps) {
  const location = useLocation();
  const { isAdmin, isTeamManager } = useAuth();

  const routes = [
    {
      title: 'Dashboard',
      href: '/',
      icon: Home,
    },
    {
      title: 'Journey Map',
      href: '/journey',
      icon: Map,
    },
    {
      title: 'Statistics',
      href: '/stats',
      icon: BarChart2,
    },
    {
      title: 'Training',
      href: '/training',
      icon: Dumbbell,
    },
    {
      title: 'Team',
      href: '/team',
      icon: Users,
    },
    {
      title: 'Achievements',
      href: '/achievements',
      icon: Award,
    },
    {
      title: 'Settings',
      href: '/settings',
      icon: Settings,
    },
  ];

  // Add admin route if user is admin
  if (isAdmin) {
    routes.push({
      title: 'Admin',
      href: '/admin',
      icon: Settings,
    });
  }

  const isActive = (path: string) => {
    if (path === '/' && location.pathname === '/') {
      return true;
    }
    return location.pathname.startsWith(path) && path !== '/';
  };

  // Mobile sidebar (Sheet component)
  const mobileSidebar = (
    <Sheet open={isOpen} onOpenChange={setIsOpen}>
      <SheetContent side="left" className="p-0">
        <div className="flex h-16 items-center border-b px-4">
          <Link to="/" className="flex items-center gap-2" onClick={() => setIsOpen(false)}>
            <div className="relative w-8 h-8">
              <div className="absolute -inset-0.5 rounded-full bg-gradient-to-r from-blue-500 to-cyan-500 blur opacity-70"></div>
              <div className="relative flex items-center justify-center h-8 w-8 rounded-full bg-blue-700 text-white text-sm font-bold">
                R
              </div>
            </div>
            <span className="font-bold text-lg">RowQuest</span>
          </Link>
          <Button variant="ghost" size="icon" className="ml-auto" onClick={() => setIsOpen(false)}>
            <X className="h-5 w-5" />
          </Button>
        </div>
        <ScrollArea className="h-[calc(100vh-4rem)] pb-10">
          <div className="px-2 py-4">
            <nav className="flex flex-col gap-1">
              {routes.map((route) => (
                <Link
                  key={route.href}
                  to={route.href}
                  onClick={() => setIsOpen(false)}
                  className={cn(
                    'flex items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium transition-colors',
                    isActive(route.href)
                      ? 'bg-primary text-primary-foreground'
                      : 'hover:bg-muted'
                  )}
                >
                  <route.icon className="h-5 w-5" />
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
    <div className="hidden border-r bg-background md:block">
      <div className="flex h-16 items-center border-b px-4">
        <Link to="/" className="flex items-center gap-2">
          <div className="relative w-8 h-8">
            <div className="absolute -inset-0.5 rounded-full bg-gradient-to-r from-blue-500 to-cyan-500 blur opacity-70"></div>
            <div className="relative flex items-center justify-center h-8 w-8 rounded-full bg-blue-700 text-white text-sm font-bold">
              R
            </div>
          </div>
          <span className="font-bold text-lg">RowQuest</span>
        </Link>
      </div>
      <ScrollArea className="h-[calc(100vh-4rem)] pb-10">
        <div className="px-2 py-4">
          <nav className="flex flex-col gap-1">
            {routes.map((route) => (
              <Link
                key={route.href}
                to={route.href}
                className={cn(
                  'flex items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium transition-colors',
                  isActive(route.href)
                    ? 'bg-primary text-primary-foreground'
                    : 'hover:bg-muted'
                )}
              >
                <route.icon className="h-5 w-5" />
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