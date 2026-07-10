"use client";

import React, { useState, useEffect, Suspense } from "react";
import Link from "next/link";
import { useSearchParams, useRouter } from "next/navigation";
import { useAuth } from "@/components/auth-provider";
import { insforge } from "@/lib/insforge";
import {
  LayoutDashboard,
  BrainCircuit,
  Newspaper,
  Plug,
  Bell,
  Settings,
  CreditCard,
  PanelLeftClose,
  PanelLeftOpen,
  Menu,
  X,
  LogOut,
  Sun,
  Moon,
  Zap,
  ShieldCheck,
} from "lucide-react";
import { useTheme } from "@/components/theme-provider";

// ─── Types ────────────────────────────────────────────────────────────────────
interface NavItem {
  name: string;
  tabKey: string;
  href: string;
  icon: React.ComponentType<any>;
  /** Tailwind classes for the icon tile background */
  iconBg: string;
  /** Tailwind classes for the icon color */
  iconColor: string;
  dot?: boolean;
}

// ─── Nav config ───────────────────────────────────────────────────────────────
const mainNavItems: NavItem[] = [
  {
    name: "Dashboard",
    tabKey: "dashboard",
    href: "/dashboard",
    icon: LayoutDashboard,
    iconBg: "bg-blue-100 dark:bg-blue-900/40",
    iconColor: "text-blue-500 dark:text-blue-400",
  },
  {
    name: "AI Agent",
    tabKey: "ai-agent",
    href: "/dashboard?tab=ai-agent",
    icon: BrainCircuit,
    iconBg: "bg-violet-100 dark:bg-violet-900/40",
    iconColor: "text-violet-500 dark:text-violet-400",
  },
  {
    name: "Briefing",
    tabKey: "briefing",
    href: "/dashboard?tab=briefing",
    icon: Newspaper,
    iconBg: "bg-orange-100 dark:bg-orange-900/40",
    iconColor: "text-orange-500 dark:text-orange-400",
  },
  {
    name: "Integrations",
    tabKey: "integrations",
    href: "/dashboard?tab=integrations",
    icon: Plug,
    iconBg: "bg-teal-100 dark:bg-teal-900/40",
    iconColor: "text-teal-500 dark:text-teal-400",
  },
  {
    name: "Alerts",
    tabKey: "alerts",
    href: "/dashboard?tab=alerts",
    icon: Bell,
    iconBg: "bg-rose-100 dark:bg-rose-900/40",
    iconColor: "text-rose-500 dark:text-rose-400",
    dot: true,
  },
  {
    name: "Settings",
    tabKey: "settings",
    href: "/dashboard?tab=settings",
    icon: Settings,
    iconBg: "bg-slate-100 dark:bg-slate-800",
    iconColor: "text-slate-500 dark:text-slate-400",
  },
];

const pricingNavItem: NavItem = {
  name: "Pricing Settings",
  tabKey: "pricing",
  href: "/dashboard?tab=pricing",
  icon: CreditCard,
  iconBg: "bg-purple-100 dark:bg-purple-900/40",
  iconColor: "text-purple-500 dark:text-purple-400",
};

// ─── Small icon tile ──────────────────────────────────────────────────────────
function IconTile({
  icon: Icon,
  bg,
  color,
}: {
  icon: React.ComponentType<any>;
  bg: string;
  color: string;
}) {
  return (
    <span
      className={`flex items-center justify-center w-9 h-9 rounded-xl flex-shrink-0 ${bg}`}
    >
      <Icon className={`w-[18px] h-[18px] ${color}`} />
    </span>
  );
}

// ─── Sidebar content ──────────────────────────────────────────────────────────
interface SidebarContentProps {
  isCollapsed: boolean;
  toggleSidebar: () => void;
  user: any;
  signOut: () => Promise<void>;
}

function SidebarContent({
  isCollapsed,
  toggleSidebar,
  user,
  signOut,
}: SidebarContentProps) {
  const searchParams = useSearchParams();
  const [activeTab, setActiveTab] = useState("dashboard");

  useEffect(() => {
    const tab = searchParams.get("tab") || "dashboard";
    setActiveTab(tab);
  }, [searchParams]);

  const isActive = (item: NavItem) => activeTab === item.tabKey;

  const renderNavItem = (item: NavItem) => {
    const active = isActive(item);
    return (
      <Link
        key={item.tabKey}
        href={item.href}
        title={isCollapsed ? item.name : undefined}
        className={`flex items-center gap-3 px-3 py-3 rounded-xl transition-all duration-150 group ${
          active
            ? "bg-slate-100 dark:bg-white/[0.06]"
            : "hover:bg-slate-50 dark:hover:bg-white/[0.03]"
        } ${isCollapsed ? "justify-center" : ""}`}
      >
        <IconTile icon={item.icon} bg={item.iconBg} color={item.iconColor} />

        {!isCollapsed && (
          <span
            className={`text-[15px] flex-1 truncate ${
              active
                ? "font-semibold text-slate-900 dark:text-white"
                : "font-medium text-slate-600 dark:text-slate-400 group-hover:text-slate-800 dark:group-hover:text-slate-200"
            }`}
          >
            {item.name}
          </span>
        )}

        {!isCollapsed && item.dot && !active && (
          <span className="w-1.5 h-1.5 rounded-full bg-rose-500 animate-pulse flex-shrink-0" />
        )}
      </Link>
    );
  };

  return (
    <div className="flex flex-col h-full bg-white dark:bg-[#0d111e] border-r border-slate-200 dark:border-white/[0.06]">
      {/* ── Brand header ── */}
      <div
        className={`flex items-center px-4 py-5 ${
          isCollapsed ? "justify-center" : "justify-between"
        }`}
      >
        {/* Logo + name */}
        <Link
          href="/dashboard"
          className={`flex items-center gap-2.5 group min-w-0 ${
            isCollapsed ? "" : "flex-1"
          }`}
        >
          {/* Logo icon */}
          <div className="w-8 h-8 rounded-xl bg-gradient-to-tr from-purple-500 via-indigo-500 to-blue-500 flex items-center justify-center flex-shrink-0 shadow-sm group-hover:opacity-90 transition-opacity">
            <Zap className="w-4 h-4 text-white fill-white" />
          </div>

          {!isCollapsed && (
            <span className="text-[15px] font-bold text-slate-800 dark:text-white leading-none truncate">
              Alyla
              <span className="text-indigo-500 dark:text-indigo-400">.ai</span>
            </span>
          )}
        </Link>

        {/* Collapse toggle */}
        {!isCollapsed && (
          <button
            onClick={toggleSidebar}
            className="hidden md:flex p-1 rounded-lg text-slate-400 hover:text-slate-600 dark:hover:text-slate-300 hover:bg-slate-100 dark:hover:bg-white/5 transition flex-shrink-0"
            title="Collapse sidebar"
          >
            <PanelLeftClose className="w-4 h-4" />
          </button>
        )}

        {isCollapsed && (
          <button
            onClick={toggleSidebar}
            className="hidden md:flex p-1 rounded-lg text-slate-400 hover:text-slate-600 dark:hover:text-slate-300 hover:bg-slate-100 dark:hover:bg-white/5 transition"
            title="Expand sidebar"
          >
            <PanelLeftOpen className="w-4 h-4" />
          </button>
        )}
      </div>

      {/* ── Main navigation ── */}
      <nav className="flex-1 flex flex-col gap-0.5 overflow-y-auto px-3 pb-2">
        {mainNavItems.map(renderNavItem)}
      </nav>

      {/* ── Bottom: Pricing Settings + user ── */}
      <div className="border-t border-slate-100 dark:border-white/[0.06] px-3 py-3 flex flex-col gap-0.5">
        {renderNavItem(pricingNavItem)}

        {/* User row */}
        {user &&
          (isCollapsed ? (
            <div className="flex flex-col items-center gap-2 pt-2">
              <div className="w-7 h-7 rounded-lg bg-gradient-to-tr from-purple-500 to-indigo-500 flex items-center justify-center text-[11px] font-bold text-white flex-shrink-0">
                {user.profile?.name?.[0]?.toUpperCase() ||
                  user.email[0].toUpperCase()}
              </div>
              <button
                onClick={() => signOut()}
                className="p-1.5 rounded-lg text-slate-400 hover:text-rose-500 hover:bg-rose-50 dark:hover:bg-rose-950/20 transition"
                title="Sign Out"
              >
                <LogOut className="w-3.5 h-3.5" />
              </button>
            </div>
          ) : (
            <div className="flex items-center gap-2 px-3 py-2 rounded-xl hover:bg-slate-50 dark:hover:bg-white/[0.03] transition group">
              <div className="w-7 h-7 rounded-lg bg-gradient-to-tr from-purple-500 to-indigo-500 flex items-center justify-center text-[11px] font-bold text-white flex-shrink-0">
                {user.profile?.name?.[0]?.toUpperCase() ||
                  user.email[0].toUpperCase()}
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-[12px] font-semibold text-slate-700 dark:text-slate-200 truncate leading-tight">
                  {user.profile?.name || user.email.split("@")[0]}
                </p>
                <p className="text-[10px] text-slate-400 truncate leading-tight">
                  {user.email}
                </p>
              </div>
              <button
                onClick={() => signOut()}
                className="p-1 rounded-lg text-slate-300 hover:text-rose-500 transition opacity-0 group-hover:opacity-100 flex-shrink-0"
                title="Sign Out"
              >
                <LogOut className="w-3.5 h-3.5" />
              </button>
            </div>
          ))}
      </div>
    </div>
  );
}

// ─── Breadcrumb title ─────────────────────────────────────────────────────────
function BreadcrumbTitle() {
  const searchParams = useSearchParams();
  const [title, setTitle] = useState("dashboard");

  useEffect(() => {
    const tab = searchParams.get("tab") || "dashboard";
    setTitle(tab);
  }, [searchParams]);

  return (
    <h1 className="text-base sm:text-lg font-bold text-slate-900 dark:text-white tracking-wide capitalize">
      {title.replace(/-/g, " ")}
    </h1>
  );
}

// ─── Layout ───────────────────────────────────────────────────────────────────
export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const { user, loading, signOut, refreshUser } = useAuth();
  const { theme, toggleTheme } = useTheme();
  const [mounted, setMounted] = useState(false);
  const [isCollapsed, setIsCollapsed] = useState(false);
  const [isMobileOpen, setIsMobileOpen] = useState(false);
  const router = useRouter();

  useEffect(() => {
    if (!loading && !user) {
      router.push("/sign-in");
    }
  }, [user, loading, router]);

  const isUnverified = user && user.email && !user.emailVerified && !user.email_confirmed_at && !user.isPhoneAuth;

  useEffect(() => {
    setMounted(true);
    const saved = localStorage.getItem("sidebar-collapsed");
    if (saved === "true") setIsCollapsed(true);
  }, []);

  const toggleSidebar = () => {
    const next = !isCollapsed;
    setIsCollapsed(next);
    localStorage.setItem("sidebar-collapsed", String(next));
  };

  const sidebarWidth = isCollapsed ? "w-[72px]" : "w-[240px]";

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-[#070b17] text-slate-800 dark:text-slate-200 flex">

      {/* ── Desktop sidebar ── */}
      <aside
        className={`hidden md:flex flex-col fixed inset-y-0 left-0 z-30 transition-all duration-300 ease-in-out ${sidebarWidth} overflow-hidden`}
      >
        <Suspense
          fallback={
            <div className="w-full h-full bg-white dark:bg-[#0d111e] border-r border-slate-200 dark:border-white/[0.06] animate-pulse" />
          }
        >
          <SidebarContent
            isCollapsed={isCollapsed}
            toggleSidebar={toggleSidebar}
            user={user}
            signOut={signOut}
          />
        </Suspense>
      </aside>

      {/* Spacer */}
      <div
        className={`hidden md:block flex-shrink-0 transition-all duration-300 ease-in-out ${sidebarWidth}`}
      />

      {/* ── Mobile sidebar drawer ── */}
      {isMobileOpen && (
        <div className="fixed inset-0 z-40 flex md:hidden">
          <div
            className="fixed inset-0 bg-black/50 backdrop-blur-sm"
            onClick={() => setIsMobileOpen(false)}
          />
          <aside className="relative flex flex-col w-[240px] h-full z-50 shadow-2xl">
            <Suspense
              fallback={
                <div className="w-full h-full bg-white dark:bg-[#0d111e] animate-pulse" />
              }
            >
              <SidebarContent
                isCollapsed={false}
                toggleSidebar={() => {}}
                user={user}
                signOut={signOut}
              />
            </Suspense>
            <button
              onClick={() => setIsMobileOpen(false)}
              className="absolute top-4 right-[-44px] p-2 bg-white dark:bg-[#0d111e] border border-slate-200 dark:border-white/10 text-slate-500 rounded-lg"
            >
              <X className="w-4 h-4" />
            </button>
          </aside>
        </div>
      )}

      {/* ── Main content ── */}
      <div className="flex-1 flex flex-col min-w-0">
        {/* Header */}
        <header className="sticky top-0 z-20 flex items-center justify-between bg-white dark:bg-[#070b17] border-b border-slate-200 dark:border-white/[0.06] px-6 py-3.5">
          <div className="flex items-center gap-3">
            {/* Mobile menu */}
            <button
              onClick={() => setIsMobileOpen(true)}
              className="md:hidden p-1.5 rounded-lg text-slate-500 hover:bg-slate-100 dark:hover:bg-white/5 transition"
              title="Open menu"
            >
              <Menu className="w-5 h-5" />
            </button>

            <Suspense
              fallback={
                <h1 className="text-base font-bold text-slate-900 dark:text-white animate-pulse">
                  Loading…
                </h1>
              }
            >
              <BreadcrumbTitle />
            </Suspense>
          </div>

          <div className="flex items-center gap-4">
            {/* Theme toggle */}
            <button
              onClick={toggleTheme}
              className={`relative inline-flex h-6 w-11 items-center rounded-full transition-all duration-300 focus:outline-none cursor-pointer p-0.5 border ${
                !mounted
                  ? "bg-slate-100 border-slate-200"
                  : theme === "dark"
                  ? "bg-indigo-950/60 border-indigo-500/30"
                  : "bg-amber-50 border-amber-200"
              }`}
              title={
                theme === "dark" ? "Switch to Light Mode" : "Switch to Dark Mode"
              }
            >
              <span className="sr-only">Toggle theme</span>
              <span
                className={`flex h-5 w-5 items-center justify-center rounded-full transition-all duration-300 shadow ${
                  !mounted
                    ? "bg-slate-400"
                    : theme === "dark"
                    ? "translate-x-5 bg-indigo-500"
                    : "translate-x-0 bg-amber-400"
                }`}
              >
                {!mounted ? (
                  <div className="w-3 h-3" />
                ) : theme === "dark" ? (
                  <Moon className="h-3 w-3 text-white" />
                ) : (
                  <Sun className="h-3 w-3 text-white" />
                )}
              </span>
            </button>

            <Link
              href="/"
              className="text-xs font-semibold text-slate-400 hover:text-slate-700 dark:hover:text-white transition"
            >
              Landing Page →
            </Link>

            {user && (
              <div className="flex items-center gap-1.5">
                <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
                <span className="text-xs text-slate-400 hidden sm:inline-block">
                  Sync Live
                </span>
              </div>
            )}
          </div>
        </header>

        {/* Page content */}
        <main className="flex-1 overflow-y-auto p-6 md:p-8">
          <div className="max-w-6xl mx-auto">
            {isUnverified ? (
              <EmailVerificationBanner user={user} refreshUser={refreshUser} />
            ) : (
              children
            )}
          </div>
        </main>
      </div>
    </div>
  );
}

function EmailVerificationBanner({ user, refreshUser }: { user: any; refreshUser: () => Promise<void> }) {
  const [resending, setResending] = useState(false);
  const [checking, setChecking] = useState(false);
  const [message, setMessage] = useState<{ text: string; type: "success" | "error" } | null>(null);

  const handleResend = async () => {
    setResending(true);
    setMessage(null);
    try {
      const { error } = await insforge.auth.resendVerificationEmail({
        email: user.email,
        redirectTo: window.location.origin + "/sign-in",
      });
      if (error) throw error;
      setMessage({ text: "Verification link sent successfully! Please check your inbox.", type: "success" });
    } catch (err: any) {
      setMessage({ text: err.message || "Failed to resend verification email.", type: "error" });
    } finally {
      setResending(false);
    }
  };

  const handleCheckStatus = async () => {
    setChecking(true);
    setMessage(null);
    try {
      await refreshUser();
      setMessage({ text: "Checking verification status... Done.", type: "success" });
    } catch (err: any) {
      setMessage({ text: "Failed to refresh status.", type: "error" });
    } finally {
      setChecking(false);
    }
  };

  return (
    <div className="flex flex-col items-center justify-center min-h-[50vh] p-6">
      <div className="glass-premium max-w-md w-full p-8 rounded-3xl border border-white/10 shadow-2xl text-center space-y-6 bg-slate-900/60 backdrop-blur-md">
        <div className="w-16 h-16 mx-auto rounded-2xl bg-amber-500/10 flex items-center justify-center text-amber-400">
          <svg className="w-8 h-8 animate-pulse" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
          </svg>
        </div>
        <div className="space-y-2">
          <h2 className="text-xl font-bold text-white tracking-tight">Verify Your Email Address</h2>
          <p className="text-xs text-slate-400 leading-relaxed">
            To unlock your Alyla.ai dashboard and AI personal assistant features, you must confirm your email address. We sent a verification link to:
          </p>
          <p className="text-sm font-semibold text-purple-400 font-mono select-all bg-white/5 py-1 px-3 rounded-lg inline-block border border-white/5">
            {user.email}
          </p>
        </div>

        {message && (
          <div className={`p-3.5 rounded-xl text-xs font-semibold text-left border ${
            message.type === "success" 
              ? "bg-emerald-500/10 border-emerald-500/20 text-emerald-400" 
              : "bg-rose-500/10 border-rose-500/20 text-rose-400"
          }`}>
            {message.text}
          </div>
        )}

        <div className="flex flex-col gap-3 pt-2">
          <button
            onClick={handleResend}
            disabled={resending}
            className="w-full py-3 bg-purple-600 hover:bg-purple-500 disabled:opacity-50 text-white font-bold rounded-xl text-xs transition duration-200 shadow-lg shadow-purple-600/25 cursor-pointer"
          >
            {resending ? "Resending link..." : "Resend Verification Email"}
          </button>
          
          <button
            onClick={handleCheckStatus}
            disabled={checking}
            className="w-full py-3 bg-white/5 hover:bg-white/10 border border-white/5 disabled:opacity-50 text-slate-300 font-bold rounded-xl text-xs transition duration-200 cursor-pointer"
          >
            {checking ? "Checking..." : "I've Verified My Email (Check Status)"}
          </button>
        </div>
      </div>
    </div>
  );
}
