import { useState } from "react";
import { AppLayout } from "@/components/AppLayout";
import { StatusBadge, PriorityBadge, SLATimer, StatCard } from "@/components/FixoraUI";
import { TicketDetailModal } from "@/components/TicketDetailModal";
import {
  AlertTriangle, FileText, Users, Clock, TrendingUp, ChevronRight,
  Download, BarChart3, CheckCircle2, Search, Star, Settings, Bell, Shield, Wrench, Phone
} from "lucide-react";

const allTickets = [
  { id: "FX-2401", title: "Water leakage in bathroom ceiling", category: "Plumbing", status: "escalated" as const, priority: "critical" as const, resident: "Priya Sharma · Flat 3B", date: "12 Feb", slaHours: 4, slaTotalHours: 24, assignedTo: "Ravi Kumar", description: "Water dripping from ceiling in bathroom.", timeline: [{ label: "Complaint submitted", time: "12 Feb, 9:00 AM", done: true }, { label: "Assigned to Ravi Kumar", time: "12 Feb, 9:15 AM", done: true }, { label: "Escalated – SLA breached", time: "13 Feb, 9:00 AM", done: true, escalated: true }, { label: "Pending resolution", time: "Ongoing", done: false }] },
  { id: "FX-2400", title: "CCTV camera not working at Gate 2", category: "Security", status: "in_progress" as const, priority: "high" as const, resident: "Admin Report", date: "13 Feb", slaHours: 20, slaTotalHours: 48, assignedTo: "Anil Sharma", description: "Camera at Gate 2 has been offline since yesterday.", timeline: [{ label: "Raised by admin", time: "13 Feb", done: true }, { label: "Assigned to Anil Sharma", time: "13 Feb", done: true }, { label: "Under repair", time: "Ongoing", done: false }] },
  { id: "FX-2398", title: "Elevator stuck between B1 and G", category: "Electrical / Lift", status: "in_progress" as const, priority: "high" as const, resident: "Sunita Gupta · Flat 7A", date: "14 Feb", slaHours: 18, slaTotalHours: 48, assignedTo: "Mukesh Verma", description: "Elevator stopped between floors.", timeline: [{ label: "Complaint submitted", time: "14 Feb", done: true }, { label: "Assigned to Mukesh Verma", time: "14 Feb", done: true }, { label: "Under repair", time: "Ongoing", done: false }] },
  { id: "FX-2395", title: "Garbage not collected from B Block", category: "Cleanliness", status: "in_progress" as const, priority: "medium" as const, resident: "Rahul Mehta · Flat 2C", date: "13 Feb", slaHours: 30, slaTotalHours: 48, assignedTo: "Deepak Singh", description: "Garbage bin overflowing for 2 days.", timeline: [{ label: "Complaint submitted", time: "13 Feb", done: true }, { label: "Assigned to Deepak Singh", time: "13 Feb", done: true }] },
  { id: "FX-2391", title: "Street light not working – Parking B4", category: "Electrical", status: "resolved" as const, priority: "medium" as const, resident: "Kavya Nair · Flat 4D", date: "10 Feb", slaHours: 0, slaTotalHours: 48, assignedTo: "Ravi Kumar", description: "Light off for 3 days.", timeline: [{ label: "Complaint submitted", time: "10 Feb", done: true }, { label: "Fixed and operational", time: "11 Feb", done: true }], rating: 4 },
  { id: "FX-2388", title: "Intercom not working in A Wing", category: "Electrical", status: "resolved" as const, priority: "low" as const, resident: "Ankit Sharma · Flat 1A", date: "9 Feb", slaHours: 0, slaTotalHours: 72, assignedTo: "Anil Sharma", description: "Intercom dead since Feb 9.", timeline: [{ label: "Complaint submitted", time: "9 Feb", done: true }, { label: "Fixed", time: "10 Feb", done: true }], rating: 5 },
];

const staffList = [
  { name: "Ravi Kumar", role: "Plumbing & Civil", phone: "+91 98765 43210", assigned: 8, resolved: 7, avg: "14h", rating: 4.6, status: "active" },
  { name: "Anil Sharma", role: "Electrical", phone: "+91 87654 32109", assigned: 6, resolved: 5, avg: "18h", rating: 4.2, status: "active" },
  { name: "Mukesh Verma", role: "Lift & Mechanical", phone: "+91 76543 21098", assigned: 5, resolved: 4, avg: "22h", rating: 3.9, status: "on-leave" },
  { name: "Deepak Singh", role: "Cleanliness", phone: "+91 65432 10987", assigned: 4, resolved: 3, avg: "28h", rating: 4.1, status: "active" },
  { name: "Suresh Pandey", role: "Security", phone: "+91 54321 09876", assigned: 3, resolved: 3, avg: "10h", rating: 4.8, status: "active" },
];

const insights = [
  { category: "Plumbing", count: 12, trend: "+40%", color: "text-escalation" },
  { category: "Electrical", count: 8, trend: "+15%", color: "text-warning" },
  { category: "Lift", count: 5, trend: "-10%", color: "text-success" },
  { category: "Security", count: 3, trend: "+5%", color: "text-muted-foreground" },
  { category: "Cleanliness", count: 9, trend: "+20%", color: "text-warning" },
];

const analyticsMonthly = [
  { month: "Sep", total: 18, resolved: 15 },
  { month: "Oct", total: 22, resolved: 19 },
  { month: "Nov", total: 27, resolved: 22 },
  { month: "Dec", total: 31, resolved: 25 },
  { month: "Jan", total: 28, resolved: 24 },
  { month: "Feb", total: 34, resolved: 20 },
];

export default function AdminDashboard() {
  const [selectedTicket, setSelectedTicket] = useState<typeof allTickets[0] | null>(null);
  const [search, setSearch] = useState("");
  const [filterStatus, setFilterStatus] = useState<string>("all");
  const [activeTab, setActiveTab] = useState("dashboard");

  const escalated = allTickets.filter((t) => t.status === "escalated").length;
  const inProgress = allTickets.filter((t) => t.status === "in_progress").length;
  const resolved = allTickets.filter((t) => t.status === "resolved").length;

  const filtered = allTickets.filter((t) => {
    const matchSearch = t.title.toLowerCase().includes(search.toLowerCase()) || t.id.toLowerCase().includes(search.toLowerCase());
    const matchStatus = filterStatus === "all" || t.status === filterStatus;
    return matchSearch && matchStatus;
  });

  const renderContent = () => {
    // ── ALL TICKETS ──────────────────────────────────────────────────────────
    if (activeTab === "tickets") {
      return (
        <div className="p-6 lg:p-8 space-y-6 animate-fade-in">
          <div>
            <h1 className="text-2xl font-bold text-foreground">All Complaints</h1>
            <p className="text-muted-foreground text-sm mt-0.5">Society-wide ticket management</p>
          </div>

          <div className="flex items-center gap-3 flex-wrap">
            <div className="flex-1 min-w-[220px] relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
              <input
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Search tickets…"
                className="w-full pl-9 pr-4 py-2.5 bg-card border border-border rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-primary/30"
              />
            </div>
            <select
              value={filterStatus}
              onChange={(e) => setFilterStatus(e.target.value)}
              className="px-3 py-2.5 bg-card border border-border rounded-xl text-sm text-foreground focus:outline-none"
            >
              <option value="all">All Status</option>
              <option value="escalated">Escalated</option>
              <option value="in_progress">In Progress</option>
              <option value="resolved">Resolved</option>
            </select>
          </div>

          <div className="space-y-2">
            {filtered.map((ticket, i) => (
              <button
                key={ticket.id}
                onClick={() => setSelectedTicket(ticket)}
                className="w-full text-left bg-card rounded-xl border border-border px-4 py-3.5 hover:shadow-md hover:border-primary/30 transition-all group animate-slide-up"
                style={{ animationDelay: `${i * 60}ms` }}
              >
                <div className="flex items-center gap-3">
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-1">
                      <span className="text-xs font-mono text-muted-foreground">{ticket.id}</span>
                      <PriorityBadge priority={ticket.priority} />
                      <StatusBadge status={ticket.status} />
                    </div>
                    <p className="text-sm font-medium text-foreground truncate">{ticket.title}</p>
                    <div className="flex items-center gap-3 mt-1 flex-wrap">
                      <span className="text-xs text-muted-foreground">{ticket.category}</span>
                      <span className="text-xs text-muted-foreground">·</span>
                      <span className="text-xs text-muted-foreground">{ticket.resident}</span>
                      <span className="text-xs text-muted-foreground">·</span>
                      <span className="text-xs text-muted-foreground">→ {ticket.assignedTo}</span>
                    </div>
                  </div>
                  <div className="w-28 flex-shrink-0">
                    {(["in_progress", "escalated"] as string[]).includes(ticket.status) && (
                      <SLATimer hoursRemaining={ticket.slaHours} totalHours={ticket.slaTotalHours} />
                    )}
                  </div>
                  <ChevronRight className="w-4 h-4 text-muted-foreground group-hover:text-foreground flex-shrink-0" />
                </div>
              </button>
            ))}
            {filtered.length === 0 && (
              <div className="text-center py-12 text-muted-foreground text-sm">No tickets found.</div>
            )}
          </div>
        </div>
      );
    }

    // ── STAFF ────────────────────────────────────────────────────────────────
    if (activeTab === "staff") {
      return (
        <div className="p-6 lg:p-8 space-y-6 animate-fade-in">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-2xl font-bold text-foreground">Staff Management</h1>
              <p className="text-muted-foreground text-sm mt-0.5">{staffList.length} maintenance staff members</p>
            </div>
            <button className="flex items-center gap-2 px-4 py-2 bg-gradient-accent text-white rounded-xl text-sm font-semibold shadow-accent hover:opacity-90 transition">
              + Add Staff
            </button>
          </div>

          <div className="grid gap-4">
            {staffList.map((staff, i) => (
              <div
                key={staff.name}
                className="bg-card rounded-xl border border-border p-5 flex items-center gap-4 animate-slide-up"
                style={{ animationDelay: `${i * 60}ms` }}
              >
                <div className="w-12 h-12 bg-primary/10 rounded-full flex items-center justify-center flex-shrink-0">
                  <span className="text-base font-bold text-primary">{staff.name[0]}</span>
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-0.5">
                    <p className="font-semibold text-foreground">{staff.name}</p>
                    <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${
                      staff.status === "active" ? "bg-success/10 text-success" : "bg-warning/10 text-warning"
                    }`}>
                      {staff.status === "active" ? "Active" : "On Leave"}
                    </span>
                  </div>
                  <div className="flex items-center gap-1.5 text-xs text-muted-foreground mb-1">
                    <Wrench className="w-3 h-3" />
                    {staff.role}
                  </div>
                  <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
                    <Phone className="w-3 h-3" />
                    {staff.phone}
                  </div>
                </div>
                <div className="grid grid-cols-3 gap-4 text-center flex-shrink-0">
                  <div>
                    <p className="text-lg font-bold text-foreground">{staff.resolved}/{staff.assigned}</p>
                    <p className="text-xs text-muted-foreground">Resolved</p>
                  </div>
                  <div>
                    <p className="text-lg font-bold text-foreground">{staff.avg}</p>
                    <p className="text-xs text-muted-foreground">Avg Time</p>
                  </div>
                  <div>
                    <div className="flex items-center justify-center gap-0.5">
                      <Star className="w-3.5 h-3.5 fill-warning text-warning" />
                      <p className="text-lg font-bold text-foreground">{staff.rating}</p>
                    </div>
                    <p className="text-xs text-muted-foreground">Rating</p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      );
    }

    // ── ANALYTICS ────────────────────────────────────────────────────────────
    if (activeTab === "analytics") {
      const maxTotal = Math.max(...analyticsMonthly.map((m) => m.total));
      return (
        <div className="p-6 lg:p-8 space-y-6 animate-fade-in">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-2xl font-bold text-foreground">Analytics</h1>
              <p className="text-muted-foreground text-sm mt-0.5">Complaint trends · Greenwood Heights</p>
            </div>
            <button className="flex items-center gap-2 px-4 py-2 bg-card border border-border rounded-xl text-sm font-medium text-foreground hover:shadow-md transition">
              <Download className="w-4 h-4" />
              Export Report
            </button>
          </div>

          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
            <StatCard label="Total This Month" value={34} icon={FileText} accent="default" />
            <StatCard label="Avg Resolution" value="19h" icon={Clock} trend={{ value: -8, label: "vs Jan" }} accent="orange" />
            <StatCard label="SLA Breaches" value={3} icon={AlertTriangle} accent="red" />
            <StatCard label="Satisfaction" value="4.3★" icon={Star} trend={{ value: 5, label: "vs Jan" }} accent="green" />
          </div>

          {/* Monthly bar chart (pure CSS) */}
          <div className="bg-card rounded-xl border border-border p-5">
            <h3 className="font-semibold text-foreground mb-4 flex items-center gap-2">
              <BarChart3 className="w-4 h-4 text-primary" />
              Monthly Complaint Volume
            </h3>
            <div className="flex items-end gap-3 h-40">
              {analyticsMonthly.map((m) => (
                <div key={m.month} className="flex-1 flex flex-col items-center gap-1">
                  <div className="w-full flex flex-col items-center gap-0.5" style={{ height: "120px", justifyContent: "flex-end" }}>
                    <div
                      className="w-full bg-primary/20 rounded-t-md relative overflow-hidden"
                      style={{ height: `${(m.total / maxTotal) * 100}%` }}
                    >
                      <div
                        className="absolute bottom-0 left-0 right-0 bg-primary rounded-t-md"
                        style={{ height: `${(m.resolved / m.total) * 100}%` }}
                      />
                    </div>
                  </div>
                  <p className="text-xs text-muted-foreground">{m.month}</p>
                  <p className="text-xs font-semibold text-foreground">{m.total}</p>
                </div>
              ))}
            </div>
            <div className="flex items-center gap-4 mt-3">
              <div className="flex items-center gap-1.5"><div className="w-3 h-3 rounded bg-primary" /><span className="text-xs text-muted-foreground">Resolved</span></div>
              <div className="flex items-center gap-1.5"><div className="w-3 h-3 rounded bg-primary/20" /><span className="text-xs text-muted-foreground">Total</span></div>
            </div>
          </div>

          {/* Category breakdown */}
          <div className="grid lg:grid-cols-2 gap-4">
            <div className="bg-card rounded-xl border border-border p-5">
              <h3 className="font-semibold text-foreground mb-4 flex items-center gap-2">
                <TrendingUp className="w-4 h-4 text-primary" />
                Category Trends – Feb
              </h3>
              <div className="space-y-3">
                {insights.map((ins) => (
                  <div key={ins.category}>
                    <div className="flex items-center justify-between mb-1">
                      <span className="text-sm text-foreground">{ins.category}</span>
                      <div className="flex items-center gap-2">
                        <span className="text-sm font-semibold text-foreground">{ins.count}</span>
                        <span className={`text-xs font-medium ${ins.color}`}>{ins.trend}</span>
                      </div>
                    </div>
                    <div className="h-1.5 bg-muted rounded-full overflow-hidden">
                      <div className="h-full bg-primary/50 rounded-full" style={{ width: `${(ins.count / 34) * 100}%` }} />
                    </div>
                  </div>
                ))}
              </div>
            </div>

            <div className="bg-card rounded-xl border border-border p-5">
              <h3 className="font-semibold text-foreground mb-4 flex items-center gap-2">
                <Users className="w-4 h-4 text-primary" />
                Staff Performance
              </h3>
              <div className="space-y-3">
                {staffList.slice(0, 4).map((staff) => (
                  <div key={staff.name} className="flex items-center gap-3">
                    <div className="w-7 h-7 bg-primary/10 rounded-full flex items-center justify-center flex-shrink-0">
                      <span className="text-xs font-bold text-primary">{staff.name[0]}</span>
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium text-foreground">{staff.name}</p>
                      <div className="h-1 bg-muted rounded-full mt-1">
                        <div className="h-full bg-success rounded-full" style={{ width: `${(staff.resolved / staff.assigned) * 100}%` }} />
                      </div>
                    </div>
                    <span className="text-xs font-bold text-foreground flex-shrink-0">⭐ {staff.rating}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      );
    }

    // ── SETTINGS ─────────────────────────────────────────────────────────────
    if (activeTab === "settings") {
      return (
        <div className="p-6 lg:p-8 space-y-6 animate-fade-in">
          <div>
            <h1 className="text-2xl font-bold text-foreground">Settings</h1>
            <p className="text-muted-foreground text-sm mt-0.5">Society configuration · Greenwood Heights</p>
          </div>

          <div className="grid lg:grid-cols-2 gap-5">
            {/* Society Info */}
            <div className="bg-card rounded-xl border border-border p-5 space-y-4">
              <h3 className="font-semibold text-foreground flex items-center gap-2">
                <Shield className="w-4 h-4 text-primary" />
                Society Information
              </h3>
              {[
                { label: "Society Name", value: "Greenwood Heights" },
                { label: "Society ID", value: "GWHS-2019-BLK-A" },
                { label: "Admin", value: "Suresh Agarwal" },
                { label: "Location", value: "Pune, Maharashtra" },
                { label: "Blocks", value: "A, B, C, D, E, F" },
                { label: "Total Flats", value: "240" },
              ].map((field) => (
                <div key={field.label} className="flex items-center justify-between py-2 border-b border-border last:border-0">
                  <span className="text-sm text-muted-foreground">{field.label}</span>
                  <span className="text-sm font-medium text-foreground">{field.value}</span>
                </div>
              ))}
            </div>

            {/* SLA Config */}
            <div className="bg-card rounded-xl border border-border p-5 space-y-4">
              <h3 className="font-semibold text-foreground flex items-center gap-2">
                <Clock className="w-4 h-4 text-primary" />
                SLA Configuration
              </h3>
              {[
                { label: "Critical Priority", value: "24 hours" },
                { label: "High Priority", value: "48 hours" },
                { label: "Medium Priority", value: "72 hours" },
                { label: "Low Priority", value: "96 hours" },
                { label: "Auto-Escalation", value: "Enabled" },
                { label: "Escalation To", value: "Committee Chair" },
              ].map((field) => (
                <div key={field.label} className="flex items-center justify-between py-2 border-b border-border last:border-0">
                  <span className="text-sm text-muted-foreground">{field.label}</span>
                  <span className="text-sm font-medium text-foreground">{field.value}</span>
                </div>
              ))}
            </div>

            {/* Notifications */}
            <div className="bg-card rounded-xl border border-border p-5 space-y-4">
              <h3 className="font-semibold text-foreground flex items-center gap-2">
                <Bell className="w-4 h-4 text-primary" />
                Notification Settings
              </h3>
              {[
                { label: "Escalation Alerts", enabled: true },
                { label: "New Ticket Alerts", enabled: true },
                { label: "Staff Performance Reports", enabled: true },
                { label: "WhatsApp Integration", enabled: false },
                { label: "Email Digest (Weekly)", enabled: true },
              ].map((item) => (
                <div key={item.label} className="flex items-center justify-between py-2 border-b border-border last:border-0">
                  <span className="text-sm text-muted-foreground">{item.label}</span>
                  <div className={`w-10 h-5 rounded-full relative cursor-pointer transition-colors ${item.enabled ? "bg-success" : "bg-muted"}`}>
                    <div className={`absolute top-0.5 w-4 h-4 bg-white rounded-full shadow transition-all ${item.enabled ? "left-5" : "left-0.5"}`} />
                  </div>
                </div>
              ))}
            </div>

            {/* Admin Contact */}
            <div className="bg-card rounded-xl border border-border p-5 space-y-4">
              <h3 className="font-semibold text-foreground flex items-center gap-2">
                <Settings className="w-4 h-4 text-primary" />
                Admin Contacts
              </h3>
              {[
                { name: "Suresh Agarwal", role: "Committee Chair", phone: "+91 98100 12345" },
                { name: "Kavita Nair", role: "Secretary", phone: "+91 87200 23456" },
                { name: "Ramesh Joshi", role: "Treasurer", phone: "+91 76300 34567" },
              ].map((person) => (
                <div key={person.name} className="flex items-center gap-3 py-2 border-b border-border last:border-0">
                  <div className="w-8 h-8 bg-primary/10 rounded-full flex items-center justify-center">
                    <span className="text-xs font-bold text-primary">{person.name[0]}</span>
                  </div>
                  <div className="flex-1">
                    <p className="text-sm font-medium text-foreground">{person.name}</p>
                    <p className="text-xs text-muted-foreground">{person.role} · {person.phone}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      );
    }

    // ── DASHBOARD (default) ──────────────────────────────────────────────────
    return (
      <div className="p-6 lg:p-8 space-y-6 animate-fade-in">
        <div className="flex items-center justify-between flex-wrap gap-3">
          <div>
            <h1 className="text-2xl font-bold text-foreground">Admin Dashboard</h1>
            <p className="text-muted-foreground text-sm mt-0.5">Greenwood Heights · Feb 2024</p>
          </div>
          <button className="flex items-center gap-2 px-4 py-2 bg-card border border-border rounded-xl text-sm font-medium text-foreground hover:shadow-md transition-shadow">
            <Download className="w-4 h-4" />
            Monthly Report
          </button>
        </div>

        {escalated > 0 && (
          <div className="bg-escalation/10 border border-escalation/30 rounded-xl p-4 flex items-center gap-3 animate-slide-up">
            <div className="w-9 h-9 bg-escalation/20 rounded-xl flex items-center justify-center flex-shrink-0">
              <AlertTriangle className="w-5 h-5 text-escalation" />
            </div>
            <div className="flex-1">
              <p className="text-sm font-bold text-escalation">{escalated} Escalated Ticket{escalated > 1 ? "s" : ""} Require Immediate Attention</p>
              <p className="text-xs text-foreground mt-0.5">FX-2401 (Water leakage) has breached SLA. Assign senior staff immediately.</p>
            </div>
            <button onClick={() => setActiveTab("tickets")} className="text-xs text-escalation font-semibold hover:underline flex-shrink-0">View →</button>
          </div>
        )}

        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          <StatCard label="Escalated" value={escalated} icon={AlertTriangle} accent="red" />
          <StatCard label="In Progress" value={inProgress} icon={Clock} accent="orange" />
          <StatCard label="Resolved (Feb)" value={resolved} icon={CheckCircle2} accent="green" trend={{ value: 8, label: "vs Jan" }} />
          <StatCard label="Total Tickets" value={allTickets.length} icon={FileText} accent="default" />
        </div>

        <div className="grid lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2 space-y-4">
            <div className="flex items-center gap-3 flex-wrap">
              <h2 className="font-semibold text-foreground">All Complaints</h2>
              <div className="flex-1 min-w-[180px]">
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                  <input
                    value={search}
                    onChange={(e) => setSearch(e.target.value)}
                    placeholder="Search tickets…"
                    className="w-full pl-9 pr-4 py-2 bg-card border border-border rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-primary/30"
                  />
                </div>
              </div>
              <select
                value={filterStatus}
                onChange={(e) => setFilterStatus(e.target.value)}
                className="px-3 py-2 bg-card border border-border rounded-xl text-sm text-foreground focus:outline-none"
              >
                <option value="all">All Status</option>
                <option value="escalated">Escalated</option>
                <option value="in_progress">In Progress</option>
                <option value="resolved">Resolved</option>
              </select>
            </div>

            <div className="space-y-2">
              {filtered.map((ticket, i) => (
                <button
                  key={ticket.id}
                  onClick={() => setSelectedTicket(ticket)}
                  className="w-full text-left bg-card rounded-xl border border-border px-4 py-3.5 hover:shadow-md hover:border-primary/30 transition-all group animate-slide-up"
                  style={{ animationDelay: `${i * 60}ms` }}
                >
                  <div className="flex items-center gap-3">
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-1">
                        <span className="text-xs font-mono text-muted-foreground">{ticket.id}</span>
                        <PriorityBadge priority={ticket.priority} />
                        <StatusBadge status={ticket.status} />
                      </div>
                      <p className="text-sm font-medium text-foreground truncate">{ticket.title}</p>
                      <div className="flex items-center gap-3 mt-1">
                        <span className="text-xs text-muted-foreground">{ticket.category}</span>
                        <span className="text-xs text-muted-foreground">·</span>
                        <span className="text-xs text-muted-foreground">{ticket.resident}</span>
                        <span className="text-xs text-muted-foreground">·</span>
                        <span className="text-xs text-muted-foreground">→ {ticket.assignedTo}</span>
                      </div>
                    </div>
                    <div className="w-28 flex-shrink-0">
                      {(["in_progress", "escalated"] as string[]).includes(ticket.status) && (
                        <SLATimer hoursRemaining={ticket.slaHours} totalHours={ticket.slaTotalHours} />
                      )}
                    </div>
                    <ChevronRight className="w-4 h-4 text-muted-foreground group-hover:text-foreground flex-shrink-0" />
                  </div>
                </button>
              ))}
            </div>
          </div>

          <div className="space-y-5">
            <div className="bg-card rounded-xl border border-border p-4">
              <div className="flex items-center gap-2 mb-4">
                <BarChart3 className="w-4 h-4 text-primary" />
                <h3 className="font-semibold text-foreground text-sm">Recurring Issues – Feb</h3>
              </div>
              <div className="space-y-3">
                {insights.map((ins) => (
                  <div key={ins.category} className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <div className="w-2 h-2 rounded-full bg-primary opacity-60" />
                      <span className="text-sm text-foreground">{ins.category}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <span className="text-sm font-semibold text-foreground">{ins.count}</span>
                      <span className={`text-xs font-medium ${ins.color}`}>{ins.trend}</span>
                    </div>
                  </div>
                ))}
              </div>
              <div className="mt-4 bg-primary/5 rounded-lg p-3">
                <div className="flex items-start gap-2">
                  <TrendingUp className="w-4 h-4 text-primary flex-shrink-0 mt-0.5" />
                  <p className="text-xs text-muted-foreground leading-relaxed">
                    Plumbing complaints are up 40% this month. Consider a preventive pipe inspection for Block B & C.
                  </p>
                </div>
              </div>
            </div>

            <div className="bg-card rounded-xl border border-border p-4">
              <div className="flex items-center gap-2 mb-4">
                <Users className="w-4 h-4 text-primary" />
                <h3 className="font-semibold text-foreground text-sm">Staff Performance</h3>
              </div>
              <div className="space-y-3">
                {staffList.slice(0, 4).map((staff) => (
                  <div key={staff.name} className="flex items-center gap-3">
                    <div className="w-8 h-8 bg-primary/10 rounded-full flex items-center justify-center flex-shrink-0">
                      <span className="text-xs font-bold text-primary">{staff.name[0]}</span>
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium text-foreground">{staff.name}</p>
                      <p className="text-xs text-muted-foreground">{staff.resolved}/{staff.assigned} resolved · avg {staff.avg}</p>
                    </div>
                    <div className="text-right flex-shrink-0">
                      <p className="text-sm font-bold text-foreground">⭐ {staff.rating}</p>
                    </div>
                  </div>
                ))}
              </div>
              <button
                onClick={() => setActiveTab("staff")}
                className="mt-3 w-full text-xs text-primary text-center hover:underline"
              >
                View full staff list →
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  };

  return (
    <AppLayout role="admin" userName="Suresh Agarwal" activeTab={activeTab} onTabChange={setActiveTab}>
      {renderContent()}
      {selectedTicket && (
        <TicketDetailModal ticket={selectedTicket} onClose={() => setSelectedTicket(null)} />
      )}
    </AppLayout>
  );
}
