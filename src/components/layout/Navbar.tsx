import { useState } from "react";
import { Link } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Menu, User, Settings, LogOut, Moon, Sun, Award } from "lucide-react";
import { useTheme } from "@/providers/ThemeProvider";

interface NavbarProps {
  toggleSidebar: () => void;
}

export function Navbar({ toggleSidebar }: NavbarProps) {
  const { user, signOut, isAdmin } = useAuth();
  const { theme, setTheme } = useTheme();
  const [isSigningOut, setIsSigningOut] = useState(false);

  const handleSignOut = async () => {
    setIsSigningOut(true);
    await signOut();
    setIsSigningOut(false);
  };

  const getInitials = (name: string) => {
    return name
      .split(" ")
      .map((part) => part[0])
      .join("")
      .toUpperCase()
      .substring(0, 2);
  };

  return (
    <header
      className="sticky top-0 z-30 border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60"
      data-oid=".348xhi"
    >
      <div
        className="container flex h-16 items-center justify-between"
        data-oid="_jomcpi"
      >
        <div className="flex items-center gap-2" data-oid="1t5prya">
          <Button
            variant="ghost"
            size="icon"
            onClick={toggleSidebar}
            className="md:hidden"
            data-oid="-uvj0:l"
          >
            <Menu className="h-5 w-5" data-oid="cqfbcbg" />
          </Button>

          <Link to="/" className="flex items-center gap-2" data-oid="hvzl22m">
            <div className="relative w-8 h-8" data-oid="kazg2yh">
              <div
                className="absolute -inset-0.5 rounded-full bg-gradient-to-r from-blue-500 to-cyan-500 blur opacity-70"
                data-oid="c1qtrdw"
              ></div>
              <div
                className="relative flex items-center justify-center h-8 w-8 rounded-full bg-blue-700 text-white text-sm font-bold"
                data-oid="f0ympu6"
              >
                R
              </div>
            </div>
            <span
              className="font-bold text-lg hidden sm:inline-block"
              data-oid="gsgb62d"
            >
              RowQuest
            </span>
          </Link>
        </div>

        <div className="flex items-center gap-4" data-oid="1ef7m.:">
          <Button
            variant="ghost"
            size="icon"
            onClick={() => setTheme(theme === "dark" ? "light" : "dark")}
            className="rounded-full"
            data-oid="pey-ufm"
          >
            {theme === "dark" ? (
              <Sun className="h-5 w-5" data-oid="7l9iy:_" />
            ) : (
              <Moon className="h-5 w-5" data-oid="6wa43e4" />
            )}
          </Button>

          {user && (
            <DropdownMenu data-oid="f07gx-x">
              <DropdownMenuTrigger asChild data-oid="zs5viic">
                <Button
                  variant="ghost"
                  className="relative h-8 w-8 rounded-full"
                  data-oid="-q6fqf1"
                >
                  <Avatar className="h-8 w-8" data-oid="j-3ln9s">
                    <AvatarImage
                      src={user.user_metadata?.avatar_url}
                      alt={user.user_metadata?.full_name || "User"}
                      data-oid="j.p8dxc"
                    />

                    <AvatarFallback data-oid="vb6hauz">
                      {getInitials(user.user_metadata?.full_name || "User")}
                    </AvatarFallback>
                  </Avatar>
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" data-oid="j9521ej">
                <DropdownMenuLabel data-oid="9v7zahu">
                  My Account
                </DropdownMenuLabel>
                <DropdownMenuSeparator data-oid="r5x88ki" />
                <DropdownMenuItem asChild data-oid=".93gzy.">
                  <Link
                    to="/profile"
                    className="cursor-pointer"
                    data-oid="hog:laf"
                  >
                    <User className="mr-2 h-4 w-4" data-oid="ypkol_2" />
                    <span data-oid="n95d4f-">Profile</span>
                  </Link>
                </DropdownMenuItem>
                <DropdownMenuItem asChild data-oid="fsaxpbf">
                  <Link
                    to="/achievements"
                    className="cursor-pointer"
                    data-oid="iksv68y"
                  >
                    <Award className="mr-2 h-4 w-4" data-oid="2wzudcf" />
                    <span data-oid="o-3t:wd">Achievements</span>
                  </Link>
                </DropdownMenuItem>
                <DropdownMenuItem asChild data-oid="0mg96m5">
                  <Link
                    to="/settings"
                    className="cursor-pointer"
                    data-oid="myq7l.s"
                  >
                    <Settings className="mr-2 h-4 w-4" data-oid="pxu-02k" />
                    <span data-oid="640znen">Settings</span>
                  </Link>
                </DropdownMenuItem>
                {isAdmin && (
                  <DropdownMenuItem asChild data-oid="bbn_9dm">
                    <Link
                      to="/admin"
                      className="cursor-pointer"
                      data-oid="d0.0cwr"
                    >
                      <Settings className="mr-2 h-4 w-4" data-oid="upzb2_7" />
                      <span data-oid="mta_:eb">Admin</span>
                    </Link>
                  </DropdownMenuItem>
                )}
                <DropdownMenuSeparator data-oid="hzrzg5y" />
                <DropdownMenuItem
                  onClick={handleSignOut}
                  disabled={isSigningOut}
                  data-oid="t5s7gxk"
                >
                  <LogOut className="mr-2 h-4 w-4" data-oid="bghufpj" />
                  <span data-oid="03r43-v">
                    {isSigningOut ? "Signing out..." : "Sign out"}
                  </span>
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          )}
        </div>
      </div>
    </header>
  );
}
