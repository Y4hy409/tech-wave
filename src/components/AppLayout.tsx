import { ReactNode, useMemo, useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { BarChart3, FileText, LayoutDashboard, LogOut, Menu, PlusCircle, UserCircle2 } from "lucide-react";
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet";

interface NavItem {
  label: string;
  tab?: string;
  path?: string;
  icon: React.ElementType;
}

interface AppLayoutProps {
  children: ReactNode;
  role: "resident" | "admin" | "staff";
  userName?: string;
  activeTab?: string;
  onTabChange?: (tab: string) => void;
}

export function AppLayout({ children, role, userName = "User", activeTab, onTabChange }: AppLayoutProps) {
  const navigate = useNavigate();
  const location = useLocation();
  const [open, setOpen] = useState(false);

  const navItems = useMemo<NavItem[]>(() => {
    if (role === "resident") {
      return [
        { label: "Dashboard", tab: "dashboard", icon: LayoutDashboard },
        { label: "My Complaints", tab: "tickets", icon: FileText },
        { label: "Post Complaint", path: "/submit", icon: PlusCircle },
        { label: "Analytics", tab: "analytics", icon: BarChart3 },
        { label: "Logout", path: "/", icon: LogOut },
      ];
    }
    if (role === "admin") {
      return [
        { label: "Dashboard", tab: "dashboard", icon: LayoutDashboard },
        { label: "My Complaints", tab: "tickets", icon: FileText },
        { label: "Post Complaint", path: "/submit", icon: PlusCircle },
        { label: "Analytics", tab: "analytics", icon: BarChart3 },
        { label: "Logout", path: "/", icon: LogOut },
      ];
    }
    return [
      { label: "Dashboard", tab: "dashboard", icon: LayoutDashboard },
      { label: "My Complaints", tab: "tasks", icon: FileText },
      { label: "Post Complaint", path: "/submit", icon: PlusCircle },
      { label: "Analytics", tab: "history", icon: BarChart3 },
      { label: "Logout", path: "/", icon: LogOut },
    ];
  }, [role]);

  return (
    <div className="min-h-screen bg-background">
      <header className="sticky top-0 z-40 border-b border-border bg-background/95 backdrop-blur">
        <div className="mx-auto flex h-14 items-center justify-between px-4 lg:px-8">
          <Sheet open={open} onOpenChange={setOpen}>
            <SheetTrigger asChild>
              <button
                className="flex h-9 w-9 items-center justify-center rounded-lg border border-border bg-card"
                aria-label="Open menu"
              >
                <Menu className="h-5 w-5" />
              </button>
            </SheetTrigger>
            <SheetContent side="left" className="w-72">
              <div className="mb-6 flex items-center gap-3 border-b border-border pb-4">
                <div className="flex h-10 w-10 items-center justify-center rounded-full bg-primary/10 text-primary font-bold">
                  {userName[0]}
                </div>
                <div>
                  <p className="font-semibold text-foreground">{userName}</p>
                  <p className="text-xs capitalize text-muted-foreground">{role}</p>
                </div>
              </div>
              <nav className="space-y-2">
                {navItems.map((item) => {
                  const Icon = item.icon;
                  const selected = item.tab ? activeTab === item.tab : location.pathname === item.path;
                  return (
                    <button
                      key={item.label}
                      onClick={() => {
                        setOpen(false);
                        if (item.path) {
                          navigate(item.path);
                          return;
                        }
                        if (item.tab && onTabChange) {
                          onTabChange(item.tab);
                        }
                      }}
                      className={`flex w-full items-center gap-2 rounded-lg px-3 py-2 text-sm ${
                        selected ? "bg-primary text-white" : "bg-card border border-border text-foreground"
                      }`}
                    >
                      <Icon className="h-4 w-4" />
                      {item.label}
                    </button>
                  );
                })}
              </nav>
            </SheetContent>
          </Sheet>

          <p className="text-sm font-semibold text-muted-foreground">Smart Complaint System</p>

          <button
            onClick={() => navigate("/profile")}
            className="flex items-center gap-2 rounded-lg border border-border bg-card px-2 py-1.5"
            title="Profile management"
          >
            <img
              src="/logo.png"
              alt="Logo"
              className="h-5 w-5 rounded object-cover"
              onError={(event) => {
                const img = event.currentTarget as HTMLImageElement;
                img.src = "/favicon.ico";
              }}
            />
            <UserCircle2 className="h-4 w-4 text-muted-foreground" />
          </button>
        </div>
      </header>
      <main>{children}</main>
    </div>
  );
}
