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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
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
    <Card data-oid="l-0bo9k">
      <CardHeader data-oid="qajvcbm">
        <CardTitle className="text-lg" data-oid=".80zvy:">
          Log Strength Training
        </CardTitle>
        <CardDescription data-oid="of5r-5a">
          Record your strength workouts
        </CardDescription>
      </CardHeader>
      <form onSubmit={handleSubmit} data-oid="bpem-bg">
        <CardContent className="space-y-4" data-oid="2rhbq84">
          <div className="space-y-1" data-oid="bvvowu7">
            <label
              htmlFor="type"
              className="text-sm font-medium"
              data-oid="l-5r4n2"
            >
              Workout Type
            </label>
            <Select value={type} onValueChange={setType} data-oid="kp6px7x">
              <SelectTrigger id="type" data-oid="9p-tdpn">
                <SelectValue
                  placeholder="Select workout type"
                  data-oid="wdrb:50"
                />
              </SelectTrigger>
              <SelectContent data-oid="s9q6fm4">
                <SelectItem value="core" data-oid="59g19p.">
                  Core Training
                </SelectItem>
                <SelectItem value="weights" data-oid="w046wc-">
                  Weight Training
                </SelectItem>
                <SelectItem value="bodyweight" data-oid="bjb31n0">
                  Bodyweight Exercises
                </SelectItem>
                <SelectItem value="erg" data-oid="8rrk:0v">
                  Ergometer Training
                </SelectItem>
                <SelectItem value="other" data-oid="kzuc4fx">
                  Other
                </SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-1" data-oid="y:7giky">
            <label
              htmlFor="duration"
              className="text-sm font-medium"
              data-oid="p_3gudt"
            >
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
              data-oid="qc3u-4v"
            />
          </div>

          <div className="space-y-1" data-oid="ki9qcrg">
            <label
              htmlFor="notes"
              className="text-sm font-medium"
              data-oid="32-09_s"
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
              data-oid="7r4w:fp"
            />
          </div>
        </CardContent>
        <CardFooter data-oid="mevwq8k">
          <Button
            type="submit"
            className={cn("w-full", isSubmitting && "opacity-80")}
            disabled={isSubmitting}
            data-oid="sgoug_s"
          >
            {isSubmitting ? "Logging..." : "Log Training Session"}
          </Button>
        </CardFooter>
      </form>
    </Card>
  );
}
