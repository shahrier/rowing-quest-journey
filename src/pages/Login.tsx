import { useState } from "react";
import { Button } from "@/components/ui/button";
import { useNavigate } from "react-router-dom";
import { useEffect } from "react";
import { Facebook, Twitter } from "lucide-react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useToast } from "@/hooks/use-toast";
import { Checkbox } from "@/components/ui/checkbox";
import { useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/lib/supabase";

export default function Login() {
  const {
    user,
    signIn,
    signUp,
    signInWithGoogle,
    signInWithFacebook,
    signInWithTwitter,
  } = useAuth();
  const navigate = useNavigate();
  const { toast } = useToast();

  const [loginEmail, setLoginEmail] = useState("");
  const [loginPassword, setLoginPassword] = useState("");
  const [registerEmail, setRegisterEmail] = useState("");
  const [registerPassword, setRegisterPassword] = useState("");
  const [registerName, setRegisterName] = useState("");
  const [registerTeamName, setRegisterTeamName] = useState("");
  const [isCreatingTeam, setIsCreatingTeam] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isProcessingSocial, setIsProcessingSocial] = useState(false);
  const [signUpError, setSignUpError] = useState("");

  useEffect(() => {
    if (user) {
      navigate("/");
    }
  }, [user, navigate]);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!loginEmail || !loginPassword) {
      toast({
        title: "Missing fields",
        description: "Please fill in all required fields",
        variant: "destructive",
      });
      return;
    }

    setIsSubmitting(true);
    try {
      await signIn(loginEmail, loginPassword);
    } catch (error) {
      console.error("Login error:", error);
      toast({
        title: "Login failed",
        description: "An unexpected error occurred. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    setSignUpError("");

    if (!registerEmail || !registerPassword || !registerName) {
      toast({
        title: "Missing fields",
        description: "Please fill in all required fields",
        variant: "destructive",
      });
      return;
    }

    if (registerPassword.length < 6) {
      toast({
        title: "Password too short",
        description: "Password must be at least 6 characters long",
        variant: "destructive",
      });
      return;
    }

    if (isCreatingTeam && !registerTeamName) {
      toast({
        title: "Missing team name",
        description: "Please provide a team name",
        variant: "destructive",
      });
      return;
    }

    setIsSubmitting(true);
    try {
      // Sign up the user
      const result = await signUp(registerEmail, registerPassword, registerName);
      
      if (!result.success) {
        setSignUpError(result.error || "Failed to create account");
        toast({
          title: "Registration failed",
          description: result.error || "Failed to create account",
          variant: "destructive",
        });
        setIsSubmitting(false);
        return;
      }

      // If user wants to create a team, create it now
      if (isCreatingTeam && registerTeamName && result.userId) {
        try {
          // Create a new team
          const { data: teamData, error: teamError } = await supabase
            .from("teams")
            .insert({
              name: registerTeamName,
              created_by: result.userId,
              created_at: new Date().toISOString(),
            })
            .select()
            .single();

          if (teamError) throw teamError;

          // Update the user's profile with the team_id and set role to team_manager
          if (teamData) {
            const { error: profileError } = await supabase
              .from("profiles")
              .update({
                team_id: teamData.id,
                role: "team_manager",
              })
              .eq("user_id", result.userId);

            if (profileError) throw profileError;
          }

          toast({
            title: "Success!",
            description: "Account created and team set up successfully. Please check your email to verify your account.",
          });
        } catch (error) {
          console.error("Team creation error:", error);
          toast({
            title: "Team Creation Failed",
            description: "Your account was created, but we couldn't set up your team. You can try again later in the team settings.",
            variant: "destructive",
          });
        }
      } else {
        toast({
          title: "Account created",
          description: "Your account has been created successfully. Please check your email to verify your account.",
        });
      }

      // Reset form
      setRegisterEmail("");
      setRegisterPassword("");
      setRegisterName("");
      setRegisterTeamName("");
      setIsCreatingTeam(false);
    } catch (error) {
      console.error("Registration error:", error);
      toast({
        title: "Registration failed",
        description: "An unexpected error occurred. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleSocialSignIn = async (
    provider: "google" | "facebook" | "twitter",
  ) => {
    try {
      setIsProcessingSocial(true);

      switch (provider) {
        case "google":
          await signInWithGoogle();
          break;
        case "facebook":
          await signInWithFacebook();
          break;
        case "twitter":
          await signInWithTwitter();
          break;
      }
    } catch (error) {
      console.error(`Error signing in with ${provider}:`, error);
      toast({
        title: `${provider.charAt(0).toUpperCase() + provider.slice(1)} Sign-In Error`,
        description:
          "This authentication provider may not be configured. Please check your Supabase settings.",
        variant: "destructive",
      });
    } finally {
      setIsProcessingSocial(false);
    }
  };

  return (
    <div
      className="flex flex-col items-center justify-center min-h-[80vh] p-4"
      data-oid="r1fj8g3"
    >
      <div className="w-full max-w-md space-y-8" data-oid="lh-h6n6">
        <div className="text-center" data-oid="ogsp7s-">
          <div className="mx-auto relative w-24 h-24" data-oid="s:q450-">
            <div
              className="absolute -inset-2 rounded-full bg-gradient-to-r from-ocean-500 to-energy-500 blur opacity-70"
              data-oid="9:u3rd:"
            ></div>
            <div
              className="relative flex items-center justify-center h-24 w-24 rounded-full bg-ocean-700 text-white text-4xl font-bold"
              data-oid="tmsovsu"
            >
              R
            </div>
          </div>
          <h1 className="mt-6 text-3xl font-bold" data-oid="qdcvpab">
            Welcome to RowQuest
          </h1>
          <p
            className="mt-2 text-gray-600 dark:text-gray-400"
            data-oid="r:jz8_9"
          >
            Track your team's rowing journey to your destination
          </p>
        </div>

        <Tabs defaultValue="login" className="w-full" data-oid="eqr:_ee">
          <TabsList className="grid w-full grid-cols-2" data-oid="q8o:7sg">
            <TabsTrigger value="login" data-oid="az27d76">
              Login
            </TabsTrigger>
            <TabsTrigger value="register" data-oid="fida::b">
              Register
            </TabsTrigger>
          </TabsList>

          <TabsContent
            value="login"
            className="space-y-4 mt-4"
            data-oid="6qtu2ha"
          >
            <form
              onSubmit={handleLogin}
              className="space-y-4"
              data-oid=":fgqn3n"
            >
              <div className="space-y-2" data-oid="xcb-e.:">
                <Label htmlFor="login-email" data-oid="p_6klsg">
                  Email
                </Label>
                <Input
                  id="login-email"
                  type="email"
                  placeholder="Email address"
                  value={loginEmail}
                  onChange={(e) => setLoginEmail(e.target.value)}
                  required
                  data-oid="o.pb3uw"
                />
              </div>

              <div className="space-y-2" data-oid="oihz_f_">
                <Label htmlFor="login-password" data-oid="h039i83">
                  Password
                </Label>
                <Input
                  id="login-password"
                  type="password"
                  placeholder="Password"
                  value={loginPassword}
                  onChange={(e) => setLoginPassword(e.target.value)}
                  required
                  data-oid="c-r1v_g"
                />
              </div>

              <Button
                type="submit"
                className="w-full"
                disabled={isSubmitting}
                data-oid="ge3q0sq"
              >
                {isSubmitting ? "Signing in..." : "Sign in"}
              </Button>
            </form>

            <div className="relative my-6" data-oid="g46cpy5">
              <div
                className="absolute inset-0 flex items-center"
                data-oid="u_aof7."
              >
                <span className="w-full border-t" data-oid="qi64p9_"></span>
              </div>
              <div
                className="relative flex justify-center text-xs uppercase"
                data-oid="48tba3."
              >
                <span
                  className="bg-background px-2 text-muted-foreground"
                  data-oid="okhunp3"
                >
                  Or continue with
                </span>
              </div>
            </div>

            <div className="grid grid-cols-1 gap-4" data-oid="zeo8mk9">
              <Button
                onClick={() => handleSocialSignIn("google")}
                variant="outline"
                className="w-full flex items-center justify-center gap-2 py-6"
                disabled={isProcessingSocial}
                data-oid=":5-:wtk"
              >
                <svg
                  viewBox="0 0 24 24"
                  width="24"
                  height="24"
                  xmlns="http://www.w3.org/2000/svg"
                  data-oid="9v_.600"
                >
                  <g
                    transform="matrix(1, 0, 0, 1, 27.009001, -39.238998)"
                    data-oid="kl-:3q-"
                  >
                    <path
                      fill="#4285F4"
                      d="M -3.264 51.509 C -3.264 50.719 -3.334 49.969 -3.454 49.239 L -14.754 49.239 L -14.754 53.749 L -8.284 53.749 C -8.574 55.229 -9.424 56.479 -10.684 57.329 L -10.684 60.329 L -6.824 60.329 C -4.564 58.239 -3.264 55.159 -3.264 51.509 Z"
                      data-oid="39d2.lw"
                    />

                    <path
                      fill="#34A853"
                      d="M -14.754 63.239 C -11.514 63.239 -8.804 62.159 -6.824 60.329 L -10.684 57.329 C -11.764 58.049 -13.134 58.489 -14.754 58.489 C -17.884 58.489 -20.534 56.379 -21.484 53.529 L -25.464 53.529 L -25.464 56.619 C -23.494 60.539 -19.444 63.239 -14.754 63.239 Z"
                      data-oid="ooyrjvi"
                    />

                    <path
                      fill="#FBBC05"
                      d="M -21.484 53.529 C -21.734 52.809 -21.864 52.039 -21.864 51.239 C -21.864 50.439 -21.724 49.669 -21.484 48.949 L -21.484 45.859 L -25.464 45.859 C -26.284 47.479 -26.754 49.299 -26.754 51.239 C -26.754 53.179 -26.284 54.999 -25.464 56.619 L -21.484 53.529 Z"
                      data-oid="n0qnn5z"
                    />

                    <path
                      fill="#EA4335"
                      d="M -14.754 43.989 C -12.984 43.989 -11.404 44.599 -10.154 45.789 L -6.734 42.369 C -8.804 40.429 -11.514 39.239 -14.754 39.239 C -19.444 39.239 -23.494 41.939 -25.464 45.859 L -21.484 48.949 C -20.534 46.099 -17.884 43.989 -14.754 43.989 Z"
                      data-oid="fy-bhuh"
                    />
                  </g>
                </svg>
                Continue with Google
              </Button>

              <Button
                onClick={() => handleSocialSignIn("facebook")}
                variant="outline"
                className="w-full flex items-center justify-center gap-2 py-6"
                disabled={isProcessingSocial}
                data-oid="3r5ibrc"
              >
                <Facebook className="text-[#1877F2]" data-oid="xg6yki9" />
                Continue with Facebook
              </Button>

              <Button
                onClick={() => handleSocialSignIn("twitter")}
                variant="outline"
                className="w-full flex items-center justify-center gap-2 py-6"
                disabled={isProcessingSocial}
                data-oid="cmpo6t."
              >
                <Twitter className="text-[#1DA1F2]" data-oid="prk.t2m" />
                Continue with Twitter
              </Button>
            </div>
          </TabsContent>

          <TabsContent
            value="register"
            className="space-y-4 mt-4"
            data-oid="r4esf64"
          >
            <form
              onSubmit={handleRegister}
              className="space-y-4"
              data-oid="q97w2kd"
            >
              <div className="space-y-2" data-oid="2p1o.-j">
                <Label htmlFor="register-name" data-oid="h8p7kup">
                  Full Name
                </Label>
                <Input
                  id="register-name"
                  type="text"
                  placeholder="Your full name"
                  value={registerName}
                  onChange={(e) => setRegisterName(e.target.value)}
                  required
                  data-oid="fu:0zb_"
                />
              </div>

              <div className="space-y-2" data-oid="lm4ea-q">
                <Label htmlFor="register-email" data-oid="u5t4369">
                  Email
                </Label>
                <Input
                  id="register-email"
                  type="email"
                  placeholder="Email address"
                  value={registerEmail}
                  onChange={(e) => setRegisterEmail(e.target.value)}
                  required
                  data-oid="gqrtj2l"
                />
              </div>

              <div className="space-y-2" data-oid="ycr5x23">
                <Label htmlFor="register-password" data-oid="z9:9qr4">
                  Password
                </Label>
                <Input
                  id="register-password"
                  type="password"
                  placeholder="Create a password"
                  value={registerPassword}
                  onChange={(e) => setRegisterPassword(e.target.value)}
                  required
                  data-oid="kxz6.89"
                />

                <p className="text-xs text-muted-foreground" data-oid="8pszk82">
                  Password must be at least 6 characters long
                </p>
              </div>

              <div className="flex items-center space-x-2" data-oid="tcc:2:m">
                <Checkbox
                  id="create-team"
                  checked={isCreatingTeam}
                  onCheckedChange={(checked) => {
                    setIsCreatingTeam(checked as boolean);
                  }}
                  data-oid="s3q:eq1"
                />

                <Label htmlFor="create-team" data-oid="5id-ufe">
                  I want to create a new team
                </Label>
              </div>

              {isCreatingTeam && (
                <div className="space-y-2" data-oid=":2b33x.">
                  <Label htmlFor="register-team-name" data-oid="-snu.za">
                    Team Name
                  </Label>
                  <Input
                    id="register-team-name"
                    type="text"
                    placeholder="Enter team name"
                    value={registerTeamName}
                    onChange={(e) => setRegisterTeamName(e.target.value)}
                    required={isCreatingTeam}
                    data-oid="s1:_:5h"
                  />

                  <p
                    className="text-xs text-muted-foreground"
                    data-oid="jhk_d5e"
                  >
                    As a team creator, you'll be the team manager with admin
                    privileges
                  </p>
                </div>
              )}

              {signUpError && (
                <div className="text-sm text-red-500 p-2 bg-red-50 dark:bg-red-900/20 rounded border border-red-200 dark:border-red-800">
                  {signUpError}
                </div>
              )}

              <Button
                type="submit"
                className="w-full"
                disabled={isSubmitting}
                data-oid="18rp5rb"
              >
                {isSubmitting ? "Creating account..." : "Create account"}
              </Button>
            </form>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}