import { AppLayout } from "@/components/AppLayout";
import { StatusBadge, SLATimer } from "@/components/FixoraUI";
import { CheckCircle2, Clock, Wrench, ChevronRight, History, Star } from "lucide-react";
import { useState } from "react";

const allTasks = [
  { id: "FX-2401", title: "Water leakage in bathroom ceiling", location: "Flat 3B", category: "Plumbing", status: "escalated" as const, priority: "critical" as const, slaHours: 4, slaTotalHours: 24, reportedBy: "Priya Sharma", date: "12 Feb 2024" },
  { id: "FX-2400", title: "CCTV camera not working at Gate 2", location: "Gate 2", category: "Security", status: "in_progress" as const, priority: "high" as const, slaHours: 20, slaTotalHours: 48, reportedBy: "Admin", date: "13 Feb 2024" },
  { id: "FX-2395", title: "Garbage not collected from B Block", location: "B Block Lobby", category: "Cleanliness", status: "in_progress" as const, priority: "medium" as const, slaHours: 30, slaTotalHours: 48, reportedBy: "Rahul Mehta", date: "13 Feb 2024" },
];

const historyTasks = [
  { id: "FX-2388", title: "Intercom not working in A Wing", location: "A Wing", category: "Electrical", resolvedDate: "10 Feb 2024", rating: 5, reportedBy: "Ankit Sharma" },
  { id: "FX-2380", title: "Broken park bench near Block C", location: "Garden Area", category: "Civil", resolvedDate: "7 Feb 2024", rating: 4, reportedBy: "Sunita Gupta" },
  { id: "FX-2371", title: "Water pump noise – basement", location: "Basement", category: "Plumbing", resolvedDate: "3 Feb 2024", rating: 4, reportedBy: "Vikram Rao" },
  { id: "FX-2362", title: "Gate 1 boom barrier jammed", location: "Main Gate", category: "Mechanical", resolvedDate: "28 Jan 2024", rating: 5, reportedBy: "Kavya Nair" },
];

export default function StaffDashboard() {
  const [taskStatus, setTaskStatus] = useState<Record<string, "in_progress" | "escalated" | "resolved">>({});
  const [activeTab, setActiveTab] = useState("dashboard");

  const updateStatus = (id: string, status: "in_progress" | "escalated" | "resolved") => {
    setTaskStatus((prev) => ({ ...prev, [id]: status }));
  };

  const getStatus = (task: typeof allTasks[0]) =>
    taskStatus[task.id] ?? task.status;

  const activeTasks = allTasks.filter((t) => getStatus(t) !== "resolved");
  const resolvedCount = allTasks.filter((t) => getStatus(t) === "resolved").length;
  const escalatedCount = allTasks.filter((t) => getStatus(t) === "escalated").length;

  const renderContent = () => {
    // ── MY TASKS ─────────────────────────────────────────────────────────────
    if (activeTab === "tasks") {
      return (
        <div className="p-6 lg:p-8 space-y-6 animate-fade-in">
          <div>
            <h1 className="text-2xl font-bold text-foreground">My Tasks</h1>
            <p className="text-muted-foreground text-sm mt-0.5">All assigned maintenance jobs</p>
          </div>
          <div className="space-y-3">
            {allTasks.map((task, i) => {
              const currentStatus = getStatus(task);
              const isResolved = currentStatus === "resolved";
              return (
                <div
                  key={task.id}
                  className={`bg-card rounded-xl border p-4 animate-slide-up ${task.status === "escalated" && !isResolved ? "border-escalation/40" : "border-border"}`}
                  style={{ animationDelay: `${i * 70}ms` }}
                >
                  <div className="flex items-start justify-between gap-3 mb-3">
                    <div>
                      <div className="flex items-center gap-2 mb-1">
                        <span className="text-xs font-mono text-muted-foreground">{task.id}</span>
                        <StatusBadge status={currentStatus} />
                      </div>
                      <p className="font-semibold text-sm text-foreground">{task.title}</p>
                      <div className="flex flex-wrap items-center gap-x-3 gap-y-1 mt-1.5 text-xs text-muted-foreground">
                        <span className="flex items-center gap-1"><Wrench className="w-3 h-3" /> {task.category}</span>
                        <span className="flex items-center gap-1"><Clock className="w-3 h-3" /> {task.location}</span>
                        <span>Reported by {task.reportedBy}</span>
                        <span>{task.date}</span>
                      </div>
                    </div>
                  </div>
                  {!isResolved && (
                    <SLATimer hoursRemaining={task.slaHours} totalHours={task.slaTotalHours} />
                  )}
                  {!isResolved && (
                    <button
                      onClick={() => updateStatus(task.id, "resolved")}
                      className="mt-3 w-full flex items-center justify-center gap-2 py-2.5 bg-success/10 border border-success/30 text-success rounded-xl text-sm font-semibold hover:bg-success hover:text-white transition-all"
                    >
                      <CheckCircle2 className="w-4 h-4" />
                      Mark as Resolved
                    </button>
                  )}
                  {isResolved && (
                    <div className="mt-3 flex items-center gap-2 text-success text-sm font-medium">
                      <CheckCircle2 className="w-4 h-4" />
                      Resolved successfully
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </div>
      );
    }

    // ── HISTORY ───────────────────────────────────────────────────────────────
    if (activeTab === "history") {
      return (
        <div className="p-6 lg:p-8 space-y-6 animate-fade-in">
          <div>
            <h1 className="text-2xl font-bold text-foreground">Resolution History</h1>
            <p className="text-muted-foreground text-sm mt-0.5">{historyTasks.length + resolvedCount} completed tasks</p>
          </div>

          {/* Stats */}
          <div className="grid grid-cols-3 gap-4">
            <div className="bg-card rounded-xl border border-border p-4 text-center">
              <p className="text-2xl font-bold text-foreground">{historyTasks.length + resolvedCount}</p>
              <p className="text-xs text-muted-foreground mt-0.5">Total Resolved</p>
            </div>
            <div className="bg-card rounded-xl border border-border p-4 text-center">
              <p className="text-2xl font-bold text-foreground">4.5</p>
              <p className="text-xs text-muted-foreground mt-0.5">Avg Rating</p>
            </div>
            <div className="bg-card rounded-xl border border-border p-4 text-center">
              <p className="text-2xl font-bold text-foreground">16h</p>
              <p className="text-xs text-muted-foreground mt-0.5">Avg Resolution</p>
            </div>
          </div>

          {/* Resolved this session */}
          {allTasks.filter((t) => getStatus(t) === "resolved").map((task) => (
            <div key={task.id} className="bg-card rounded-xl border border-success/30 p-4">
              <div className="flex items-center gap-2 mb-1">
                <span className="text-xs font-mono text-muted-foreground">{task.id}</span>
                <span className="text-xs font-semibold text-success bg-success/10 px-2 py-0.5 rounded-full">Resolved today</span>
              </div>
              <p className="font-semibold text-sm text-foreground">{task.title}</p>
              <p className="text-xs text-muted-foreground mt-0.5">{task.category} · {task.location} · Reported by {task.reportedBy}</p>
            </div>
          ))}

          {/* Past history */}
          <div className="space-y-3">
            {historyTasks.map((task, i) => (
              <div
                key={task.id}
                className="bg-card rounded-xl border border-border p-4 flex items-start gap-3 animate-slide-up"
                style={{ animationDelay: `${i * 70}ms` }}
              >
                <div className="w-8 h-8 bg-success/10 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5">
                  <CheckCircle2 className="w-4 h-4 text-success" />
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-0.5">
                    <span className="text-xs font-mono text-muted-foreground">{task.id}</span>
                  </div>
                  <p className="font-semibold text-sm text-foreground">{task.title}</p>
                  <div className="flex flex-wrap items-center gap-x-3 gap-y-0.5 mt-1 text-xs text-muted-foreground">
                    <span>{task.category} · {task.location}</span>
                    <span>Resolved {task.resolvedDate}</span>
                    <span>Reported by {task.reportedBy}</span>
                  </div>
                </div>
                <div className="flex flex-col items-end gap-1 flex-shrink-0">
                  <div className="flex items-center gap-0.5">
                    {[1, 2, 3, 4, 5].map((s) => (
                      <Star key={s} className={`w-3.5 h-3.5 ${s <= task.rating ? "fill-warning text-warning" : "text-muted"}`} />
                    ))}
                  </div>
                  <span className="text-xs text-muted-foreground">{task.rating}/5</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      );
    }

    // ── DASHBOARD (default) ──────────────────────────────────────────────────
    return (
      <div className="p-6 lg:p-8 space-y-6 animate-fade-in">
        <div>
          <h1 className="text-2xl font-bold text-foreground">My Tasks</h1>
          <p className="text-muted-foreground text-sm mt-0.5">Ravi Kumar · Maintenance Staff</p>
        </div>

        <div className="grid grid-cols-3 gap-4">
          <div className="bg-card rounded-xl border border-border p-4 text-center">
            <p className="text-2xl font-bold text-foreground">{activeTasks.length}</p>
            <p className="text-xs text-muted-foreground mt-0.5">Active</p>
          </div>
          <div className="bg-card rounded-xl border border-border p-4 text-center">
            <p className="text-2xl font-bold text-escalation">{escalatedCount}</p>
            <p className="text-xs text-muted-foreground mt-0.5">Escalated</p>
          </div>
          <div className="bg-card rounded-xl border border-border p-4 text-center">
            <p className="text-2xl font-bold text-success">{resolvedCount + historyTasks.length}</p>
            <p className="text-xs text-muted-foreground mt-0.5">Resolved</p>
          </div>
        </div>

        <div className="space-y-3">
          {allTasks.map((task, i) => {
            const currentStatus = getStatus(task);
            const isResolved = currentStatus === "resolved";
            return (
              <div
                key={task.id}
                className={`bg-card rounded-xl border p-4 animate-slide-up ${!isResolved && currentStatus === "escalated" ? "border-escalation/40" : "border-border"}`}
                style={{ animationDelay: `${i * 80}ms` }}
              >
                <div className="flex items-start justify-between gap-3 mb-3">
                  <div>
                    <div className="flex items-center gap-2 mb-1">
                      <span className="text-xs font-mono text-muted-foreground">{task.id}</span>
                      <StatusBadge status={currentStatus} />
                    </div>
                    <p className="font-semibold text-sm text-foreground">{task.title}</p>
                    <div className="flex flex-wrap items-center gap-x-3 gap-y-0.5 mt-1 text-xs text-muted-foreground">
                      <span className="flex items-center gap-1"><Wrench className="w-3 h-3" /> {task.category}</span>
                      <span className="flex items-center gap-1"><Clock className="w-3 h-3" /> {task.location}</span>
                      <span>· {task.reportedBy}</span>
                    </div>
                  </div>
                </div>
                {!isResolved && (
                  <SLATimer hoursRemaining={task.slaHours} totalHours={task.slaTotalHours} />
                )}
                {!isResolved && (
                  <button
                    onClick={() => updateStatus(task.id, "resolved")}
                    className="mt-3 w-full flex items-center justify-center gap-2 py-2.5 bg-success/10 border border-success/30 text-success rounded-xl text-sm font-semibold hover:bg-success hover:text-white transition-all"
                  >
                    <CheckCircle2 className="w-4 h-4" />
                    Mark as Resolved
                  </button>
                )}
                {isResolved && (
                  <div className="mt-3 flex items-center gap-2 text-success text-sm font-medium">
                    <CheckCircle2 className="w-4 h-4" />
                    Resolved successfully
                  </div>
                )}
              </div>
            );
          })}
        </div>

        {/* Quick link to history */}
        <button
          onClick={() => setActiveTab("history")}
          className="w-full flex items-center justify-center gap-2 py-3 bg-card border border-border rounded-xl text-sm font-medium text-foreground hover:shadow-md transition-shadow"
        >
          <History className="w-4 h-4 text-muted-foreground" />
          View Resolution History
          <ChevronRight className="w-4 h-4 text-muted-foreground" />
        </button>
      </div>
    );
  };

  return (
    <AppLayout role="staff" userName="Ravi Kumar" activeTab={activeTab} onTabChange={setActiveTab}>
      {renderContent()}
    </AppLayout>
  );
}
