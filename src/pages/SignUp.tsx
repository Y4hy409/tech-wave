import { useState } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { Home, Shield, Wrench, ArrowRight, Eye, EyeOff, ArrowLeft, CheckCircle } from "lucide-react";
import heroBuilding from "@/assets/hero-building.jpg";

type Role = "resident" | "admin" | "staff";

const roleConfig = {
  resident: {
    label: "Resident",
    icon: Home,
    color: "from-blue-600 to-blue-800",
    description: "Submit complaints, track tickets, rate service",
    destination: "/resident",
    mockUsers: ["Priya Sharma", "Rahul Mehta", "Sunita Gupta"],
    society: "Greenwood Heights Society · Flat 3B",
  },
  admin: {
    label: "Admin / Committee",
    icon: Shield,
    color: "from-orange-500 to-orange-700",
    description: "Monitor dashboard, manage escalations, analytics",
    destination: "/admin",
    mockUsers: ["Suresh Agarwal", "Kavita Nair", "Ramesh Joshi"],
    society: "Greenwood Heights Society · Committee Chair",
  },
  staff: {
    label: "Maintenance Staff",
    icon: Wrench,
    color: "from-emerald-600 to-emerald-800",
    description: "View assigned tasks, update resolution status",
    destination: "/staff",
    mockUsers: ["Ravi Kumar", "Anil Sharma", "Mukesh Verma"],
    society: "Greenwood Heights Society · Maintenance Dept.",
  },
};

export default function SignUp() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const role = (searchParams.get("role") as Role) || "resident";

  const config = roleConfig[role] || roleConfig.resident;
  const Icon = config.icon;

  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState("");

  const handleSignUp = () => {
    if (!username.trim()) { setError("Please enter a username."); return; }
    if (password.length < 6) { setError("Password must be at least 6 characters."); return; }
    setError("");
    setLoading(true);
    setTimeout(() => {
      setLoading(false);
      setSuccess(true);
      setTimeout(() => navigate(config.destination), 1200);
    }, 1000);
  };

  return (
    <div className="min-h-screen flex flex-col lg:flex-row">
      {/* Left panel */}
      <div className="relative flex flex-col justify-between lg:w-1/2 min-h-[280px] lg:min-h-screen overflow-hidden">
        <img src={heroBuilding} alt="Society building" className="absolute inset-0 w-full h-full object-cover" />
        <div className="absolute inset-0 bg-gradient-hero opacity-90" />

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
        <div className="w-14 h-14 rounded-2xl flex items-center justify-center bg-gradient-accent mb-4 shadow-accent">
            <Icon className="w-7 h-7 text-white" />
          </div>
          <h2 className="text-white text-3xl font-bold mb-2">Create Account</h2>
          <p className="text-blue-200 text-sm mb-1">{config.description}</p>
          <p className="text-blue-300 text-xs opacity-75">{config.society}</p>
        </div>
      </div>

      {/* Right panel */}
      <div className="flex-1 flex items-center justify-center p-6 lg:p-12 bg-background">
        <div className="w-full max-w-md animate-slide-up">
          {/* Back button */}
          <button
            onClick={() => navigate("/")}
            className="flex items-center gap-1.5 text-sm text-muted-foreground hover:text-foreground mb-8 transition-colors"
          >
            <ArrowLeft className="w-4 h-4" />
            Back to role selection
          </button>

          {/* Role chip */}
          <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-gradient-accent mb-6">
            <Icon className="w-3.5 h-3.5 text-white" />
            <span className="text-white text-xs font-semibold">{config.label}</span>
          </div>

          <div className="mb-8">
            <h1 className="text-2xl font-bold text-foreground mb-1">Sign Up</h1>
            <p className="text-muted-foreground text-sm">Create your Fixora account to get started.</p>
          </div>

          {success ? (
            <div className="flex flex-col items-center gap-4 py-8 animate-slide-up">
              <div className="w-16 h-16 bg-success/10 rounded-full flex items-center justify-center">
                <CheckCircle className="w-8 h-8 text-success" />
              </div>
              <p className="text-foreground font-semibold text-lg">Account created!</p>
              <p className="text-muted-foreground text-sm">Redirecting to your dashboard…</p>
            </div>
          ) : (
            <div className="space-y-4">
              {/* Username */}
              <div className="space-y-1.5">
                <label className="text-sm font-medium text-foreground">Username</label>
                <input
                  type="text"
                  value={username}
                  onChange={(e) => { setUsername(e.target.value); setError(""); }}
                  placeholder={`e.g. ${config.mockUsers[0].toLowerCase().replace(" ", "_")}`}
                  className="w-full px-4 py-3 bg-card border border-border rounded-xl text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/30 transition"
                />
              </div>

              {/* Password */}
              <div className="space-y-1.5">
                <label className="text-sm font-medium text-foreground">Password</label>
                <div className="relative">
                  <input
                    type={showPassword ? "text" : "password"}
                    value={password}
                    onChange={(e) => { setPassword(e.target.value); setError(""); }}
                    placeholder="Min. 6 characters"
                    className="w-full px-4 py-3 pr-11 bg-card border border-border rounded-xl text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/30 transition"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors"
                  >
                    {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
              </div>

              {/* Society ID (pre-filled) */}
              <div className="space-y-1.5">
                <label className="text-sm font-medium text-foreground">Society ID</label>
                <input
                  type="text"
                  readOnly
                  value="GWHS-2019-BLK-A"
                  className="w-full px-4 py-3 bg-muted border border-border rounded-xl text-sm text-muted-foreground cursor-not-allowed"
                />
                <p className="text-xs text-muted-foreground">Pre-assigned by your society admin.</p>
              </div>

              {error && (
                <p className="text-sm text-escalation bg-escalation/10 border border-escalation/20 rounded-lg px-3 py-2">{error}</p>
              )}

              <button
                onClick={handleSignUp}
                disabled={loading}
                className="w-full flex items-center justify-center gap-2 py-3.5 rounded-xl font-semibold text-sm bg-gradient-accent text-white shadow-accent hover:opacity-90 active:scale-[0.98] transition-all duration-200 mt-2"
              >
                {loading ? (
                  <div className="w-5 h-5 rounded-full border-2 border-white border-t-transparent animate-spin" />
                ) : (
                  <>
                    Create Account <ArrowRight className="w-4 h-4" />
                  </>
                )}
              </button>

              <div className="relative my-4">
                <div className="absolute inset-0 flex items-center">
                  <div className="w-full border-t border-border" />
                </div>
                <div className="relative flex justify-center">
                  <span className="bg-background px-3 text-xs text-muted-foreground">or use mock account</span>
                </div>
              </div>

              {/* Mock user quick-fill */}
              <div className="space-y-2">
                {config.mockUsers.map((name) => (
                  <button
                    key={name}
                    onClick={() => {
                      setUsername(name.toLowerCase().replace(" ", "_"));
                      setPassword("fixora123");
                      setError("");
                    }}
                    className="w-full flex items-center gap-3 px-4 py-3 bg-card border border-border rounded-xl hover:border-primary/30 hover:shadow-sm transition-all text-left group"
                  >
                    <div className="w-8 h-8 bg-primary/10 rounded-full flex items-center justify-center flex-shrink-0">
                      <span className="text-xs font-bold text-primary">{name[0]}</span>
                    </div>
                    <div>
                      <p className="text-sm font-medium text-foreground">{name}</p>
                      <p className="text-xs text-muted-foreground">Mock account · password: fixora123</p>
                    </div>
                    <ArrowRight className="w-4 h-4 text-muted-foreground ml-auto opacity-0 group-hover:opacity-100 transition-opacity" />
                  </button>
                ))}
              </div>
            </div>
          )}

          <p className="text-center text-xs text-muted-foreground mt-8">
            Greenwood Heights Society · Block A–F · Est. 2019
          </p>
        </div>
      </div>
    </div>
  );
}
