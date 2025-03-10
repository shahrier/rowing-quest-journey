
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
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
    <Card>
      <CardHeader>
        <CardTitle className="text-lg">Log Your Distance</CardTitle>
        <CardDescription>Record your rowing progress</CardDescription>
      </CardHeader>
      <form onSubmit={handleSubmit}>
        <CardContent className="space-y-4">
          <div className="space-y-1">
            <label htmlFor="distance" className="text-sm font-medium">
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
            />
          </div>
          
          <div className="space-y-1">
            <label htmlFor="notes" className="text-sm font-medium">
              Notes (optional)
            </label>
            <Textarea
              id="notes"
              placeholder="Add any notes about your session"
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              className="resize-none"
              rows={3}
            />
          </div>
        </CardContent>
        <CardFooter>
          <Button 
            type="submit" 
            className={cn("w-full", isSubmitting && "opacity-80")}
            disabled={isSubmitting}
          >
            {isSubmitting ? "Logging..." : "Log Distance"}
          </Button>
        </CardFooter>
      </form>
    </Card>
  );
}
