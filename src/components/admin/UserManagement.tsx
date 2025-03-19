import { useState, useEffect } from "react";
import { supabase } from "@/lib/supabase";
import { useToast } from "@/hooks/use-toast";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Search, UserPlus, Edit, Trash2 } from "lucide-react";

interface User {
  id: string;
  email: string;
  full_name: string;
  role: string;
  team_name: string | null;
  created_at: string;
}

export function UserManagement() {
  const { toast } = useToast();
  const [users, setUsers] = useState<User[]>([]);
  const [teams, setTeams] = useState<{ id: string; name: string }[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [selectedUser, setSelectedUser] = useState<User | null>(null);
  const [editRole, setEditRole] = useState("");
  const [editTeam, setEditTeam] = useState("");

  useEffect(() => {
    fetchUsers();
    fetchTeams();
  }, []);

  const fetchUsers = async () => {
    try {
      setIsLoading(true);

      // Join profiles with teams to get team names
      const { data, error } = await supabase.from("profiles").select(`
          id,
          user_id,
          full_name,
          email,
          role,
          created_at,
          teams:team_id (id, name)
        `);

      if (error) throw error;

      // Format the data
      const formattedUsers = data.map((user) => ({
        id: user.user_id,
        email: user.email,
        full_name: user.full_name,
        role: user.role,
        team_name: user.teams ? user.teams.name : null,
        team_id: user.teams ? user.teams.id : null,
        created_at: new Date(user.created_at).toLocaleDateString(),
      }));

      setUsers(formattedUsers);
    } catch (error) {
      console.error("Error fetching users:", error);
      toast({
        title: "Error",
        description: "Failed to load users",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const fetchTeams = async () => {
    try {
      const { data, error } = await supabase.from("teams").select("id, name");

      if (error) throw error;
      setTeams(data || []);
    } catch (error) {
      console.error("Error fetching teams:", error);
    }
  };

  const handleEditUser = (user: User) => {
    setSelectedUser(user);
    setEditRole(user.role);
    setEditTeam(user.team_id || "");
    setIsEditDialogOpen(true);
  };

  const handleSaveUser = async () => {
    if (!selectedUser) return;

    try {
      const { error } = await supabase
        .from("profiles")
        .update({
          role: editRole,
          team_id: editTeam || null,
        })
        .eq("user_id", selectedUser.id);

      if (error) throw error;

      toast({
        title: "User updated",
        description: "User information has been updated successfully",
      });

      // Refresh the user list
      fetchUsers();
      setIsEditDialogOpen(false);
    } catch (error) {
      console.error("Error updating user:", error);
      toast({
        title: "Error",
        description: "Failed to update user",
        variant: "destructive",
      });
    }
  };

  const handleDeleteUser = async (userId: string) => {
    if (
      !confirm(
        "Are you sure you want to delete this user? This action cannot be undone.",
      )
    ) {
      return;
    }

    try {
      // First delete the profile
      const { error: profileError } = await supabase
        .from("profiles")
        .delete()
        .eq("user_id", userId);

      if (profileError) throw profileError;

      // Then delete the auth user (requires admin privileges in Supabase)
      // Note: This might not work with the client-side API depending on your Supabase setup
      // You might need to use a server function for this
      const { error: authError } = await supabase.auth.admin.deleteUser(userId);

      if (authError) {
        console.error("Error deleting auth user:", authError);
        toast({
          title: "Warning",
          description:
            "User profile deleted but auth record may remain. Contact administrator.",
          variant: "destructive",
        });
      } else {
        toast({
          title: "User deleted",
          description: "User has been deleted successfully",
        });
      }

      // Refresh the user list
      fetchUsers();
    } catch (error) {
      console.error("Error deleting user:", error);
      toast({
        title: "Error",
        description: "Failed to delete user",
        variant: "destructive",
      });
    }
  };

  const filteredUsers = users.filter(
    (user) =>
      user.full_name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      user.email.toLowerCase().includes(searchQuery.toLowerCase()) ||
      user.role.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (user.team_name &&
        user.team_name.toLowerCase().includes(searchQuery.toLowerCase())),
  );

  return (
    <Card data-oid="lungu1d">
      <CardHeader data-oid="9ez-zhu">
        <CardTitle data-oid="1mktsem">User Management</CardTitle>
      </CardHeader>
      <CardContent data-oid="-mu_:01">
        <div
          className="flex flex-col md:flex-row justify-between mb-4 gap-4"
          data-oid="qpmcq:."
        >
          <div className="relative flex-1" data-oid="r1418:m">
            <Search
              className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground"
              data-oid="_vom75."
            />

            <Input
              placeholder="Search users..."
              className="pl-8"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              data-oid="ce9ozy-"
            />
          </div>
          <Dialog data-oid=":0wto1y">
            <DialogTrigger asChild data-oid="59vboqg">
              <Button data-oid="l_h2glq">
                <UserPlus className="mr-2 h-4 w-4" data-oid="k3plr.c" />
                Add User
              </Button>
            </DialogTrigger>
            <DialogContent data-oid="50_3ddl">
              <DialogHeader data-oid="a3__y1o">
                <DialogTitle data-oid="za:4cw.">Add New User</DialogTitle>
                <DialogDescription data-oid="t645_r9">
                  Create a new user account. They will receive an email to set
                  their password.
                </DialogDescription>
              </DialogHeader>
              <div className="grid gap-4 py-4" data-oid="8p9b28j">
                <div className="grid gap-2" data-oid="6lsv13q">
                  <Label htmlFor="name" data-oid="hhxmu41">
                    Full Name
                  </Label>
                  <Input
                    id="name"
                    placeholder="Enter full name"
                    data-oid="_siw62d"
                  />
                </div>
                <div className="grid gap-2" data-oid="8pxffre">
                  <Label htmlFor="email" data-oid="eutm66g">
                    Email
                  </Label>
                  <Input
                    id="email"
                    type="email"
                    placeholder="Enter email address"
                    data-oid="6odc_2e"
                  />
                </div>
                <div className="grid gap-2" data-oid="z8momiq">
                  <Label htmlFor="role" data-oid="au8n_47">
                    Role
                  </Label>
                  <Select data-oid="sg1e0d1">
                    <SelectTrigger data-oid="mc11fnd">
                      <SelectValue
                        placeholder="Select role"
                        data-oid="hn4wx8j"
                      />
                    </SelectTrigger>
                    <SelectContent data-oid="e2t09jj">
                      <SelectItem value="user" data-oid="i9fwdjo">
                        User
                      </SelectItem>
                      <SelectItem value="team_manager" data-oid="vn1q_:_">
                        Team Manager
                      </SelectItem>
                      <SelectItem value="admin" data-oid=":spp7h0">
                        Admin
                      </SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="grid gap-2" data-oid="p.tt5f5">
                  <Label htmlFor="team" data-oid="-ddyb_n">
                    Team
                  </Label>
                  <Select data-oid="g2q-f_i">
                    <SelectTrigger data-oid="mk61q5v">
                      <SelectValue
                        placeholder="Select team"
                        data-oid="nu7f1r3"
                      />
                    </SelectTrigger>
                    <SelectContent data-oid=".9h5xso">
                      <SelectItem value="" data-oid="40ona2:">
                        No Team
                      </SelectItem>
                      {teams.map((team) => (
                        <SelectItem
                          key={team.id}
                          value={team.id}
                          data-oid="666dvdn"
                        >
                          {team.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>
              <DialogFooter data-oid="jjr071w">
                <Button type="submit" data-oid="zx43-3-">
                  Add User
                </Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
        </div>

        {isLoading ? (
          <div className="text-center py-4" data-oid="y7.kkd4">
            Loading users...
          </div>
        ) : (
          <div className="rounded-md border" data-oid=":jp98:b">
            <Table data-oid="a6jtd0m">
              <TableHeader data-oid="yp_.:od">
                <TableRow data-oid="zhrpwpm">
                  <TableHead data-oid="i3byvlj">Name</TableHead>
                  <TableHead data-oid="5883yy:">Email</TableHead>
                  <TableHead data-oid="rfu_1tk">Role</TableHead>
                  <TableHead data-oid="8_l83.w">Team</TableHead>
                  <TableHead data-oid="42or-sj">Joined</TableHead>
                  <TableHead className="text-right" data-oid="c0sq3ob">
                    Actions
                  </TableHead>
                </TableRow>
              </TableHeader>
              <TableBody data-oid="ogikcia">
                {filteredUsers.length === 0 ? (
                  <TableRow data-oid="puql_8i">
                    <TableCell
                      colSpan={6}
                      className="text-center"
                      data-oid="4clacd-"
                    >
                      No users found
                    </TableCell>
                  </TableRow>
                ) : (
                  filteredUsers.map((user) => (
                    <TableRow key={user.id} data-oid=":7o5e10">
                      <TableCell data-oid="_ct0e1z">{user.full_name}</TableCell>
                      <TableCell data-oid="1txv.g2">{user.email}</TableCell>
                      <TableCell data-oid="dpn5-6z">
                        <span
                          className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                            user.role === "admin"
                              ? "bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200"
                              : user.role === "team_manager"
                                ? "bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200"
                                : "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200"
                          }`}
                          data-oid="ygul593"
                        >
                          {user.role === "admin"
                            ? "Admin"
                            : user.role === "team_manager"
                              ? "Team Manager"
                              : "User"}
                        </span>
                      </TableCell>
                      <TableCell data-oid="hgvk.3m">
                        {user.team_name || "No Team"}
                      </TableCell>
                      <TableCell data-oid="zc6u27y">
                        {user.created_at}
                      </TableCell>
                      <TableCell className="text-right" data-oid="g-ozs-w">
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => handleEditUser(user)}
                          data-oid="hb19us2"
                        >
                          <Edit className="h-4 w-4" data-oid="c:0h3um" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => handleDeleteUser(user.id)}
                          data-oid="5.t8o2t"
                        >
                          <Trash2 className="h-4 w-4" data-oid="n-cekws" />
                        </Button>
                      </TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          </div>
        )}
      </CardContent>

      {/* Edit User Dialog */}
      <Dialog
        open={isEditDialogOpen}
        onOpenChange={setIsEditDialogOpen}
        data-oid="c0z0ull"
      >
        <DialogContent data-oid="xihr-_d">
          <DialogHeader data-oid="q33lw-i">
            <DialogTitle data-oid="9iyjenj">Edit User</DialogTitle>
            <DialogDescription data-oid="ahommfe">
              Update user information and permissions
            </DialogDescription>
          </DialogHeader>
          {selectedUser && (
            <div className="grid gap-4 py-4" data-oid="_t5oeif">
              <div className="grid gap-2" data-oid="_2g8oo7">
                <Label data-oid="p3wxx_k">Name</Label>
                <Input
                  value={selectedUser.full_name}
                  disabled
                  data-oid="rvu_098"
                />
              </div>
              <div className="grid gap-2" data-oid="6r::qhb">
                <Label data-oid="a86:y02">Email</Label>
                <Input value={selectedUser.email} disabled data-oid="qvnop-." />
              </div>
              <div className="grid gap-2" data-oid="ejnx-ob">
                <Label htmlFor="role" data-oid="0xn4vk6">
                  Role
                </Label>
                <Select
                  value={editRole}
                  onValueChange={setEditRole}
                  data-oid="m9fh._q"
                >
                  <SelectTrigger data-oid="qrwwm1s">
                    <SelectValue placeholder="Select role" data-oid="25wp_-n" />
                  </SelectTrigger>
                  <SelectContent data-oid="v0rcv:6">
                    <SelectItem value="user" data-oid="871gcxe">
                      User
                    </SelectItem>
                    <SelectItem value="team_manager" data-oid="ifllf9x">
                      Team Manager
                    </SelectItem>
                    <SelectItem value="admin" data-oid="tu73v9q">
                      Admin
                    </SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="grid gap-2" data-oid="iwork.f">
                <Label htmlFor="team" data-oid=".xu0vn0">
                  Team
                </Label>
                <Select
                  value={editTeam}
                  onValueChange={setEditTeam}
                  data-oid="klk6.r_"
                >
                  <SelectTrigger data-oid="-8tnawg">
                    <SelectValue placeholder="Select team" data-oid="t42_c-k" />
                  </SelectTrigger>
                  <SelectContent data-oid="fulx.d9">
                    <SelectItem value="" data-oid="witu398">
                      No Team
                    </SelectItem>
                    {teams.map((team) => (
                      <SelectItem
                        key={team.id}
                        value={team.id}
                        data-oid="0m5i_8j"
                      >
                        {team.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>
          )}
          <DialogFooter data-oid="d4pnuzz">
            <Button
              variant="outline"
              onClick={() => setIsEditDialogOpen(false)}
              data-oid="k.215_c"
            >
              Cancel
            </Button>
            <Button onClick={handleSaveUser} data-oid="tiuxp:.">
              Save Changes
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </Card>
  );
}
