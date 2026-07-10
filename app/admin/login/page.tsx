"use client";

import React, { useState } from "react";
import { useRouter } from "next/navigation";
import { ShieldCheck, LockKeyhole, Mail, ArrowRight, Eye, EyeOff } from "lucide-react";

export default function AdminLoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setLoading(true);

    try {
      const res = await fetch("/api/admin/auth", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password }),
      });

      const data = await res.json();

      if (data.success) {
        // Redirect to admin dashboard
        router.push("/admin");
        router.refresh();
      } else {
        setError(data.error || "Invalid Admin Credentials");
      }
    } catch (err) {
      console.error("Login request failed:", err);
      setError("An unexpected network error occurred.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex items-center justify-center min-h-screen bg-[#060913] text-white p-4 font-sans relative overflow-hidden">
      {/* Background Glows */}
      <div className="absolute top-1/4 left-1/4 -translate-x-1/2 -translate-y-1/2 w-[350px] h-[350px] bg-emerald-500/10 rounded-full blur-[120px] pointer-events-none"></div>
      <div className="absolute bottom-1/4 right-1/4 translate-x-1/2 translate-y-1/2 w-[300px] h-[300px] bg-teal-500/10 rounded-full blur-[100px] pointer-events-none"></div>

      <div className="w-full max-w-md relative z-10 space-y-8 animate-fade-in">
        {/* Brand Header */}
        <div className="text-center space-y-3">
          <div className="inline-flex items-center justify-center w-14 h-14 rounded-3xl bg-gradient-to-tr from-emerald-500 to-teal-500 shadow-xl shadow-emerald-500/20">
            <ShieldCheck className="w-7 h-7 text-white" />
          </div>
          <div>
            <h1 className="text-2xl font-black tracking-tight text-white font-sans">
              Alyla<span className="text-emerald-500">.ai</span> Admin Control
            </h1>
            <p className="text-xs text-slate-400 font-medium mt-1">
              Predefined developer console dashboard login
            </p>
          </div>
        </div>

        {/* Login Card */}
        <div className="glass-premium border border-white/10 p-8 rounded-[2rem] shadow-2xl bg-white/[0.02] backdrop-blur-xl relative">
          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Email field */}
            <div className="space-y-2">
              <label className="text-[10px] font-extrabold uppercase text-slate-400 tracking-widest block">
                Username / Admin Email
              </label>
              <div className="flex items-center gap-3 bg-black/40 border border-white/5 rounded-2xl px-4 py-3 focus-within:border-emerald-500/50 transition">
                <Mail className="w-4 h-4 text-slate-500 flex-shrink-0" />
                <input
                  type="text"
                  required
                  placeholder="admin@alyla.ai"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="bg-transparent border-0 outline-none text-sm text-white w-full placeholder-slate-650"
                  disabled={loading}
                />
              </div>
            </div>

            {/* Password field */}
            <div className="space-y-2">
              <label className="text-[10px] font-extrabold uppercase text-slate-400 tracking-widest block">
                Secret Console Key
              </label>
              <div className="flex items-center gap-3 bg-black/40 border border-white/5 rounded-2xl px-4 py-3 focus-within:border-emerald-500/50 transition">
                <LockKeyhole className="w-4 h-4 text-slate-500 flex-shrink-0" />
                <input
                  type={showPassword ? "text" : "password"}
                  required
                  placeholder="••••••••••••"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="bg-transparent border-0 outline-none text-sm text-white w-full placeholder-slate-650"
                  disabled={loading}
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="p-0.5 rounded text-slate-450 hover:text-white transition"
                  disabled={loading}
                >
                  {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </div>

            {/* Error Message */}
            {error && (
              <div className="p-4 rounded-2xl border border-rose-500/20 bg-rose-500/10 text-rose-400 text-xs font-semibold leading-relaxed animate-shake">
                {error}
              </div>
            )}

            {/* Submit button */}
            <button
              type="submit"
              disabled={loading}
              className="w-full bg-gradient-to-tr from-emerald-600 to-teal-500 hover:opacity-90 active:opacity-100 disabled:opacity-50 text-white py-3.5 px-4 rounded-2xl text-xs font-bold transition flex items-center justify-center gap-2 shadow-lg shadow-emerald-500/10 cursor-pointer"
            >
              <span>{loading ? "Authenticating Console..." : "Unlock Admin Controls"}</span>
              {!loading && <ArrowRight className="w-4 h-4" />}
            </button>
          </form>
        </div>

        {/* Info footer */}
        <div className="text-center">
          <p className="text-[10px] text-slate-500 font-medium">
            Authorized admin access only. Privilege modifications require direct DB mutations.
          </p>
        </div>
      </div>
    </div>
  );
}
