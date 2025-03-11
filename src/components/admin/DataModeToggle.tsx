
import { useState, useEffect } from 'react';
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { useToast } from "@/hooks/use-toast";
import { Database, ToggleLeft, Trash2, RefreshCw } from "lucide-react";
import { getDataMode, setDataMode, toggleDataMode, deleteMockData } from "@/data/dataService";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from "@/components/ui/alert-dialog";

export function DataModeToggle() {
  const [isMockData, setIsMockData] = useState(true);
  const [isDeleting, setIsDeleting] = useState(false);
  const { toast } = useToast();

  useEffect(() => {
    const currentMode = getDataMode();
    setIsMockData(currentMode === 'mock');
  }, []);

  const handleToggle = () => {
    const newMode = toggleDataMode();
    setIsMockData(newMode === 'mock');
    
    toast({
      title: `Switched to ${newMode === 'mock' ? 'Mock' : 'Real'} Data`,
      description: newMode === 'mock' 
        ? 'The application will now use demonstration data.'
        : 'The application will now use real user data only.',
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

  const handleRestoreMockData = () => {
    setIsMockData(true);
    setDataMode('mock');
    toast({
      title: "Mock Data Restored",
      description: "Demonstration data has been restored.",
    });
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Database className="h-5 w-5" />
          Data Source Management
        </CardTitle>
        <CardDescription>
          Control whether the application uses mock data for demonstration purposes
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="flex flex-col space-y-4">
          <div className="flex items-center justify-between rounded-lg border p-4">
            <div className="space-y-0.5">
              <Label className="text-base">
                Mock Data {isMockData ? '(Enabled)' : '(Disabled)'}
              </Label>
              <p className="text-sm text-muted-foreground">
                {isMockData 
                  ? 'Using demonstration data for all app features'
                  : 'Using only real user data throughout the app'}
              </p>
            </div>
            <Switch
              checked={isMockData}
              onCheckedChange={handleToggle}
            />
          </div>
        </div>
      </CardContent>
      <CardFooter className="flex justify-between">
        <p className="text-sm text-muted-foreground">
          {isMockData 
            ? 'Mock data is useful for demonstrations and testing. Disable it when you are ready for production.'
            : 'Real data mode shows only actual user-generated content. Mock data is hidden.'}
        </p>
        <div className="space-x-2">
          <Button
            variant="outline"
            size="sm"
            onClick={handleRestoreMockData}
            disabled={isMockData}
          >
            <RefreshCw className="h-4 w-4 mr-2" />
            Restore Mock Data
          </Button>
          <AlertDialog>
            <AlertDialogTrigger asChild>
              <Button 
                variant="destructive" 
                size="sm" 
                disabled={isDeleting || !isMockData}
              >
                <Trash2 className="h-4 w-4 mr-2" />
                Delete Mock Data
              </Button>
            </AlertDialogTrigger>
            <AlertDialogContent>
              <AlertDialogHeader>
                <AlertDialogTitle>Delete Mock Data</AlertDialogTitle>
                <AlertDialogDescription>
                  This will permanently delete all demonstration data. This action cannot be undone.
                  Real user data will not be affected.
                </AlertDialogDescription>
              </AlertDialogHeader>
              <AlertDialogFooter>
                <AlertDialogCancel>Cancel</AlertDialogCancel>
                <AlertDialogAction onClick={handleDeleteMockData} disabled={isDeleting}>
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
