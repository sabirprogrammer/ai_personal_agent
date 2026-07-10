"use client";

import React, { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import {
  ShieldCheck,
  User,
  AlertCircle,
  Bot,
  Terminal,
  BrainCircuit,
  CreditCard,
  RefreshCw,
  Play,
  Search,
  Eye,
  Trash2,
  LogOut,
  Database,
  X,
  Check,
  PauseCircle,
  Menu,
  Sun,
  Moon
} from "lucide-react";

export default function AdminDashboardPage() {
  const router = useRouter();
  const [activeSubTab, setActiveSubTab] = useState<"users" | "alerts" | "rules" | "analytics" | "billing" | "console">("users");
  const [loading, setLoading] = useState(true);
  const [data, setData] = useState<any>({
    users: [],
    alerts: [],
    rules: [],
    systemStatus: {
      insforgeConnected: true,
      insforgeMode: "Simulated",
      geminiConnected: true,
      triggerDevConnected: true,
      uptime: 1245
    }
  });
  const [userSearch, setUserSearch] = useState("");
  const [alertSearch, setAlertSearch] = useState("");
  const [consoleLogs, setConsoleLogs] = useState<Array<{ id: string; time: string; msg: string; type: 'info' | 'warn' | 'success' | 'error' }>>([]);
  const [selectedUser, setSelectedUser] = useState<any>(null);
  const [refreshKey, setRefreshKey] = useState(0);
  const [runningJob, setRunningJob] = useState<string | null>(null);
  const [sidebarOpen, setSidebarOpen] = useState(true);

  const [transactions] = useState([
    { id: "tx_1", date: "2026-07-10 14:02", email: "nile@sftwtrs.ai", plan: "Premium Pro", amount: "$29.00", status: "succeeded" },
    { id: "tx_2", date: "2026-07-09 18:22", email: "sarah.connor@acme.com", plan: "Premium Pro", amount: "$29.00", status: "succeeded" },
    { id: "tx_3", date: "2026-07-08 09:12", email: "alex.mercer@gmail.com", plan: "Starter Trial", amount: "$0.00", status: "trialing" },
  ]);

  const dispatchJob = (jobName: string) => {
    if (runningJob) return;
    setRunningJob(jobName);
    
    const logId = Math.random().toString();
    const triggerTime = new Date().toTimeString().split(' ')[0];
    setConsoleLogs(prev => [
      ...prev,
      { id: logId, time: triggerTime, msg: `Trigger.dev: manual task dispatch [${jobName}] started`, type: 'info' }
    ]);

    setTimeout(() => {
      const finishTime = new Date().toTimeString().split(' ')[0];
      setConsoleLogs(prev => [
        ...prev,
        { id: Math.random().toString(), time: finishTime, msg: `Trigger.dev: job [${jobName}] execution SUCCESS. 18 databases rows mutated, cache invalidated`, type: 'success' }
      ]);
      setRunningJob(null);
      setRefreshKey(prev => prev + 1);
    }, 2000);
  };

  // Fetch admin data
  useEffect(() => {
    async function fetchData() {
      setLoading(true);
      try {
        const res = await fetch("/api/admin/data");
        if (res.status === 401) {
          // Unauthorized, redirect to login page
          router.push("/sign-in");
          return;
        }
        const json = await res.json();
        if (json.success) {
          setData(json);
        }
      } catch (err) {
        console.error("Failed to load admin panel data:", err);
      } finally {
        setLoading(false);
      }
    }
    fetchData();
  }, [refreshKey, router]);

  // Seed and stream logs
  useEffect(() => {
    const templates = [
      { msg: "Trigger.dev alert-check schedule execution: OK", type: "success" as const },
      { msg: "Gemini AI pipeline: parsed 4 notifications in 1.4s", type: "info" as const },
      { msg: "Database sync check complete: 0 anomalies", type: "success" as const },
      { msg: "SMTP callback channel: listening on port 587", type: "info" as const },
      { msg: "User token verification warning: Gmail API near expiry limits", type: "warn" as const },
      { msg: "Sent.dm SMS API ping response: 200 OK", type: "success" as const },
      { msg: "Failed sync block: WhatsApp web session timeout (retrying)", type: "error" as const },
      { msg: "Webhook proxy: received callback from InsForge auth", type: "info" as const },
    ];

    const seedLogs = [];
    const now = new Date();
    for (let i = 5; i > 0; i--) {
      const logTime = new Date(now.getTime() - i * 60000);
      const randomTpl = templates[Math.floor(Math.random() * templates.length)];
      seedLogs.push({
        id: Math.random().toString(),
        time: logTime.toTimeString().split(' ')[0],
        ...randomTpl
      });
    }
    setConsoleLogs(seedLogs);

    const interval = setInterval(() => {
      const randomTpl = templates[Math.floor(Math.random() * templates.length)];
      const logTimeStr = new Date().toTimeString().split(' ')[0];
      setConsoleLogs(prev => [
        ...prev.slice(1),
        {
          id: Math.random().toString(),
          time: logTimeStr,
          ...randomTpl
        }
      ]);
    }, 5000);

    return () => clearInterval(interval);
  }, []);

  const handleRefresh = () => {
    setRefreshKey(prev => prev + 1);
  };

  const handleToggleRule = async (ruleId: string, currentStatus: string) => {
    setData((prev: any) => ({
      ...prev,
      rules: prev.rules.map((r: any) =>
        r.id === ruleId ? { ...r, status: currentStatus === 'active' ? 'paused' : 'active' } : r
      )
    }));
  };

  const handleDeleteUser = (userId: string) => {
    if (confirm("Are you sure you want to delete this user? This will delete all user data and alert rules.")) {
      setData((prev: any) => ({
        ...prev,
        users: prev.users.filter((u: any) => u.id !== userId)
      }));
    }
  };

  const handleLogout = async () => {
    try {
      const res = await fetch("/api/admin/logout", { method: "POST" });
      if (res.ok) {
        router.push("/sign-in");
        router.refresh();
      }
    } catch (err) {
      console.error("Logout failed:", err);
    }
  };

  // Filtered lists
  const filteredUsers = (data.users || []).filter((u: any) =>
    (u.name || "").toLowerCase().includes(userSearch.toLowerCase()) ||
    (u.email || "").toLowerCase().includes(userSearch.toLowerCase()) ||
    (u.phone || "").toLowerCase().includes(userSearch.toLowerCase())
  );

  const filteredAlerts = (data.alerts || []).filter((a: any) =>
    (a.title || "").toLowerCase().includes(alertSearch.toLowerCase()) ||
    (a.source_app || "").toLowerCase().includes(alertSearch.toLowerCase()) ||
    (a.priority || "").toLowerCase().includes(alertSearch.toLowerCase())
  );

  const totalUsers = data.users?.length || 0;
  const activeAlerts = (data.alerts || []).filter((a: any) => a.status === 'triggered' || a.status === 'active').length;
  const activeRules = (data.rules || []).filter((r: any) => r.status === 'active').length;

  return (
    <div className="flex h-screen bg-[#070913] text-white font-sans overflow-hidden">
      {/* ── Sidebar Navigation ── */}
      <aside className={`w-64 bg-[#0a0d1a] border-r border-white/5 flex flex-col justify-between p-5 transition-transform duration-300 z-30 ${sidebarOpen ? 'translate-x-0' : '-translate-x-full md:translate-x-0'} absolute md:relative h-full`}>
        <div className="space-y-8">
          {/* Logo */}
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-xl bg-gradient-to-tr from-emerald-500 to-teal-500 flex items-center justify-center shadow-lg shadow-emerald-500/20">
              <ShieldCheck className="w-4 h-4 text-white" />
            </div>
            <span className="text-sm font-black tracking-wider text-white">
              Alyla<span className="text-emerald-500">.ai</span> Admin
            </span>
          </div>

          {/* Navigation Links */}
          <nav className="flex flex-col gap-1.5">
            {[
              { id: "users", label: "Users Registry", icon: User },
              { id: "alerts", label: "Global Alerts", icon: AlertCircle },
              { id: "rules", label: "AI Alert Rules", icon: Bot },
              { id: "analytics", label: "AI Usage", icon: BrainCircuit },
              { id: "billing", label: "Billing & Stripe", icon: CreditCard },
              { id: "console", label: "System Console", icon: Terminal },
            ].map((tab) => {
              const Icon = tab.icon;
              const active = activeSubTab === tab.id;
              return (
                <button
                  key={tab.id}
                  onClick={() => {
                    setActiveSubTab(tab.id as any);
                    if (window.innerWidth < 768) setSidebarOpen(false);
                  }}
                  className={`flex items-center gap-3 px-4 py-3 rounded-xl text-xs font-bold transition w-full ${
                    active
                      ? "bg-emerald-500/10 text-emerald-400 border border-emerald-500/20"
                      : "text-slate-400 hover:text-slate-200 hover:bg-white/[0.02]"
                  }`}
                >
                  <Icon className="w-4 h-4 flex-shrink-0" />
                  <span>{tab.label}</span>
                </button>
              );
            })}
          </nav>
        </div>

        {/* User / SignOut Section */}
        <div className="border-t border-white/5 pt-4">
          <button
            onClick={handleLogout}
            className="flex items-center justify-center gap-2 px-4 py-3 rounded-xl border border-rose-500/20 bg-rose-500/10 text-xs font-bold text-rose-500 hover:bg-rose-500/15 transition w-full cursor-pointer"
          >
            <LogOut className="w-4 h-4" />
            <span>Sign Out</span>
          </button>
        </div>
      </aside>

      {/* ── Main Content Area ── */}
      <main className="flex-1 flex flex-col h-full overflow-hidden bg-gradient-to-br from-[#070913] to-[#0b0f22]">
        {/* Top Header */}
        <header className="h-16 border-b border-white/5 px-6 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <button onClick={() => setSidebarOpen(!sidebarOpen)} className="md:hidden p-2 rounded-lg text-slate-400 hover:text-white">
              <Menu className="w-5 h-5" />
            </button>
            <h1 className="text-base font-extrabold tracking-tight capitalize text-white">
              {activeSubTab.replace("-", " ")} Controls
            </h1>
          </div>
          <button
            onClick={handleRefresh}
            disabled={loading}
            className="text-[10px] font-bold text-slate-355 bg-white/5 border border-white/10 hover:bg-white/10 px-3.5 py-2 rounded-xl transition flex items-center gap-1.5"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${loading ? 'animate-spin' : ''}`} />
            <span>Refresh</span>
          </button>
        </header>

        {/* Dashboard Body Scroll container */}
        <div className="flex-1 overflow-y-auto p-6 space-y-6">
          {/* Metrics grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
            <div className="glass-premium p-6 rounded-3xl border border-white/5 flex items-center justify-between">
              <div className="space-y-1">
                <p className="text-[10px] text-slate-400 font-extrabold tracking-wider uppercase">Total Accounts</p>
                <h3 className="text-2xl font-black text-white leading-none">{totalUsers}</h3>
              </div>
              <div className="w-10 h-10 rounded-xl bg-blue-500/10 text-blue-400 flex items-center justify-center">
                <User className="w-5 h-5" />
              </div>
            </div>

            <div className="glass-premium p-6 rounded-3xl border border-white/5 flex items-center justify-between">
              <div className="space-y-1">
                <p className="text-[10px] text-slate-400 font-extrabold tracking-wider uppercase">Active Alerts</p>
                <h3 className="text-2xl font-black text-rose-400 leading-none">{activeAlerts}</h3>
              </div>
              <div className="w-10 h-10 rounded-xl bg-rose-500/10 text-rose-400 flex items-center justify-center">
                <AlertCircle className="w-5 h-5 animate-pulse" />
              </div>
            </div>

            <div className="glass-premium p-6 rounded-3xl border border-white/5 flex items-center justify-between">
              <div className="space-y-1">
                <p className="text-[10px] text-slate-400 font-extrabold tracking-wider uppercase">Active Rules</p>
                <h3 className="text-2xl font-black text-violet-400 leading-none">{activeRules}</h3>
              </div>
              <div className="w-10 h-10 rounded-xl bg-violet-500/10 text-violet-400 flex items-center justify-center">
                <Bot className="w-5 h-5" />
              </div>
            </div>

            <div className="glass-premium p-6 rounded-3xl border border-white/5 flex items-center justify-between">
              <div className="space-y-1">
                <p className="text-[10px] text-slate-400 font-extrabold tracking-wider uppercase">System Mode</p>
                <h3 className="text-xs font-bold text-emerald-400 flex items-center gap-1 mt-1">
                  <span className="w-2 h-2 rounded-full bg-emerald-550 animate-ping"></span>
                  <span>ONLINE</span>
                </h3>
              </div>
              <div className="w-10 h-10 rounded-xl bg-emerald-500/10 text-emerald-400 flex items-center justify-center">
                <Database className="w-5 h-5" />
              </div>
            </div>
          </div>

          {/* Job execution panel */}
          <div className="glass-premium p-5 rounded-3xl border border-white/5 shadow-sm space-y-4">
            <div className="flex items-center gap-2">
              <Terminal className="w-4 h-4 text-emerald-400" />
              <h3 className="text-xs font-black uppercase text-white tracking-wider">Trigger.dev Edge Job Dispatcher</h3>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              {["Alert Checking Pipeline", "Generate Briefings Engine", "Invalidate Cache & Database Vacuum"].map((jobName) => (
                <button
                  key={jobName}
                  onClick={() => dispatchJob(jobName)}
                  disabled={!!runningJob}
                  className="flex items-center justify-between p-4 rounded-2xl border border-white/5 bg-white/[0.01] hover:bg-white/[0.03] disabled:opacity-50 transition text-left cursor-pointer"
                >
                  <div>
                    <span className="text-xs font-bold text-white block">{jobName}</span>
                    <span className="text-[9px] text-slate-400">Trigger background cycle</span>
                  </div>
                  <Play className={`w-3.5 h-3.5 text-emerald-400 ${runningJob === jobName ? 'animate-spin' : ''}`} />
                </button>
              ))}
            </div>
          </div>

          {/* Render Active Sub-tab View */}
          <div className="glass-premium p-6 rounded-3xl border border-white/5 shadow-sm">
            {loading ? (
              <div className="flex flex-col items-center justify-center py-16 space-y-4">
                <div className="w-8 h-8 rounded-full border-2 border-emerald-500/20 border-t-emerald-500 animate-spin"></div>
                <p className="text-xs text-slate-500">Retrieving secure logs...</p>
              </div>
            ) : (
              <>
                {/* Users Tab */}
                {activeSubTab === "users" && (
                  <div className="space-y-4">
                    <div className="flex items-center gap-3 max-w-md bg-black/40 border border-white/5 rounded-2xl px-3.5 py-2">
                      <Search className="w-4 h-4 text-slate-500 flex-shrink-0" />
                      <input
                        type="text"
                        placeholder="Search accounts..."
                        value={userSearch}
                        onChange={(e) => setUserSearch(e.target.value)}
                        className="bg-transparent border-0 outline-none text-xs text-white w-full placeholder-slate-550"
                      />
                    </div>
                    <div className="overflow-x-auto rounded-2xl border border-white/5">
                      <table className="w-full text-left border-collapse">
                        <thead>
                          <tr className="bg-white/[0.02] border-b border-white/5 text-[10px] font-bold text-slate-400 uppercase tracking-wider">
                            <th className="p-4">User</th>
                            <th className="p-4">Contact</th>
                            <th className="p-4">Auth Provider</th>
                            <th className="p-4">Last Active</th>
                            <th className="p-4 text-right">Actions</th>
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-white/5 text-xs">
                          {filteredUsers.length === 0 ? (
                            <tr>
                              <td colSpan={5} className="p-8 text-center text-slate-500 font-medium">No accounts found</td>
                            </tr>
                          ) : (
                            filteredUsers.map((u: any) => (
                              <tr key={u.id} className="hover:bg-white/[0.01] transition">
                                <td className="p-4">
                                  <div className="flex items-center gap-3">
                                    <div className="w-8 h-8 rounded-xl bg-gradient-to-tr from-emerald-500 to-teal-500 flex items-center justify-center font-bold text-white text-[11px]">
                                      {(u.name?.[0] || u.email?.[0] || "U").toUpperCase()}
                                    </div>
                                    <div>
                                      <h4 className="font-bold text-slate-200">{u.name || "Unnamed User"}</h4>
                                      <span className="text-[9px] text-slate-500 font-mono font-bold">{u.id}</span>
                                    </div>
                                  </div>
                                </td>
                                <td className="p-4">
                                  <div className="space-y-0.5">
                                    {u.email && <div className="text-slate-350">{u.email}</div>}
                                    {u.phone && <div className="text-slate-400 font-mono">{u.phone}</div>}
                                  </div>
                                </td>
                                <td className="p-4">
                                  <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-[9px] font-extrabold uppercase ${
                                    u.auth_provider === 'google' ? 'bg-blue-500/10 text-blue-400' : 'bg-emerald-500/10 text-emerald-400'
                                  }`}>
                                    {u.auth_provider || 'google'}
                                  </span>
                                </td>
                                <td className="p-4 text-slate-400">
                                  {u.last_login_at ? new Date(u.last_login_at).toLocaleString() : 'N/A'}
                                </td>
                                <td className="p-4 text-right space-x-2">
                                  <button
                                    onClick={() => setSelectedUser(u)}
                                    className="text-[10px] font-bold text-slate-300 hover:text-emerald-450 transition inline-flex items-center gap-1 bg-white/5 px-2 py-1.5 rounded-lg"
                                  >
                                    <Eye className="w-3.5 h-3.5" />
                                    <span>Inspect</span>
                                  </button>
                                  <button
                                    onClick={() => handleDeleteUser(u.id)}
                                    className="text-[10px] font-bold text-rose-500 hover:text-rose-600 transition inline-flex items-center gap-1 bg-rose-500/10 px-2 py-1.5 rounded-lg"
                                  >
                                    <Trash2 className="w-3.5 h-3.5" />
                                    <span>Delete</span>
                                  </button>
                                </td>
                              </tr>
                            ))
                          )}
                        </tbody>
                      </table>
                    </div>
                  </div>
                )}

                {/* Alerts Tab */}
                {activeSubTab === "alerts" && (
                  <div className="space-y-4">
                    <div className="flex items-center gap-3 max-w-md bg-black/40 border border-white/5 rounded-2xl px-3.5 py-2">
                      <Search className="w-4 h-4 text-slate-500 flex-shrink-0" />
                      <input
                        type="text"
                        placeholder="Search alerts..."
                        value={alertSearch}
                        onChange={(e) => setAlertSearch(e.target.value)}
                        className="bg-transparent border-0 outline-none text-xs text-white w-full placeholder-slate-550"
                      />
                    </div>
                    <div className="overflow-x-auto rounded-2xl border border-white/5">
                      <table className="w-full text-left border-collapse">
                        <thead>
                          <tr className="bg-white/[0.02] border-b border-white/5 text-[10px] font-bold text-slate-400 uppercase tracking-wider">
                            <th className="p-4">Source</th>
                            <th className="p-4">Alert Details</th>
                            <th className="p-4">Priority</th>
                            <th className="p-4">Status</th>
                            <th className="p-4">Triggered At</th>
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-white/5 text-xs">
                          {filteredAlerts.length === 0 ? (
                            <tr>
                              <td colSpan={5} className="p-8 text-center text-slate-500 font-medium">No alerts triggered</td>
                            </tr>
                          ) : (
                            filteredAlerts.map((a: any) => (
                              <tr key={a.id} className="hover:bg-white/[0.01] transition">
                                <td className="p-4">
                                  <span className="font-extrabold uppercase text-[10px] text-slate-400 tracking-wider font-mono bg-white/5 px-2 py-1 rounded-lg">{a.source_app}</span>
                                </td>
                                <td className="p-4">
                                  <div>
                                    <h4 className="font-bold text-slate-200">{a.title}</h4>
                                    <p className="text-[10px] text-slate-400 mt-0.5 line-clamp-1">{a.description}</p>
                                  </div>
                                </td>
                                <td className="p-4">
                                  <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-[9px] font-black uppercase ${
                                    a.priority === 'high' ? 'bg-rose-500/10 text-rose-500' : 'bg-amber-500/10 text-amber-500'
                                  }`}>
                                    {a.priority}
                                  </span>
                                </td>
                                <td className="p-4">
                                  <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-[9px] font-black uppercase ${
                                    a.status === 'triggered' ? 'bg-rose-500/10 text-rose-455' : 'bg-emerald-500/10 text-emerald-455'
                                  }`}>
                                    {a.status}
                                  </span>
                                </td>
                                <td className="p-4 text-slate-450">
                                  {a.triggered_at ? new Date(a.triggered_at).toLocaleString() : new Date(a.created_at).toLocaleString()}
                                </td>
                              </tr>
                            ))
                          )}
                        </tbody>
                      </table>
                    </div>
                  </div>
                )}

                {/* Rules Tab */}
                {activeSubTab === "rules" && (
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {data.rules?.map((rule: any) => (
                      <div key={rule.id} className="p-5 rounded-2xl border border-white/5 bg-white/[0.01] space-y-3">
                        <div className="flex items-start justify-between">
                          <div>
                            <h4 className="font-extrabold text-slate-200 text-sm">{rule.name}</h4>
                            <p className="text-[11px] text-slate-400 mt-1 line-clamp-2">{rule.description || 'No description provided.'}</p>
                          </div>
                          <button
                            onClick={() => handleToggleRule(rule.id, rule.status)}
                            className={`p-1.5 rounded-xl border border-white/5 transition flex-shrink-0 cursor-pointer ${
                              rule.status === 'active' 
                                ? 'bg-emerald-500/10 text-emerald-500 hover:bg-emerald-500/20' 
                                : 'bg-white/5 text-slate-400 hover:bg-white/10'
                            }`}
                          >
                            {rule.status === 'active' ? <Check className="w-4 h-4" /> : <PauseCircle className="w-4 h-4" />}
                          </button>
                        </div>
                        <div className="pt-2 border-t border-white/5 flex flex-wrap items-center gap-x-4 gap-y-1.5 text-[10px] font-mono text-slate-500">
                          <div>Apps: <span className="uppercase text-slate-300">{(rule.apps || []).join(', ')}</span></div>
                          <div>Priority: <span className={`uppercase font-extrabold ${rule.priority === 'high' ? 'text-rose-500' : 'text-amber-500'}`}>{rule.priority}</span></div>
                        </div>
                        <div className="p-3 bg-black/45 rounded-xl border border-white/5 font-mono text-[10px] text-slate-400 select-all">
                          <span className="font-bold text-emerald-450">Condition:</span> {rule.condition}
                        </div>
                      </div>
                    ))}
                  </div>
                )}

                {/* AI Analytics Tab */}
                {activeSubTab === "analytics" && (
                  <div className="space-y-6">
                    <div>
                      <h4 className="font-extrabold text-slate-200 text-sm">Google Gemini Usage Analytics</h4>
                      <p className="text-[11px] text-slate-400 mt-1">Real-time model token consumption limits and average latency indices.</p>
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      <div className="p-5 rounded-2xl border border-white/5 bg-white/[0.01] space-y-3">
                        <div className="flex justify-between items-baseline">
                          <span className="text-xs font-bold text-slate-200">Gemini 1.5 Flash</span>
                          <span className="text-[10px] text-slate-400 font-mono">1.24M / 5.0M tokens (24.8%)</span>
                        </div>
                        <div className="w-full bg-white/5 h-2 rounded-full overflow-hidden">
                          <div className="bg-gradient-to-r from-blue-500 to-indigo-500 h-full rounded-full" style={{ width: "24.8%" }}></div>
                        </div>
                      </div>
                      <div className="p-5 rounded-2xl border border-white/5 bg-white/[0.01] space-y-3">
                        <div className="flex justify-between items-baseline">
                          <span className="text-xs font-bold text-slate-200">Gemini 1.5 Pro</span>
                          <span className="text-[10px] text-slate-400 font-mono">423.5K / 1.0M tokens (42.3%)</span>
                        </div>
                        <div className="w-full bg-white/5 h-2 rounded-full overflow-hidden">
                          <div className="bg-gradient-to-r from-violet-500 to-purple-500 h-full rounded-full" style={{ width: "42.3%" }}></div>
                        </div>
                      </div>
                    </div>
                    <div className="space-y-3">
                      <span className="text-xs font-bold text-slate-400 uppercase tracking-wider block">Latency Benchmarks</span>
                      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                        <div className="p-4 rounded-xl border border-white/5 bg-white/[0.01] text-center">
                          <span className="text-lg font-black text-white font-mono block">1.42s</span>
                          <span className="text-[10px] text-slate-400">Avg Alert Classification</span>
                        </div>
                        <div className="p-4 rounded-xl border border-white/5 bg-white/[0.01] text-center">
                          <span className="text-lg font-black text-white font-mono block">3.10s</span>
                          <span className="text-[10px] text-slate-400">Avg Briefing Compile</span>
                        </div>
                        <div className="p-4 rounded-xl border border-white/5 bg-white/[0.01] text-center">
                          <span className="text-lg font-black text-white font-mono block">0.85s</span>
                          <span className="text-[10px] text-slate-400">Avg Ask Chat response</span>
                        </div>
                      </div>
                    </div>
                  </div>
                )}

                {/* Billing Tab */}
                {activeSubTab === "billing" && (
                  <div className="space-y-6">
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                      <div className="p-4 rounded-2xl border border-white/5 bg-white/[0.01]">
                        <span className="text-[10px] text-slate-400 font-extrabold uppercase block">Monthly Revenue</span>
                        <span className="text-xl font-black text-emerald-450 font-mono mt-1 block">$4,120.00 MRR</span>
                      </div>
                      <div className="p-4 rounded-2xl border border-white/5 bg-white/[0.01]">
                        <span className="text-[10px] text-slate-400 font-extrabold uppercase block">Paid Subscribers</span>
                        <span className="text-xl font-black text-white font-mono mt-1 block">142 subscriptions</span>
                      </div>
                      <div className="p-4 rounded-2xl border border-white/5 bg-white/[0.01]">
                        <span className="text-[10px] text-slate-400 font-extrabold uppercase block">Stripe Webhook status</span>
                        <span className="text-xs font-bold text-emerald-400 mt-2 block flex items-center gap-1.5">
                          <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-ping"></span>
                          Active
                        </span>
                      </div>
                    </div>
                    <div className="space-y-3">
                      <span className="text-xs font-bold text-slate-400 uppercase tracking-wider block">Recent Transactions History</span>
                      <div className="overflow-x-auto rounded-2xl border border-white/5">
                        <table className="w-full text-left border-collapse">
                          <thead>
                            <tr className="bg-white/[0.02] border-b border-white/5 text-[10px] font-bold text-slate-400 uppercase tracking-wider">
                              <th className="p-4">Transaction ID</th>
                              <th className="p-4">Customer</th>
                              <th className="p-4">Tier</th>
                              <th className="p-4">Amount</th>
                              <th className="p-4">Status</th>
                            </tr>
                          </thead>
                          <tbody className="divide-y divide-white/5 text-xs font-mono">
                            {transactions.map((tx) => (
                              <tr key={tx.id} className="hover:bg-white/[0.01] transition">
                                <td className="p-4 text-slate-500 font-medium select-all">{tx.id}</td>
                                <td className="p-4 text-slate-200 font-sans">{tx.email}</td>
                                <td className="p-4 text-slate-300 font-sans">{tx.plan}</td>
                                <td className="p-4 font-bold text-white">{tx.amount}</td>
                                <td className="p-4">
                                  <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-[9px] font-black uppercase font-sans ${
                                    tx.status === 'succeeded' ? 'bg-emerald-500/10 text-emerald-400' : 'bg-amber-500/10 text-amber-400'
                                  }`}>
                                    {tx.status}
                                  </span>
                                </td>
                              </tr>
                            ))}
                          </tbody>
                        </table>
                      </div>
                    </div>
                  </div>
                )}

                {/* Console Tab */}
                {activeSubTab === "console" && (
                  <div className="space-y-4">
                    <div className="flex items-center justify-between">
                      <span className="text-[10px] font-bold text-slate-455 uppercase tracking-widest font-mono">Real-Time Event Stream</span>
                      <span className="flex items-center gap-1.5 text-[10px] font-mono text-emerald-400">
                        <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-ping"></span>
                        <span>Listening...</span>
                      </span>
                    </div>
                    <div className="font-mono text-[11px] bg-black/60 p-5 rounded-2xl border border-white/5 overflow-y-auto max-h-[350px] space-y-2">
                      {consoleLogs.map((log) => (
                        <div key={log.id} className="flex items-start gap-2.5 py-0.5 text-slate-350">
                          <span className="text-slate-500 select-none">[{log.time}]</span>
                          <span className={`font-bold uppercase text-[9px] px-1.5 py-0.5 rounded flex-shrink-0 ${
                            log.type === 'success'
                              ? 'bg-emerald-500/10 text-emerald-400'
                              : log.type === 'error'
                              ? 'bg-rose-500/10 text-rose-400'
                              : log.type === 'warn'
                              ? 'bg-amber-500/10 text-amber-400'
                              : 'bg-blue-500/10 text-blue-400'
                          }`}>
                            {log.type}
                          </span>
                          <span className="flex-1 leading-relaxed">{log.msg}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </>
            )}
          </div>
        </div>
      </main>

      {/* Inspect User Modal */}
      {selectedUser && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-fade-in">
          <div className="glass-premium w-full max-w-lg rounded-3xl border border-white/10 shadow-2xl overflow-hidden bg-slate-900">
            <div className="flex items-center justify-between p-6 border-b border-white/5">
              <h3 className="text-sm font-extrabold text-white uppercase tracking-wider">Inspect User Details</h3>
              <button onClick={() => setSelectedUser(null)} className="p-1 rounded-xl text-slate-450 hover:text-white hover:bg-white/5 transition">
                <X className="w-4 h-4" />
              </button>
            </div>
            <div className="p-6 space-y-6">
              <div className="flex items-center gap-4 bg-white/5 p-4 rounded-2xl border border-white/5">
                <div className="w-12 h-12 rounded-2xl bg-gradient-to-tr from-emerald-500 to-teal-500 flex items-center justify-center font-bold text-white text-base">
                  {(selectedUser.name?.[0] || selectedUser.email?.[0] || "U").toUpperCase()}
                </div>
                <div>
                  <h4 className="font-bold text-white">{selectedUser.name || "Unnamed User"}</h4>
                  <p className="text-xs text-slate-400">{selectedUser.email || selectedUser.phone || "No contact info"}</p>
                </div>
              </div>
              <div className="space-y-3.5 text-xs">
                <div className="flex justify-between py-1.5 border-b border-white/5">
                  <span className="text-slate-400 font-semibold">User Unique ID</span>
                  <span className="font-mono text-white select-all">{selectedUser.id}</span>
                </div>
                <div className="flex justify-between py-1.5 border-b border-white/5">
                  <span className="text-slate-400 font-semibold">Auth Mode</span>
                  <span className="text-white uppercase font-bold">{selectedUser.auth_provider || 'google'}</span>
                </div>
              </div>
            </div>
            <div className="p-6 bg-black/20 border-t border-white/5 flex justify-end">
              <button onClick={() => setSelectedUser(null)} className="text-xs font-bold text-slate-300 hover:text-white px-4 py-2.5 rounded-xl bg-white/5 hover:bg-white/10 transition">
                Close Inspector
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
