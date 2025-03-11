
import { useState } from 'react';
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { useToast } from "@/hooks/use-toast";
import { UserPlus, Users, Mail, X } from "lucide-react";

export function TeamMembers() {
  const { toast } = useToast();
  const [email, setEmail] = useState("");
  const [pendingInvites, setPendingInvites] = useState<string[]>([]);
  const [isInviting, setIsInviting] = useState(false);

  const handleInviteMember = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email) {
      toast({
        title: "Missing Information",
        description: "Please enter an email address",
        variant: "destructive",
      });
      return;
    }

    if (pendingInvites.includes(email)) {
      toast({
        title: "Duplicate Invite",
        description: "This email has already been invited",
        variant: "destructive",
      });
      return;
    }

    setIsInviting(true);
    try {
      // In a real app, this would send an invitation email
      // For now, we'll just add to pending invites
      setTimeout(() => {
        setPendingInvites([...pendingInvites, email]);
        setEmail("");
        toast({
          title: "Invitation Sent",
          description: `An invitation has been sent to ${email}`,
        });
        setIsInviting(false);
      }, 500);
    } catch (error) {
      console.error("Error sending invitation:", error);
      toast({
        title: "Error",
        description: "Failed to send invitation. Please try again.",
        variant: "destructive",
      });
      setIsInviting(false);
    }
  };

  const handleCancelInvite = (emailToRemove: string) => {
    setPendingInvites(pendingInvites.filter(e => e !== emailToRemove));
    toast({
      title: "Invitation Cancelled",
      description: `Invitation to ${emailToRemove} has been cancelled`,
    });
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Users className="h-5 w-5" />
          Team Members
        </CardTitle>
        <CardDescription>
          Invite new members to join your team
        </CardDescription>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleInviteMember} className="space-y-4">
          <div className="flex gap-2">
            <div className="flex-1">
              <div className="flex">
                <span className="flex items-center px-3 border border-r-0 rounded-l-md bg-muted">
                  <Mail className="h-4 w-4 text-muted-foreground" />
                </span>
                <Input
                  type="email"
                  placeholder="Enter email address"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="rounded-l-none"
                />
              </div>
            </div>
            <Button type="submit" disabled={isInviting}>
              <UserPlus className="h-4 w-4 mr-2" />
              {isInviting ? "Inviting..." : "Invite"}
            </Button>
          </div>
        </form>

        {pendingInvites.length > 0 && (
          <div className="mt-6">
            <h3 className="text-sm font-medium mb-2">Pending Invitations</h3>
            <div className="rounded-md border divide-y">
              {pendingInvites.map((pendingEmail, index) => (
                <div key={index} className="flex items-center justify-between p-3">
                  <span className="text-sm truncate">{pendingEmail}</span>
                  <Button 
                    variant="ghost" 
                    size="sm" 
                    onClick={() => handleCancelInvite(pendingEmail)}
                  >
                    <X className="h-4 w-4" />
                  </Button>
                </div>
              ))}
            </div>
          </div>
        )}
      </CardContent>
      <CardFooter>
        <p className="text-sm text-muted-foreground">
          Team members will receive an email with instructions to join.
        </p>
      </CardFooter>
    </Card>
  );
}
