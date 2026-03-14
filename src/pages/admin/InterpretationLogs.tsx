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
import { Search, Download } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { getLogs } from "@/lib/api";
import { toast } from "sonner";

type InterpretationLog = {
  _id: string;
  user: string;
  type: "Gesture Translation" | "Live Interpretation";
  status: "Completed" | "Pending" | "Failed";
  createdAt: string;
  duration: string;
};

const statusClass: Record<InterpretationLog["status"], string> = {
  Completed:
    "bg-emerald-50 text-emerald-700 dark:bg-emerald-900/40 dark:text-emerald-200",
  Pending:
    "bg-amber-50 text-amber-700 dark:bg-amber-900/40 dark:text-amber-200",
  Failed:
    "bg-rose-50 text-rose-700 dark:bg-rose-900/40 dark:text-rose-200",
};

const InterpretationLogs = () => {
  const [logs, setLogs] = useState<InterpretationLog[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] =
    useState<InterpretationLog["status"] | "All">("All");
  const [selectedLog, setSelectedLog] = useState<InterpretationLog | null>(
    null
  );

  useEffect(() => {
    fetchLogs();
  }, []);

  const fetchLogs = async () => {
    try {
      setLoading(true);
      const data = await getLogs();
      setLogs(data);
    } catch (err) {
      toast.error("Failed to load interpretation logs");
    } finally {
      setLoading(false);
    }
  };

  const filtered = useMemo(() => {
    return logs.filter((log) => {
      const s = search.trim().toLowerCase();
      const matchesSearch =
        s.length === 0 ||
        log.user.toLowerCase().includes(s) ||
        log.type.toLowerCase().includes(s);
      const matchesStatus =
        statusFilter === "All" ? true : log.status === statusFilter;
      return matchesSearch && matchesStatus;
    });
  }, [logs, search, statusFilter]);

  const handleExportCsv = () => {
    const rows = [
      ["User", "Type", "Status", "Started At", "Duration"],
      ...filtered.map((log) => [
        log.user,
        log.type,
        log.status,
        log.createdAt,
        log.duration,
      ]),
    ];

    const csvContent = rows
      .map((r) => r.map((field) => `"${String(field).replace(/"/g, '""')}"`).join(","))
      .join("\n");

    const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.setAttribute("download", "interpretation-logs.csv");
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
        <div>
          <h1 className="text-2xl md:text-3xl font-display font-bold text-foreground">
            Interpretation Logs
          </h1>
          <p className="text-sm text-muted-foreground mt-1">
            Review recent interpretation activity and session details.
          </p>
        </div>
        <Button
          variant="outline"
          className="border-[#0f74d4] text-[#0f74d4]"
          onClick={handleExportCsv}
        >
          <Download className="mr-2 h-4 w-4" />
          Export CSV
        </Button>
      </div>

      <Card className="border-border bg-card shadow-sm">
        <CardHeader className="pb-3">
          <CardTitle className="text-sm font-semibold text-foreground">
            Recent Interpretation Requests
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
            <div className="relative w-full md:w-80">
              <Search className="pointer-events-none absolute left-2 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-muted-foreground" />
              <Input
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Search by user or type..."
                className="pl-7 h-8 text-xs"
              />
            </div>
            <div className="flex flex-wrap items-center gap-2 text-xs">
              <span className="text-muted-foreground">Status:</span>
              <div className="flex gap-1">
                {["All", "Completed", "Pending", "Failed"].map((s) => (
                  <button
                    key={s}
                    type="button"
                    onClick={() =>
                      setStatusFilter(s as InterpretationLog["status"] | "All")
                    }
                    className={`rounded-full px-3 py-1 border text-xs ${
                      statusFilter === s
                        ? "border-[#0f74d4] bg-[#0f74d4]/10 text-[#0f74d4]"
                        : "border-border text-muted-foreground hover:bg-muted/60"
                    }`}
                  >
                    {s}
                  </button>
                ))}
              </div>
            </div>
          </div>

          <div className="rounded-lg border border-border overflow-hidden bg-background">
            <Table>
              <TableHeader>
                <TableRow className="bg-muted/60">
                  <TableHead>User</TableHead>
                  <TableHead>Request Type</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Started At</TableHead>
                  <TableHead>Duration</TableHead>
                  <TableHead className="text-right">Details</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {loading ? (
                  <TableRow>
                    <TableCell
                      colSpan={6}
                      className="py-6 text-center text-sm text-muted-foreground"
                    >
                      Loading logs...
                    </TableCell>
                  </TableRow>
                ) : filtered.length === 0 ? (
                  <TableRow>
                    <TableCell
                      colSpan={6}
                      className="py-6 text-center text-sm text-muted-foreground"
                    >
                      No logs match your filters.
                    </TableCell>
                  </TableRow>
                ) : (
                  filtered.map((log) => (
                    <TableRow key={log._id}>
                      <TableCell className="font-medium">
                        {log.user}
                      </TableCell>
                      <TableCell className="text-muted-foreground">
                        {log.type}
                      </TableCell>
                      <TableCell>
                        <Badge
                          variant="outline"
                          className={statusClass[log.status]}
                        >
                          {log.status}
                        </Badge>
                      </TableCell>
                      <TableCell className="text-xs text-muted-foreground">
                        {new Date(log.createdAt).toLocaleString()}
                      </TableCell>
                      <TableCell className="text-xs text-muted-foreground">
                        {log.duration}
                      </TableCell>
                      <TableCell className="text-right">
                        <Button
                          variant="outline"
                          size="xs"
                          className="h-7 px-3 text-[11px]"
                          onClick={() => setSelectedLog(log)}
                        >
                          View
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

      <Dialog
        open={selectedLog !== null}
        onOpenChange={(open) => {
          if (!open) setSelectedLog(null);
        }}
      >
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Interpretation Details</DialogTitle>
          </DialogHeader>
          {selectedLog && (
            <div className="space-y-2 text-sm">
              <div>
                <span className="text-xs font-medium text-muted-foreground">
                  User
                </span>
                <p className="font-medium">{selectedLog.user}</p>
              </div>
              <div>
                <span className="text-xs font-medium text-muted-foreground">
                  Request Type
                </span>
                <p>{selectedLog.type}</p>
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <span className="text-xs font-medium text-muted-foreground">
                    Status
                  </span>
                  <div className="mt-1">
                    <Badge
                      variant="outline"
                      className={statusClass[selectedLog.status]}
                    >
                      {selectedLog.status}
                    </Badge>
                  </div>
                </div>
                <div>
                  <span className="text-xs font-medium text-muted-foreground">
                    Duration
                  </span>
                  <p className="mt-1">{selectedLog.duration}</p>
                </div>
              </div>
              <div>
                <span className="text-xs font-medium text-muted-foreground">
                  Started At
                </span>
                <p className="mt-1 text-xs text-muted-foreground">
                  {new Date(selectedLog.createdAt).toLocaleString()}
                </p>
              </div>
            </div>
          )}
          <DialogFooter>
            <Button
              size="sm"
              variant="outline"
              onClick={() => setSelectedLog(null)}
            >
              Close
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default InterpretationLogs;

