
import { useState } from 'react';
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { useToast } from "@/hooks/use-toast";
import { Users, MapPin } from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";

export function TeamManagement() {
  const { user, isAdmin } = useAuth();
  const { toast } = useToast();
  const [teamName, setTeamName] = useState("");
  const [startLocation, setStartLocation] = useState("Boston");
  const [endLocation, setEndLocation] = useState("Rotterdam");
  const [journeyDescription, setJourneyDescription] = useState(
    "Row across the Atlantic Ocean from Boston to Rotterdam."
  );
  const [totalDistance, setTotalDistance] = useState(5556);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleCreateTeam = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!teamName) {
      toast({
        title: "Missing Information",
        description: "Please provide a team name",
        variant: "destructive",
      });
      return;
    }

    setIsSubmitting(true);
    try {
      // In a real app, this would connect to your database
      // For now, we'll just show a success message
      setTimeout(() => {
        toast({
          title: "Team Created",
          description: `Team "${teamName}" has been created successfully with a journey from ${startLocation} to ${endLocation}.`,
        });
        setIsSubmitting(false);
      }, 1000);
    } catch (error) {
      console.error("Error creating team:", error);
      toast({
        title: "Error",
        description: "Failed to create team. Please try again.",
        variant: "destructive",
      });
      setIsSubmitting(false);
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Users className="h-5 w-5" />
          Team & Journey Management
        </CardTitle>
        <CardDescription>
          Create a new team and define your rowing journey
        </CardDescription>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleCreateTeam} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="team-name">Team Name</Label>
            <Input
              id="team-name"
              placeholder="Enter team name"
              value={teamName}
              onChange={(e) => setTeamName(e.target.value)}
              required
            />
          </div>
          
          <div className="grid gap-4 md:grid-cols-2">
            <div className="space-y-2">
              <Label htmlFor="start-location">Start Location</Label>
              <div className="flex">
                <span className="flex items-center px-3 border border-r-0 rounded-l-md bg-muted">
                  <MapPin className="h-4 w-4 text-muted-foreground" />
                </span>
                <Input
                  id="start-location"
                  className="rounded-l-none"
                  value={startLocation}
                  onChange={(e) => setStartLocation(e.target.value)}
                  required
                />
              </div>
            </div>
            <div className="space-y-2">
              <Label htmlFor="end-location">End Location</Label>
              <div className="flex">
                <span className="flex items-center px-3 border border-r-0 rounded-l-md bg-muted">
                  <MapPin className="h-4 w-4 text-muted-foreground" />
                </span>
                <Input
                  id="end-location"
                  className="rounded-l-none"
                  value={endLocation}
                  onChange={(e) => setEndLocation(e.target.value)}
                  required
                />
              </div>
            </div>
          </div>
          
          <div className="space-y-2">
            <Label htmlFor="total-distance">Total Distance (km)</Label>
            <Input
              id="total-distance"
              type="number"
              min="1"
              value={totalDistance}
              onChange={(e) => setTotalDistance(Number(e.target.value))}
              required
            />
          </div>
          
          <div className="space-y-2">
            <Label htmlFor="journey-description">Journey Description</Label>
            <Textarea
              id="journey-description"
              placeholder="Describe your team's journey"
              value={journeyDescription}
              onChange={(e) => setJourneyDescription(e.target.value)}
              rows={3}
            />
          </div>
        
          <Button type="submit" className="w-full" disabled={isSubmitting}>
            {isSubmitting ? "Creating Team..." : "Create Team & Journey"}
          </Button>
        </form>
      </CardContent>
      <CardFooter>
        <p className="text-sm text-muted-foreground">
          Once created, you can invite members to join your team.
        </p>
      </CardFooter>
    </Card>
  );
}
