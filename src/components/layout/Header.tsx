import { Bell, LogOut, Menu, Settings, Shield, User } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { useEffect, useState } from "react";
import { Badge } from "@/components/ui/badge";
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet";
import { Sidebar } from "./Sidebar";
import { useAuth } from "@/hooks/use-auth";
import { Link } from "react-router-dom";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

export function Header() {
  const [scrolled, setScrolled] = useState(false);
  const { user, profile, isAdmin, signOut } = useAuth();

  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 10);
    };

    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  // Generate avatar initials from user email or name
  const getInitials = () => {
    if (!user) return "JD";

    if (profile?.full_name) {
      const nameParts = profile.full_name.split(" ");
      if (nameParts.length >= 2) {
        return `${nameParts[0][0]}${nameParts[nameParts.length - 1][0]}`.toUpperCase();
      }
      return nameParts[0].substring(0, 2).toUpperCase();
    }

    if (user.email) {
      return user.email.substring(0, 2).toUpperCase();
    }

    return "RQ";
  };

  return (
    <header
      className={`sticky top-0 z-50 w-full transition-all duration-200 ${
        scrolled
          ? "bg-white/80 dark:bg-slate-900/80 backdrop-blur-md shadow-sm"
          : "bg-transparent"
      }`}
      data-oid="jypam06"
    >
      <div
        className="container flex h-16 items-center justify-between"
        data-oid="l1qrswb"
      >
        <div className="flex items-center gap-2" data-oid="kin0d:w">
          <Sheet data-oid="b3r:9sz">
            <SheetTrigger asChild data-oid="n9b1u65">
              <Button
                variant="ghost"
                size="icon"
                className="md:hidden"
                data-oid="y:badvr"
              >
                <Menu className="h-5 w-5" data-oid="u1x:i8t" />
              </Button>
            </SheetTrigger>
            <SheetContent side="left" className="p-0" data-oid="ejsid7j">
              <Sidebar data-oid="16ehxqa" />
            </SheetContent>
          </Sheet>

          <div className="flex items-center gap-2" data-oid="sbcqzc3">
            <div className="relative" data-oid="ff0qs5i">
              <div
                className="absolute -inset-0.5 rounded-full bg-gradient-to-r from-ocean-500 to-energy-500 blur opacity-70 group-hover:opacity-100 transition"
                data-oid="pa6hqm0"
              ></div>
              <div
                className="relative flex items-center justify-center h-8 w-8 rounded-full bg-ocean-700 text-white font-bold"
                data-oid="jpo9fl9"
              >
                R
              </div>
            </div>
            <span className="text-lg font-semibold" data-oid="lzat1n4">
              RowQuest
            </span>
          </div>
        </div>

        <div className="flex items-center gap-4" data-oid="72gc1zg">
          <Button
            variant="ghost"
            size="icon"
            className="relative"
            data-oid=":2r_jsp"
          >
            <Bell className="h-5 w-5" data-oid="g-w9ae-" />
            <Badge
              className="absolute -top-1 -right-1 h-5 w-5 flex items-center justify-center p-0 bg-energy-500"
              data-oid="7.6vea-"
            >
              3
            </Badge>
          </Button>

          <DropdownMenu data-oid=":sc64gb">
            <DropdownMenuTrigger asChild data-oid="88g2r_c">
              <Avatar className="cursor-pointer" data-oid="q1y5iu_">
                <AvatarImage
                  src={profile?.avatar_url || ""}
                  data-oid="upfbx2l"
                />

                <AvatarFallback
                  className="bg-ocean-100 text-ocean-700"
                  data-oid="3zz.vqs"
                >
                  {getInitials()}
                </AvatarFallback>
              </Avatar>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" data-oid="gy8tp2u">
              <DropdownMenuLabel data-oid="uk:.avu">
                {profile?.full_name || user?.email || "My Account"}
              </DropdownMenuLabel>
              <DropdownMenuSeparator data-oid="kavop3l" />
              <DropdownMenuItem asChild data-oid="rfazb1t">
                <Link
                  to="/profile"
                  className="cursor-pointer flex items-center gap-2"
                  data-oid="gkplrq_"
                >
                  <User className="h-4 w-4" data-oid="1lxx-0m" />
                  <span data-oid="fp7b2_8">Profile</span>
                </Link>
              </DropdownMenuItem>
              {isAdmin && (
                <DropdownMenuItem asChild data-oid="kwcq-a0">
                  <Link
                    to="/admin"
                    className="cursor-pointer flex items-center gap-2"
                    data-oid="xhl9_i5"
                  >
                    <Shield className="h-4 w-4" data-oid="6:pkecc" />
                    <span data-oid="ep2y9o9">Admin Panel</span>
                  </Link>
                </DropdownMenuItem>
              )}
              <DropdownMenuItem asChild data-oid="np:avz2">
                <Link
                  to="/settings"
                  className="cursor-pointer flex items-center gap-2"
                  data-oid="k3togp."
                >
                  <Settings className="h-4 w-4" data-oid="i:dlamt" />
                  <span data-oid="ct3:aw-">Settings</span>
                </Link>
              </DropdownMenuItem>
              <DropdownMenuSeparator data-oid="5t8k51:" />
              <DropdownMenuItem
                className="cursor-pointer flex items-center gap-2"
                onClick={signOut}
                data-oid="lcf695t"
              >
                <LogOut className="h-4 w-4" data-oid="dtxr:e1" />
                <span data-oid="ue_vjxh">Log out</span>
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>
    </header>
  );
}
