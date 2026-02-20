import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { AppLayout } from "@/components/AppLayout";
import { ArrowLeft, Mic, Zap, CheckCircle, Loader2, ImagePlus } from "lucide-react";
import { queueOfflineComplaint, syncPendingComplaints } from "@/lib/offlineSync";
import { readSessionUser } from "@/lib/userProfile";

const categories = [
  { label: "Plumbing", icon: "🔧", keywords: ["water", "leak", "pipe", "drain", "tap"] },
  { label: "Electrical", icon: "⚡", keywords: ["light", "power", "switch", "socket", "circuit"] },
  { label: "Lift / Elevator", icon: "🛗", keywords: ["elevator", "lift", "stuck"] },
  { label: "Security", icon: "🔒", keywords: ["cctv", "gate", "guard", "access"] },
  { label: "Cleanliness", icon: "🧹", keywords: ["garbage", "clean", "waste", "dirty"] },
  { label: "Civil / Structure", icon: "🏗️", keywords: ["crack", "wall", "ceiling", "floor"] },
  { label: "Other", icon: "📋", keywords: [] },
];

const priorities = [
  { value: "low", label: "Low", desc: "Minor, can wait", color: "border-border bg-card" },
  { value: "medium", label: "Medium", desc: "Needs attention soon", color: "border-primary/40 bg-primary/5" },
  { value: "high", label: "High", desc: "Affecting daily life", color: "border-warning/60 bg-warning/5" },
  { value: "critical", label: "Critical", desc: "Safety / emergency", color: "border-escalation/60 bg-escalation/5" },
];

function detectCategory(text: string): string {
  const lower = text.toLowerCase();
  for (const cat of categories) {
    if (cat.keywords.some((k) => lower.includes(k))) return cat.label;
  }
  return "Other";
}

function detectPriority(text: string): string {
  const lower = text.toLowerCase();
  if (lower.includes("emergency") || lower.includes("flood") || lower.includes("fire") || lower.includes("gas")) return "critical";
  if (lower.includes("leak") || lower.includes("stuck") || lower.includes("no power")) return "high";
  if (lower.includes("slow") || lower.includes("issue") || lower.includes("problem")) return "medium";
  return "low";
}

export default function SubmitComplaint() {
  const navigate = useNavigate();
  const sessionUser = readSessionUser();
  const displayName = sessionUser?.name || "Priya Sharma";
  const [step, setStep] = useState<"form" | "analyzing" | "review" | "success">("form");
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [category, setCategory] = useState("");
  const [priority, setPriority] = useState("medium");
  const [aiCategory, setAiCategory] = useState("");
  const [aiPriority, setAiPriority] = useState("");
  const [isDuplicate, setIsDuplicate] = useState(false);
  const [attachments, setAttachments] = useState<File[]>([]);
  const apartmentId = "APT1";
  const residentId =
    sessionUser?.name?.toLowerCase().replace(/[^a-z0-9]+/g, "-") || "resident-demo-1";

  useEffect(() => {
    const syncWhenOnline = () => {
      void syncPendingComplaints();
    };
    window.addEventListener("online", syncWhenOnline);
    if (navigator.onLine) {
      void syncPendingComplaints();
    }
    return () => {
      window.removeEventListener("online", syncWhenOnline);
    };
  }, []);

  const handleAnalyze = () => {
    if (!title || !description) return;
    setStep("analyzing");
    setTimeout(() => {
      const detectedCat = detectCategory(title + " " + description);
      const detectedPri = detectPriority(title + " " + description);
      setAiCategory(detectedCat);
      setAiPriority(detectedPri);
      setCategory(detectedCat);
      setPriority(detectedPri);
      const dupe = title.toLowerCase().includes("water") || title.toLowerCase().includes("elevator");
      setIsDuplicate(dupe);
      setStep("review");
    }, 600);
  };

  const handleSubmit = async () => {
    setStep("analyzing");
    const payload = {
      apartment_id: apartmentId,
      resident_id: residentId,
      title,
      description,
      is_synced: navigator.onLine,
    };

    if (!navigator.onLine) {
      await queueOfflineComplaint(payload);
      setTimeout(() => setStep("success"), 600);
      return;
    }

    try {
      const formData = new FormData();
      formData.append("apartment_id", apartmentId);
      formData.append("resident_id", residentId);
      formData.append("title", title);
      formData.append("description", description);
      formData.append("is_synced", "true");
      attachments.forEach((file) => formData.append("images", file));

      const response = await fetch("/complaints/with-media", {
        method: "POST",
        body: formData,
      });
      if (!response.ok) {
        throw new Error("Complaint submit failed");
      }
      setStep("success");
    } catch {
      await queueOfflineComplaint({ ...payload, is_synced: false });
      setStep("success");
    }
  };

  const ticketId = "FX-" + Math.floor(2400 + Math.random() * 100);

  if (step === "success") {
    return (
      <AppLayout role="resident" userName={displayName}>
        <div className="flex items-center justify-center min-h-screen p-8">
          <div className="text-center max-w-md animate-slide-up">
            <div className="w-20 h-20 bg-success/10 rounded-full flex items-center justify-center mx-auto mb-6">
              <CheckCircle className="w-10 h-10 text-success" />
            </div>
            <h2 className="text-2xl font-bold text-foreground mb-2">Complaint Submitted!</h2>
            <p className="text-muted-foreground mb-1">Your ticket has been created and assigned.</p>
            <p className="text-sm font-mono text-accent font-bold mb-6">{ticketId}</p>
            <div className="bg-card border border-border rounded-xl p-4 text-left mb-6 space-y-2">
              <div className="flex justify-between text-sm">
                <span className="text-muted-foreground">Category</span>
                <span className="font-medium">{category}</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-muted-foreground">Priority</span>
                <span className="font-medium capitalize">{priority}</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-muted-foreground">SLA</span>
                <span className="font-medium">{priority === "critical" ? "4h" : priority === "high" ? "24h" : "48h"}</span>
              </div>
            </div>
            <button
              onClick={() => navigate("/resident")}
              className="w-full py-3 bg-gradient-accent text-white rounded-xl font-semibold text-sm shadow-accent hover:opacity-90 transition-opacity"
            >
              Back to Dashboard
            </button>
          </div>
        </div>
      </AppLayout>
    );
  }

  return (
    <AppLayout role="resident" userName={displayName}>
      <div className="max-w-2xl mx-auto p-6 lg:p-8 animate-fade-in">
        {/* Header */}
        <div className="flex items-center gap-3 mb-8">
          <button
            onClick={() => navigate("/resident")}
            className="w-9 h-9 rounded-xl bg-card border border-border flex items-center justify-center hover:shadow-md transition-shadow"
          >
            <ArrowLeft className="w-4 h-4 text-muted-foreground" />
          </button>
          <div>
            <h1 className="text-xl font-bold text-foreground">New Complaint</h1>
            <p className="text-sm text-muted-foreground">AI will auto-categorize your issue</p>
          </div>
        </div>

        {step === "analyzing" && (
          <div className="flex flex-col items-center justify-center py-24">
            <div className="w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center mb-4">
              <Zap className="w-8 h-8 text-primary animate-pulse" />
            </div>
            <p className="font-semibold text-foreground mb-1">AI is analyzing your complaint…</p>
            <p className="text-sm text-muted-foreground">Categorizing, checking duplicates, setting priority</p>
            <Loader2 className="w-5 h-5 text-muted-foreground mt-4 animate-spin" />
          </div>
        )}

        {step === "form" && (
          <div className="space-y-5">
            {/* Title */}
            <div>
              <label className="block text-sm font-semibold text-foreground mb-2">Complaint Title *</label>
              <input
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="e.g. Water leakage in bathroom"
                className="w-full px-4 py-3 bg-card border border-border rounded-xl text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary transition-all"
              />
            </div>

            {/* Description */}
            <div>
              <div className="flex items-center justify-between mb-2">
                <label className="block text-sm font-semibold text-foreground">Description *</label>
                <button className="flex items-center gap-1.5 text-xs text-muted-foreground hover:text-primary transition-colors">
                  <Mic className="w-3.5 h-3.5" /> Voice input
                </button>
              </div>
              <textarea
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                rows={4}
                placeholder="Describe the issue in detail. Include location, how long it's been, severity…"
                className="w-full px-4 py-3 bg-card border border-border rounded-xl text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary transition-all resize-none"
              />
            </div>

            {/* Flat */}
            <div>
              <label className="block text-sm font-semibold text-foreground mb-2">Your Flat</label>
              <input
                defaultValue="3B"
                className="w-full px-4 py-3 bg-card border border-border rounded-xl text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary transition-all"
              />
            </div>

            {/* Attachment */}
            <div className="border-2 border-dashed border-border rounded-xl p-5 text-center space-y-2">
              <ImagePlus className="w-5 h-5 text-muted-foreground mx-auto" />
              <p className="text-sm text-muted-foreground">Add complaint images from gallery (optional)</p>
              <input
                type="file"
                multiple
                accept="image/*"
                onChange={(event) => {
                  const files = Array.from(event.target.files || []).slice(0, 5);
                  setAttachments(files);
                }}
                className="mx-auto block text-xs text-muted-foreground"
              />
              <p className="text-xs text-muted-foreground">Up to 5 images</p>
              {attachments.length > 0 && (
                <p className="text-xs text-foreground">{attachments.length} image(s) selected</p>
              )}
            </div>

            <button
              onClick={handleAnalyze}
              disabled={!title || !description}
              className={`w-full flex items-center justify-center gap-2 py-3.5 rounded-xl font-semibold text-sm transition-all ${
                title && description
                  ? "bg-gradient-accent text-white shadow-accent hover:opacity-90"
                  : "bg-muted text-muted-foreground cursor-not-allowed"
              }`}
            >
              <Zap className="w-4 h-4" />
              Analyze with AI
            </button>
          </div>
        )}

        {step === "review" && (
          <div className="space-y-5 animate-slide-up">
            {/* AI Result */}
            <div className="bg-primary rounded-xl p-4">
              <div className="flex items-center gap-2 mb-3">
                <Zap className="w-4 h-4 text-accent" />
                <p className="text-white text-sm font-semibold">AI Analysis Complete</p>
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div className="glass rounded-lg p-3">
                  <p className="text-blue-300 text-xs mb-0.5">Category detected</p>
                  <p className="text-white font-semibold text-sm">{aiCategory}</p>
                </div>
                <div className="glass rounded-lg p-3">
                  <p className="text-blue-300 text-xs mb-0.5">Priority suggested</p>
                  <p className="text-white font-semibold text-sm capitalize">{aiPriority}</p>
                </div>
              </div>
            </div>

            {/* Duplicate warning */}
            {isDuplicate && (
              <div className="bg-warning/10 border border-warning/30 rounded-xl p-4">
                <p className="text-sm font-semibold text-warning mb-1">⚠ Possible Duplicate Detected</p>
                <p className="text-xs text-foreground">
                  Ticket <strong>FX-2401</strong> reports a similar issue in Block 3. Your complaint will still be logged and linked.
                </p>
              </div>
            )}

            {/* Category override */}
            <div>
              <label className="block text-sm font-semibold text-foreground mb-2">Category</label>
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                {categories.map((cat) => (
                  <button
                    key={cat.label}
                    onClick={() => setCategory(cat.label)}
                    className={`flex items-center gap-2 px-3 py-2.5 rounded-xl border text-sm transition-all ${
                      category === cat.label
                        ? "border-primary bg-primary text-primary-foreground"
                        : "border-border bg-card text-foreground hover:border-primary/40"
                    }`}
                  >
                    <span>{cat.icon}</span>
                    <span className="text-xs font-medium">{cat.label}</span>
                  </button>
                ))}
              </div>
            </div>

            {/* Priority override */}
            <div>
              <label className="block text-sm font-semibold text-foreground mb-2">Priority</label>
              <div className="grid grid-cols-2 gap-2">
                {priorities.map((p) => (
                  <button
                    key={p.value}
                    onClick={() => setPriority(p.value)}
                    className={`px-4 py-3 rounded-xl border-2 text-left transition-all ${
                      priority === p.value ? p.color + " border-current" : "border-border bg-card"
                    }`}
                  >
                    <p className="text-sm font-semibold text-foreground">{p.label}</p>
                    <p className="text-xs text-muted-foreground">{p.desc}</p>
                  </button>
                ))}
              </div>
            </div>

            <div className="flex gap-3">
              <button
                onClick={() => setStep("form")}
                className="flex-1 py-3 border border-border bg-card text-foreground rounded-xl font-semibold text-sm hover:shadow-md transition-shadow"
              >
                Edit
              </button>
              <button
                onClick={handleSubmit}
                className="flex-1 py-3 bg-gradient-accent text-white rounded-xl font-semibold text-sm shadow-accent hover:opacity-90 transition-opacity"
              >
                Submit Complaint
              </button>
            </div>
          </div>
        )}
      </div>
    </AppLayout>
  );
}
