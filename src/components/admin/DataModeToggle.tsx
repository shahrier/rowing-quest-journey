
import { useState, useEffect } from 'react';
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { useToast } from "@/hooks/use-toast";
import { Database, ToggleLeft } from "lucide-react";
import { getDataMode, toggleDataMode } from "@/data/dataService";

export function DataModeToggle() {
  const [isMockData, setIsMockData] = useState(true);
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
      <CardFooter>
        <p className="text-sm text-muted-foreground">
          {isMockData 
            ? 'Mock data is useful for demonstrations and testing. Disable it when you are ready for production.'
            : 'Real data mode shows only actual user-generated content. Mock data is hidden.'}
        </p>
      </CardFooter>
    </Card>
  );
}
