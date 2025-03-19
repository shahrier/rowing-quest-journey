import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { LucideIcon } from "lucide-react";
import { cn } from "@/lib/utils";

interface StatsCardProps {
  title: string;
  value: string | number;
  icon: LucideIcon;
  description?: string;
  trend?: {
    value: number;
    isPositive: boolean;
  };
  className?: string;
}

export function StatsCard({
  title,
  value,
  icon: Icon,
  description,
  trend,
  className,
}: StatsCardProps) {
  return (
    <Card className={cn("overflow-hidden", className)} data-oid="rwoka:3">
      <CardHeader
        className="flex flex-row items-center justify-between pb-2"
        data-oid="-19ie9q"
      >
        <CardTitle className="text-sm font-medium" data-oid="gc5u-87">
          {title}
        </CardTitle>
        <Icon className="h-4 w-4 text-muted-foreground" data-oid="0otg1c-" />
      </CardHeader>
      <CardContent data-oid="dgzthg6">
        <div className="text-2xl font-bold" data-oid="taar8.l">
          {value}
        </div>
        {description && (
          <p className="text-xs text-muted-foreground mt-1" data-oid=":f0.w7n">
            {description}
          </p>
        )}
        {trend && (
          <div
            className={cn(
              "text-xs font-medium mt-2",
              trend.isPositive ? "text-green-500" : "text-red-500",
            )}
            data-oid="qkrfpj7"
          >
            {trend.isPositive ? "↑" : "↓"} {trend.value}%
            <span className="text-muted-foreground ml-1" data-oid="23hiz.c">
              from last week
            </span>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
