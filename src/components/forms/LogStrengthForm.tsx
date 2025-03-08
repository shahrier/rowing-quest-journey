
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useState } from "react";
import { useToast } from "@/hooks/use-toast";
import { cn } from "@/lib/utils";

export function LogStrengthForm() {
  const [duration, setDuration] = useState("");
  const [type, setType] = useState("");
  const [notes, setNotes] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { toast } = useToast();

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!duration || isNaN(Number(duration)) || Number(duration) <= 0) {
      toast({
        title: "Invalid duration",
        description: "Please enter a valid duration greater than 0.",
        variant: "destructive",
      });
      return;
    }
    
    if (!type) {
      toast({
        title: "Missing workout type",
        description: "Please select a workout type.",
        variant: "destructive",
      });
      return;
    }
    
    setIsSubmitting(true);
    
    // Simulate API call
    setTimeout(() => {
      toast({
        title: "Strength session logged!",
        description: `You've recorded a ${duration} minute ${type} session.`,
      });
      
      setDuration("");
      setType("");
      setNotes("");
      setIsSubmitting(false);
    }, 1000);
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-lg">Log Strength Training</CardTitle>
        <CardDescription>Record your strength workouts</CardDescription>
      </CardHeader>
      <form onSubmit={handleSubmit}>
        <CardContent className="space-y-4">
          <div className="space-y-1">
            <label htmlFor="type" className="text-sm font-medium">
              Workout Type
            </label>
            <Select value={type} onValueChange={setType}>
              <SelectTrigger id="type">
                <SelectValue placeholder="Select workout type" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="core">Core Training</SelectItem>
                <SelectItem value="weights">Weight Training</SelectItem>
                <SelectItem value="bodyweight">Bodyweight Exercises</SelectItem>
                <SelectItem value="erg">Ergometer Training</SelectItem>
                <SelectItem value="other">Other</SelectItem>
              </SelectContent>
            </Select>
          </div>
          
          <div className="space-y-1">
            <label htmlFor="duration" className="text-sm font-medium">
              Duration (minutes)
            </label>
            <Input
              id="duration"
              type="number"
              min="1"
              placeholder="Enter duration in minutes"
              value={duration}
              onChange={(e) => setDuration(e.target.value)}
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
            {isSubmitting ? "Logging..." : "Log Training Session"}
          </Button>
        </CardFooter>
      </form>
    </Card>
  );
}
