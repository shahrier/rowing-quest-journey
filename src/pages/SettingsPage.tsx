import { useState } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/lib/supabase';
import { useToast } from '@/hooks/use-toast';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Bell, Lock, Smartphone, Moon } from 'lucide-react';
import { useTheme } from '@/providers/ThemeProvider';

export default function SettingsPage() {
  const { user } = useAuth();
  const { toast } = useToast();
  const { theme, setTheme } = useTheme();
  
  // Password change
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [isChangingPassword, setIsChangingPassword] = useState(false);
  
  // Notification settings
  const [emailNotifications, setEmailNotifications] = useState(true);
  const [achievementNotifications, setAchievementNotifications] = useState(true);
  const [teamUpdates, setTeamUpdates] = useState(true);
  const [isSavingNotifications, setIsSavingNotifications] = useState(false);
  
  // App settings
  const [installPromptShown, setInstallPromptShown] = useState(false);
  const [deferredPrompt, setDeferredPrompt] = useState<any>(null);

  // Listen for the beforeinstallprompt event
  useState(() => {
    const handleBeforeInstallPrompt = (e: Event) => {
      // Prevent Chrome 67 and earlier from automatically showing the prompt
      e.preventDefault();
      // Stash the event so it can be triggered later
      setDeferredPrompt(e);
      setInstallPromptShown(true);
    };

    window.addEventListener('beforeinstallprompt', handleBeforeInstallPrompt);

    return () => {
      window.removeEventListener('beforeinstallprompt', handleBeforeInstallPrompt);
    };
  });

  const handleChangePassword = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (newPassword !== confirmPassword) {
      toast({
        title: 'Passwords do not match',
        description: 'Please make sure your new password and confirmation match',
        variant: 'destructive',
      });
      return;
    }
    
    if (newPassword.length < 6) {
      toast({
        title: 'Password too short',
        description: 'Your new password must be at least 6 characters long',
        variant: 'destructive',
      });
      return;
    }
    
    setIsChangingPassword(true);
    try {
      const { error } = await supabase.auth.updateUser({
        password: newPassword,
      });

      if (error) throw error;
      
      toast({
        title: 'Password updated',
        description: 'Your password has been changed successfully',
      });
      
      // Reset form
      setCurrentPassword('');
      setNewPassword('');
      setConfirmPassword('');
    } catch (error) {
      console.error('Error changing password:', error);
      toast({
        title: 'Error',
        description: 'Failed to change password. Please try again.',
        variant: 'destructive',
      });
    } finally {
      setIsChangingPassword(false);
    }
  };

  const handleSaveNotifications = async () => {
    setIsSavingNotifications(true);
    try {
      // In a real app, you would save these preferences to the database
      // For now, we'll just show a success message
      setTimeout(() => {
        toast({
          title: 'Preferences saved',
          description: 'Your notification preferences have been updated',
        });
        setIsSavingNotifications(false);
      }, 1000);
    } catch (error) {
      console.error('Error saving notification preferences:', error);
      toast({
        title: 'Error',
        description: 'Failed to save preferences',
        variant: 'destructive',
      });
      setIsSavingNotifications(false);
    }
  };

  const handleInstallApp = async () => {
    if (!deferredPrompt) {
      // The deferred prompt isn't available
      // This could happen if the user has already installed the app
      // or if the browser doesn't support installation
      toast({
        title: 'Installation not available',
        description: 'You can install this app from your browser menu',
      });
      return;
    }

    // Show the install prompt
    deferredPrompt.prompt();
    
    // Wait for the user to respond to the prompt
    const { outcome } = await deferredPrompt.userChoice;
    
    // We no longer need the prompt
    setDeferredPrompt(null);
    
    if (outcome === 'accepted') {
      toast({
        title: 'Thank you!',
        description: 'RowQuest has been installed on your device',
      });
    }
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold mb-2">Settings</h1>
        <p className="text-muted-foreground">
          Manage your account settings and preferences
        </p>
      </div>
      
      <Tabs defaultValue="account" className="space-y-6">
        <TabsList>
          <TabsTrigger value="account">
            <Lock className="h-4 w-4 mr-2" />
            Account
          </TabsTrigger>
          <TabsTrigger value="notifications">
            <Bell className="h-4 w-4 mr-2" />
            Notifications
          </TabsTrigger>
          <TabsTrigger value="appearance">
            <Moon className="h-4 w-4 mr-2" />
            Appearance
          </TabsTrigger>
          <TabsTrigger value="app">
            <Smartphone className="h-4 w-4 mr-2" />
            App
          </TabsTrigger>
        </TabsList>
        
        <TabsContent value="account">
          <Card>
            <CardHeader>
              <CardTitle>Password</CardTitle>
              <CardDescription>
                Change your password to keep your account secure
              </CardDescription>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleChangePassword} className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="current-password">Current Password</Label>
                  <Input
                    id="current-password"
                    type="password"
                    value={currentPassword}
                    onChange={(e) => setCurrentPassword(e.target.value)}
                    required
                  />
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="new-password">New Password</Label>
                  <Input
                    id="new-password"
                    type="password"
                    value={newPassword}
                    onChange={(e) => setNewPassword(e.target.value)}
                    required
                  />
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="confirm-password">Confirm New Password</Label>
                  <Input
                    id="confirm-password"
                    type="password"
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    required
                  />
                </div>
                
                <Button type="submit" disabled={isChangingPassword}>
                  {isChangingPassword ? 'Changing Password...' : 'Change Password'}
                </Button>
              </form>
            </CardContent>
          </Card>
        </TabsContent>
        
        <TabsContent value="notifications">
          <Card>
            <CardHeader>
              <CardTitle>Notification Preferences</CardTitle>
              <CardDescription>
                Choose what notifications you want to receive
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <div className="space-y-0.5">
                    <Label htmlFor="email-notifications">Email Notifications</Label>
                    <p className="text-sm text-muted-foreground">
                      Receive emails about your account activity
                    </p>
                  </div>
                  <Switch
                    id="email-notifications"
                    checked={emailNotifications}
                    onCheckedChange={setEmailNotifications}
                  />
                </div>
                
                <div className="flex items-center justify-between">
                  <div className="space-y-0.5">
                    <Label htmlFor="achievement-notifications">Achievement Alerts</Label>
                    <p className="text-sm text-muted-foreground">
                      Get notified when you earn new badges
                    </p>
                  </div>
                  <Switch
                    id="achievement-notifications"
                    checked={achievementNotifications}
                    onCheckedChange={setAchievementNotifications}
                  />
                </div>
                
                <div className="flex items-center justify-between">
                  <div className="space-y-0.5">
                    <Label htmlFor="team-updates">Team Updates</Label>
                    <p className="text-sm text-muted-foreground">
                      Receive notifications about team progress and milestones
                    </p>
                  </div>
                  <Switch
                    id="team-updates"
                    checked={teamUpdates}
                    onCheckedChange={setTeamUpdates}
                  />
                </div>
                
                <Button 
                  onClick={handleSaveNotifications} 
                  disabled={isSavingNotifications}
                >
                  {isSavingNotifications ? 'Saving...' : 'Save Preferences'}
                </Button>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
        
        <TabsContent value="appearance">
          <Card>
            <CardHeader>
              <CardTitle>Theme</CardTitle>
              <CardDescription>
                Customize the appearance of the application
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="grid grid-cols-3 gap-4">
                  <div 
                    className={`border rounded-lg p-4 cursor-pointer ${
                      theme === 'light' ? 'border-primary bg-primary/10' : 'border-muted'
                    }`}
                    onClick={() => setTheme('light')}
                  >
                    <div className="h-24 bg-white border rounded-md mb-2 flex items-center justify-center">
                      <span className="text-black">Aa</span>
                    </div>
                    <p className="text-center font-medium">Light</p>
                  </div>
                  
                  <div 
                    className={`border rounded-lg p-4 cursor-pointer ${
                      theme === 'dark' ? 'border-primary bg-primary/10' : 'border-muted'
                    }`}
                    onClick={() => setTheme('dark')}
                  >
                    <div className="h-24 bg-gray-900 border border-gray-700 rounded-md mb-2 flex items-center justify-center">
                      <span className="text-white">Aa</span>
                    </div>
                    <p className="text-center font-medium">Dark</p>
                  </div>
                  
                  <div 
                    className={`border rounded-lg p-4 cursor-pointer ${
                      theme === 'system' ? 'border-primary bg-primary/10' : 'border-muted'
                    }`}
                    onClick={() => setTheme('system')}
                  >
                    <div className="h-24 bg-gradient-to-r from-white to-gray-900 border rounded-md mb-2 flex items-center justify-center">
                      <span className="text-gray-500">Aa</span>
                    </div>
                    <p className="text-center font-medium">System</p>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
        
        <TabsContent value="app">
          <Card>
            <CardHeader>
              <CardTitle>App Settings</CardTitle>
              <CardDescription>
                Manage the RowQuest app on your device
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-6">
                <div>
                  <h3 className="text-lg font-medium mb-2">Install RowQuest</h3>
                  <p className="text-sm text-muted-foreground mb-4">
                    Install RowQuest on your device for a better experience and offline access
                  </p>
                  <Button 
                    onClick={handleInstallApp}
                    disabled={!deferredPrompt}
                  >
                    <Smartphone className="h-4 w-4 mr-2" />
                    Install App
                  </Button>
                  {!deferredPrompt && (
                    <p className="text-xs text-muted-foreground mt-2">
                      {window.matchMedia('(display-mode: standalone)').matches
                        ? 'App is already installed'
                        : 'Installation not available in this browser or the app is already installed'}
                    </p>
                  )}
                </div>
                
                <div>
                  <h3 className="text-lg font-medium mb-2">Storage</h3>
                  <p className="text-sm text-muted-foreground mb-4">
                    Manage app data stored on your device
                  </p>
                  <Button variant="outline" onClick={() => {
                    localStorage.clear();
                    toast({
                      title: 'Cache cleared',
                      description: 'Application cache has been cleared',
                    });
                  }}>
                    Clear Cache
                  </Button>
                </div>
                
                <div>
                  <h3 className="text-lg font-medium mb-2">About</h3>
                  <div className="text-sm text-muted-foreground">
                    <p>RowQuest v1.0.0</p>
                    <p className="mt-1">© 2023 RowQuest Team</p>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}