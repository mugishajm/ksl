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
import { Plus, Search } from "lucide-react";
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
import { getGestures, createGesture } from "@/lib/api";
import { toast } from "sonner";

type Gesture = {
  _id: string;
  name: string;
  category: string;
  difficulty: "Beginner" | "Intermediate" | "Advanced";
  status: "Active" | "Draft" | "Archived";
  updatedAt: string;
};

const statusColor: Record<Gesture["status"], string> = {
  Active: "bg-emerald-50 text-emerald-700 dark:bg-emerald-900/40 dark:text-emerald-200",
  Draft: "bg-amber-50 text-amber-700 dark:bg-amber-900/40 dark:text-amber-200",
  Archived: "bg-slate-100 text-slate-600 dark:bg-slate-800 dark:text-slate-200",
};

const ManageGestures = () => {
  const [gestures, setGestures] = useState<Gesture[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState<Gesture["status"] | "All">(
    "All"
  );
  const [isAddOpen, setIsAddOpen] = useState(false);
  const [newName, setNewName] = useState("");
  const [newCategory, setNewCategory] = useState("");
  const [newDifficulty, setNewDifficulty] =
    useState<Gesture["difficulty"]>("Beginner");
  const [newStatus, setNewStatus] = useState<Gesture["status"]>("Active");
  const [isAdding, setIsAdding] = useState(false);

  useEffect(() => {
    fetchGestures();
  }, []);

  const fetchGestures = async () => {
    try {
      setLoading(true);
      const data = await getGestures();
      setGestures(data);
    } catch (err) {
      toast.error("Failed to load gestures");
    } finally {
      setLoading(false);
    }
  };

  const filteredGestures = useMemo(() => {
    return gestures.filter((g) => {
      const matchesSearch =
        search.trim().length === 0 ||
        g.name.toLowerCase().includes(search.toLowerCase()) ||
        g.category.toLowerCase().includes(search.toLowerCase());
      const matchesStatus =
        statusFilter === "All" ? true : g.status === statusFilter;
      return matchesSearch && matchesStatus;
    });
  }, [gestures, search, statusFilter]);

  const handleAddGesture = async () => {
    if (!newName.trim() || !newCategory.trim()) return;
    
    try {
      setIsAdding(true);
      const newGesture = await createGesture({
        name: newName.trim(),
        category: newCategory.trim(),
        difficulty: newDifficulty,
        status: newStatus,
      });

      setGestures((prev) => [newGesture, ...prev]);
      toast.success("Gesture added successfully");

      setNewName("");
      setNewCategory("");
      setNewDifficulty("Beginner");
      setNewStatus("Active");
      setIsAddOpen(false);
    } catch (err) {
      toast.error("Failed to add gesture");
    } finally {
      setIsAdding(false);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
        <div>
          <h1 className="text-2xl md:text-3xl font-display font-bold text-foreground">
            Manage Gestures
          </h1>
          <p className="text-sm text-muted-foreground mt-1">
            View, search, and manage KSL gesture definitions used by the system.
          </p>
        </div>
        <Dialog open={isAddOpen} onOpenChange={setIsAddOpen}>
          <Button
            className="bg-[#0f74d4] hover:bg-[#0d63b5] text-white"
            onClick={() => setIsAddOpen(true)}
          >
            <Plus className="mr-2 h-4 w-4" />
            Add Gesture
          </Button>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Add New Gesture</DialogTitle>
            </DialogHeader>
            <div className="space-y-3 py-2">
              <div className="space-y-1.5">
                <label className="text-xs font-medium text-muted-foreground">
                  Gesture Name
                </label>
                <Input
                  value={newName}
                  onChange={(e) => setNewName(e.target.value)}
                  placeholder="e.g. Hello"
                  className="h-8 text-sm"
                />
              </div>
              <div className="space-y-1.5">
                <label className="text-xs font-medium text-muted-foreground">
                  Category
                </label>
                <Input
                  value={newCategory}
                  onChange={(e) => setNewCategory(e.target.value)}
                  placeholder="e.g. Greetings"
                  className="h-8 text-sm"
                />
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1.5">
                  <label className="text-xs font-medium text-muted-foreground">
                    Difficulty
                  </label>
                  <Select
                    value={newDifficulty}
                    onValueChange={(value) =>
                      setNewDifficulty(value as Gesture["difficulty"])
                    }
                  >
                    <SelectTrigger className="h-8 text-xs">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="Beginner">Beginner</SelectItem>
                      <SelectItem value="Intermediate">Intermediate</SelectItem>
                      <SelectItem value="Advanced">Advanced</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-1.5">
                  <label className="text-xs font-medium text-muted-foreground">
                    Status
                  </label>
                  <Select
                    value={newStatus}
                    onValueChange={(value) =>
                      setNewStatus(value as Gesture["status"])
                    }
                  >
                    <SelectTrigger className="h-8 text-xs">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="Active">Active</SelectItem>
                      <SelectItem value="Draft">Draft</SelectItem>
                      <SelectItem value="Archived">Archived</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
            </div>
            <DialogFooter>
              <Button
                variant="outline"
                size="sm"
                onClick={() => setIsAddOpen(false)}
              >
                Cancel
              </Button>
              <Button
                size="sm"
                className="bg-[#0f74d4] hover:bg-[#0d63b5] text-white"
                onClick={handleAddGesture}
                disabled={!newName.trim() || !newCategory.trim() || isAdding}
              >
                {isAdding ? "Saving..." : "Save Gesture"}
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>

      <Card className="border-border bg-card shadow-sm">
        <CardHeader className="pb-3">
          <CardTitle className="text-sm font-semibold text-foreground">
            Gesture Library
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
            <div className="flex items-center gap-2 md:w-72">
              <div className="relative w-full">
                <Search className="pointer-events-none absolute left-2 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-muted-foreground" />
                <Input
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  placeholder="Search gestures..."
                  className="pl-7 h-8 text-xs"
                />
              </div>
            </div>
            <div className="flex flex-wrap items-center gap-2 text-xs">
              <span className="text-muted-foreground">Status:</span>
              <div className="flex gap-1">
                {["All", "Active", "Draft", "Archived"].map((status) => (
                  <button
                    key={status}
                    type="button"
                    onClick={() =>
                      setStatusFilter(status as Gesture["status"] | "All")
                    }
                    className={`rounded-full px-3 py-1 border text-xs ${
                      statusFilter === status
                        ? "border-[#0f74d4] bg-[#0f74d4]/10 text-[#0f74d4]"
                        : "border-border text-muted-foreground hover:bg-muted/60"
                    }`}
                  >
                    {status}
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
                  <TableHead>Category</TableHead>
                  <TableHead>Difficulty</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Last Updated</TableHead>
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
                      Loading gestures...
                    </TableCell>
                  </TableRow>
                ) : filteredGestures.length === 0 ? (
                  <TableRow>
                    <TableCell
                      colSpan={6}
                      className="py-6 text-center text-sm text-muted-foreground"
                    >
                      No gestures match your filters.
                    </TableCell>
                  </TableRow>
                ) : (
                  filteredGestures.map((gesture) => (
                    <TableRow key={gesture._id}>
                      <TableCell className="font-medium">
                        {gesture.name}
                      </TableCell>
                      <TableCell className="text-muted-foreground">
                        {gesture.category}
                      </TableCell>
                      <TableCell className="text-muted-foreground">
                        {gesture.difficulty}
                      </TableCell>
                      <TableCell>
                        <Badge
                          className={statusColor[gesture.status]}
                          variant="outline"
                        >
                          {gesture.status}
                        </Badge>
                      </TableCell>
                      <TableCell className="text-muted-foreground text-xs">
                        {gesture.updatedAt ? new Date(gesture.updatedAt).toLocaleDateString("en-US", { year: "numeric", month: "short", day: "numeric" }) : "N/A"}
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
                          Archive
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

export default ManageGestures;

