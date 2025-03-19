import { useState, useEffect } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/lib/supabase";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { MapPin, Flag, Navigation } from "lucide-react";
import { JourneyMap } from "./JourneyMap";

interface Checkpoint {
  id: string;
  name: string;
  description: string | null;
  distance_from_start: number;
  latitude: number;
  longitude: number;
  is_reached: boolean;
  reached_at: string | null;
}

interface Team {
  id: string;
  name: string;
  journey_name: string;
  start_location: string;
  end_location: string;
  total_distance_km: number;
  current_distance_km: number;
}

export function JourneyProgress() {
  const { user, teamId } = useAuth();
  const [team, setTeam] = useState<Team | null>(null);
  const [checkpoints, setCheckpoints] = useState<Checkpoint[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [nextCheckpoint, setNextCheckpoint] = useState<Checkpoint | null>(null);
  const [completionPercentage, setCompletionPercentage] = useState(0);
  const [distanceToNext, setDistanceToNext] = useState(0);

  useEffect(() => {
    if (user && teamId) {
      fetchTeamData();
      fetchCheckpoints();
    } else {
      setIsLoading(false);
    }
  }, [user, teamId]);

  const fetchTeamData = async () => {
    try {
      const { data, error } = await supabase
        .from("teams")
        .select("*")
        .eq("id", teamId)
        .single();

      if (error) throw error;
      setTeam(data);

      if (data) {
        const percentage = Math.min(
          100,
          Math.round((data.current_distance_km / data.total_distance_km) * 100),
        );
        setCompletionPercentage(percentage);
      }
    } catch (error) {
      console.error("Error fetching team data:", error);
    }
  };

  const fetchCheckpoints = async () => {
    try {
      setIsLoading(true);

      const { data, error } = await supabase
        .from("journey_checkpoints")
        .select("*")
        .eq("team_id", teamId)
        .order("distance_from_start", { ascending: true });

      if (error) throw error;

      setCheckpoints(data || []);

      // Find the next checkpoint
      if (data && team) {
        const next = data.find(
          (cp) => cp.distance_from_start > team.current_distance_km,
        );
        if (next) {
          setNextCheckpoint(next);
          setDistanceToNext(
            Math.round(next.distance_from_start - team.current_distance_km),
          );
        }
      }
    } catch (error) {
      console.error("Error fetching checkpoints:", error);
    } finally {
      setIsLoading(false);
    }
  };

  if (isLoading) {
    return <div data-oid="m8125co">Loading journey progress...</div>;
  }

  if (!team || !teamId) {
    return (
      <Card data-oid="ztn6c_-">
        <CardHeader data-oid="6e3c9qe">
          <CardTitle data-oid="-hpexqd">Journey Progress</CardTitle>
          <CardDescription data-oid="i90lkdu">
            Join a team to track your rowing journey
          </CardDescription>
        </CardHeader>
        <CardContent className="text-center py-8" data-oid="1-66y5a">
          <p data-oid="ik0ymds">
            You need to be part of a team to view journey progress.
          </p>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card data-oid="x0sp5hg">
      <CardHeader data-oid="rp41xzu">
        <CardTitle data-oid="zj7jvgx">{team.journey_name}</CardTitle>
        <CardDescription data-oid="0t_2lih">
          From {team.start_location} to {team.end_location}
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-6" data-oid="lajc_8m">
        <div className="space-y-2" data-oid="0tcm1_d">
          <div className="flex justify-between text-sm" data-oid="78mgf7e">
            <div className="flex items-center" data-oid="dih0l6w">
              <MapPin className="h-4 w-4 mr-1" data-oid="t0-um67" />
              <span data-oid="v7zvpob">{team.start_location}</span>
            </div>
            <span data-oid="5gb1cp0">{completionPercentage}% complete</span>
            <div className="flex items-center" data-oid="dlryu.i">
              <span data-oid="va2y8bh">{team.end_location}</span>
              <Flag className="h-4 w-4 ml-1" data-oid="-lhp7f-" />
            </div>
          </div>
          <Progress
            value={completionPercentage}
            className="h-2"
            data-oid="b-onhbe"
          />

          <div
            className="flex justify-between text-sm text-muted-foreground"
            data-oid="qob1u.b"
          >
            <span data-oid="22mccqg">0 km</span>
            <span data-oid="63o0.md">
              {team.current_distance_km.toLocaleString()} km
            </span>
            <span data-oid="dghaepi">
              {team.total_distance_km.toLocaleString()} km
            </span>
          </div>
        </div>

        {nextCheckpoint && (
          <div className="bg-muted p-4 rounded-lg" data-oid="4awndn0">
            <div className="flex items-start gap-3" data-oid="3i339l0">
              <div
                className="bg-primary text-primary-foreground p-2 rounded-full"
                data-oid="wogouwl"
              >
                <Navigation className="h-5 w-5" data-oid="gcqoy_4" />
              </div>
              <div data-oid="o0pdffs">
                <h3 className="font-medium" data-oid="n:p55:a">
                  Next Checkpoint: {nextCheckpoint.name}
                </h3>
                <p
                  className="text-sm text-muted-foreground mt-1"
                  data-oid="vf-lpk9"
                >
                  {nextCheckpoint.description ||
                    `Approaching ${nextCheckpoint.name}`}
                </p>
                <p className="text-sm font-medium mt-2" data-oid="uik.20p">
                  {distanceToNext.toLocaleString()} km to go
                </p>
              </div>
            </div>
          </div>
        )}

        <JourneyMap
          checkpoints={checkpoints}
          currentDistance={team.current_distance_km}
          totalDistance={team.total_distance_km}
          data-oid="tfn20cp"
        />

        <div className="space-y-2" data-oid="l7ncrqx">
          <h3 className="font-medium" data-oid="d9mlgl:">
            Checkpoints
          </h3>
          <div className="space-y-3" data-oid="wis-_ns">
            {checkpoints.map((checkpoint, index) => {
              const isReached =
                team.current_distance_km >= checkpoint.distance_from_start;
              const isCurrent = nextCheckpoint?.id === checkpoint.id;

              return (
                <div
                  key={checkpoint.id}
                  className={`flex items-center gap-3 p-2 rounded-md ${
                    isReached
                      ? "bg-green-50 dark:bg-green-950"
                      : isCurrent
                        ? "bg-blue-50 dark:bg-blue-950"
                        : ""
                  }`}
                  data-oid="ioltaz4"
                >
                  <div
                    className={`w-8 h-8 rounded-full flex items-center justify-center ${
                      isReached
                        ? "bg-green-100 text-green-700 dark:bg-green-900 dark:text-green-300"
                        : "bg-gray-100 text-gray-500 dark:bg-gray-800"
                    }`}
                    data-oid="f3bd2w4"
                  >
                    {index + 1}
                  </div>
                  <div className="flex-1" data-oid="8qt-187">
                    <div className="flex justify-between" data-oid="j22b-.s">
                      <span className="font-medium" data-oid="c2ya9r2">
                        {checkpoint.name}
                      </span>
                      <span
                        className="text-sm text-muted-foreground"
                        data-oid="u7fatia"
                      >
                        {checkpoint.distance_from_start} km
                      </span>
                    </div>
                    {isReached && checkpoint.reached_at && (
                      <div
                        className="text-xs text-green-600 dark:text-green-400"
                        data-oid="wmsmq.s"
                      >
                        Reached on{" "}
                        {new Date(checkpoint.reached_at).toLocaleDateString()}
                      </div>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
