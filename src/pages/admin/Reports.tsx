import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Download, RefreshCw } from "lucide-react";
import {
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
  ChartLegend,
  ChartLegendContent,
} from "@/components/ui/chart";
import { BarChart, Bar, LineChart, Line, CartesianGrid, XAxis, YAxis } from "recharts";
import { getReportStats } from "@/lib/api";
import { toast } from "sonner";

type ReportStats = {
  totalInterpretations: number;
  averageAccuracy: string;
  activeUsers: number;
  interpretationsData: any[];
  accuracyData: any[];
};

const Reports = () => {
  const [range, setRange] = useState<"7d" | "30d" | "90d">("30d");
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [stats, setStats] = useState<ReportStats | null>(null);

  useEffect(() => {
    fetchStats(range);
  }, [range]);

  const fetchStats = async (selectedRange: "7d" | "30d" | "90d") => {
    try {
      setIsRefreshing(true);
      const data = await getReportStats(selectedRange);
      setStats(data);
    } catch (err) {
      toast.error("Failed to load report stats");
    } finally {
      setIsRefreshing(false);
    }
  };

  const chartConfig = {
    total: { label: "Interpretations", color: "#0f74d4" },
    accuracy: { label: "Accuracy", color: "#31c76a" },
  };

  const handleRangeClick = (value: "7d" | "30d" | "90d") => {
    if (value !== range) {
      setRange(value);
    }
  };

  const handleRefresh = () => {
    fetchStats(range);
  };

  const handleExportSummary = () => {
    const text = `KSL Reports summary\nRange: ${range}\nGenerated at: ${new Date().toISOString()}\nTotal Interpretations: ${stats?.totalInterpretations}\nAverage Accuracy: ${stats?.averageAccuracy}%`;
    const blob = new Blob([text], { type: "text/plain;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.setAttribute("download", "ksl-report-summary.txt");
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
            Reports
          </h1>
          <p className="text-sm text-muted-foreground mt-1">
            View high-level metrics and export summaries for your KSL system.
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Button
            variant="outline"
            className="border-[#0f74d4] text-[#0f74d4]"
            onClick={handleExportSummary}
          >
            <Download className="mr-2 h-4 w-4" />
            Export Summary
          </Button>
          <Button
            variant="ghost"
            className="text-[#0f74d4]"
            onClick={handleRefresh}
          >
            <RefreshCw
              className={`mr-1.5 h-4 w-4 ${
                isRefreshing ? "animate-spin" : ""
              }`}
            />
            Refresh
          </Button>
        </div>
      </div>

      <Card className="border-border bg-card shadow-sm">
        <CardHeader className="pb-3">
          <div className="flex flex-col gap-2 md:flex-row md:items-center md:justify-between">
            <CardTitle className="text-sm font-semibold text-foreground">
              Overview
            </CardTitle>
            <div className="flex flex-wrap items-center gap-2 text-xs">
              <span className="text-muted-foreground">Range:</span>
              <div className="flex gap-1">
                {[
                  { label: "7 days", value: "7d" },
                  { label: "30 days", value: "30d" },
                  { label: "90 days", value: "90d" },
                ].map((opt) => (
                  <button
                    key={opt.value}
                    type="button"
                    onClick={() =>
                      handleRangeClick(opt.value as "7d" | "30d" | "90d")
                    }
                    className={`rounded-full px-3 py-1 border text-xs ${
                      range === opt.value
                        ? "border-[#0f74d4] bg-[#0f74d4]/10 text-[#0f74d4]"
                        : "border-border text-muted-foreground hover:bg-muted/60"
                    }`}
                  >
                    {opt.label}
                  </button>
                ))}
              </div>
            </div>
          </div>
        </CardHeader>
        <CardContent className="grid gap-4 md:grid-cols-3 text-sm">
          <div className="rounded-lg bg-muted/60 px-4 py-3">
            <p className="text-xs text-muted-foreground mb-1">
              Total Interpretations
            </p>
            <p className="text-2xl font-semibold text-foreground">
              {stats ? stats.totalInterpretations : "..."}
            </p>
            <p className="text-[11px] text-emerald-500 mt-1">
              +12% vs previous {range}
            </p>
          </div>
          <div className="rounded-lg bg-muted/60 px-4 py-3">
            <p className="text-xs text-muted-foreground mb-1">
              Average Accuracy
            </p>
            <p className="text-2xl font-semibold text-foreground">
              {stats ? `${stats.averageAccuracy}%` : "..."}
            </p>
            <p className="text-[11px] text-emerald-500 mt-1">
              Stable performance
            </p>
          </div>
          <div className="rounded-lg bg-muted/60 px-4 py-3">
            <p className="text-xs text-muted-foreground mb-1">
              Active Users
            </p>
            <p className="text-2xl font-semibold text-foreground">
              {stats ? stats.activeUsers : "..."}
            </p>
            <p className="text-[11px] text-sky-500 mt-1">
              +8 new registrations
            </p>
          </div>
        </CardContent>
      </Card>

      <Card className="border-border bg-card shadow-sm">
        <CardHeader className="pb-3">
          <CardTitle className="text-sm font-semibold text-foreground">
            Statistics
          </CardTitle>
        </CardHeader>
        <CardContent className="grid gap-6 md:grid-cols-2">
          <div>
            <p className="mb-2 text-xs font-medium text-muted-foreground">
              Interpretations per day
            </p>
            <ChartContainer config={chartConfig} className="h-[220px] w-full">
              <BarChart data={stats?.interpretationsData || []} margin={{ left: 0, right: 0, top: 10 }}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} className="stroke-muted" />
                <XAxis dataKey="label" tickLine={false} axisLine={{ stroke: "#e5e7eb" }} />
                <YAxis tickLine={false} axisLine={{ stroke: "#e5e7eb" }} />
                <ChartTooltip content={<ChartTooltipContent />} />
                <ChartLegend content={<ChartLegendContent />} />
                <Bar dataKey="total" radius={[4, 4, 0, 0]} fill="#0f74d4" />
              </BarChart>
            </ChartContainer>
          </div>
          <div>
            <p className="mb-2 text-xs font-medium text-muted-foreground">
              Accuracy trend
            </p>
            <ChartContainer config={chartConfig} className="h-[220px] w-full">
              <LineChart data={stats?.accuracyData || []} margin={{ left: 0, right: 0, top: 10 }}>
                <CartesianGrid strokeDasharray="3 3" className="stroke-muted" />
                <XAxis dataKey="label" tickLine={false} axisLine={{ stroke: "#e5e7eb" }} />
                <YAxis domain={[90, 100]} tickLine={false} axisLine={{ stroke: "#e5e7eb" }} />
                <ChartTooltip content={<ChartTooltipContent />} />
                <ChartLegend content={<ChartLegendContent />} />
                <Line
                  type="monotone"
                  dataKey="accuracy"
                  stroke="#31c76a"
                  strokeWidth={2}
                  dot={{ r: 3 }}
                  activeDot={{ r: 5 }}
                />
              </LineChart>
            </ChartContainer>
          </div>
        </CardContent>
      </Card>

      <Card className="border-border bg-card shadow-sm">
        <CardHeader className="pb-3">
          <CardTitle className="text-sm font-semibold text-foreground">
            Quick Notes
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-3 text-sm">
          <p className="text-muted-foreground">
            Use the controls above to refresh data and export a text summary. In
            a full implementation, this page would pull real analytics from
            your backend or Power BI.
          </p>
          <div className="flex flex-wrap gap-2">
            <Badge variant="outline">Accuracy</Badge>
            <Badge variant="outline">Usage</Badge>
            <Badge variant="outline">Errors</Badge>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default Reports;

