
import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { supabase } from "@/lib/supabase";
import { useToast } from "@/hooks/use-toast";
import { Checkbox } from "@/components/ui/checkbox";

export default function Login() {
  const { signIn, signUp } = useAuth();
  const navigate = useNavigate();
  const { toast } = useToast();
  
  // Login form state
  const [loginEmail, setLoginEmail] = useState("");
  const [loginPassword, setLoginPassword] = useState("");
  const [isLoggingIn, setIsLoggingIn] = useState(false);
  
  // Register form state
  const [registerName, setRegisterName] = useState("");
  const [registerEmail, setRegisterEmail] = useState("");
  const [registerPassword, setRegisterPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [isRegistering, setIsRegistering] = useState(false);
  
  // Team creation state
  const [createTeam, setCreateTeam] = useState(false);
  const [teamName, setTeamName] = useState("");
  const [journeyName, setJourneyName] = useState("");
  const [startLocation, setStartLocation] = useState("");
  const [endLocation, setEndLocation] = useState("");
  const [distanceKm, setDistanceKm] = useState("");
  
  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoggingIn(true);
    
    try {
      await signIn(loginEmail, loginPassword);
      navigate("/");
    } catch (error) {
      console.error("Login error:", error);
    } finally {
      setIsLoggingIn(false);
    }
  };
  
  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (registerPassword !== confirmPassword) {
      toast({
        title: "Passwords don't match",
        description: "Please make sure your passwords match.",
        variant: "destructive",
      });
      return;
    }
    
    setIsRegistering(true);
    
    try {
      // Register the user
      await signUp(registerEmail, registerPassword, registerName);
      
      // If team creation is checked, create a team and make the user a manager
      if (createTeam && teamName) {
        // Wait for the auth state to be updated
        const { data: { session } } = await supabase.auth.getSession();
        
        if (session) {
          // Create a new team
          const { data: team, error: teamError } = await supabase
            .from('teams')
            .insert({
              name: teamName,
              created_by: session.user.id
            })
            .select()
            .single();
            
          if (teamError) throw teamError;
          
          // Add the user as a team manager
          const { error: membershipError } = await supabase
            .from('team_memberships')
            .insert({
              team_id: team.id,
              user_id: session.user.id,
              role: 'manager'
            });
            
          if (membershipError) throw membershipError;
          
          // Create a journey if all fields are provided
          if (journeyName && startLocation && endLocation && distanceKm) {
            const { error: journeyError } = await supabase
              .from('journeys')
              .insert({
                team_id: team.id,
                name: journeyName,
                start_location: startLocation,
                end_location: endLocation,
                distance_km: parseFloat(distanceKm)
              });
              
            if (journeyError) throw journeyError;
          }
        }
      }
      
      toast({
        title: "Account created",
        description: "Please check your email to verify your account.",
      });
      
      // Switch to login tab
      setTimeout(() => {
        document.getElementById("login-tab")?.click();
        setLoginEmail(registerEmail);
      }, 1000);
    } catch (error: any) {
      console.error("Registration error:", error);
      toast({
        title: "Registration failed",
        description: error.message || "Something went wrong during registration.",
        variant: "destructive",
      });
    } finally {
      setIsRegistering(false);
    }
  };
  
  return (
    <div className="flex min-h-screen items-center justify-center bg-gradient-to-b from-ocean-50 to-ocean-100 p-4">
      <div className="w-full max-w-md">
        <div className="mb-8 text-center">
          <div className="flex justify-center mb-4">
            <div className="bg-ocean-600 p-3 rounded-full">
              <div className="h-8 w-8 text-white flex items-center justify-center">RQ</div>
            </div>
          </div>
          <h1 className="text-3xl font-bold text-ocean-900">RowQuest</h1>
          <p className="text-ocean-700">Track your team's virtual rowing journey</p>
        </div>
        
        <Tabs defaultValue="login">
          <TabsList className="grid w-full grid-cols-2 mb-6">
            <TabsTrigger value="login" id="login-tab">Login</TabsTrigger>
            <TabsTrigger value="register">Register</TabsTrigger>
          </TabsList>
          
          <TabsContent value="login">
            <Card>
              <CardHeader>
                <CardTitle>Login</CardTitle>
                <CardDescription>Enter your credentials to access your account</CardDescription>
              </CardHeader>
              <form onSubmit={handleLogin}>
                <CardContent className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="email">Email</Label>
                    <Input 
                      id="email" 
                      type="email" 
                      placeholder="your@email.com" 
                      value={loginEmail}
                      onChange={(e) => setLoginEmail(e.target.value)}
                      required
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="password">Password</Label>
                    <Input 
                      id="password" 
                      type="password" 
                      value={loginPassword}
                      onChange={(e) => setLoginPassword(e.target.value)}
                      required
                    />
                  </div>
                </CardContent>
                <CardFooter>
                  <Button type="submit" className="w-full" disabled={isLoggingIn}>
                    {isLoggingIn ? "Logging in..." : "Login"}
                  </Button>
                </CardFooter>
              </form>
            </Card>
          </TabsContent>
          
          <TabsContent value="register">
            <Card>
              <CardHeader>
                <CardTitle>Create an account</CardTitle>
                <CardDescription>Enter your details to create a new account</CardDescription>
              </CardHeader>
              <form onSubmit={handleRegister}>
                <CardContent className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="name">Full Name</Label>
                    <Input 
                      id="name" 
                      placeholder="John Doe" 
                      value={registerName}
                      onChange={(e) => setRegisterName(e.target.value)}
                      required
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="register-email">Email</Label>
                    <Input 
                      id="register-email" 
                      type="email" 
                      placeholder="your@email.com" 
                      value={registerEmail}
                      onChange={(e) => setRegisterEmail(e.target.value)}
                      required
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="register-password">Password</Label>
                    <Input 
                      id="register-password" 
                      type="password" 
                      value={registerPassword}
                      onChange={(e) => setRegisterPassword(e.target.value)}
                      required
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="confirm-password">Confirm Password</Label>
                    <Input 
                      id="confirm-password" 
                      type="password" 
                      value={confirmPassword}
                      onChange={(e) => setConfirmPassword(e.target.value)}
                      required
                    />
                  </div>
                  
                  <div className="flex items-center space-x-2 pt-2">
                    <Checkbox 
                      id="create-team" 
                      checked={createTeam}
                      onCheckedChange={(checked) => setCreateTeam(checked === true)}
                    />
                    <Label htmlFor="create-team">I want to create a new team</Label>
                  </div>
                  
                  {createTeam && (
                    <div className="space-y-4 border rounded-lg p-4 mt-2">
                      <div className="space-y-2">
                        <Label htmlFor="team-name">Team Name</Label>
                        <Input 
                          id="team-name" 
                          placeholder="Riverside Rowers" 
                          value={teamName}
                          onChange={(e) => setTeamName(e.target.value)}
                          required
                        />
                      </div>
                      
                      <div className="space-y-2">
                        <Label htmlFor="journey-name">Journey Name</Label>
                        <Input 
                          id="journey-name" 
                          placeholder="Atlantic Crossing" 
                          value={journeyName}
                          onChange={(e) => setJourneyName(e.target.value)}
                        />
                      </div>
                      
                      <div className="grid grid-cols-2 gap-4">
                        <div className="space-y-2">
                          <Label htmlFor="start-location">Start Location</Label>
                          <Input 
                            id="start-location" 
                            placeholder="Boston" 
                            value={startLocation}
                            onChange={(e) => setStartLocation(e.target.value)}
                          />
                        </div>
                        <div className="space-y-2">
                          <Label htmlFor="end-location">End Location</Label>
                          <Input 
                            id="end-location" 
                            placeholder="Rotterdam" 
                            value={endLocation}
                            onChange={(e) => setEndLocation(e.target.value)}
                          />
                        </div>
                      </div>
                      
                      <div className="space-y-2">
                        <Label htmlFor="distance">Distance (km)</Label>
                        <Input 
                          id="distance" 
                          type="number"
                          placeholder="5556" 
                          value={distanceKm}
                          onChange={(e) => setDistanceKm(e.target.value)}
                        />
                      </div>
                    </div>
                  )}
                </CardContent>
                <CardFooter>
                  <Button type="submit" className="w-full" disabled={isRegistering}>
                    {isRegistering ? "Creating account..." : "Create account"}
                  </Button>
                </CardFooter>
              </form>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}
