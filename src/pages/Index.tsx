import { useState } from "react";
import { useNavigate } from "react-router-dom";
import heroBuilding from "@/assets/hero-building.jpg";
import { Shield, Wrench, Home, ArrowRight, CheckCircle, Zap } from "lucide-react";

type Role = "resident" | "admin" | "staff";

const roles = [
  {
    id: "resident" as Role,
    label: "Resident",
    icon: Home,
    description: "Submit complaints, track tickets, rate service",
    color: "from-blue-600 to-blue-800",
    accent: "border-blue-400",
  },
  {
    id: "admin" as Role,
    label: "Admin / Committee",
    icon: Shield,
    description: "Monitor dashboard, manage escalations, analytics",
    color: "from-orange-500 to-orange-700",
    accent: "border-orange-400",
  },
  {
    id: "staff" as Role,
    label: "Maintenance Staff",
    icon: Wrench,
    description: "View assigned tasks, update resolution status",
    color: "from-emerald-600 to-emerald-800",
    accent: "border-emerald-400",
  },
];

const features = [
  { icon: Zap, text: "AI-powered complaint categorization" },
  { icon: CheckCircle, text: "Smart SLA-based auto-escalation" },
  { icon: CheckCircle, text: "Duplicate complaint detection" },
  { icon: CheckCircle, text: "Real-time transparency board" },
];

export default function Index() {
  const navigate = useNavigate();
  const [selected, setSelected] = useState<Role | null>(null);
  const [loading, setLoading] = useState(false);

  const handleContinue = () => {
    if (!selected) return;
    setLoading(true);
    setTimeout(() => {
      navigate(`/signup?role=${selected}`);
    }, 400);
  };

  return (
    <div className="min-h-screen flex flex-col lg:flex-row">
      {/* Left panel — branding */}
      <div className="relative flex flex-col justify-between lg:w-1/2 min-h-[340px] lg:min-h-screen overflow-hidden">
        <img
          src={heroBuilding}
          alt="Society building"
          className="absolute inset-0 w-full h-full object-cover"
        />
        <div className="absolute inset-0 bg-gradient-hero opacity-85" />

        <div className="relative z-10 p-8 lg:p-12">
          <div className="flex items-center gap-3 mb-2">
            <div className="w-9 h-9 bg-gradient-accent rounded-xl flex items-center justify-center shadow-accent">
              <Wrench className="w-5 h-5 text-white" />
            </div>
            <span className="text-white font-bold text-xl tracking-tight">Fixora</span>
          </div>
          <p className="text-blue-200 text-sm italic">"Where Every Issue Finds Its Fix."</p>
        </div>

        <div className="relative z-10 p-8 lg:p-12">
          <h1 className="text-white text-3xl lg:text-4xl font-bold leading-tight mb-4">
            Society maintenance,<br />
            <span className="text-accent">smarter.</span>
          </h1>
          <p className="text-blue-200 text-sm lg:text-base mb-6 leading-relaxed">
            Stop losing complaints in WhatsApp groups. Fixora brings structure, accountability, and AI-powered insights to your society.
          </p>
          <div className="space-y-2">
            {features.map((f) => (
              <div key={f.text} className="flex items-center gap-2 text-blue-100 text-sm">
                <f.icon className="w-4 h-4 text-accent flex-shrink-0" />
                <span>{f.text}</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Right panel — role selection */}
      <div className="flex-1 flex items-center justify-center p-6 lg:p-12 bg-background">
        <div className="w-full max-w-md animate-slide-up">
          <div className="mb-8">
            <h2 className="text-2xl font-bold text-foreground mb-1">Welcome to Fixora</h2>
            <p className="text-muted-foreground text-sm">Select your role to continue to sign up</p>
          </div>

          <div className="space-y-3 mb-6">
            {roles.map((role) => {
              const Icon = role.icon;
              const isSelected = selected === role.id;
              return (
                <button
                  key={role.id}
                  onClick={() => setSelected(role.id)}
                  className={`w-full flex items-center gap-4 p-4 rounded-xl border-2 transition-all duration-200 text-left group ${
                    isSelected
                      ? `bg-primary border-primary shadow-primary`
                      : "bg-card border-border hover:border-primary/40 hover:shadow-md"
                  }`}
                >
                  <div
                    className={`w-11 h-11 rounded-xl flex items-center justify-center bg-gradient-to-br ${role.color} flex-shrink-0`}
                  >
                    <Icon className="w-5 h-5 text-white" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className={`font-semibold text-sm ${isSelected ? "text-primary-foreground" : "text-foreground"}`}>
                      {role.label}
                    </p>
                    <p className={`text-xs mt-0.5 ${isSelected ? "text-blue-200" : "text-muted-foreground"}`}>
                      {role.description}
                    </p>
                  </div>
                  {isSelected && (
                    <CheckCircle className="w-5 h-5 text-accent flex-shrink-0" />
                  )}
                </button>
              );
            })}
          </div>

          <button
            onClick={handleContinue}
            disabled={!selected || loading}
            className={`w-full flex items-center justify-center gap-2 py-3.5 rounded-xl font-semibold text-sm transition-all duration-200 ${
              selected && !loading
                ? "bg-gradient-accent text-white shadow-accent hover:opacity-90 active:scale-[0.98]"
                : "bg-muted text-muted-foreground cursor-not-allowed"
            }`}
          >
            {loading ? (
              <div className="w-5 h-5 rounded-full border-2 border-white border-t-transparent animate-spin" />
            ) : (
              <>
                Continue to Sign Up <ArrowRight className="w-4 h-4" />
              </>
            )}
          </button>

          <p className="text-center text-xs text-muted-foreground mt-6">
            Greenwood Heights Society · Block A–F · Est. 2019
          </p>
        </div>
      </div>
    </div>
  );
}
