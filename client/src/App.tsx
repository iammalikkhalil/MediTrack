import { Switch, Route, useLocation, Link } from "wouter";
import { queryClient } from "./lib/queryClient";
import { QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import { AuthProvider, useAuth } from "@/lib/auth";
import { ThemeProvider } from "@/components/theme-provider";
import { ThemeToggle } from "@/components/theme-toggle";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { 
  Home, 
  Pill, 
  Clock, 
  ShoppingCart, 
  Zap, 
  LogOut,
  Menu,
  X
} from "lucide-react";
import { useState } from "react";
import { cn } from "@/lib/utils";

import LoginPage from "@/pages/login";
import DashboardPage from "@/pages/dashboard";
import SymptomsPage from "@/pages/symptoms";
import QuickAccessPage from "@/pages/quick-access";
import ShoppingPage from "@/pages/shopping";
import InventoryPage from "@/pages/inventory";
import MedicineDetailPage from "@/pages/medicine-detail";
import HistoryPage from "@/pages/history";
import NotFound from "@/pages/not-found";

const NAV_ITEMS = [
  { href: "/", icon: Home, label: "Dashboard" },
  { href: "/quick-access", icon: Zap, label: "Quick Access" },
  { href: "/inventory", icon: Pill, label: "Inventory" },
  { href: "/shopping", icon: ShoppingCart, label: "Shopping" },
  { href: "/history", icon: Clock, label: "History" },
];

function MobileNav({ isOpen, onClose }: { isOpen: boolean; onClose: () => void }) {
  const [location] = useLocation();
  const { logout } = useAuth();

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 lg:hidden">
      <div className="fixed inset-0 bg-background/80 backdrop-blur-sm" onClick={onClose} />
      <nav className="fixed top-0 left-0 bottom-0 w-72 bg-sidebar border-r border-sidebar-border p-6">
        <div className="flex items-center justify-between mb-8">
          <div className="flex items-center gap-2">
            <Pill className="h-6 w-6 text-primary" />
            <span className="font-bold text-xl">Medical Kit</span>
          </div>
          <Button variant="ghost" size="icon" onClick={onClose}>
            <X className="h-5 w-5" />
          </Button>
        </div>
        <div className="space-y-2">
          {NAV_ITEMS.map((item) => {
            const isActive = location === item.href;
            return (
              <Link key={item.href} href={item.href} onClick={onClose}>
                <div
                  className={cn(
                    "flex items-center gap-3 px-4 py-3 rounded-lg text-lg font-medium transition-colors",
                    "hover-elevate active-elevate-2",
                    isActive 
                      ? "bg-primary text-primary-foreground" 
                      : "text-sidebar-foreground"
                  )}
                  data-testid={`nav-${item.label.toLowerCase().replace(/\s+/g, "-")}`}
                >
                  <item.icon className="h-5 w-5" />
                  {item.label}
                </div>
              </Link>
            );
          })}
        </div>
        <div className="absolute bottom-6 left-6 right-6">
          <Button
            variant="outline"
            className="w-full h-12"
            onClick={() => {
              logout();
              onClose();
            }}
            data-testid="button-logout-mobile"
          >
            <LogOut className="h-5 w-5 mr-2" />
            Sign Out
          </Button>
        </div>
      </nav>
    </div>
  );
}

function Sidebar() {
  const [location] = useLocation();
  const { logout } = useAuth();

  return (
    <aside className="hidden lg:flex flex-col w-64 bg-sidebar border-r border-sidebar-border p-4">
      <div className="flex items-center gap-2 px-4 py-4 mb-4">
        <Pill className="h-7 w-7 text-primary" />
        <span className="font-bold text-xl">Medical Kit</span>
      </div>
      <nav className="flex-1 space-y-1">
        {NAV_ITEMS.map((item) => {
          const isActive = location === item.href;
          return (
            <Link key={item.href} href={item.href}>
              <div
                className={cn(
                  "flex items-center gap-3 px-4 py-3 rounded-lg text-base font-medium transition-colors",
                  "hover-elevate active-elevate-2",
                  isActive 
                    ? "bg-primary text-primary-foreground" 
                    : "text-sidebar-foreground"
                )}
                data-testid={`nav-${item.label.toLowerCase().replace(/\s+/g, "-")}`}
              >
                <item.icon className="h-5 w-5" />
                {item.label}
              </div>
            </Link>
          );
        })}
      </nav>
      <div className="pt-4 border-t border-sidebar-border">
        <Button
          variant="ghost"
          className="w-full justify-start h-12"
          onClick={() => logout()}
          data-testid="button-logout"
        >
          <LogOut className="h-5 w-5 mr-3" />
          Sign Out
        </Button>
      </div>
    </aside>
  );
}

function Header() {
  const [mobileNavOpen, setMobileNavOpen] = useState(false);

  return (
    <>
      <header className="sticky top-0 z-40 bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60 border-b border-border">
        <div className="flex items-center justify-between h-16 px-4 lg:px-6">
          <div className="flex items-center gap-3 lg:hidden">
            <Button
              variant="ghost"
              size="icon"
              onClick={() => setMobileNavOpen(true)}
              data-testid="button-mobile-menu"
            >
              <Menu className="h-6 w-6" />
            </Button>
            <div className="flex items-center gap-2">
              <Pill className="h-6 w-6 text-primary" />
              <span className="font-bold text-lg">Medical Kit</span>
            </div>
          </div>
          <div className="hidden lg:block" />
          <ThemeToggle />
        </div>
      </header>
      <MobileNav isOpen={mobileNavOpen} onClose={() => setMobileNavOpen(false)} />
    </>
  );
}

function BottomNav() {
  const [location] = useLocation();

  return (
    <nav className="fixed bottom-0 left-0 right-0 z-40 lg:hidden bg-background border-t border-border">
      <div className="flex items-center justify-around h-16">
        {NAV_ITEMS.slice(0, 5).map((item) => {
          const isActive = location === item.href;
          return (
            <Link key={item.href} href={item.href}>
              <div
                className={cn(
                  "flex flex-col items-center gap-1 px-3 py-2 min-w-[64px]",
                  isActive ? "text-primary" : "text-muted-foreground"
                )}
                data-testid={`bottom-nav-${item.label.toLowerCase().replace(/\s+/g, "-")}`}
              >
                <item.icon className="h-5 w-5" />
                <span className="text-xs font-medium">{item.label}</span>
              </div>
            </Link>
          );
        })}
      </div>
    </nav>
  );
}

function AuthenticatedLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex h-screen bg-background">
      <Sidebar />
      <div className="flex-1 flex flex-col overflow-hidden">
        <Header />
        <main className="flex-1 overflow-y-auto pb-20 lg:pb-0">
          <div className="container max-w-6xl mx-auto p-4 lg:p-8">
            {children}
          </div>
        </main>
        <BottomNav />
      </div>
    </div>
  );
}

function Router() {
  const { isAuthenticated, isLoading } = useAuth();

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <div className="text-center space-y-4">
          <Pill className="h-12 w-12 mx-auto text-primary animate-pulse" />
          <Skeleton className="h-4 w-32 mx-auto" />
        </div>
      </div>
    );
  }

  if (!isAuthenticated) {
    return <LoginPage />;
  }

  return (
    <AuthenticatedLayout>
      <Switch>
        <Route path="/" component={DashboardPage} />
        <Route path="/symptoms" component={SymptomsPage} />
        <Route path="/quick-access" component={QuickAccessPage} />
        <Route path="/shopping" component={ShoppingPage} />
        <Route path="/inventory" component={InventoryPage} />
        <Route path="/medicine/:id" component={MedicineDetailPage} />
        <Route path="/history" component={HistoryPage} />
        <Route component={NotFound} />
      </Switch>
    </AuthenticatedLayout>
  );
}

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <ThemeProvider defaultTheme="light">
        <TooltipProvider>
          <AuthProvider>
            <Toaster />
            <Router />
          </AuthProvider>
        </TooltipProvider>
      </ThemeProvider>
    </QueryClientProvider>
  );
}

export default App;
