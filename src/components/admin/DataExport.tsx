import { useState } from "react";
import { supabase } from "@/lib/supabase";
import { useToast } from "@/hooks/use-toast";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Checkbox } from "@/components/ui/checkbox";
import { Label } from "@/components/ui/label";
import { FileDown, FileSpreadsheet, FileText } from "lucide-react";
import { useAuth } from "@/hooks/use-auth";

export function DataExport() {
  const { isAdmin, teamId } = useAuth();
  const { toast } = useToast();
  const [dataType, setDataType] = useState("activities");
  const [fileFormat, setFileFormat] = useState("csv");
  const [isLoading, setIsLoading] = useState(false);
  const [includeAllTeams, setIncludeAllTeams] = useState(false);
  const [dateRange, setDateRange] = useState("all");

  const handleExport = async () => {
    setIsLoading(true);

    try {
      let query = supabase.from(dataType);

      // Apply team filter if not including all teams
      if (!includeAllTeams && teamId && !isAdmin) {
        // For team-specific data
        if (dataType === "activities" || dataType === "media") {
          // For activities, we need to join with profiles to get team_id
          const { data: teamMembers } = await supabase
            .from("profiles")
            .select("user_id")
            .eq("team_id", teamId);

          if (teamMembers && teamMembers.length > 0) {
            const userIds = teamMembers.map((member) => member.user_id);
            query = query.in("user_id", userIds);
          }
        } else if (dataType === "badges") {
          // For badges, filter by team_id directly
          query = query.eq("team_id", teamId);
        }
      }

      // Apply date range filter
      if (
        dateRange !== "all" &&
        (dataType === "activities" || dataType === "media")
      ) {
        const now = new Date();
        let startDate;

        switch (dateRange) {
          case "week":
            startDate = new Date(now.setDate(now.getDate() - 7));
            break;
          case "month":
            startDate = new Date(now.setMonth(now.getMonth() - 1));
            break;
          case "year":
            startDate = new Date(now.setFullYear(now.getFullYear() - 1));
            break;
        }

        query = query.gte("created_at", startDate.toISOString());
      }

      // Get the data
      const { data, error } = await query.select();

      if (error) throw error;

      if (!data || data.length === 0) {
        toast({
          title: "No data to export",
          description: "There is no data matching your criteria",
          variant: "destructive",
        });
        setIsLoading(false);
        return;
      }

      // Convert data to the selected format
      let fileContent;
      let fileName;
      let fileType;

      switch (fileFormat) {
        case "csv":
          fileContent = convertToCSV(data);
          fileName = `${dataType}_export_${new Date().toISOString()}.csv`;
          fileType = "text/csv";
          break;
        case "json":
          fileContent = JSON.stringify(data, null, 2);
          fileName = `${dataType}_export_${new Date().toISOString()}.json`;
          fileType = "application/json";
          break;
        case "excel":
          // For Excel, we'll use CSV as a simple approach
          // In a real app, you might use a library like xlsx
          fileContent = convertToCSV(data);
          fileName = `${dataType}_export_${new Date().toISOString()}.csv`;
          fileType = "text/csv";
          break;
      }

      // Create a download link
      const blob = new Blob([fileContent], { type: fileType });
      const url = URL.createObjectURL(blob);
      const link = document.createElement("a");
      link.href = url;
      link.download = fileName;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);

      toast({
        title: "Export successful",
        description: `${dataType} data has been exported as ${fileFormat.toUpperCase()}`,
      });
    } catch (error) {
      console.error("Error exporting data:", error);
      toast({
        title: "Export failed",
        description: "There was an error exporting the data",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  // Helper function to convert data to CSV
  const convertToCSV = (data: any[]) => {
    if (!data || data.length === 0) return "";

    const headers = Object.keys(data[0]);
    const headerRow = headers.join(",");

    const rows = data.map((item) => {
      return headers
        .map((header) => {
          const value = item[header];
          // Handle different data types
          if (value === null || value === undefined) return "";
          if (typeof value === "object") return JSON.stringify(value);
          return value;
        })
        .join(",");
    });

    return [headerRow, ...rows].join("\\n");
  };

  return (
    <Card data-oid="hlxsfz5">
      <CardHeader data-oid="0b0p6ga">
        <CardTitle data-oid="bu8g6o:">Data Export</CardTitle>
        <CardDescription data-oid="b2o..ee">
          Export data for analysis or backup purposes
        </CardDescription>
      </CardHeader>
      <CardContent data-oid="k0khaf1">
        <div className="grid gap-6" data-oid="1t0m1ct">
          <div className="grid gap-3" data-oid="h1xmw3q">
            <Label data-oid="2xjfzkn">Data Type</Label>
            <Select
              value={dataType}
              onValueChange={setDataType}
              data-oid="eiarop2"
            >
              <SelectTrigger data-oid="cfdvg-n">
                <SelectValue
                  placeholder="Select data type"
                  data-oid="kj9fnyd"
                />
              </SelectTrigger>
              <SelectContent data-oid="bj9on-0">
                <SelectItem value="activities" data-oid="jnu:gfq">
                  Rowing & Strength Activities
                </SelectItem>
                <SelectItem value="badges" data-oid="fie25tn">
                  Badges & Achievements
                </SelectItem>
                <SelectItem value="media" data-oid="wvhdk61">
                  Photos & Videos
                </SelectItem>
                {isAdmin && (
                  <SelectItem value="profiles" data-oid="_joae69">
                    User Profiles
                  </SelectItem>
                )}
                {isAdmin && (
                  <SelectItem value="teams" data-oid="5rb42:d">
                    Teams
                  </SelectItem>
                )}
              </SelectContent>
            </Select>
          </div>

          <div className="grid gap-3" data-oid="etxv-dt">
            <Label data-oid="089:k1l">File Format</Label>
            <Select
              value={fileFormat}
              onValueChange={setFileFormat}
              data-oid="tpfhju2"
            >
              <SelectTrigger data-oid="fi:8e_c">
                <SelectValue
                  placeholder="Select file format"
                  data-oid="h9dmz_5"
                />
              </SelectTrigger>
              <SelectContent data-oid="s:ioicy">
                <SelectItem value="csv" data-oid="tz37fri">
                  CSV
                </SelectItem>
                <SelectItem value="json" data-oid=".mhz17-">
                  JSON
                </SelectItem>
                <SelectItem value="excel" data-oid="2-e9tx5">
                  Excel
                </SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="grid gap-3" data-oid="h.m67rc">
            <Label data-oid="ngyiven">Date Range</Label>
            <Select
              value={dateRange}
              onValueChange={setDateRange}
              data-oid="irb7f_c"
            >
              <SelectTrigger data-oid="1a::9_d">
                <SelectValue
                  placeholder="Select date range"
                  data-oid="qdbasyh"
                />
              </SelectTrigger>
              <SelectContent data-oid="rsr9mz7">
                <SelectItem value="all" data-oid="i4i8s1r">
                  All Time
                </SelectItem>
                <SelectItem value="week" data-oid="15cjai-">
                  Last 7 Days
                </SelectItem>
                <SelectItem value="month" data-oid="_wc.ktx">
                  Last 30 Days
                </SelectItem>
                <SelectItem value="year" data-oid=".q1ec1h">
                  Last Year
                </SelectItem>
              </SelectContent>
            </Select>
          </div>

          {isAdmin && (
            <div className="flex items-center space-x-2" data-oid="t72l31h">
              <Checkbox
                id="all-teams"
                checked={includeAllTeams}
                onCheckedChange={(checked) =>
                  setIncludeAllTeams(checked as boolean)
                }
                data-oid="ptu.1rv"
              />

              <Label htmlFor="all-teams" data-oid="t31.fs5">
                Include data from all teams
              </Label>
            </div>
          )}

          <Button
            onClick={handleExport}
            disabled={isLoading}
            className="w-full"
            data-oid="ts80yl:"
          >
            {isLoading ? (
              "Exporting..."
            ) : (
              <>
                <FileDown className="mr-2 h-4 w-4" data-oid="gla4om6" />
                Export{" "}
                {dataType === "activities"
                  ? "Activities"
                  : dataType === "badges"
                    ? "Badges"
                    : dataType === "media"
                      ? "Media"
                      : dataType === "profiles"
                        ? "Profiles"
                        : "Teams"}
              </>
            )}
          </Button>

          <div className="text-sm text-muted-foreground" data-oid="stqjwp7">
            <p data-oid="rnf8_rd">Available export formats:</p>
            <div
              className="flex items-center mt-2 space-x-4"
              data-oid="8vf707."
            >
              <div className="flex items-center" data-oid="holj6op">
                <FileSpreadsheet className="h-4 w-4 mr-1" data-oid="3hmjedt" />
                <span data-oid="jv-umqg">CSV/Excel</span>
              </div>
              <div className="flex items-center" data-oid="znkjkzt">
                <FileText className="h-4 w-4 mr-1" data-oid="k9hbq8a" />
                <span data-oid="f6whl-t">JSON</span>
              </div>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
