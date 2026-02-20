import { ReactNode, useState } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import {
  Home, PlusCircle, FileText, Bell, LogOut, LayoutDashboard, Users, BarChart3, Settings, ClipboardList,
  Menu, ChevronDown
} from "lucide-react";

interface NavItem {
  icon: React.ElementType;
  label: string;
  tab?: string;
  path?: string;
}

interface AppLayoutProps {
  children: ReactNode;
  role: "resident" | "admin" | "staff";
  userName?: string;
  activeTab?: string;
  onTabChange?: (tab: string) => void;
}

const residentNav: NavItem[] = [
  { icon: Home, label: "Dashboard", tab: "dashboard" },
  { icon: PlusCircle, label: "New Complaint", path: "/submit" },
  { icon: FileText, label: "My Tickets", tab: "tickets" },
  { icon: Bell, label: "Notifications", tab: "notifications" },
];

const adminNav: NavItem[] = [
  { icon: LayoutDashboard, label: "Dashboard", tab: "dashboard" },
  { icon: FileText, label: "All Tickets", tab: "tickets" },
  { icon: Users, label: "Staff", tab: "staff" },
  { icon: BarChart3, label: "Analytics", tab: "analytics" },
  { icon: Settings, label: "Settings", tab: "settings" },
];

const staffNav: NavItem[] = [
  { icon: Home, label: "Dashboard", tab: "dashboard" },
  { icon: ClipboardList, label: "My Tasks", tab: "tasks" },
  { icon: FileText, label: "History", tab: "history" },
];

export function AppLayout({ children, role, userName = "User", activeTab, onTabChange }: AppLayoutProps) {
  const navigate = useNavigate();
  const navItems = role === "resident" ? residentNav : role === "admin" ? adminNav : staffNav;
  const [menuOpen, setMenuOpen] = useState(false);

  const roleLabel = role === "resident" ? "Resident" : role === "admin" ? "Admin" : "Staff";
  const roleColors = {
    resident: "bg-blue-600",
    admin: "bg-orange-500",
    staff: "bg-emerald-600",
  };

  return (
    <div className="min-h-screen flex bg-background">
      {/* Sidebar */}
      <aside className="w-60 flex-shrink-0 flex flex-col" style={{ background: "hsl(var(--sidebar-background))" }}>
        {/* Logo */}
        <div className="p-5 border-b border-sidebar-border">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg overflow-hidden flex items-center justify-center">
              <img
                src="/logo.png"
                alt="Fixora"
                className="w-8 h-8 object-cover"
                onError={(e) => {
                  const img = e.currentTarget as HTMLImageElement;
                  if (img.src.endsWith('/logo.png')) img.src = '/favicon.ico';
                }}
              />
            </div>
            <div>
              <p className="text-white font-bold text-base leading-none">Fixora</p>
              <p className="text-sidebar-foreground text-xs mt-0.5 opacity-70">Society Platform</p>
            </div>
          </div>
        </div>

        {/* Nav */}
        <nav className="flex-1 p-3 space-y-1">
          {role === "resident" ? (
            <div>
              <button
                onClick={() => setMenuOpen((s) => !s)}
                className="w-full flex items-center justify-between gap-3 px-3 py-2.5 rounded-lg text-sm font-medium text-sidebar-foreground hover:bg-sidebar-accent/60 hover:text-white transition-all duration-150"
              >
                <span className="flex items-center gap-3">
                  <Menu className="w-4 h-4" />
                  Menu
                </span>
                <ChevronDown className={`w-4 h-4 transform ${menuOpen ? "rotate-180" : "rotate-0"}`} />
              </button>

              {menuOpen && (
                <div className="mt-2 space-y-1 pl-3">
                  {residentNav.map((item) => {
                    const Icon = item.icon;
                    const isActive = item.tab ? activeTab === item.tab : false;
                    return (
                      <button
                        key={item.label}
                        onClick={() => {
                          if (item.path) {
                            navigate(item.path);
                          } else if (item.tab && onTabChange) {
                            onTabChange(item.tab);
                          }
                        }}
                        className={`w-full flex items-center gap-3 px-3 py-2 rounded-lg text-sm font-medium transition-all duration-150 ${
                          isActive
                            ? "bg-sidebar-accent text-white"
                            : "text-sidebar-foreground hover:bg-sidebar-accent/60 hover:text-white"
                        }`}
                      >
                        <Icon className="w-4 h-4 flex-shrink-0" />
                        {item.label}
                      </button>
                    );
                  })}
                </div>
              )}
            </div>
          ) : (
            navItems.map((item) => {
              const Icon = item.icon;
              const isActive = item.tab ? activeTab === item.tab : false;
              return (
                <button
                  key={item.label}
                  onClick={() => {
                    if (item.path) {
                      navigate(item.path);
                    } else if (item.tab && onTabChange) {
                      onTabChange(item.tab);
                    }
                  }}
                  className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-all duration-150 ${
                    isActive
                      ? "bg-sidebar-accent text-white"
                      : "text-sidebar-foreground hover:bg-sidebar-accent/60 hover:text-white"
                  }`}
                >
                  <Icon className="w-4 h-4 flex-shrink-0" />
                  {item.label}
                </button>
              );
            })
          )}
        </nav>

        {/* User */}
        <div className="p-3 border-t border-sidebar-border">
          <div className="flex items-center gap-3 px-2 py-2">
            <div className={`w-8 h-8 ${roleColors[role]} rounded-full flex items-center justify-center flex-shrink-0`}>
              <span className="text-white text-xs font-bold">{userName[0]}</span>
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-white text-sm font-medium truncate">{userName}</p>
              <p className="text-sidebar-foreground text-xs opacity-70">{roleLabel}</p>
            </div>
            <button
              onClick={() => navigate("/")}
              className="text-sidebar-foreground hover:text-white transition-colors"
              title="Logout"
            >
              <LogOut className="w-4 h-4" />
            </button>
          </div>
        </div>
      </aside>

      {/* Main content */}
      <main className="flex-1 overflow-auto">
        {children}
      </main>
    </div>
  );
}
