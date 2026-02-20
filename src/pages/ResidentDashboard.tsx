import { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  AlertTriangle,
  Bell,
  CheckCircle2,
  ChevronRight,
  Clock,
  FileText,
  House,
  PlusCircle,
  ThumbsDown,
  ThumbsUp,
  TrendingUp,
} from "lucide-react";

import { AppLayout } from "@/components/AppLayout";
import { PriorityBadge, SLATimer, StatCard, StatusBadge } from "@/components/FixoraUI";
import { TicketDetailModal } from "@/components/TicketDetailModal";
import { readSessionUser } from "@/lib/userProfile";

type UiStatus = "open" | "in_progress" | "escalated" | "resolved" | "closed";
type UiPriority = "low" | "medium" | "high" | "critical";

type BackendImage = {
  filename?: string;
  content_type?: string;
  data_base64?: string;
};

type BackendVote = {
  resident_id: string;
  vote_type: "up" | "down";
};

type BackendComplaint = {
  _id: string;
  ticket_id: string;
  apartment_id: string;
  resident_id: string;
  title: string;
  description: string;
  category: string;
  urgency_level: "Low" | "Medium" | "High";
  status: "Open" | "In Progress" | "Escalated" | "Resolved";
  upvotes: number;
  downvotes: number;
  voters_list: BackendVote[];
  eta?: string | null;
  created_at: string;
  images?: BackendImage[];
};

function mapStatus(status: BackendComplaint["status"]): UiStatus {
  if (status === "Open") return "open";
  if (status === "In Progress") return "in_progress";
  if (status === "Escalated") return "escalated";
  if (status === "Resolved") return "resolved";
  return "closed";
}

function mapPriority(urgency: BackendComplaint["urgency_level"]): UiPriority {
  if (urgency === "High") return "high";
  if (urgency === "Medium") return "medium";
  return "low";
}

function hoursForSla(urgency: BackendComplaint["urgency_level"]): number {
  if (urgency === "High") return 24;
  if (urgency === "Medium") return 48;
  return 72;
}

function getHoursRemaining(complaint: BackendComplaint): number {
  const created = new Date(complaint.created_at).getTime();
  const elapsed = Math.max(0, Date.now() - created);
  const elapsedHours = Math.floor(elapsed / (1000 * 60 * 60));
  return Math.max(0, hoursForSla(complaint.urgency_level) - elapsedHours);
}

function toImageDataUrl(image: BackendImage): string | null {
  if (!image?.data_base64) return null;
  const contentType = image.content_type || "image/jpeg";
  return `data:${contentType};base64,${image.data_base64}`;
}

export default function ResidentDashboard() {
  const navigate = useNavigate();
  const sessionUser = readSessionUser();
  const userName = sessionUser?.name || "Resident User";
  const residentId = userName.toLowerCase().replace(/[^a-z0-9]+/g, "-");
  const apartmentId = "APT1";

  const [activeTab, setActiveTab] = useState("dashboard");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [complaints, setComplaints] = useState<BackendComplaint[]>([]);
  const [selectedTicket, setSelectedTicket] = useState<any | null>(null);

  const fetchComplaints = async () => {
    try {
      setError(null);
      const response = await fetch(`/complaints?apartment_id=${encodeURIComponent(apartmentId)}`);
      if (!response.ok) {
        throw new Error("Unable to load complaints");
      }
      const data = (await response.json()) as BackendComplaint[];
      setComplaints(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Unable to load complaints");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    void fetchComplaints();
    const interval = setInterval(() => {
      void fetchComplaints();
    }, 20000);
    return () => clearInterval(interval);
  }, []);

  const myComplaints = useMemo(
    () => complaints.filter((complaint) => complaint.resident_id === residentId),
    [complaints, residentId],
  );

  const openCount = useMemo(
    () => complaints.filter((complaint) => ["Open", "In Progress", "Escalated"].includes(complaint.status)).length,
    [complaints],
  );
  const escalatedCount = useMemo(
    () => complaints.filter((complaint) => complaint.status === "Escalated").length,
    [complaints],
  );
  const resolvedCount = useMemo(
    () => complaints.filter((complaint) => complaint.status === "Resolved").length,
    [complaints],
  );

  const notifications = useMemo(
    () =>
      complaints.slice(0, 6).map((complaint) => ({
        text: `${complaint.ticket_id} updated: ${complaint.status}`,
        time: new Date(complaint.created_at).toLocaleDateString(),
        type: complaint.status === "Escalated" ? "escalation" : complaint.status === "Resolved" ? "resolved" : "update",
      })),
    [complaints],
  );

  const castVote = async (complaint: BackendComplaint, vote: "up" | "down") => {
    const response = await fetch(`/complaints/${complaint._id}/vote`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ vote_type: vote, resident_id: residentId }),
    });
    if (!response.ok) return;
    const updated = (await response.json()) as BackendComplaint;
    setComplaints((prev) => prev.map((item) => (item._id === updated._id ? updated : item)));
  };

  const openTicketModal = (complaint: BackendComplaint) => {
    const uiStatus = mapStatus(complaint.status);
    const imageUrls = (complaint.images || []).map(toImageDataUrl).filter(Boolean) as string[];
    setSelectedTicket({
      id: complaint.ticket_id,
      title: complaint.title,
      category: complaint.category,
      status: uiStatus,
      priority: mapPriority(complaint.urgency_level),
      date: new Date(complaint.created_at).toLocaleDateString(),
      slaHours: getHoursRemaining(complaint),
      slaTotalHours: hoursForSla(complaint.urgency_level),
      description: complaint.description,
      images: imageUrls,
      timeline: [
        { label: "Complaint submitted", time: new Date(complaint.created_at).toLocaleString(), done: true },
        { label: `AI urgency: ${complaint.urgency_level}`, time: "Auto analysis", done: true },
        { label: `Current status: ${complaint.status}`, time: "Live", done: true },
      ],
    });
  };

  const renderTicketList = (items: BackendComplaint[]) => (
    <div className="space-y-3">
      {items.map((complaint, index) => {
        const uiStatus = mapStatus(complaint.status);
        const uiPriority = mapPriority(complaint.urgency_level);
        const slaTotalHours = hoursForSla(complaint.urgency_level);
        const slaHours = getHoursRemaining(complaint);
        return (
          <button
            key={complaint._id}
            onClick={() => openTicketModal(complaint)}
            className="w-full text-left bg-card rounded-xl border border-border p-4 hover:shadow-md hover:border-primary/30 transition-all duration-200 animate-slide-up group"
            style={{ animationDelay: `${index * 60}ms` }}
          >
            <div className="flex items-start justify-between gap-3 mb-3">
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 mb-1">
                  <span className="text-xs font-mono text-muted-foreground">{complaint.ticket_id}</span>
                  <PriorityBadge priority={uiPriority} />
                </div>
                <p className="font-medium text-sm text-foreground truncate">{complaint.title}</p>
                <p className="text-xs text-muted-foreground mt-0.5">
                  {complaint.category} - {new Date(complaint.created_at).toLocaleDateString()}
                </p>
                {!!complaint.images?.length && (
                  <p className="text-[11px] text-muted-foreground mt-1">{complaint.images.length} image(s) attached</p>
                )}
              </div>
              <div className="flex items-center gap-2 flex-shrink-0">
                <StatusBadge status={uiStatus} />
                <ChevronRight className="w-4 h-4 text-muted-foreground group-hover:text-foreground transition-colors" />
              </div>
            </div>
            {["open", "in_progress", "escalated"].includes(uiStatus) && (
              <SLATimer hoursRemaining={slaHours} totalHours={slaTotalHours} />
            )}
          </button>
        );
      })}
      {items.length === 0 && (
        <div className="rounded-xl border border-border bg-card p-4 text-sm text-muted-foreground">No complaints yet.</div>
      )}
    </div>
  );

  const communityComplaints = complaints;

  if (loading) {
    return (
      <AppLayout role="resident" userName={userName} activeTab={activeTab} onTabChange={setActiveTab}>
        <div className="p-6 text-sm text-muted-foreground">Loading complaints...</div>
      </AppLayout>
    );
  }

  return (
    <AppLayout role="resident" userName={userName} activeTab={activeTab} onTabChange={setActiveTab}>
      <div className="p-6 lg:p-8 space-y-6 animate-fade-in">
        {activeTab === "notifications" ? (
          <div className="space-y-4">
            <div className="flex items-center justify-between gap-3">
              <div>
                <h1 className="text-2xl font-bold text-foreground">Notifications</h1>
                <p className="text-muted-foreground text-sm mt-0.5">{notifications.length} recent updates</p>
              </div>
              <button
                onClick={() => setActiveTab("dashboard")}
                className="inline-flex items-center gap-1 rounded-lg border border-border bg-card px-3 py-2 text-xs font-medium text-foreground"
              >
                <House className="h-3.5 w-3.5" />
                Home
              </button>
            </div>
            <div className="space-y-3">
              {notifications.map((notification, index) => (
                <div key={index} className="bg-card rounded-xl border border-border p-4">
                  <p className="text-sm text-foreground">{notification.text}</p>
                  <p className="text-xs text-muted-foreground mt-0.5">{notification.time}</p>
                </div>
              ))}
            </div>
          </div>
        ) : activeTab === "tickets" ? (
          <div className="space-y-4">
            <h1 className="text-2xl font-bold text-foreground">All Posted Complaints</h1>
            {renderTicketList(complaints)}
          </div>
        ) : (
          <>
            <div className="flex items-center justify-between">
              <div>
                <h1 className="text-2xl font-bold text-foreground">Welcome, {userName}</h1>
                <p className="text-muted-foreground text-sm mt-0.5">Apartment {apartmentId}</p>
              </div>
              <div className="flex items-center gap-3">
                <button
                  onClick={() => setActiveTab("notifications")}
                  className="relative w-9 h-9 bg-card rounded-xl border border-border flex items-center justify-center"
                >
                  <Bell className="w-4 h-4 text-muted-foreground" />
                </button>
                <button
                  onClick={() => navigate("/submit")}
                  className="flex items-center gap-2 px-4 py-2 bg-gradient-accent text-white rounded-xl font-semibold text-sm shadow-accent"
                >
                  <PlusCircle className="w-4 h-4" />
                  New Complaint
                </button>
              </div>
            </div>

            {error && <div className="rounded-xl border border-escalation/30 bg-escalation/10 p-3 text-sm">{error}</div>}

            <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
              <StatCard label="Active Tickets" value={openCount} icon={FileText} accent="default" />
              <StatCard label="Escalated" value={escalatedCount} icon={AlertTriangle} accent="red" />
              <StatCard label="Resolved" value={resolvedCount} icon={CheckCircle2} accent="green" />
              <StatCard label="Avg Resolution" value="Live" icon={Clock} accent="orange" />
            </div>

            <div className="grid lg:grid-cols-3 gap-6">
              <div className="lg:col-span-2 space-y-3">
                <div className="flex items-center justify-between">
                  <h2 className="font-semibold text-foreground">My Complaints</h2>
                  <button onClick={() => setActiveTab("tickets")} className="text-xs text-primary hover:underline">
                    View all
                  </button>
                </div>
                {renderTicketList(myComplaints.slice(0, 3))}
              </div>

              <div className="space-y-3">
                <div className="bg-primary rounded-xl p-4">
                  <div className="flex items-center gap-2 mb-2">
                    <TrendingUp className="w-4 h-4 text-accent" />
                    <p className="text-white text-xs font-semibold">AI Insight</p>
                  </div>
                  <p className="text-blue-200 text-xs leading-relaxed">
                    Live data: {complaints.length} complaint(s) loaded from backend for this apartment.
                  </p>
                </div>

                <div className="bg-card rounded-xl border border-border p-4">
                  <h3 className="text-sm font-semibold text-foreground mb-3">Apartment Transparency Board</h3>
                  <div className="space-y-2">
                    {communityComplaints.map((complaint) => {
                      const myVote = complaint.voters_list?.find((entry) => entry.resident_id === residentId)?.vote_type;
                      return (
                        <div key={complaint._id} className="rounded-lg border border-border p-3">
                          <p className="text-xs font-mono text-muted-foreground">{complaint.ticket_id}</p>
                          <p className="text-sm text-foreground">{complaint.title}</p>
                          <p className="text-xs text-muted-foreground mt-1">
                            Status: {complaint.status} - ETA: {complaint.eta || "Pending"} - Urgency: {complaint.urgency_level}
                          </p>
                          <div className="mt-2 flex gap-2">
                            <button
                              className={`flex items-center gap-1 rounded-md border border-border px-2 py-1 text-xs ${myVote === "up" ? "bg-primary/10" : ""}`}
                              onClick={() => void castVote(complaint, "up")}
                            >
                              <ThumbsUp className="h-3 w-3" /> {complaint.upvotes}
                            </button>
                            <button
                              className={`flex items-center gap-1 rounded-md border border-border px-2 py-1 text-xs ${myVote === "down" ? "bg-primary/10" : ""}`}
                              onClick={() => void castVote(complaint, "down")}
                            >
                              <ThumbsDown className="h-3 w-3" /> {complaint.downvotes}
                            </button>
                          </div>
                        </div>
                      );
                    })}
                    {communityComplaints.length === 0 && (
                      <p className="text-xs text-muted-foreground">No community complaints yet.</p>
                    )}
                  </div>
                </div>
              </div>
            </div>
          </>
        )}
      </div>

      {selectedTicket && <TicketDetailModal ticket={selectedTicket} onClose={() => setSelectedTicket(null)} />}
    </AppLayout>
  );
}
