import { ReactNode } from "react";

interface StatusBadgeProps {
  status: "open" | "in_progress" | "escalated" | "resolved" | "closed";
}

const config = {
  open: { label: "Open", className: "bg-blue-100 text-blue-700 border-blue-200" },
  in_progress: { label: "In Progress", className: "bg-warning/15 text-warning border-warning/30" },
  escalated: { label: "Escalated", className: "bg-escalation/15 text-escalation border-escalation/30 animate-pulse-red" },
  resolved: { label: "Resolved", className: "bg-success/15 text-success border-success/30" },
  closed: { label: "Closed", className: "bg-muted text-muted-foreground border-border" },
};

export function StatusBadge({ status }: StatusBadgeProps) {
  const { label, className } = config[status];
  return (
    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold border ${className}`}>
      {status === "escalated" && <span className="w-1.5 h-1.5 rounded-full bg-escalation mr-1.5 animate-pulse-red" />}
      {label}
    </span>
  );
}

interface PriorityBadgeProps {
  priority: "low" | "medium" | "high" | "critical";
}

const priorityConfig = {
  low: { label: "Low", className: "bg-muted text-muted-foreground" },
  medium: { label: "Medium", className: "bg-blue-100 text-blue-700" },
  high: { label: "High", className: "bg-orange-100 text-orange-700" },
  critical: { label: "Critical", className: "bg-red-100 text-red-700 font-bold" },
};

export function PriorityBadge({ priority }: PriorityBadgeProps) {
  const { label, className } = priorityConfig[priority];
  return (
    <span className={`inline-flex items-center px-2 py-0.5 rounded text-xs font-medium ${className}`}>
      {label}
    </span>
  );
}

interface StatCardProps {
  label: string;
  value: string | number;
  icon: React.ElementType;
  trend?: { value: number; label: string };
  accent?: "default" | "orange" | "green" | "red";
  children?: ReactNode;
}

const accentMap = {
  default: "bg-primary/10 text-primary",
  orange: "bg-accent/10 text-accent",
  green: "bg-success/10 text-success",
  red: "bg-escalation/10 text-escalation",
};

export function StatCard({ label, value, icon: Icon, trend, accent = "default", children }: StatCardProps) {
  return (
    <div className="bg-card rounded-xl border border-border p-5 shadow-sm hover:shadow-md transition-shadow">
      <div className="flex items-start justify-between mb-3">
        <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${accentMap[accent]}`}>
          <Icon className="w-5 h-5" />
        </div>
        {trend && (
          <span className={`text-xs font-medium px-2 py-0.5 rounded-full ${trend.value >= 0 ? "bg-success/10 text-success" : "bg-escalation/10 text-escalation"}`}>
            {trend.value >= 0 ? "+" : ""}{trend.value}% {trend.label}
          </span>
        )}
      </div>
      <p className="text-2xl font-bold text-foreground">{value}</p>
      <p className="text-xs text-muted-foreground mt-0.5">{label}</p>
      {children}
    </div>
  );
}

interface SLATimerProps {
  hoursRemaining: number;
  totalHours: number;
}

export function SLATimer({ hoursRemaining, totalHours }: SLATimerProps) {
  const pct = Math.max(0, (hoursRemaining / totalHours) * 100);
  const isUrgent = pct < 25;
  const isWarning = pct < 50;

  return (
    <div className="space-y-1">
      <div className="flex items-center justify-between text-xs">
        <span className="text-muted-foreground">SLA</span>
        <span className={`font-medium ${isUrgent ? "text-escalation animate-pulse-red" : isWarning ? "text-warning" : "text-success"}`}>
          {hoursRemaining}h left
        </span>
      </div>
      <div className="h-1.5 bg-muted rounded-full overflow-hidden">
        <div
          className={`h-full rounded-full transition-all ${isUrgent ? "bg-escalation" : isWarning ? "bg-warning" : "bg-success"}`}
          style={{ width: `${pct}%` }}
        />
      </div>
    </div>
  );
}
