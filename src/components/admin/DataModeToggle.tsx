import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { useToast } from "@/hooks/use-toast";
import { Database, ToggleLeft, Trash2, RefreshCw } from "lucide-react";
import {
  getDataMode,
  toggleDataMode,
  deleteMockData,
} from "@/data/dataService";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";

export function DataModeToggle() {
  const [isMockData, setIsMockData] = useState(true);
  const [isDeleting, setIsDeleting] = useState(false);
  const { toast } = useToast();

  useEffect(() => {
    const currentMode = getDataMode();
    setIsMockData(currentMode === "mock");
  }, []);

  const handleToggle = () => {
    const newMode = toggleDataMode();
    setIsMockData(newMode === "mock");

    toast({
      title: `Switched to ${newMode === "mock" ? "Mock" : "Real"} Data`,
      description:
        newMode === "mock"
          ? "The application will now use demonstration data."
          : "The application will now use real user data only.",
    });
  };

  const handleDeleteMockData = async () => {
    setIsDeleting(true);
    try {
      await deleteMockData();
      toast({
        title: "Mock Data Deleted",
        description: "All demonstration data has been removed.",
      });
    } catch (error) {
      console.error("Error deleting mock data:", error);
      toast({
        title: "Error",
        description: "Failed to delete mock data. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsDeleting(false);
    }
  };

  return (
    <Card data-oid="5f3j89a">
      <CardHeader data-oid="v40qv_p">
        <CardTitle className="flex items-center gap-2" data-oid="o5qw03v">
          <Database className="h-5 w-5" data-oid="674:1jz" />
          Data Source Management
        </CardTitle>
        <CardDescription data-oid=":-fi2qk">
          Control whether the application uses mock data for demonstration
          purposes
        </CardDescription>
      </CardHeader>
      <CardContent data-oid="tthy8_i">
        <div className="flex flex-col space-y-4" data-oid="f-xfyv-">
          <div
            className="flex items-center justify-between rounded-lg border p-4"
            data-oid="hd.qngx"
          >
            <div className="space-y-0.5" data-oid="ph.tq.r">
              <Label className="text-base" data-oid="g:1b.g4">
                Mock Data {isMockData ? "(Enabled)" : "(Disabled)"}
              </Label>
              <p className="text-sm text-muted-foreground" data-oid="0cd0t4y">
                {isMockData
                  ? "Using demonstration data for all app features"
                  : "Using only real user data throughout the app"}
              </p>
            </div>
            <Switch
              checked={isMockData}
              onCheckedChange={handleToggle}
              data-oid="jerc3wa"
            />
          </div>
        </div>
      </CardContent>
      <CardFooter className="flex justify-between" data-oid="3wr-s_3">
        <p className="text-sm text-muted-foreground" data-oid="_f0ftk5">
          {isMockData
            ? "Mock data is useful for demonstrations and testing. Disable it when you are ready for production."
            : "Real data mode shows only actual user-generated content. Mock data is hidden."}
        </p>
        <div className="space-x-2" data-oid="krqnd9u">
          <Button
            variant="outline"
            size="sm"
            onClick={() => {
              setIsMockData(true);
              toggleDataMode();
              toast({
                title: "Mock Data Restored",
                description: "Demonstration data has been restored.",
              });
            }}
            disabled={isMockData}
            data-oid="vu7x:1r"
          >
            <RefreshCw className="h-4 w-4 mr-2" data-oid="gzjqm_u" />
            Restore Mock Data
          </Button>
          <AlertDialog data-oid="sg5rfsh">
            <AlertDialogTrigger asChild data-oid="77jqp9w">
              <Button
                variant="destructive"
                size="sm"
                disabled={isDeleting || !isMockData}
                data-oid="4:haavd"
              >
                <Trash2 className="h-4 w-4 mr-2" data-oid="zuem:xj" />
                Delete Mock Data
              </Button>
            </AlertDialogTrigger>
            <AlertDialogContent data-oid="v6so8sk">
              <AlertDialogHeader data-oid=".v_:zp3">
                <AlertDialogTitle data-oid="h_gxppf">
                  Delete Mock Data
                </AlertDialogTitle>
                <AlertDialogDescription data-oid="7e.2zo-">
                  This will permanently delete all demonstration data. This
                  action cannot be undone. Real user data will not be affected.
                </AlertDialogDescription>
              </AlertDialogHeader>
              <AlertDialogFooter data-oid="sk-1cwk">
                <AlertDialogCancel data-oid="3cr:og7">Cancel</AlertDialogCancel>
                <AlertDialogAction
                  onClick={handleDeleteMockData}
                  disabled={isDeleting}
                  data-oid="y1p24c8"
                >
                  {isDeleting ? "Deleting..." : "Delete Mock Data"}
                </AlertDialogAction>
              </AlertDialogFooter>
            </AlertDialogContent>
          </AlertDialog>
        </div>
      </CardFooter>
    </Card>
  );
}
