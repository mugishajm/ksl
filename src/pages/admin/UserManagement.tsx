import { useMemo, useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Search, UserPlus } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { getUsers, inviteUser } from "@/lib/api";
import { toast } from "sonner";

type AdminUser = {
  id: string;
  name: string;
  email: string;
  role: "admin" | "moderator" | "viewer";
  status: "Active" | "Invited" | "Disabled";
  joinedAt: string;
};

const statusBadge: Record<AdminUser["status"], string> = {
  Active:
    "bg-emerald-50 text-emerald-700 dark:bg-emerald-900/40 dark:text-emerald-200",
  Invited:
    "bg-sky-50 text-sky-700 dark:bg-sky-900/40 dark:text-sky-200",
  Disabled:
    "bg-slate-100 text-slate-600 dark:bg-slate-800 dark:text-slate-200",
};

const roleLabel: Record<AdminUser["role"], string> = {
  admin: "Admin",
  moderator: "Moderator",
  viewer: "Viewer",
};

const UserManagement = () => {
  const [users, setUsers] = useState<AdminUser[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [roleFilter, setRoleFilter] =
    useState<AdminUser["role"] | "All">("All");
  const [isInviteOpen, setIsInviteOpen] = useState(false);
  const [inviteName, setInviteName] = useState("");
  const [inviteEmail, setInviteEmail] = useState("");
  const [inviteRole, setInviteRole] = useState<AdminUser["role"]>("viewer");
  const [isInviting, setIsInviting] = useState(false);

  useEffect(() => {
    fetchUsers();
  }, []);

  const fetchUsers = async () => {
    try {
      setLoading(true);
      const data = await getUsers();
      setUsers(data);
    } catch (err) {
      toast.error("Failed to load users");
    } finally {
      setLoading(false);
    }
  };

  const filtered = useMemo(() => {
    return users.filter((u) => {
      const s = search.trim().toLowerCase();
      const matchesSearch =
        s.length === 0 ||
        u.name.toLowerCase().includes(s) ||
        u.email.toLowerCase().includes(s);
      const matchesRole =
        roleFilter === "All" ? true : u.role === roleFilter;
      return matchesSearch && matchesRole;
    });
  }, [users, search, roleFilter]);

  const handleInvite = async () => {
    if (!inviteName.trim() || !inviteEmail.trim()) return;
    
    try {
      setIsInviting(true);
      const newUser = await inviteUser({
        name: inviteName.trim(),
        email: inviteEmail.trim(),
        role: inviteRole,
      });

      setUsers((prev) => [newUser, ...prev]);
      toast.success("User invited successfully");

      setInviteName("");
      setInviteEmail("");
      setInviteRole("viewer");
      setIsInviteOpen(false);
    } catch (err) {
      toast.error("Failed to invite user");
    } finally {
      setIsInviting(false);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
        <div>
          <h1 className="text-2xl md:text-3xl font-display font-bold text-foreground">
            User Management
          </h1>
          <p className="text-sm text-muted-foreground mt-1">
            Manage admin accounts and access for the KSL platform.
          </p>
        </div>
        <Dialog open={isInviteOpen} onOpenChange={setIsInviteOpen}>
          <Button
            className="bg-[#0f74d4] hover:bg-[#0d63b5] text-white"
            onClick={() => setIsInviteOpen(true)}
          >
            <UserPlus className="mr-2 h-4 w-4" />
            Invite User
          </Button>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Invite New User</DialogTitle>
            </DialogHeader>
            <div className="space-y-3 py-2">
              <div className="space-y-1.5">
                <label className="text-xs font-medium text-muted-foreground">
                  Full Name
                </label>
                <Input
                  value={inviteName}
                  onChange={(e) => setInviteName(e.target.value)}
                  placeholder="e.g. Jane Doe"
                  className="h-8 text-sm"
                />
              </div>
              <div className="space-y-1.5">
                <label className="text-xs font-medium text-muted-foreground">
                  Email
                </label>
                <Input
                  type="email"
                  value={inviteEmail}
                  onChange={(e) => setInviteEmail(e.target.value)}
                  placeholder="name@example.com"
                  className="h-8 text-sm"
                />
              </div>
              <div className="space-y-1.5">
                <label className="text-xs font-medium text-muted-foreground">
                  Role
                </label>
                <Select
                  value={inviteRole}
                  onValueChange={(value) =>
                    setInviteRole(value as AdminUser["role"])
                  }
                >
                  <SelectTrigger className="h-8 text-xs">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="admin">Admin</SelectItem>
                    <SelectItem value="moderator">Moderator</SelectItem>
                    <SelectItem value="viewer">Viewer</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
            <DialogFooter>
              <Button
                variant="outline"
                size="sm"
                onClick={() => setIsInviteOpen(false)}
              >
                Cancel
              </Button>
              <Button
                size="sm"
                className="bg-[#0f74d4] hover:bg-[#0d63b5] text-white"
                onClick={handleInvite}
                disabled={!inviteName.trim() || !inviteEmail.trim() || isInviting}
              >
                {isInviting ? "Sending..." : "Send Invite"}
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>

      <Card className="border-border bg-card shadow-sm">
        <CardHeader className="pb-3">
          <CardTitle className="text-sm font-semibold text-foreground">
            Team Members
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
            <div className="relative w-full md:w-80">
              <Search className="pointer-events-none absolute left-2 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-muted-foreground" />
              <Input
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Search by name or email..."
                className="pl-7 h-8 text-xs"
              />
            </div>
            <div className="flex flex-wrap items-center gap-2 text-xs">
              <span className="text-muted-foreground">Role:</span>
              <div className="flex gap-1">
                {["All", "admin", "moderator", "viewer"].map((r) => (
                  <button
                    key={r}
                    type="button"
                    onClick={() =>
                      setRoleFilter(r as AdminUser["role"] | "All")
                    }
                    className={`rounded-full px-3 py-1 border text-xs ${
                      roleFilter === r
                        ? "border-[#0f74d4] bg-[#0f74d4]/10 text-[#0f74d4]"
                        : "border-border text-muted-foreground hover:bg-muted/60"
                    }`}
                  >
                    {r === "All" ? "All" : roleLabel[r as AdminUser["role"]]}
                  </button>
                ))}
              </div>
            </div>
          </div>

          <div className="rounded-lg border border-border overflow-hidden bg-background">
            <Table>
              <TableHeader>
                <TableRow className="bg-muted/60">
                  <TableHead>Name</TableHead>
                  <TableHead>Email</TableHead>
                  <TableHead>Role</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Joined</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {loading ? (
                  <TableRow>
                    <TableCell
                      colSpan={6}
                      className="py-6 text-center text-sm text-muted-foreground"
                    >
                      Loading users...
                    </TableCell>
                  </TableRow>
                ) : filtered.length === 0 ? (
                  <TableRow>
                    <TableCell
                      colSpan={6}
                      className="py-6 text-center text-sm text-muted-foreground"
                    >
                      No users found.
                    </TableCell>
                  </TableRow>
                ) : (
                  filtered.map((user) => (
                    <TableRow key={user.id}>
                      <TableCell className="font-medium">
                        {user.name}
                      </TableCell>
                      <TableCell className="text-muted-foreground">
                        {user.email}
                      </TableCell>
                      <TableCell className="capitalize">
                        {roleLabel[user.role]}
                      </TableCell>
                      <TableCell>
                        <Badge
                          variant="outline"
                          className={statusBadge[user.status]}
                        >
                          {user.status}
                        </Badge>
                      </TableCell>
                      <TableCell className="text-xs text-muted-foreground">
                        {user.joinedAt}
                      </TableCell>
                      <TableCell className="text-right space-x-2">
                        <Button
                          variant="outline"
                          size="xs"
                          className="h-7 px-3 text-[11px]"
                        >
                          Edit
                        </Button>
                        <Button
                          variant="ghost"
                          size="xs"
                          className="h-7 px-3 text-[11px] text-destructive"
                        >
                          Disable
                        </Button>
                      </TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default UserManagement;

