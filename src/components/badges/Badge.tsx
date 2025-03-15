
import { Badge as UIBadge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";
import { BadgeTier } from "@/lib/supabase-types";
import { Award, Star } from "lucide-react";

interface BadgeProps {
  name: string;
  description?: string;
  tier: BadgeTier;
  earned?: boolean;
  className?: string;
}

export function Badge({ name, description, tier, earned = false, className }: BadgeProps) {
  // Define colors based on the badge tier
  const tierColors = {
    bronze: "bg-amber-700 hover:bg-amber-800 text-white",
    silver: "bg-gray-400 hover:bg-gray-500 text-white",
    gold: "bg-yellow-500 hover:bg-yellow-600 text-white",
  };

  // Define tier icons
  const tierIcons = {
    bronze: <Award className="h-3.5 w-3.5 mr-1" />,
    silver: <Award className="h-3.5 w-3.5 mr-1" />,
    gold: <Star className="h-3.5 w-3.5 mr-1" />,
  };

  return (
    <div className={cn("flex flex-col items-center", className)}>
      <UIBadge 
        className={cn(
          "text-xs px-3 py-1", 
          tierColors[tier],
          !earned && "opacity-60",
          className
        )}
      >
        {tierIcons[tier]}
        {name}
        {!earned && " (Locked)"}
      </UIBadge>
      
      {description && (
        <span className="text-xs text-muted-foreground mt-1 text-center">
          {description}
        </span>
      )}
    </div>
  );
}
