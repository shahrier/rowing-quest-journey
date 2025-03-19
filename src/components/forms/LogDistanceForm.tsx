import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { useState } from "react";
import { useToast } from "@/hooks/use-toast";
import { cn } from "@/lib/utils";

export function LogDistanceForm() {
  const [distance, setDistance] = useState("");
  const [notes, setNotes] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { toast } = useToast();

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    if (!distance || isNaN(Number(distance)) || Number(distance) <= 0) {
      toast({
        title: "Invalid distance",
        description: "Please enter a valid distance greater than 0.",
        variant: "destructive",
      });
      return;
    }

    setIsSubmitting(true);

    // Simulate API call
    setTimeout(() => {
      toast({
        title: "Distance logged successfully!",
        description: `You've added ${distance} m to your journey.`,
      });

      setDistance("");
      setNotes("");
      setIsSubmitting(false);
    }, 1000);
  };

  return (
    <Card data-oid="z0sz9.t">
      <CardHeader data-oid="ta_1kyu">
        <CardTitle className="text-lg" data-oid="b6i057k">
          Log Your Distance
        </CardTitle>
        <CardDescription data-oid="f79lz6f">
          Record your rowing progress
        </CardDescription>
      </CardHeader>
      <form onSubmit={handleSubmit} data-oid="i106bd7">
        <CardContent className="space-y-4" data-oid="wesvb9l">
          <div className="space-y-1" data-oid="24zuyz_">
            <label
              htmlFor="distance"
              className="text-sm font-medium"
              data-oid="6pzuhmq"
            >
              Distance (m)
            </label>
            <Input
              id="distance"
              type="number"
              step="1"
              min="0"
              placeholder="Enter distance in meters"
              value={distance}
              onChange={(e) => setDistance(e.target.value)}
              required
              data-oid="m:0h8mp"
            />
          </div>

          <div className="space-y-1" data-oid="e8__g0t">
            <label
              htmlFor="notes"
              className="text-sm font-medium"
              data-oid="xthq--:"
            >
              Notes (optional)
            </label>
            <Textarea
              id="notes"
              placeholder="Add any notes about your session"
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              className="resize-none"
              rows={3}
              data-oid="nve.9uh"
            />
          </div>
        </CardContent>
        <CardFooter data-oid="rlqz:zr">
          <Button
            type="submit"
            className={cn("w-full", isSubmitting && "opacity-80")}
            disabled={isSubmitting}
            data-oid="8:eo.-v"
          >
            {isSubmitting ? "Logging..." : "Log Distance"}
          </Button>
        </CardFooter>
      </form>
    </Card>
  );
}
