import { useState } from "react";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
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
    setPendingInvites(pendingInvites.filter((e) => e !== emailToRemove));
    toast({
      title: "Invitation Cancelled",
      description: `Invitation to ${emailToRemove} has been cancelled`,
    });
  };

  return (
    <Card data-oid="vz7f5a5">
      <CardHeader data-oid="aovfgtf">
        <CardTitle className="flex items-center gap-2" data-oid="dzfs-3-">
          <Users className="h-5 w-5" data-oid="wyux3x9" />
          Team Members
        </CardTitle>
        <CardDescription data-oid="i6jt:vg">
          Invite new members to join your team
        </CardDescription>
      </CardHeader>
      <CardContent data-oid="1g:abn7">
        <form
          onSubmit={handleInviteMember}
          className="space-y-4"
          data-oid="b9auuos"
        >
          <div className="flex gap-2" data-oid="nt:asrj">
            <div className="flex-1" data-oid="74wlrrb">
              <div className="flex" data-oid="-8lchgh">
                <span
                  className="flex items-center px-3 border border-r-0 rounded-l-md bg-muted"
                  data-oid="36i5zmu"
                >
                  <Mail
                    className="h-4 w-4 text-muted-foreground"
                    data-oid="b62iik_"
                  />
                </span>
                <Input
                  type="email"
                  placeholder="Enter email address"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="rounded-l-none"
                  data-oid="en5rkjk"
                />
              </div>
            </div>
            <Button type="submit" disabled={isInviting} data-oid="fknv-ne">
              <UserPlus className="h-4 w-4 mr-2" data-oid="4e3a2fe" />
              {isInviting ? "Inviting..." : "Invite"}
            </Button>
          </div>
        </form>

        {pendingInvites.length > 0 && (
          <div className="mt-6" data-oid="9vh:htr">
            <h3 className="text-sm font-medium mb-2" data-oid="ivl0.r4">
              Pending Invitations
            </h3>
            <div className="rounded-md border divide-y" data-oid=".y2930:">
              {pendingInvites.map((pendingEmail, index) => (
                <div
                  key={index}
                  className="flex items-center justify-between p-3"
                  data-oid="32pr020"
                >
                  <span className="text-sm truncate" data-oid="e8zoa7n">
                    {pendingEmail}
                  </span>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => handleCancelInvite(pendingEmail)}
                    data-oid="gitjonn"
                  >
                    <X className="h-4 w-4" data-oid="3mfucu." />
                  </Button>
                </div>
              ))}
            </div>
          </div>
        )}
      </CardContent>
      <CardFooter data-oid="9xmgxjb">
        <p className="text-sm text-muted-foreground" data-oid="hss69a6">
          Team members will receive an email with instructions to join.
        </p>
      </CardFooter>
    </Card>
  );
}
