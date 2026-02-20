import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { AppLayout } from "@/components/AppLayout";
import { StatusBadge, PriorityBadge, SLATimer, StatCard } from "@/components/FixoraUI";
import { TicketDetailModal } from "@/components/TicketDetailModal";
import {
  PlusCircle, FileText, Clock, CheckCircle2, AlertTriangle, Star, ChevronRight, Bell, TrendingUp
} from "lucide-react";

const mockTickets = [
  {
    id: "FX-2401",
    title: "Water leakage in bathroom ceiling",
    category: "Plumbing",
    status: "escalated" as const,
    priority: "critical" as const,
    date: "12 Feb 2024",
    slaHours: 4,
    slaTotalHours: 24,
    description: "Water dripping from the ceiling in my bathroom. Looks like pipe burst above.",
    timeline: [
      { label: "Complaint submitted", time: "12 Feb, 9:00 AM", done: true },
      { label: "AI categorized as Plumbing – Critical", time: "12 Feb, 9:01 AM", done: true },
      { label: "Assigned to Ravi Kumar", time: "12 Feb, 9:15 AM", done: true },
      { label: "Escalated – SLA breached", time: "13 Feb, 9:00 AM", done: true, escalated: true },
      { label: "Resolution pending", time: "In progress", done: false },
    ],
  },
  {
    id: "FX-2398",
    title: "Elevator stuck between floors B1 and G",
    category: "Electrical / Lift",
    status: "in_progress" as const,
    priority: "high" as const,
    date: "14 Feb 2024",
    slaHours: 18,
    slaTotalHours: 48,
    description: "Elevator stopped between floors. Maintenance team notified.",
    timeline: [
      { label: "Complaint submitted", time: "14 Feb, 2:00 PM", done: true },
      { label: "Assigned to Anil Sharma", time: "14 Feb, 2:20 PM", done: true },
      { label: "Technician dispatched", time: "14 Feb, 3:00 PM", done: true },
      { label: "Under repair", time: "Ongoing", done: false },
    ],
  },
  {
    id: "FX-2391",
    title: "Street light not working – Parking B4",
    category: "Electrical",
    status: "resolved" as const,
    priority: "medium" as const,
    date: "10 Feb 2024",
    slaHours: 0,
    slaTotalHours: 48,
    description: "The streetlight near parking slot B4 has been off for 3 days.",
    timeline: [
      { label: "Complaint submitted", time: "10 Feb, 6:00 PM", done: true },
      { label: "Assigned to Mukesh Verma", time: "10 Feb, 6:30 PM", done: true },
      { label: "Fixed and operational", time: "11 Feb, 11:00 AM", done: true },
    ],
    rating: 4,
  },
  {
    id: "FX-2385",
    title: "Garbage not collected from A Wing lobby",
    category: "Cleanliness",
    status: "resolved" as const,
    priority: "low" as const,
    date: "8 Feb 2024",
    slaHours: 0,
    slaTotalHours: 24,
    description: "Lobby garbage bin overflowing since morning.",
    timeline: [
      { label: "Complaint submitted", time: "8 Feb, 10:00 AM", done: true },
      { label: "Assigned to Deepak Singh", time: "8 Feb, 10:30 AM", done: true },
      { label: "Cleaned and resolved", time: "8 Feb, 1:00 PM", done: true },
    ],
    rating: 5,
  },
];

const notifications = [
  { text: "Ticket FX-2401 has been escalated to committee", time: "2h ago", type: "escalation" },
  { text: "FX-2398 status updated to In Progress", time: "5h ago", type: "update" },
  { text: "FX-2391 resolved – please rate your experience", time: "1d ago", type: "resolved" },
  { text: "FX-2385 marked as resolved by Deepak Singh", time: "2d ago", type: "resolved" },
  { text: "New AI insight: Plumbing issues up 40% this winter", time: "3d ago", type: "update" },
  { text: "Your complaint FX-2398 has been assigned to Anil Sharma", time: "4d ago", type: "update" },
];

export default function ResidentDashboard() {
  const navigate = useNavigate();
  const [selectedTicket, setSelectedTicket] = useState<typeof mockTickets[0] | null>(null);
  const [activeTab, setActiveTab] = useState("dashboard");

  const activeStatuses: string[] = ["in_progress", "escalated"];
  const open = mockTickets.filter((t) => activeStatuses.includes(t.status)).length;
  const escalated = mockTickets.filter((t) => t.status === "escalated").length;
  const resolved = mockTickets.filter((t) => t.status === "resolved").length;

  const renderContent = () => {
    if (activeTab === "tickets") {
      return (
        <div className="p-6 lg:p-8 space-y-6 animate-fade-in">
          <div>
            <h1 className="text-2xl font-bold text-foreground">My Tickets</h1>
            <p className="text-muted-foreground text-sm mt-0.5">All complaints raised by you</p>
          </div>
          <div className="flex gap-2 flex-wrap">
            {["All", "Escalated", "In Progress", "Resolved"].map((f) => (
              <span key={f} className="px-3 py-1 text-xs font-medium bg-card border border-border rounded-full text-foreground cursor-default">
                {f}
              </span>
            ))}
          </div>
          <div className="space-y-3">
            {mockTickets.map((ticket, i) => (
              <button
                key={ticket.id}
                onClick={() => setSelectedTicket(ticket)}
                className="w-full text-left bg-card rounded-xl border border-border p-4 hover:shadow-md hover:border-primary/30 transition-all duration-200 animate-slide-up group"
                style={{ animationDelay: `${i * 80}ms` }}
              >
                <div className="flex items-start justify-between gap-3 mb-3">
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-1">
                      <span className="text-xs font-mono text-muted-foreground">{ticket.id}</span>
                      <PriorityBadge priority={ticket.priority} />
                    </div>
                    <p className="font-medium text-sm text-foreground truncate">{ticket.title}</p>
                    <p className="text-xs text-muted-foreground mt-0.5">{ticket.category} · {ticket.date}</p>
                  </div>
                  <div className="flex items-center gap-2 flex-shrink-0">
                    <StatusBadge status={ticket.status} />
                    <ChevronRight className="w-4 h-4 text-muted-foreground group-hover:text-foreground transition-colors" />
                  </div>
                </div>
                {(["in_progress", "escalated"] as string[]).includes(ticket.status) && (
                  <SLATimer hoursRemaining={ticket.slaHours} totalHours={ticket.slaTotalHours} />
                )}
                {ticket.status === "resolved" && (
                  <div className="flex items-center gap-1 mt-1">
                    {[1, 2, 3, 4, 5].map((s) => (
                      <Star key={s} className={`w-3.5 h-3.5 ${s <= (ticket.rating || 0) ? "fill-warning text-warning" : "text-muted"}`} />
                    ))}
                    <span className="text-xs text-muted-foreground ml-1">{ticket.rating}/5</span>
                  </div>
                )}
              </button>
            ))}
          </div>
        </div>
      );
    }

    if (activeTab === "notifications") {
      return (
        <div className="p-6 lg:p-8 space-y-6 animate-fade-in">
          <div>
            <h1 className="text-2xl font-bold text-foreground">Notifications</h1>
            <p className="text-muted-foreground text-sm mt-0.5">{notifications.length} recent updates</p>
          </div>
          <div className="space-y-3">
            {notifications.map((n, i) => (
              <div
                key={i}
                className={`bg-card rounded-xl border p-4 flex items-start gap-3 animate-slide-up ${
                  n.type === "escalation" ? "border-escalation/30 bg-escalation/5" : "border-border"
                }`}
                style={{ animationDelay: `${i * 60}ms` }}
              >
                <div className={`w-2.5 h-2.5 rounded-full mt-1.5 flex-shrink-0 ${
                  n.type === "escalation" ? "bg-escalation" : n.type === "resolved" ? "bg-success" : "bg-primary"
                }`} />
                <div className="flex-1">
                  <p className="text-sm text-foreground leading-snug">{n.text}</p>
                  <p className="text-xs text-muted-foreground mt-0.5">{n.time}</p>
                </div>
                {n.type === "escalation" && (
                  <span className="text-xs font-semibold text-escalation bg-escalation/10 px-2 py-0.5 rounded-full flex-shrink-0">
                    Action needed
                  </span>
                )}
              </div>
            ))}
          </div>
        </div>
      );
    }

    // default dashboard
    return (
      <div className="p-6 lg:p-8 space-y-6 animate-fade-in">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-foreground">Good morning, Priya 👋</h1>
            <p className="text-muted-foreground text-sm mt-0.5">Flat 3B · Greenwood Heights</p>
          </div>
          <div className="flex items-center gap-3">
            <button
              onClick={() => setActiveTab("notifications")}
              className="relative w-9 h-9 bg-card rounded-xl border border-border flex items-center justify-center hover:shadow-md transition-shadow"
            >
              <Bell className="w-4 h-4 text-muted-foreground" />
              <span className="absolute -top-1 -right-1 w-4 h-4 bg-escalation rounded-full flex items-center justify-center text-white text-[10px] font-bold">
                {notifications.filter((n) => n.type === "escalation").length}
              </span>
            </button>
            <button
              onClick={() => navigate("/submit")}
              className="flex items-center gap-2 px-4 py-2 bg-gradient-accent text-white rounded-xl font-semibold text-sm shadow-accent hover:opacity-90 transition-opacity"
            >
              <PlusCircle className="w-4 h-4" />
              New Complaint
            </button>
          </div>
        </div>

        {escalated > 0 && (
          <div className="bg-escalation/10 border border-escalation/30 rounded-xl p-4 flex items-start gap-3 animate-slide-up">
            <AlertTriangle className="w-5 h-5 text-escalation flex-shrink-0 mt-0.5" />
            <div>
              <p className="text-sm font-semibold text-escalation">Escalation Alert</p>
              <p className="text-xs text-foreground mt-0.5">
                Ticket <strong>FX-2401</strong> has exceeded SLA limits and been escalated to the committee. You'll be notified of updates.
              </p>
            </div>
          </div>
        )}

        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          <StatCard label="Active Tickets" value={open} icon={FileText} accent="default" />
          <StatCard label="Escalated" value={escalated} icon={AlertTriangle} accent="red" />
          <StatCard label="Resolved" value={resolved} icon={CheckCircle2} accent="green" />
          <StatCard label="Avg Resolution" value="18h" icon={Clock} trend={{ value: -12, label: "vs last month" }} accent="orange" />
        </div>

        <div className="grid lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2 space-y-3">
            <div className="flex items-center justify-between">
              <h2 className="font-semibold text-foreground">My Complaints</h2>
              <button onClick={() => setActiveTab("tickets")} className="text-xs text-primary hover:underline">View all →</button>
            </div>
            <div className="space-y-3">
              {mockTickets.slice(0, 3).map((ticket, i) => (
                <button
                  key={ticket.id}
                  onClick={() => setSelectedTicket(ticket)}
                  className="w-full text-left bg-card rounded-xl border border-border p-4 hover:shadow-md hover:border-primary/30 transition-all duration-200 animate-slide-up group"
                  style={{ animationDelay: `${i * 80}ms` }}
                >
                  <div className="flex items-start justify-between gap-3 mb-3">
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-1">
                        <span className="text-xs font-mono text-muted-foreground">{ticket.id}</span>
                        <PriorityBadge priority={ticket.priority} />
                      </div>
                      <p className="font-medium text-sm text-foreground truncate">{ticket.title}</p>
                      <p className="text-xs text-muted-foreground mt-0.5">{ticket.category} · {ticket.date}</p>
                    </div>
                    <div className="flex items-center gap-2 flex-shrink-0">
                      <StatusBadge status={ticket.status} />
                      <ChevronRight className="w-4 h-4 text-muted-foreground group-hover:text-foreground transition-colors" />
                    </div>
                  </div>
                  {(["in_progress", "escalated"] as string[]).includes(ticket.status) && (
                    <SLATimer hoursRemaining={ticket.slaHours} totalHours={ticket.slaTotalHours} />
                  )}
                  {ticket.status === "resolved" && (
                    <div className="flex items-center gap-1 mt-1">
                      {[1, 2, 3, 4, 5].map((s) => (
                        <Star key={s} className={`w-3.5 h-3.5 ${s <= (ticket.rating || 0) ? "fill-warning text-warning" : "text-muted"}`} />
                      ))}
                      <span className="text-xs text-muted-foreground ml-1">{ticket.rating}/5</span>
                    </div>
                  )}
                </button>
              ))}
            </div>
          </div>

          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <h2 className="font-semibold text-foreground">Recent Updates</h2>
              <button onClick={() => setActiveTab("notifications")} className="text-xs text-primary hover:underline">View all →</button>
            </div>
            <div className="space-y-2">
              {notifications.slice(0, 4).map((n, i) => (
                <div
                  key={i}
                  className={`bg-card rounded-xl border p-3.5 animate-slide-up ${
                    n.type === "escalation" ? "border-escalation/30 bg-escalation/5" : "border-border"
                  }`}
                  style={{ animationDelay: `${i * 80}ms` }}
                >
                  <div className="flex items-start gap-2">
                    <div className={`w-2 h-2 rounded-full mt-1.5 flex-shrink-0 ${
                      n.type === "escalation" ? "bg-escalation" : n.type === "resolved" ? "bg-success" : "bg-primary"
                    }`} />
                    <div>
                      <p className="text-sm text-foreground leading-snug">{n.text}</p>
                      <p className="text-xs text-muted-foreground mt-0.5">{n.time}</p>
                    </div>
                  </div>
                </div>
              ))}
            </div>

            <div className="bg-primary rounded-xl p-4 mt-4">
              <div className="flex items-center gap-2 mb-2">
                <TrendingUp className="w-4 h-4 text-accent" />
                <p className="text-white text-xs font-semibold">AI Insight</p>
              </div>
              <p className="text-blue-200 text-xs leading-relaxed">
                Plumbing issues spike 40% in winter months. Your building has had 3 similar reports this week.
              </p>
            </div>
          </div>
        </div>
      </div>
    );
  };

  return (
    <AppLayout role="resident" userName="Priya Sharma" activeTab={activeTab} onTabChange={setActiveTab}>
      {renderContent()}
      {selectedTicket && (
        <TicketDetailModal ticket={selectedTicket} onClose={() => setSelectedTicket(null)} />
      )}
    </AppLayout>
  );
}
