"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { useAuth } from "@/components/auth-provider";

// Types for the Interactive Playground
interface DemoChannel {
  id: string;
  name: string;
  color: string;
  borderColor: string;
  glowColor: string;
  icon: React.ReactNode;
  sender: string;
  time: string;
  avatarText: string;
  avatarBg: string;
  inputMessage: string;
  aiAction: string;
  aiType: "reminder" | "summary" | "reply" | "conflict";
  aiOutputTitle: string;
  aiOutputContent: React.ReactNode;
}

export default function Home() {
  const { user, signOut } = useAuth();
  
  // Navigation states
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);

  // Playground states
  const [activeChannel, setActiveChannel] = useState<string>("gmail");
  const [isPlaying, setIsPlaying] = useState<boolean>(false);
  const [playProgress, setPlayProgress] = useState<number>(0);
  const [showAiResult, setShowAiResult] = useState<boolean>(false);
  
  // Custom interactive waitlist states
  const [email, setEmail] = useState("");
  const [waitlistStatus, setWaitlistStatus] = useState<"idle" | "loading" | "success">("idle");
  const [waitlistCount, setWaitlistCount] = useState(1428);

  // FAQ states
  const [openFaq, setOpenFaq] = useState<number | null>(null);

  // Track page scroll for header background opacity
  useEffect(() => {
    const handleScroll = () => {
      if (window.scrollY > 20) {
        setScrolled(true);
      } else {
        setScrolled(false);
      }
    };
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  // Handle playground simulation animation
  useEffect(() => {
    let interval: NodeJS.Timeout;
    if (isPlaying) {
      setShowAiResult(false);
      setPlayProgress(0);
      
      const step = 2; // speed
      interval = setInterval(() => {
        setPlayProgress((prev) => {
          if (prev >= 100) {
            clearInterval(interval);
            setIsPlaying(false);
            setShowAiResult(true);
            return 100;
          }
          return prev + step;
        });
      }, 30);
    }
    return () => clearInterval(interval);
  }, [isPlaying]);

  // Trigger playground process
  const triggerSimulation = () => {
    setIsPlaying(true);
  };

  // Handle Waitlist Submit
  const handleWaitlistSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!email) return;
    setWaitlistStatus("loading");
    setTimeout(() => {
      setWaitlistStatus("success");
      setWaitlistCount(prev => prev + 1);
    }, 1200);
  };

  // Channels Data for Interactive Playground
  const channels: DemoChannel[] = [
    {
      id: "gmail",
      name: "Gmail",
      color: "from-red-500 to-rose-600",
      borderColor: "border-red-500/20",
      glowColor: "rgba(239, 68, 68, 0.15)",
      icon: (
        <svg className="w-5 h-5" viewBox="0 0 24 24" fill="currentColor">
          <path d="M20 4H4c-1.1 0-2 .9-2 2v12c0 1.1.9 2 2 2h16c1.1 0 2-.9 2-2V6c0-1.1-.9-2-2-2zm0 4l-8 5-8-5V6l8 5 8-5v2z"/>
        </svg>
      ),
      sender: "sarah.finance@corp.com",
      time: "10:42 AM",
      avatarText: "SF",
      avatarBg: "bg-red-500/20 text-red-300 border-red-500/30",
      inputMessage: "Hi Rahul, please review the final Q2 budget draft before our meeting tomorrow. Let me know if we need to adjust the Marketing allocation by 10%. Thanks!",
      aiAction: "Summarizing & Drafting Reply",
      aiType: "reply",
      aiOutputTitle: "Gmail Assistant Core",
      aiOutputContent: (
        <div className="space-y-3">
          <div className="p-2.5 bg-white/5 rounded-lg border border-white/5">
            <span className="text-[10px] text-purple-400 font-semibold tracking-wider uppercase block mb-1">AI Executive Summary</span>
            <p className="text-xs text-slate-300 leading-relaxed">
              Review Q2 budget draft. Decide if marketing allocation requires a 10% adjustment. Action required before tomorrow's sync.
            </p>
          </div>
          <div className="p-2.5 bg-white/5 rounded-lg border border-purple-500/20 relative">
            <div className="absolute top-2 right-2 flex items-center space-x-1.5">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-ping"></span>
              <span className="text-[9px] text-emerald-400 font-medium">Suggested Draft</span>
            </div>
            <span className="text-[10px] text-indigo-400 font-semibold tracking-wider uppercase block mb-1">Auto-Draft Reply</span>
            <p className="text-xs text-slate-200 italic leading-relaxed">
              "Hi Sarah, thanks. I've reviewed the draft. The 10% marketing shift looks reasonable given Q3 targets. Let's lock it in during tomorrow's call."
            </p>
          </div>
        </div>
      )
    },
    {
      id: "whatsapp",
      name: "WhatsApp",
      color: "from-green-400 to-emerald-500",
      borderColor: "border-emerald-500/20",
      glowColor: "rgba(16, 185, 129, 0.15)",
      icon: (
        <svg className="w-5 h-5" viewBox="0 0 24 24" fill="currentColor">
          <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L0 24l6.335-1.662c1.746.953 3.71 1.458 5.704 1.46h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z"/>
        </svg>
      ),
      sender: "Alex (Co-Founder)",
      time: "02:15 PM",
      avatarText: "A",
      avatarBg: "bg-emerald-500/20 text-emerald-300 border-emerald-500/30",
      inputMessage: "Hey! Let's do a quick coffee chat tomorrow at 4:30 PM near the downtown office to discuss the product roadmap. Let me know if that works.",
      aiAction: "Extracting Event & Checking Schedule",
      aiType: "reminder",
      aiOutputTitle: "WhatsApp Sync Core",
      aiOutputContent: (
        <div className="space-y-3">
          <div className="p-3 bg-indigo-500/10 rounded-xl border border-indigo-500/20">
            <div className="flex items-center justify-between mb-2">
              <span className="text-[10px] text-indigo-400 font-bold uppercase tracking-wider">Smart Calendar Extraction</span>
              <span className="px-1.5 py-0.5 rounded bg-amber-500/20 text-amber-300 text-[9px] font-medium border border-amber-500/30">Action Needed</span>
            </div>
            <div className="space-y-1.5">
              <h4 className="text-xs font-semibold text-white">Roadmap Coffee Chat with Alex</h4>
              <div className="flex items-center text-[11px] text-slate-300 space-x-4">
                <span className="flex items-center">
                  <svg className="w-3.5 h-3.5 mr-1 text-slate-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"/></svg>
                  Tomorrow
                </span>
                <span className="flex items-center">
                  <svg className="w-3.5 h-3.5 mr-1 text-slate-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"/></svg>
                  4:30 PM - 5:00 PM
                </span>
              </div>
              <p className="text-[11px] text-slate-400 flex items-center">
                <svg className="w-3.5 h-3.5 mr-1 text-slate-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z"/><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 11a3 3 0 11-6 0 3 3 0 016 0z"/></svg>
                Near Downtown Office
              </p>
            </div>
          </div>
          <button className="w-full py-1.5 px-3 bg-indigo-600 hover:bg-indigo-500 active:bg-indigo-700 text-white rounded-lg text-xs font-medium transition duration-200 shadow-md shadow-indigo-600/20">
            Sync to Google Calendar
          </button>
        </div>
      )
    },
    {
      id: "telegram",
      name: "Telegram",
      color: "from-blue-400 to-sky-500",
      borderColor: "border-sky-500/20",
      glowColor: "rgba(56, 189, 248, 0.15)",
      icon: (
        <svg className="w-5 h-5" viewBox="0 0 24 24" fill="currentColor">
          <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm4.64 6.8c-.15 1.58-.8 5.42-1.13 7.19-.14.75-.42 1-.68 1.03-.58.05-1.02-.38-1.58-.75-.88-.58-1.38-.94-2.23-1.5-1-.65-.35-1 .22-1.62.15-.15 2.72-2.5 2.77-2.7.01-.03.01-.15-.06-.21-.07-.06-.17-.04-.25-.02-.11.02-1.92 1.22-5.43 3.59-.51.35-.98.53-1.4.51-.46-.01-1.35-.26-2.01-.48-.81-.27-1.46-.42-1.4-.88.03-.24.36-.49.99-.75 3.87-1.68 6.45-2.79 7.74-3.33 3.68-1.54 4.44-1.81 4.94-1.82.11 0 .36.03.52.16.14.11.18.26.19.37 0 .07-.01.21-.02.28z"/>
        </svg>
      ),
      sender: "Dev Team Channel (99+ messages)",
      time: "03:55 PM",
      avatarText: "DT",
      avatarBg: "bg-sky-500/20 text-sky-300 border-sky-500/30",
      inputMessage: "System crashed again on production. Fixed by scaling the database pods. We need to audit the database connection pooling config. Mark is writing the post-mortem. Deploy scheduled for tomorrow morning.",
      aiAction: "Synthesizing Channel Updates",
      aiType: "summary",
      aiOutputTitle: "Telegram Agent Core",
      aiOutputContent: (
        <div className="space-y-2.5">
          <span className="text-[10px] text-sky-400 font-bold uppercase tracking-wider">Dev Team Channel Digest</span>
          <div className="space-y-1.5 text-xs text-slate-300">
            <div className="flex items-start">
              <span className="text-purple-400 mr-1.5">•</span>
              <span><strong>Incident resolved</strong>: Database pods scaled to mitigate production crash.</span>
            </div>
            <div className="flex items-start">
              <span className="text-purple-400 mr-1.5">•</span>
              <span><strong>Action Item</strong>: Audit database connection pooling configurations.</span>
            </div>
            <div className="flex items-start">
              <span className="text-purple-400 mr-1.5">•</span>
              <span><strong>Owner</strong>: Mark is writing the incident post-mortem report.</span>
            </div>
            <div className="flex items-start">
              <span className="text-purple-400 mr-1.5">•</span>
              <span><strong>Key Event</strong>: Next deployment set for tomorrow morning.</span>
            </div>
          </div>
        </div>
      )
    },
    {
      id: "outlook",
      name: "Outlook",
      color: "from-blue-600 to-indigo-700",
      borderColor: "border-blue-600/20",
      glowColor: "rgba(59, 130, 246, 0.15)",
      icon: (
        <svg className="w-5 h-5" viewBox="0 0 24 24" fill="currentColor">
          <path d="M20 3H4c-1.1 0-2 .9-2 2v14c0 1.1.9 2 2 2h16c1.1 0 2-.9 2-2V5c0-1.1-.9-2-2-2zm0 16H4V7h16v12zm-3-9h-2V8h2v2zm0 4h-2v-2h2v2zm-4-4h-2V8h2v2zm0 4h-2v-2h2v2z"/>
        </svg>
      ),
      sender: "calendar@outlook-corp.com",
      time: "05:00 PM",
      avatarText: "OL",
      avatarBg: "bg-blue-600/20 text-blue-300 border-blue-600/30",
      inputMessage: "Calendar conflict detected: Your 'Q3 Budget Review' (Tomorrow 11:00 AM - 12:00 PM) overlaps with 'Weekly Marketing Sync' (Tomorrow 11:30 AM - 12:30 PM).",
      aiAction: "Resolving Schedule Conflicts",
      aiType: "conflict",
      aiOutputTitle: "Outlook AI Intelligence",
      aiOutputContent: (
        <div className="space-y-3">
          <div className="p-2.5 bg-rose-500/10 rounded-lg border border-rose-500/25">
            <span className="text-[10px] text-rose-400 font-bold uppercase tracking-wider block mb-1">Overlap Detected (30 Mins)</span>
            <p className="text-xs text-slate-300">
              Q3 Budget Review conflicts with Marketing Sync between 11:30 AM and 12:00 PM.
            </p>
          </div>
          <div className="p-2.5 bg-emerald-500/10 rounded-lg border border-emerald-500/25">
            <span className="text-[10px] text-emerald-400 font-bold uppercase tracking-wider block mb-1">AI Recommendation</span>
            <p className="text-xs text-slate-300 mb-2">
              Move 'Weekly Marketing Sync' to 1:00 PM. Host and 4 out of 5 participants are free.
            </p>
            <div className="flex space-x-2">
              <button className="flex-1 py-1 bg-emerald-600 hover:bg-emerald-500 text-white rounded text-[10px] font-semibold transition">
                Propose Reschedule
              </button>
              <button className="py-1 px-2.5 bg-white/5 hover:bg-white/10 text-slate-300 rounded text-[10px] transition">
                Ignore
              </button>
            </div>
          </div>
        </div>
      )
    }
  ];

  const currentChannel = channels.find(c => c.id === activeChannel) || channels[0];

  return (
    <div className="min-h-screen text-slate-200 bg-[#030712] relative overflow-hidden font-sans select-none">
      
      {/* Background ambient glows */}
      <div className="absolute top-[-10%] left-[-10%] w-[50%] h-[50%] rounded-full bg-purple-900/10 animate-pulse-glow z-0 pointer-events-none filter blur-[120px]"></div>
      <div className="absolute top-[30%] right-[-10%] w-[50%] h-[50%] rounded-full bg-blue-900/10 animate-pulse-glow z-0 pointer-events-none filter blur-[120px]" style={{ animationDelay: "2s" }}></div>
      <div className="absolute bottom-[-10%] left-[10%] w-[45%] h-[45%] rounded-full bg-emerald-950/10 animate-pulse-glow z-0 pointer-events-none filter blur-[120px]" style={{ animationDelay: "4s" }}></div>
      
      {/* Background grid lines */}
      <div className="absolute inset-0 grid-bg opacity-35 pointer-events-none z-0"></div>

      {/* --- PREMIUM HEADER --- */}
      <header className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${scrolled ? "glass shadow-2xl py-3 border-b border-white/5" : "bg-transparent py-5"}`}>
        <div className="max-w-7xl mx-auto px-6 flex items-center justify-between">
          {/* Logo */}
          <a href="#" className="flex items-center space-x-2.5 group">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-purple-600 via-indigo-600 to-blue-500 flex items-center justify-center shadow-lg shadow-purple-900/40 group-hover:scale-105 transition-transform duration-300">
              <svg className="w-5.5 h-5.5 text-white animate-pulse" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M13 10V3L4 14h7v7l9-11h-7z" />
              </svg>
            </div>
            <span className="text-xl font-bold tracking-tight text-white group-hover:text-purple-400 transition-colors duration-300">
              Alyla<span className="text-purple-500">.ai</span>
            </span>
          </a>

          {/* Desktop Navigation Links */}
          <nav className="hidden md:flex items-center space-x-8">
            <a href="#features" className="text-sm font-medium text-slate-400 hover:text-white transition duration-200">Features</a>
            <a href="#playground" className="text-sm font-medium text-slate-400 hover:text-white transition duration-200">Interactive Demo</a>
            <a href="#integrations" className="text-sm font-medium text-slate-400 hover:text-white transition duration-200">Integrations</a>
            <a href="#workflow" className="text-sm font-medium text-slate-400 hover:text-white transition duration-200">How it Works</a>
            <a href="#pricing" className="text-sm font-medium text-slate-400 hover:text-white transition duration-200">Pricing</a>
            <a href="#faq" className="text-sm font-medium text-slate-400 hover:text-white transition duration-200">FAQ</a>
          </nav>

          {/* CTA / Auth Actions */}
          <div className="hidden md:flex items-center space-x-4">
            {user ? (
              <div className="flex items-center space-x-4">
                <div className="flex flex-col text-right">
                  <span className="text-xs font-bold text-white">{user.profile?.name || user.email.split("@")[0]}</span>
                  <span className="text-[10px] text-slate-400">{user.email}</span>
                </div>
                <Link
                  href="/dashboard"
                  className="text-xs font-bold text-white bg-purple-600 hover:bg-purple-500 transition duration-200 px-4 py-2 rounded-xl shadow-md shadow-purple-900/30"
                >
                  Dashboard
                </Link>
                <button 
                  onClick={signOut}
                  className="text-xs font-semibold text-slate-300 hover:text-white transition duration-200 px-3.5 py-2 glass rounded-xl border border-white/5 hover:border-white/10 cursor-pointer"
                >
                  Sign Out
                </button>
              </div>
            ) : (
              <>
                <Link href="/sign-in" className="text-sm font-semibold text-slate-300 hover:text-white transition duration-200 px-4 py-2">
                  Sign In
                </Link>
                <Link 
                  href="/sign-up" 
                  className="glow-on-hover relative px-5 py-2.5 bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-500 hover:to-indigo-500 text-white text-sm font-semibold rounded-xl shadow-lg shadow-purple-900/30 hover:shadow-purple-700/40 transform hover:-translate-y-0.5 transition duration-200 text-center"
                >
                  Get Started Free
                </Link>
              </>
            )}
          </div>

          {/* Mobile hamburger toggle */}
          <button 
            onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
            className="md:hidden p-2 text-slate-400 hover:text-white focus:outline-none"
            aria-label="Toggle Menu"
          >
            {isMobileMenuOpen ? (
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
              </svg>
            ) : (
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 6h16M4 12h16M4 18h16" />
              </svg>
            )}
          </button>
        </div>

        {/* Mobile Navigation Dropdown */}
        {isMobileMenuOpen && (
          <div className="md:hidden absolute top-full left-0 right-0 py-6 px-6 glass border-t border-white/5 flex flex-col space-y-4 shadow-2xl animate-fade-in bg-slate-950/95 backdrop-blur-xl">
            <a href="#features" onClick={() => setIsMobileMenuOpen(false)} className="text-base font-medium text-slate-300 hover:text-white py-1">Features</a>
            <a href="#playground" onClick={() => setIsMobileMenuOpen(false)} className="text-base font-medium text-slate-300 hover:text-white py-1">Interactive Demo</a>
            <a href="#integrations" onClick={() => setIsMobileMenuOpen(false)} className="text-base font-medium text-slate-300 hover:text-white py-1">Integrations</a>
            <a href="#workflow" onClick={() => setIsMobileMenuOpen(false)} className="text-base font-medium text-slate-300 hover:text-white py-1">How it Works</a>
            <a href="#pricing" onClick={() => setIsMobileMenuOpen(false)} className="text-base font-medium text-slate-300 hover:text-white py-1">Pricing</a>
            <a href="#faq" onClick={() => setIsMobileMenuOpen(false)} className="text-base font-medium text-slate-300 hover:text-white py-1">FAQ</a>
            <div className="h-px bg-white/10 my-2"></div>
            <div className="flex flex-col space-y-3 pt-2">
              {user ? (
                <div className="flex flex-col space-y-2">
                  <div className="flex flex-col p-2.5 bg-white/5 rounded-xl border border-white/5">
                    <span className="text-sm font-bold text-white">{user.profile?.name || user.email.split("@")[0]}</span>
                    <span className="text-xs text-slate-400 mt-0.5">{user.email}</span>
                  </div>
                  <Link
                    href="/dashboard"
                    onClick={() => setIsMobileMenuOpen(false)}
                    className="w-full text-center py-2.5 text-sm font-semibold text-white bg-purple-600 rounded-xl"
                  >
                    Go to Dashboard
                  </Link>
                  <button 
                    onClick={() => {
                      signOut();
                      setIsMobileMenuOpen(false);
                    }}
                    className="w-full text-center py-2.5 text-sm font-semibold text-slate-300 hover:text-white bg-white/5 border border-white/5 rounded-xl"
                  >
                    Sign Out
                  </button>
                </div>
              ) : (
                <>
                  <Link 
                    href="/sign-in"
                    onClick={() => setIsMobileMenuOpen(false)}
                    className="w-full text-center py-2.5 text-sm font-semibold text-slate-300 hover:text-white transition"
                  >
                    Sign In
                  </Link>
                  <Link 
                    href="/sign-up"
                    onClick={() => setIsMobileMenuOpen(false)}
                    className="w-full text-center py-3 bg-gradient-to-r from-purple-600 to-indigo-600 text-white text-sm font-semibold rounded-xl"
                  >
                    Get Started Free
                  </Link>
                </>
              )}
            </div>
          </div>
        )}
      </header>

      {/* --- HERO SECTION --- */}
      <section className="pt-32 pb-20 md:pt-44 md:pb-28 relative z-10 px-6 max-w-7xl mx-auto flex flex-col items-center text-center">
        {/* Intro Badge */}
        <div className="inline-flex items-center space-x-2.5 px-4.5 py-2 rounded-full glass border border-purple-500/20 mb-8 animate-float shadow-lg shadow-purple-950/10">
          <span className="w-2 h-2 rounded-full bg-purple-500 animate-ping"></span>
          <span className="text-xs font-semibold text-purple-300 tracking-wide">Introducing Alyla AI v1.2</span>
          <span className="text-slate-500">|</span>
          <span className="text-xs text-indigo-300 flex items-center">
            Unified App Workspace
          </span>
        </div>

        {/* Hero Title */}
        <h1 className="text-4xl sm:text-5xl md:text-6xl lg:text-7xl font-extrabold tracking-tight leading-[1.12] max-w-5xl mb-8">
          The Intelligent AI Chief of Staff. <br />
          <span className="text-gradient-purple-blue">Unifying all your conversations.</span>
        </h1>

        {/* Hero Subtitle */}
        <p className="text-base sm:text-lg md:text-xl text-slate-400 max-w-3xl leading-relaxed mb-10">
          Orchestrate Gmail, WhatsApp, Telegram, and Microsoft Outlook communications inside a single secure cockpit. Reclaim focus through smart briefing cards, calendar sync automation, and conversational intelligence.
        </p>

        {/* Action Buttons */}
        <div className="flex flex-col sm:flex-row items-center justify-center gap-4 w-full max-w-md mb-16">
          <Link 
            href={user ? "/dashboard" : "/sign-up"} 
            className="w-full sm:w-auto px-8 py-4 bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-500 hover:to-indigo-500 text-white font-bold rounded-xl shadow-xl shadow-purple-900/40 hover:shadow-purple-700/50 transform hover:-translate-y-0.5 transition duration-200 text-center"
          >
            {user ? "Go to Dashboard" : "Get Started Free"}
          </Link>
          <a 
            href="#playground" 
            className="w-full sm:w-auto px-8 py-4 glass hover:bg-white/5 border border-white/10 text-white font-semibold rounded-xl transition duration-200 text-center flex items-center justify-center space-x-2"
          >
            <svg className="w-4 h-4 text-purple-400" fill="currentColor" viewBox="0 0 24 24">
              <path d="M8 5v14l11-7z"/>
            </svg>
            <span>Interactive Simulator</span>
          </a>
        </div>

        {/* Client Logos (Placeholders) */}
        <div className="w-full max-w-5xl">
          <p className="text-xs uppercase tracking-widest text-slate-500 mb-6 font-bold">Trusted by builders at industry leading firms</p>
          <div className="flex flex-wrap items-center justify-center gap-x-12 gap-y-6 opacity-45">
            <span className="text-sm font-extrabold text-white tracking-wider">ACME CORP</span>
            <span className="text-sm font-extrabold text-white tracking-wider">ZEPHYR AI</span>
            <span className="text-sm font-extrabold text-white tracking-wider">LINEAR CORP</span>
            <span className="text-sm font-extrabold text-white tracking-wider">STRIPE FLOW</span>
            <span className="text-sm font-extrabold text-white tracking-wider">NOTION CLOUD</span>
          </div>
        </div>
      </section>

      {/* --- STATISTICS SECTION --- */}
      <section className="py-12 relative z-10 px-6 max-w-7xl mx-auto">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-6 md:gap-8 w-full py-10 bg-white/[0.01] backdrop-blur-md rounded-3xl border border-white/5 px-8 shadow-2xl">
          <div className="text-center">
            <p className="text-4xl md:text-5xl font-extrabold text-white mb-2">99.8%</p>
            <p className="text-xs text-slate-400 font-medium uppercase tracking-wider">Accuracy Digest Rating</p>
          </div>
          <div className="text-center border-l border-white/5">
            <p className="text-4xl md:text-5xl font-extrabold text-white mb-2">4.2M+</p>
            <p className="text-xs text-slate-400 font-medium uppercase tracking-wider">Alerts Generated</p>
          </div>
          <div className="text-center border-l border-white/5">
            <p className="text-4xl md:text-5xl font-extrabold text-white mb-2">12k+</p>
            <p className="text-xs text-slate-400 font-medium uppercase tracking-wider">Active Chief Accounts</p>
          </div>
          <div className="text-center border-l border-white/5">
            <p className="text-4xl md:text-5xl font-extrabold text-white mb-2">2.5 hrs</p>
            <p className="text-xs text-slate-400 font-medium uppercase tracking-wider">Saved Daily Per User</p>
          </div>
        </div>
      </section>

      {/* --- CORE FEATURES SECTION --- */}
      <section id="features" className="py-24 relative z-10 px-6 max-w-7xl mx-auto border-t border-white/5">
        <div className="text-center max-w-3xl mx-auto mb-20">
          <h2 className="text-xs font-bold text-purple-400 uppercase tracking-widest mb-3">Enterprise Suite</h2>
          <h3 className="text-3xl sm:text-4xl font-extrabold text-white mb-4">
            Everything you need to orchestrate focus
          </h3>
          <p className="text-slate-400 text-base sm:text-lg">
            Say goodbye to endless notification noise. Alyla works in the background to summarize, check, flag, and propose scheduling.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {/* Card 1: AI Assistant */}
          <div className="glass-premium rounded-2xl p-8 hover:border-purple-500/25 transition duration-300 space-y-4 group">
            <div className="w-12 h-12 rounded-xl bg-purple-500/10 border border-purple-500/20 flex items-center justify-center text-purple-400 group-hover:scale-105 transition-transform duration-200">
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z"/></svg>
            </div>
            <h4 className="text-lg font-bold text-white">AI Assistant Chat</h4>
            <p className="text-slate-400 text-sm leading-relaxed">
              Ask questions directly about your communication feeds. Fetch data instantly across email bodies and active chat lists.
            </p>
          </div>

          {/* Card 2: AI Briefings */}
          <div className="glass-premium rounded-2xl p-8 hover:border-purple-500/25 transition duration-300 space-y-4 group">
            <div className="w-12 h-12 rounded-xl bg-indigo-500/10 border border-indigo-500/20 flex items-center justify-center text-indigo-400 group-hover:scale-105 transition-transform duration-200">
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253"/></svg>
            </div>
            <h4 className="text-lg font-bold text-white">Smart Executive Briefings</h4>
            <p className="text-slate-400 text-sm leading-relaxed">
              Receive clear daily outlines summarizing your inbox activity, upcoming commitments, and follow-up items.
            </p>
          </div>

          {/* Card 3: Alert Intelligence */}
          <div className="glass-premium rounded-2xl p-8 hover:border-purple-500/25 transition duration-300 space-y-4 group">
            <div className="w-12 h-12 rounded-xl bg-blue-500/10 border border-blue-500/20 flex items-center justify-center text-blue-400 group-hover:scale-105 transition-transform duration-200">
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9"/></svg>
            </div>
            <h4 className="text-lg font-bold text-white">Custom Alert Rules</h4>
            <p className="text-slate-400 text-sm leading-relaxed">
              Define custom trigger rules for emails or WhatsApp threads to flag important events, pricing changes, or critical action tasks.
            </p>
          </div>

          {/* Card 4: Gmail Integration */}
          <div className="glass-premium rounded-2xl p-8 hover:border-purple-500/25 transition duration-300 space-y-4 group">
            <div className="w-12 h-12 rounded-xl bg-red-500/10 border border-red-500/20 flex items-center justify-center text-red-400 group-hover:scale-105 transition-transform duration-200">
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z"/></svg>
            </div>
            <h4 className="text-lg font-bold text-white">Secure Gmail Connect</h4>
            <p className="text-slate-400 text-sm leading-relaxed">
              Connect your Google workspace safely. Alyla reads metadata to schedule alerts and organize summaries without exposing credentials.
            </p>
          </div>

          {/* Card 5: WhatsApp Integration */}
          <div className="glass-premium rounded-2xl p-8 hover:border-purple-500/25 transition duration-300 space-y-4 group">
            <div className="w-12 h-12 rounded-xl bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center text-emerald-400 group-hover:scale-105 transition-transform duration-200">
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z"/></svg>
            </div>
            <h4 className="text-lg font-bold text-white">WhatsApp Pipeline</h4>
            <p className="text-slate-400 text-sm leading-relaxed">
              Monitor group chats or specific direct messages. Automatically highlight requests, meeting times, and follow-ups.
            </p>
          </div>

          {/* Card 6: Productivity Dashboard */}
          <div className="glass-premium rounded-2xl p-8 hover:border-purple-500/25 transition duration-300 space-y-4 group">
            <div className="w-12 h-12 rounded-xl bg-pink-500/10 border border-pink-500/20 flex items-center justify-center text-pink-400 group-hover:scale-105 transition-transform duration-200">
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M11 3.055A9.003 9.003 0 1020.945 13H11V3.055z"/><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M20.488 9H15V3.512A9.025 9.025 0 0120.488 9z"/></svg>
            </div>
            <h4 className="text-lg font-bold text-white">Productivity Dashboard</h4>
            <p className="text-slate-400 text-sm leading-relaxed">
              A premium visual interface containing connected metrics, active follow-ups, and live system indexing pipelines.
            </p>
          </div>
        </div>
      </section>

      {/* --- AI CAPABILITIES (HIGHLIGHT FEATURES) --- */}
      <section className="py-24 relative z-10 px-6 max-w-7xl mx-auto border-t border-white/5">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 items-center">
          <div className="space-y-6">
            <span className="text-xs font-bold text-purple-400 uppercase tracking-widest">Cognitive Intelligence</span>
            <h3 className="text-3xl sm:text-4xl font-extrabold text-white">
              Understand the core of your feeds in seconds.
            </h3>
            <p className="text-slate-400 text-base leading-relaxed">
              Alyla uses state-of-the-art Google Gemini models to evaluate complex context blocks. It recognizes context and handles calendar sync proposals, schedule conflicts, and email drafting automatically.
            </p>
            <div className="space-y-4 pt-4">
              <div className="flex items-start space-x-3.5">
                <div className="w-5 h-5 rounded-full bg-purple-500/20 flex items-center justify-center text-purple-400 mt-1">
                  <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M5 13l4 4L19 7"/></svg>
                </div>
                <div>
                  <h5 className="text-sm font-bold text-white">Context-Aware Summarization</h5>
                  <p className="text-xs text-slate-400 mt-0.5">Translates long email chains or multi-message chats into clear bullet-point briefs.</p>
                </div>
              </div>
              <div className="flex items-start space-x-3.5">
                <div className="w-5 h-5 rounded-full bg-purple-500/20 flex items-center justify-center text-purple-400 mt-1">
                  <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M5 13l4 4L19 7"/></svg>
                </div>
                <div>
                  <h5 className="text-sm font-bold text-white">Calendar Overlap Resolution</h5>
                  <p className="text-xs text-slate-400 mt-0.5">Identifies overlaps and proposes optimal slots checking workspace participant calendars.</p>
                </div>
              </div>
              <div className="flex items-start space-x-3.5">
                <div className="w-5 h-5 rounded-full bg-purple-500/20 flex items-center justify-center text-purple-400 mt-1">
                  <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M5 13l4 4L19 7"/></svg>
                </div>
                <div>
                  <h5 className="text-sm font-bold text-white">Smart Action Suggestion</h5>
                  <p className="text-xs text-slate-400 mt-0.5">Recommends clear, direct actions that let you handle items without leaving the app.</p>
                </div>
              </div>
            </div>
          </div>
          {/* Custom Illustration Mockup */}
          <div className="relative">
            <div className="absolute inset-0 bg-gradient-to-tr from-purple-500/10 to-indigo-500/10 rounded-3xl filter blur-2xl"></div>
            <div className="relative glass border border-white/5 rounded-3xl p-8 shadow-2xl">
              <div className="flex items-center justify-between border-b border-white/5 pb-4 mb-6">
                <div className="flex space-x-1.5">
                  <span className="w-3 h-3 rounded-full bg-red-500/30"></span>
                  <span className="w-3 h-3 rounded-full bg-yellow-500/30"></span>
                  <span className="w-3 h-3 rounded-full bg-green-500/30"></span>
                </div>
                <span className="text-[10px] text-slate-500 uppercase tracking-widest font-mono">Cognitive Analytics Engine</span>
              </div>
              <div className="space-y-4">
                <div className="p-4 bg-white/[0.02] border border-white/5 rounded-2xl relative overflow-hidden">
                  <div className="absolute top-0 right-0 bg-indigo-500/20 text-indigo-400 text-[8px] font-bold uppercase px-2 py-0.5 rounded-bl-lg">Flagged Email</div>
                  <span className="text-[10px] text-purple-400 font-semibold uppercase">Finance Dept</span>
                  <p className="text-xs text-white font-bold mt-1">Invoice review required for cloud storage subscription.</p>
                  <p className="text-[10px] text-slate-400 mt-2">Received via Gmail proxy. Overlimit charges detected ($1,420 excess).</p>
                </div>
                <div className="p-4 bg-purple-500/5 border border-purple-500/20 rounded-2xl">
                  <span className="text-[10px] text-indigo-400 font-semibold uppercase">Alyla Smart Advice</span>
                  <p className="text-xs text-slate-300 mt-1">"The billing cycle exceeds the custom notification threshold of $1,000. Recommend auditing connection logs or upgrading plans."</p>
                  <div className="flex space-x-2 mt-3">
                    <button className="px-3 py-1 bg-purple-600 hover:bg-purple-500 text-white rounded text-[10px] font-semibold transition">Flag for Review</button>
                    <button className="px-3 py-1 bg-white/5 hover:bg-white/10 text-slate-300 rounded text-[10px] transition">Ignore Task</button>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* --- PLAYGROUND SIMULATOR SECTION --- */}
      <section id="playground" className="py-24 relative z-10 px-6 max-w-7xl mx-auto border-t border-white/5">
        <div className="text-center max-w-3xl mx-auto mb-16">
          <h2 className="text-xs font-bold text-purple-400 uppercase tracking-widest mb-3">Live Sandbox</h2>
          <h3 className="text-3xl sm:text-4xl font-extrabold text-white mb-4">
            Test the Cognitive Parser Engine
          </h3>
          <p className="text-slate-400 text-base sm:text-lg">
            Choose a communication source, evaluate the raw parameters, and click to trigger Alyla's AI parsing sequence.
          </p>
        </div>

        {/* Mac OS Layout Frame */}
        <div className="max-w-5xl mx-auto rounded-3xl border border-white/10 bg-slate-950/80 shadow-2xl overflow-hidden backdrop-blur-xl">
          {/* Windows Header Bar */}
          <div className="px-6 py-4 bg-slate-900 border-b border-white/5 flex items-center justify-between">
            <div className="flex items-center space-x-2">
              <span className="w-3.5 h-3.5 rounded-full bg-rose-500 flex items-center justify-center shadow shadow-rose-900/40"></span>
              <span className="w-3.5 h-3.5 rounded-full bg-amber-500 flex items-center justify-center shadow shadow-amber-900/40"></span>
              <span className="w-3.5 h-3.5 rounded-full bg-emerald-500 flex items-center justify-center shadow shadow-emerald-900/40"></span>
            </div>
            <span className="text-[11px] font-mono text-slate-500 tracking-wider">ALYLA INTERACTIVE SIMULATION SANDBOX v1.2</span>
            <div className="w-12"></div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 divide-y md:divide-y-0 md:divide-x divide-white/5">
            {/* Sidebar Channels List */}
            <div className="p-6 bg-slate-950/40 space-y-4">
              <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest block mb-2">Connected Feeds</span>
              <div className="space-y-2">
                {channels.map((channel) => {
                  const isActive = activeChannel === channel.id;
                  return (
                    <button
                      key={channel.id}
                      onClick={() => {
                        setActiveChannel(channel.id);
                        setShowAiResult(false);
                      }}
                      className={`w-full p-3 rounded-xl flex items-center justify-between text-left transition duration-200 cursor-pointer ${isActive ? "bg-white/5 border border-white/10 shadow-lg" : "hover:bg-white/[0.02] border border-transparent"}`}
                    >
                      <div className="flex items-center space-x-3">
                        <div className={`w-8 h-8 rounded-lg bg-gradient-to-tr ${channel.color} flex items-center justify-center text-white shadow-md`}>
                          {channel.icon}
                        </div>
                        <div>
                          <p className="text-xs font-bold text-white">{channel.name}</p>
                          <p className="text-[10px] text-slate-500 mt-0.5 truncate max-w-[120px]">{channel.sender}</p>
                        </div>
                      </div>
                      <span className="text-[9px] text-slate-500">{channel.time}</span>
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Input Message Panel (Raw Stream) */}
            <div className="p-6 flex flex-col justify-between space-y-6">
              <div>
                <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest block mb-4">Notification Content</span>
                <div className="p-5 rounded-2xl bg-white/[0.01] border border-white/5 space-y-4 shadow-inner relative">
                  <div className="flex items-center space-x-3">
                    <div className={`w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold border ${currentChannel.avatarBg}`}>
                      {currentChannel.avatarText}
                    </div>
                    <div>
                      <h5 className="text-xs font-bold text-white">{currentChannel.sender}</h5>
                      <span className="text-[9px] text-slate-500 uppercase tracking-wider">Incoming Meta Payload</span>
                    </div>
                  </div>
                  <p className="text-xs text-slate-300 leading-relaxed italic bg-black/20 p-4 rounded-xl border border-white/[0.02]">
                    "{currentChannel.inputMessage}"
                  </p>
                </div>
              </div>

              {/* Trigger Action Button */}
              <div className="space-y-3">
                <button
                  onClick={triggerSimulation}
                  disabled={isPlaying}
                  className={`w-full py-3.5 px-6 rounded-xl font-bold text-sm transition duration-200 cursor-pointer flex items-center justify-center space-x-2.5 ${isPlaying ? "bg-purple-950 text-purple-300 border border-purple-500/25" : "bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-500 hover:to-indigo-500 text-white shadow-lg shadow-purple-900/30"}`}
                >
                  {isPlaying ? (
                    <>
                      <svg className="animate-spin -ml-1 mr-3 h-4 w-4 text-purple-400" fill="none" viewBox="0 0 24 24">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                      </svg>
                      <span>{currentChannel.aiAction}...</span>
                    </>
                  ) : (
                    <>
                      <svg className="w-4 h-4 text-white" fill="currentColor" viewBox="0 0 24 24">
                        <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm1 15h-2v-6h2v6zm0-8h-2V7h2v2z"/>
                      </svg>
                      <span>Analyze with Alyla AI</span>
                    </>
                  )}
                </button>
                <p className="text-[10px] text-center text-slate-500">
                  Secure local processing sandbox model simulation.
                </p>
              </div>
            </div>

            {/* AI Engine Processing / Output Panel */}
            <div className="p-6 flex flex-col justify-between space-y-6">
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest flex items-center">
                    <svg className="w-3.5 h-3.5 mr-1.5 text-purple-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M13 10V3L4 14h7v7l9-11h-7z" />
                    </svg>
                    AI Processing Console
                  </span>
                  {showAiResult && (
                    <span className="text-[9px] px-2 py-0.5 rounded bg-emerald-500/25 text-emerald-400 font-bold uppercase tracking-wider border border-emerald-500/30">
                      Success
                    </span>
                  )}
                </div>

                {/* Processing Progress State */}
                {isPlaying && (
                  <div className="flex flex-col items-center justify-center py-16 space-y-4 animate-pulse">
                    <div className="w-14 h-14 rounded-full border-2 border-dashed border-purple-500 animate-spin flex items-center justify-center">
                      <div className="w-8 h-8 rounded-full bg-purple-500/20 flex items-center justify-center">
                        <span className="w-2 h-2 rounded-full bg-purple-400"></span>
                      </div>
                    </div>
                    <div className="w-full max-w-[200px] bg-white/5 h-1.5 rounded-full overflow-hidden">
                      <div className="bg-purple-500 h-full rounded-full transition-all duration-100" style={{ width: `${playProgress}%` }}></div>
                    </div>
                    <span className="text-[11px] text-slate-400">Structuring cognitive data...</span>
                  </div>
                )}

                {/* Idle State */}
                {!isPlaying && !showAiResult && (
                  <div className="flex flex-col items-center justify-center py-20 text-center space-y-3">
                    <div className="w-12 h-12 rounded-xl bg-white/[0.01] border border-white/5 flex items-center justify-center text-slate-600">
                      <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M19.428 15.428a2 2 0 00-1.022-.547l-2.387-.477a6 6 0 00-3.86.517l-.318.158a6 6 0 01-3.86.517L6.05 15.21a2 2 0 00-1.806.547M8 4h8l-1 1v5.172a2 2 0 00.586 1.414l5 5c1.26 1.26.367 3.414-1.415 3.414H4.828c-1.782 0-2.674-2.154-1.414-3.414l5-5A2 2 0 009 10.172V5L8 4z"/>
                      </svg>
                    </div>
                    <div>
                      <p className="text-xs font-bold text-slate-400">Engine Ready</p>
                      <p className="text-[10px] text-slate-600 mt-1 max-w-[200px] mx-auto">Click 'Analyze with Alyla AI' to trigger parsing sequence.</p>
                    </div>
                  </div>
                )}

                {/* Completed Output State */}
                {showAiResult && (
                  <div className="animate-fade-in p-5 rounded-2xl bg-slate-950/90 border border-white/5 space-y-4">
                    <div className="flex items-center justify-between border-b border-white/5 pb-2.5">
                      <span className="text-[9px] text-slate-400 font-bold uppercase tracking-wider">
                        {currentChannel.aiOutputTitle}
                      </span>
                      <span className="text-[9px] text-purple-400 font-mono font-bold">142ms latency</span>
                    </div>
                    {currentChannel.aiOutputContent}
                  </div>
                )}
              </div>

              {/* Simulated Notification Indicator */}
              {showAiResult && (
                <div className="p-3 bg-emerald-500/10 rounded-xl border border-emerald-500/25 flex items-center justify-between text-[10px] animate-fade-in">
                  <span className="text-emerald-400 font-semibold flex items-center">
                    <svg className="w-3.5 h-3.5 mr-1.5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M9 12l2 2 4-4"/></svg>
                    Output synced to notification pipeline.
                  </span>
                </div>
              )}
            </div>
          </div>
        </div>
      </section>

      {/* --- HOW IT WORKS (WORKFLOW) --- */}
      <section id="workflow" className="py-24 relative z-10 px-6 max-w-7xl mx-auto border-t border-white/5">
        <div className="text-center max-w-3xl mx-auto mb-20">
          <h2 className="text-xs font-bold text-purple-400 uppercase tracking-widest mb-3">Onboarding</h2>
          <h3 className="text-3xl sm:text-4xl font-extrabold text-white mb-4">
            Activate your Assistant in 4 Steps
          </h3>
          <p className="text-slate-400 text-base sm:text-lg">
            No developer setups or API configurations required. We support simple click connections to configure your channels safely.
          </p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8 relative">
          {/* Connecting Line (Desktop) */}
          <div className="hidden lg:block absolute top-12 left-[10%] right-[10%] h-0.5 bg-gradient-to-r from-purple-500/20 via-indigo-500/20 to-blue-500/20 z-0"></div>

          {/* Step 1 */}
          <div className="flex flex-col items-center text-center relative z-10 space-y-4 group">
            <div className="w-14 h-14 rounded-2xl bg-white/[0.01] border border-white/5 group-hover:border-purple-500/30 flex items-center justify-center text-lg font-bold text-white shadow-lg transition duration-300 group-hover:scale-105 relative">
              <span className="absolute inset-0 rounded-2xl bg-gradient-to-tr from-purple-600/10 to-indigo-600/10 opacity-0 group-hover:opacity-100 transition-opacity"></span>
              01
            </div>
            <h4 className="text-base font-bold text-white">Create Account</h4>
            <p className="text-slate-400 text-xs leading-relaxed max-w-[200px]">
              Sign up via email or quick OAuth callback. Establish your profile.
            </p>
          </div>

          {/* Step 2 */}
          <div className="flex flex-col items-center text-center relative z-10 space-y-4 group">
            <div className="w-14 h-14 rounded-2xl bg-white/[0.01] border border-white/5 group-hover:border-indigo-500/30 flex items-center justify-center text-lg font-bold text-white shadow-lg transition duration-300 group-hover:scale-105 relative">
              <span className="absolute inset-0 rounded-2xl bg-gradient-to-tr from-indigo-600/10 to-blue-600/10 opacity-0 group-hover:opacity-100 transition-opacity"></span>
              02
            </div>
            <h4 className="text-base font-bold text-white">Connect Apps</h4>
            <p className="text-slate-400 text-xs leading-relaxed max-w-[200px]">
              Authenticate Gmail or WhatsApp feeds using direct proxy gateways.
            </p>
          </div>

          {/* Step 3 */}
          <div className="flex flex-col items-center text-center relative z-10 space-y-4 group">
            <div className="w-14 h-14 rounded-2xl bg-white/[0.01] border border-white/5 group-hover:border-blue-500/30 flex items-center justify-center text-lg font-bold text-white shadow-lg transition duration-300 group-hover:scale-105 relative">
              <span className="absolute inset-0 rounded-2xl bg-gradient-to-tr from-blue-600/10 to-pink-600/10 opacity-0 group-hover:opacity-100 transition-opacity"></span>
              03
            </div>
            <h4 className="text-base font-bold text-white">Gemini Processing</h4>
            <p className="text-slate-400 text-xs leading-relaxed max-w-[200px]">
              AI models filter content to flag actions, summaries, and scheduling tasks.
            </p>
          </div>

          {/* Step 4 */}
          <div className="flex flex-col items-center text-center relative z-10 space-y-4 group">
            <div className="w-14 h-14 rounded-2xl bg-white/[0.01] border border-white/5 group-hover:border-pink-500/30 flex items-center justify-center text-lg font-bold text-white shadow-lg transition duration-300 group-hover:scale-105 relative">
              <span className="absolute inset-0 rounded-2xl bg-gradient-to-tr from-pink-600/10 to-purple-600/10 opacity-0 group-hover:opacity-100 transition-opacity"></span>
              04
            </div>
            <h4 className="text-base font-bold text-white">Reclaim Focus</h4>
            <p className="text-slate-400 text-xs leading-relaxed max-w-[200px]">
              Resolve alerts, check calendar sync updates, and edit replies easily.
            </p>
          </div>
        </div>
      </section>

      {/* --- INTEGRATIONS MATRIX SECTION --- */}
      <section id="integrations" className="py-24 relative z-10 px-6 max-w-7xl mx-auto border-t border-white/5">
        <div className="text-center max-w-3xl mx-auto mb-16">
          <h2 className="text-xs font-bold text-purple-400 uppercase tracking-widest mb-3">Integrations</h2>
          <h3 className="text-3xl sm:text-4xl font-extrabold text-white mb-4">
            Connect all your production tools
          </h3>
          <p className="text-slate-400 text-base sm:text-lg">
            Unify multiple notification paths into a single database logic system. More channels coming soon.
          </p>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-6">
          {[
            { name: "Gmail", icon: "/001-gmail.png", status: "Active" },
            { name: "WhatsApp", icon: "/002-whatsapp.png", status: "Active" },
            { name: "Slack", icon: "/005-slack.png", status: "Beta" },
            { name: "Telegram", icon: "/004-telegram.png", status: "Active" },
            { name: "Discord", icon: "/006-discord.png", status: "Beta" },
            { name: "Outlook", icon: "/003-email.png", status: "Active" },
            { name: "InsForge", icon: null, status: "Active", label: "InsForge BaaS" },
            { name: "Sent.dm", icon: null, status: "Active", label: "Sent.dm SMS" },
            { name: "Google Calendar", icon: null, status: "Active", label: "Calendar" },
            { name: "Notion", icon: null, status: "Soon", label: "Notion" },
            { name: "Microsoft Teams", icon: null, status: "Soon", label: "Teams" },
            { name: "Zoom", icon: null, status: "Soon", label: "Zoom" }
          ].map((item, i) => (
            <div key={i} className="glass-premium rounded-xl p-5 hover:border-purple-500/20 transition duration-300 flex flex-col items-center text-center space-y-3">
              {item.icon ? (
                <img src={item.icon} alt={item.name} className="w-10 h-10 object-contain" />
              ) : (
                <div className="w-10 h-10 rounded-lg bg-white/5 border border-white/10 flex items-center justify-center text-[10px] font-bold text-purple-300 uppercase leading-none">
                  {item.label ? item.label.slice(0, 3) : "APP"}
                </div>
              )}
              <div>
                <p className="text-xs font-bold text-white">{item.name}</p>
                <span className={`inline-block text-[9px] mt-1.5 px-2 py-0.5 rounded-full font-bold uppercase tracking-wider ${item.status === "Active" ? "bg-emerald-500/10 text-emerald-400 border border-emerald-500/20" : item.status === "Beta" ? "bg-amber-500/10 text-amber-400 border border-amber-500/20" : "bg-white/5 text-slate-500 border border-white/5"}`}>
                  {item.status}
                </span>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* --- WHY CHOOSE ALYLA SECTION --- */}
      <section className="py-24 relative z-10 px-6 max-w-7xl mx-auto border-t border-white/5">
        <div className="text-center max-w-3xl mx-auto mb-16">
          <h2 className="text-xs font-bold text-purple-400 uppercase tracking-widest mb-3">Comparison</h2>
          <h3 className="text-3xl sm:text-4xl font-extrabold text-white mb-4">
            How Alyla compares
          </h3>
        </div>

        <div className="max-w-4xl mx-auto overflow-hidden rounded-2xl border border-white/5 shadow-2xl">
          <table className="w-full text-left border-collapse bg-slate-950/60 backdrop-blur-md">
            <thead>
              <tr className="border-b border-white/5 bg-white/[0.02]">
                <th className="p-4 text-xs font-bold uppercase tracking-widest text-slate-400">Capabilities</th>
                <th className="p-4 text-xs font-bold uppercase tracking-widest text-purple-400">Alyla AI</th>
                <th className="p-4 text-xs font-bold uppercase tracking-widest text-slate-500">Other Tools</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-white/5 text-xs text-slate-300">
              <tr>
                <td className="p-4 font-semibold text-white">Cross-App Feed Syncing</td>
                <td className="p-4 text-purple-400 font-bold">Yes (Gmail, WhatsApp, Telegram, Outlook)</td>
                <td className="p-4 text-slate-500">No (Requires multiple tabs)</td>
              </tr>
              <tr>
                <td className="p-4 font-semibold text-white">Smart Conflict Extraction</td>
                <td className="p-4 text-purple-400 font-bold">Yes (Proposes Reschedules instantly)</td>
                <td className="p-4 text-slate-500">Basic (Only adds static events)</td>
              </tr>
              <tr>
                <td className="p-4 font-semibold text-white">Context-Aware AI Drafting</td>
                <td className="p-4 text-purple-400 font-bold">Yes (Analyzes tone and logs)</td>
                <td className="p-4 text-slate-500">No (Template replies only)</td>
              </tr>
              <tr>
                <td className="p-4 font-semibold text-white">Secure Local Sandboxing</td>
                <td className="p-4 text-purple-400 font-bold">Yes (Keeps credentials private)</td>
                <td className="p-4 text-slate-500">No (Uploads keys to external servers)</td>
              </tr>
            </tbody>
          </table>
        </div>
      </section>

      {/* --- TESTIMONIALS SECTION --- */}
      <section className="py-24 relative z-10 px-6 max-w-7xl mx-auto border-t border-white/5">
        <div className="text-center max-w-3xl mx-auto mb-16">
          <h2 className="text-xs font-bold text-purple-400 uppercase tracking-widest mb-3">Feedback</h2>
          <h3 className="text-3xl sm:text-4xl font-extrabold text-white mb-4">
            What our clients say
          </h3>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {[
            {
              name: "Nile",
              role: "Founding Engineer, Software Solutions",
              review: "Alyla unified my entire WhatsApp engineering channel digest with our Gmail client lists. I reclaim at least 2 hours daily from manually checking messaging updates.",
              rating: 5
            },
            {
              name: "Sarah Jenkins",
              role: "Director of Finance, Zephyr AI",
              review: "The smart alert triggers worked perfectly when clients requested budget shifts or NDA signatures. It schedules events and drafts replies in a single cockpit.",
              rating: 5
            },
            {
              name: "Mark Henderson",
              role: "DevOps Architect, Acme Corp",
              review: "I connected WhatsApp and Gmail to monitor deployment warnings and production incident logs. The Gemini parser extraction is incredibly reliable.",
              rating: 5
            }
          ].map((item, i) => (
            <div key={i} className="glass-premium rounded-2xl p-6 flex flex-col justify-between hover:border-purple-500/10 transition duration-300">
              <div className="space-y-4">
                <div className="flex space-x-1">
                  {[...Array(item.rating)].map((_, idx) => (
                    <svg key={idx} className="w-4 h-4 text-amber-400" fill="currentColor" viewBox="0 0 20 20"><path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z"/></svg>
                  ))}
                </div>
                <p className="text-xs sm:text-sm text-slate-300 leading-relaxed italic">
                  "{item.review}"
                </p>
              </div>
              <div className="flex items-center space-x-3 pt-6 border-t border-white/5 mt-6">
                <div className="w-8 h-8 rounded-full bg-purple-500/20 text-purple-300 flex items-center justify-center font-bold text-xs">
                  {item.name.slice(0, 2)}
                </div>
                <div>
                  <h5 className="text-xs font-bold text-white">{item.name}</h5>
                  <p className="text-[10px] text-slate-500 mt-0.5">{item.role}</p>
                </div>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* --- PRICING SECTION --- */}
      <section id="pricing" className="py-24 relative z-10 px-6 max-w-7xl mx-auto border-t border-white/5">
        <div className="text-center max-w-3xl mx-auto mb-20">
          <h2 className="text-xs font-bold text-purple-400 uppercase tracking-widest mb-3">Subscription</h2>
          <h3 className="text-3xl sm:text-4xl font-extrabold text-white mb-4">
            Pricing Plans for Every Workflow
          </h3>
          <p className="text-slate-400 text-base sm:text-lg">
            Start free and scale up as your communication volumes increase. Cancel or switch plans at any time.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 items-stretch max-w-5xl mx-auto">
          {/* Plan 1: Free */}
          <div className="glass-premium rounded-2xl p-8 flex flex-col justify-between hover:border-white/10 transition duration-300 relative">
            <div className="space-y-6">
              <div>
                <h4 className="text-lg font-bold text-white">Starter</h4>
                <p className="text-xs text-slate-500 mt-1">For testing and light usage</p>
              </div>
              <div className="flex items-baseline">
                <span className="text-4xl font-extrabold text-white">$0</span>
                <span className="text-slate-500 text-xs ml-2">/ month</span>
              </div>
              <div className="h-px bg-white/5"></div>
              <ul className="space-y-3 text-xs text-slate-400">
                <li className="flex items-center">
                  <svg className="w-3.5 h-3.5 text-emerald-400 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M5 13l4 4L19 7"/></svg>
                  Connect 2 Accounts
                </li>
                <li className="flex items-center">
                  <svg className="w-3.5 h-3.5 text-emerald-400 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M5 13l4 4L19 7"/></svg>
                  50 AI Summaries / month
                </li>
                <li className="flex items-center">
                  <svg className="w-3.5 h-3.5 text-emerald-400 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M5 13l4 4L19 7"/></svg>
                  Basic Reminder Syncing
                </li>
                <li className="flex items-center text-slate-600 line-through">
                  <svg className="w-3.5 h-3.5 text-slate-600 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M6 18L18 6M6 6l12 12"/></svg>
                  Context-Aware Reply Suggestions
                </li>
                <li className="flex items-center text-slate-600 line-through">
                  <svg className="w-3.5 h-3.5 text-slate-600 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M6 18L18 6M6 6l12 12"/></svg>
                  Custom Rule Builders
                </li>
              </ul>
            </div>
            <Link href="/sign-up" className="w-full mt-8 py-3 bg-white/5 hover:bg-white/10 text-white rounded-xl text-xs font-semibold transition text-center block">
              Get Started Free
            </Link>
          </div>

          {/* Plan 2: Pro */}
          <div className="glass-premium rounded-2xl p-8 flex flex-col justify-between border-purple-500/30 hover:border-purple-500/50 transition duration-300 relative shadow-xl shadow-purple-950/20 transform md:-translate-y-3">
            <div className="absolute top-0 right-8 transform -translate-y-1/2 px-3 py-1 bg-gradient-to-r from-purple-600 to-indigo-600 text-white text-[10px] font-extrabold tracking-wider uppercase rounded-full shadow-md shadow-purple-900/30">
              Most Popular
            </div>
            
            <div className="space-y-6">
              <div>
                <h4 className="text-lg font-bold text-white">Professional</h4>
                <p className="text-xs text-purple-300 mt-1">For active power users</p>
              </div>
              <div className="flex items-baseline">
                <span className="text-4xl font-extrabold text-white">$19</span>
                <span className="text-slate-500 text-xs ml-2">/ month</span>
              </div>
              <div className="h-px bg-white/5"></div>
              <ul className="space-y-3 text-xs text-slate-300">
                <li className="flex items-center">
                  <svg className="w-3.5 h-3.5 text-purple-400 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M5 13l4 4L19 7"/></svg>
                  Connect Unlimited Accounts
                </li>
                <li className="flex items-center">
                  <svg className="w-3.5 h-3.5 text-purple-400 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M5 13l4 4L19 7"/></svg>
                  Unlimited AI Digests & Summaries
                </li>
                <li className="flex items-center">
                  <svg className="w-3.5 h-3.5 text-purple-400 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M5 13l4 4L19 7"/></svg>
                  Real-time Calendar conflict sync
                </li>
                <li className="flex items-center">
                  <svg className="w-3.5 h-3.5 text-purple-400 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M5 13l4 4L19 7"/></svg>
                  AI Tone-Matched Suggested Replies
                </li>
                <li className="flex items-center">
                  <svg className="w-3.5 h-3.5 text-purple-400 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M5 13l4 4L19 7"/></svg>
                  Custom Rule Builders
                </li>
              </ul>
            </div>
            <Link href="/sign-up" className="w-full mt-8 py-3 bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-500 hover:to-indigo-500 text-white rounded-xl text-xs font-bold transition shadow-lg shadow-purple-900/30 text-center block">
              Start 14-Day Free Trial
            </Link>
          </div>

          {/* Plan 3: Enterprise */}
          <div className="glass-premium rounded-2xl p-8 flex flex-col justify-between hover:border-white/10 transition duration-300 relative">
            <div className="space-y-6">
              <div>
                <h4 className="text-lg font-bold text-white">Enterprise</h4>
                <p className="text-xs text-slate-500 mt-1">For corporate teams & compliance</p>
              </div>
              <div className="flex items-baseline">
                <span className="text-4xl font-extrabold text-white">Custom</span>
              </div>
              <div className="h-px bg-white/5"></div>
              <ul className="space-y-3 text-xs text-slate-400">
                <li className="flex items-center">
                  <svg className="w-3.5 h-3.5 text-emerald-400 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M5 13l4 4L19 7"/></svg>
                  Custom SSO & Identity sync
                </li>
                <li className="flex items-center">
                  <svg className="w-3.5 h-3.5 text-emerald-400 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M5 13l4 4L19 7"/></svg>
                  Private LLM deployments (VPC/On-prem)
                </li>
                <li className="flex items-center">
                  <svg className="w-3.5 h-3.5 text-emerald-400 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M5 13l4 4L19 7"/></svg>
                  Custom SLA & 24/7 Phone Support
                </li>
                <li className="flex items-center">
                  <svg className="w-3.5 h-3.5 text-emerald-400 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M5 13l4 4L19 7"/></svg>
                  Granular permission auditer tools
                </li>
              </ul>
            </div>
            <button className="w-full mt-8 py-3 bg-white/5 hover:bg-white/10 text-white rounded-xl text-xs font-semibold transition cursor-pointer">
              Contact Sales
            </button>
          </div>
        </div>
      </section>

      {/* --- SECURITY & PRIVACY SECTION --- */}
      <section className="py-24 relative z-10 px-6 max-w-7xl mx-auto border-t border-white/5">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
          <div className="space-y-6">
            <span className="text-xs font-bold text-purple-400 uppercase tracking-widest">Bank-Grade Compliance</span>
            <h3 className="text-3xl sm:text-4xl font-extrabold text-white">Your privacy is our core engineering design</h3>
            <p className="text-slate-400 text-sm leading-relaxed">
              Alyla is built using strict data segmentation. We do not store your raw credentials, and connection tokens are encrypted using AES-256 protocols. Your conversations are audited using local cognitive modules and are never used to train public LLM models.
            </p>
            <div className="grid grid-cols-2 gap-6">
              <div className="space-y-2">
                <h5 className="text-sm font-bold text-white">End-to-End Encryption</h5>
                <p className="text-xs text-slate-500">All data payloads are encrypted during transit and at rest using standard hardware security keys.</p>
              </div>
              <div className="space-y-2">
                <h5 className="text-sm font-bold text-white">OAuth Gateways</h5>
                <p className="text-xs text-slate-500">We utilize secure auth callbacks, meaning Alyla never asks for or sees your account passwords.</p>
              </div>
            </div>
          </div>
          <div className="relative">
            <div className="absolute inset-0 bg-purple-500/10 rounded-2xl filter blur-3xl"></div>
            <div className="relative border border-white/5 bg-slate-950 p-6 rounded-2xl flex items-center space-x-4 shadow-2xl">
              <div className="w-12 h-12 rounded-xl bg-purple-500/10 border border-purple-500/20 flex items-center justify-center text-purple-400">
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z"/></svg>
              </div>
              <div>
                <h4 className="text-sm font-bold text-white">Enterprise Ready Security</h4>
                <p className="text-xs text-slate-400 mt-1">SOC2 Type II compliant pipelines and HIPAA ready enclaves.</p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* --- FAQ SECTION --- */}
      <section id="faq" className="py-24 relative z-10 px-6 max-w-4xl mx-auto border-t border-white/5">
        <div className="text-center mb-16">
          <h2 className="text-xs font-bold text-purple-400 uppercase tracking-widest mb-3">FAQ</h2>
          <h3 className="text-3xl sm:text-4xl font-extrabold text-white">
            Frequently Asked Questions
          </h3>
        </div>

        <div className="space-y-4">
          {[
            {
              q: "How secure is my connected account data?",
              a: "We prioritize your privacy above all. Alyla utilizes bank-grade OAuth connections to sync your channels. All cognitive summaries and reply draft processing are performed inside secure sandboxed execution enclaves. Your data is encrypted in transit and at rest using AES-256 protocols."
            },
            {
              q: "Does the AI read all my private chats continuously?",
              a: "No. Alyla's listener engine parses raw metadata streams to identify target tasks. It only processes message body text when specific events occur (e.g., extracting reminders, creating requested summaries, or drafting answers). You have granular control to pause syncing on any chat, channel, or email at any moment."
            },
            {
              q: "Can I sync multiple Gmail or Outlook accounts?",
              a: "Yes! With our Professional plan, you can connect as many business or personal Gmail and Outlook workspaces as you need. All accounts are pooled into a single daily dashboard overview so you can track all action items in one spot."
            },
            {
              q: "Does it support voice messages in WhatsApp or Telegram?",
              a: "Yes! Alyla features built-in high-accuracy speech-to-text translators. When you receive a long voice message, the system transcribes it locally and supplies a text digest so you can grasp the key points without listening to the audio."
            },
            {
              q: "What is the difference between Starter and Professional plans?",
              a: "The Starter plan is completely free and allows you to connect up to 2 accounts with up to 50 AI summaries monthly. The Professional plan ($19/mo) unlocks unlimited connected accounts, unlimited summaries, real-time calendar conflict notifications, and dynamic tone-matched draft replies."
            },
            {
              q: "How long does the initial app syncing take?",
              a: "The initial sync process typically takes between 30 seconds and 2 minutes depending on the size of your current inbox. Once the sync pipeline finishes indexing, future changes process in real-time."
            },
            {
              q: "Does Alyla support custom notification configurations?",
              a: "Yes! Under settings you can define active hours, snooze duration rules, priority thresholds (High/Medium/Low), and choose whether you want alerts delivered in-app or via custom SMS updates."
            },
            {
              q: "Can I use Alyla AI on my mobile phone?",
              a: "Yes! The Alyla dashboard and chat panels are fully responsive and optimized for mobile screens. You can manage rules, check alerts, and run chats directly from any smartphone browser."
            },
            {
              q: "Can Alyla auto-send replies on my behalf without review?",
              a: "No. For compliance and security reasons, Alyla compiles reply suggestions but never sends them directly. You must review the draft reply on the alerts panel and click 'Send Reply' to authorize execution."
            },
            {
              q: "Is my data stored or used for AI model training?",
              a: "Absolutely not. All processing uses isolated API sessions with zero retention, meaning none of your emails or private messaging parameters are ever logged or used to train public models."
            }
          ].map((faq, index) => {
            const isOpen = openFaq === index;
            return (
              <div 
                key={index} 
                className="glass rounded-xl border border-white/5 overflow-hidden transition-all duration-300"
              >
                <button
                  onClick={() => setOpenFaq(isOpen ? null : index)}
                  className="w-full py-5 px-6 flex items-center justify-between text-left focus:outline-none cursor-pointer"
                >
                  <span className="text-sm sm:text-base font-bold text-white">{faq.q}</span>
                  <svg 
                    className={`w-5 h-5 text-purple-400 transform transition-transform duration-300 ${isOpen ? "rotate-180" : ""}`} 
                    fill="none" 
                    stroke="currentColor" 
                    viewBox="0 0 24 24"
                  >
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M19 9l-7 7-7-7"/>
                  </svg>
                </button>
                <div 
                  className={`transition-all duration-300 ease-in-out overflow-hidden ${isOpen ? "max-h-[250px] opacity-100 border-t border-white/5 bg-slate-900/10" : "max-h-0 opacity-0"}`}
                >
                  <div className="p-6 text-xs sm:text-sm text-slate-400 leading-relaxed">
                    {faq.a}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </section>

      {/* --- BLOG / RESOURCES PREVIEW --- */}
      <section className="py-24 relative z-10 px-6 max-w-7xl mx-auto border-t border-white/5">
        <div className="text-center max-w-3xl mx-auto mb-16">
          <h2 className="text-xs font-bold text-purple-400 uppercase tracking-widest mb-3">Resources</h2>
          <h3 className="text-3xl sm:text-4xl font-extrabold text-white mb-4">
            Recent updates & guides
          </h3>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          <div className="glass-premium rounded-2xl overflow-hidden hover:border-purple-500/20 transition duration-300 flex flex-col justify-between">
            <div className="p-6 space-y-4">
              <span className="text-[9px] uppercase tracking-wider bg-purple-500/10 text-purple-400 font-bold px-2 py-0.5 rounded border border-purple-500/20">Product Guide</span>
              <h4 className="text-sm font-bold text-white">How to connect and sync your WhatsApp chats with Alyla</h4>
              <p className="text-xs text-slate-400 leading-relaxed">A step-by-step walkthrough covering auth socket connection parameters and privacy settings.</p>
            </div>
            <div className="p-6 border-t border-white/5 flex items-center justify-between text-xs text-slate-500">
              <span>5 min read</span>
              <span className="text-purple-400 font-bold hover:underline cursor-pointer">Read article &rarr;</span>
            </div>
          </div>

          <div className="glass-premium rounded-2xl overflow-hidden hover:border-purple-500/20 transition duration-300 flex flex-col justify-between">
            <div className="p-6 space-y-4">
              <span className="text-[9px] uppercase tracking-wider bg-purple-500/10 text-purple-400 font-bold px-2 py-0.5 rounded border border-purple-500/20">Security Insights</span>
              <h4 className="text-sm font-bold text-white">Auditing the data privacy enclaves used by Gemini models</h4>
              <p className="text-xs text-slate-400 leading-relaxed">An engineering breakdown explaining standard data encryption during live prompt parsing pipelines.</p>
            </div>
            <div className="p-6 border-t border-white/5 flex items-center justify-between text-xs text-slate-500">
              <span>8 min read</span>
              <span className="text-purple-400 font-bold hover:underline cursor-pointer">Read article &rarr;</span>
            </div>
          </div>

          <div className="glass-premium rounded-2xl overflow-hidden hover:border-purple-500/20 transition duration-300 flex flex-col justify-between">
            <div className="p-6 space-y-4">
              <span className="text-[9px] uppercase tracking-wider bg-purple-500/10 text-purple-400 font-bold px-2 py-0.5 rounded border border-purple-500/20">Productivity Guide</span>
              <h4 className="text-sm font-bold text-white">10 custom alert rules to automate weekly meetings and inbox reviews</h4>
              <p className="text-xs text-slate-400 leading-relaxed">Learn how to build advanced trigger structures to manage customer feedback and flag escalations.</p>
            </div>
            <div className="p-6 border-t border-white/5 flex items-center justify-between text-xs text-slate-500">
              <span>4 min read</span>
              <span className="text-purple-400 font-bold hover:underline cursor-pointer">Read article &rarr;</span>
            </div>
          </div>
        </div>
      </section>

      {/* --- WAITLIST / CALL TO ACTION (CTA) --- */}
      <section id="waitlist" className="py-24 relative z-10 px-6 max-w-5xl mx-auto text-center border-t border-white/5">
        <div className="glass-premium rounded-3xl p-8 sm:p-12 md:p-16 relative overflow-hidden shadow-2xl border-purple-500/10">
          <div className="absolute top-[-40%] left-[-20%] w-[400px] h-[400px] rounded-full bg-purple-900/10 filter blur-3xl pointer-events-none"></div>
          <div className="absolute bottom-[-40%] right-[-20%] w-[400px] h-[400px] rounded-full bg-blue-900/10 filter blur-3xl pointer-events-none"></div>
          
          <div className="max-w-2xl mx-auto space-y-8 relative z-10">
            <h3 className="text-3xl sm:text-4xl md:text-5xl font-extrabold tracking-tight text-white leading-tight">
              Ready to reclaim <br className="sm:hidden" /> your cognitive focus?
            </h3>
            <p className="text-slate-400 text-sm sm:text-base max-w-lg mx-auto">
              Join 1,400+ professionals using Alyla AI to orchestrate messaging, emails, and reminders. Start your 14-day free trial today.
            </p>

            {waitlistStatus === "success" ? (
              <div className="p-6 bg-purple-500/10 rounded-2xl border border-purple-500/20 max-w-md mx-auto animate-fade-in space-y-2">
                <div className="w-10 h-10 rounded-full bg-purple-500/20 text-purple-400 flex items-center justify-center mx-auto mb-2">
                  <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M5 13l4 4L19 7"/></svg>
                </div>
                <h4 className="text-base font-bold text-white">You're on the list!</h4>
                <p className="text-xs text-slate-400">
                  Thank you for subscribing. We've sent a confirmation email to <span className="text-purple-300 font-semibold">{email}</span> with setup details.
                </p>
                <span className="inline-block text-[10px] text-purple-400 bg-purple-500/10 px-2.5 py-0.5 rounded-full mt-2 font-bold">
                  Queue Position: #{waitlistCount}
                </span>
              </div>
            ) : (
              <form onSubmit={handleWaitlistSubmit} className="flex flex-col sm:flex-row items-stretch justify-center gap-3 max-w-md mx-auto">
                <input
                  type="email"
                  required
                  placeholder="Enter your business email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="flex-1 px-4 py-3.5 bg-black/40 border border-white/10 hover:border-white/20 focus:border-purple-500 rounded-xl text-white text-sm focus:outline-none transition"
                />
                <button
                  type="submit"
                  disabled={waitlistStatus === "loading"}
                  className="px-6 py-3.5 bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-500 hover:to-indigo-500 text-white font-bold rounded-xl text-sm transition transform active:scale-[0.98] cursor-pointer flex items-center justify-center"
                >
                  {waitlistStatus === "loading" ? (
                    <svg className="animate-spin h-5 w-5 text-white" fill="none" viewBox="0 0 24 24"><circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle><path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path></svg>
                  ) : (
                    "Join the Waitlist"
                  )}
                </button>
              </form>
            )}

            <div className="flex items-center justify-center space-x-6 text-[11px] text-slate-500">
              <span className="flex items-center">
                <svg className="w-3.5 h-3.5 text-purple-400 mr-1.5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M9 12l2 2 4-4"/></svg>
                No credit card required
              </span>
              <span className="flex items-center">
                <svg className="w-3.5 h-3.5 text-purple-400 mr-1.5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M9 12l2 2 4-4"/></svg>
                Cancel anytime
              </span>
            </div>
          </div>
        </div>
      </section>

      {/* --- FOOTER --- */}
      <footer className="bg-slate-950 border-t border-white/5 relative z-10 pt-20 pb-8 px-6">
        <div className="max-w-7xl mx-auto grid grid-cols-2 md:grid-cols-6 gap-10 pb-16">
          {/* Brand Col */}
          <div className="col-span-2 space-y-6">
            <a href="#" className="flex items-center space-x-2.5">
              <div className="w-8 h-8 rounded-lg bg-gradient-to-tr from-purple-600 to-indigo-600 flex items-center justify-center shadow shadow-purple-900/30">
                <svg className="w-4 h-4 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 10V3L4 14h7v7l9-11h-7z" />
                </svg>
              </div>
              <span className="text-lg font-bold tracking-tight text-white">Alyla<span className="text-purple-500">.ai</span></span>
            </a>
            <p className="text-xs text-slate-400 max-w-sm leading-relaxed">
              Alyla AI brings clarity to your communication channels, orchestrating summaries, draft response suggests, and reminder calendar syncs.
            </p>
            <div className="flex space-x-4">
              {/* Social Link: Twitter */}
              <a href="#" className="p-2 rounded-lg bg-white/5 border border-white/5 hover:border-white/10 text-slate-400 hover:text-white transition duration-200" aria-label="Twitter">
                <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z"/>
                </svg>
              </a>
              {/* Social Link: GitHub */}
              <a href="#" className="p-2 rounded-lg bg-white/5 border border-white/5 hover:border-white/10 text-slate-400 hover:text-white transition duration-200" aria-label="GitHub">
                <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24">
                  <path fillRule="evenodd" clipRule="evenodd" d="M12 2C6.477 2 2 6.484 2 12.017c0 4.425 2.865 8.18 6.839 9.504.5.092.682-.217.682-.483 0-.237-.008-.868-.013-1.703-2.782.605-3.369-1.343-3.369-1.343-.454-1.158-1.11-1.466-1.11-1.466-.908-.62.069-.608.069-.608 1.003.07 1.531 1.032 1.531 1.032.892 1.53 2.341 1.088 2.91.832.092-.647.35-1.088.636-1.338-2.22-.253-4.555-1.113-4.555-4.951 0-1.093.39-1.988 1.029-2.688-.103-.253-.446-1.272.098-2.65 0 0 .84-.27 2.75 1.026A9.564 9.564 0 0112 6.844c.85.004 1.705.115 2.504.337 1.909-1.296 2.747-1.027 2.747-1.027.546 1.379.202 2.398.1 2.651.64.7 1.028 1.595 1.028 2.688 0 3.848-2.339 4.695-4.566 4.943.359.309.678.92.678 1.855 0 1.338-.012 2.419-.012 2.747 0 .268.18.58.688.482C19.138 20.197 22 16.44 22 12.017 22 6.484 17.522 2 12 2z"/>
                </svg>
              </a>
              {/* Social Link: Discord */}
              <a href="#" className="p-2 rounded-lg bg-white/5 border border-white/5 hover:border-white/10 text-slate-400 hover:text-white transition duration-200" aria-label="Discord">
                <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M20.317 4.37a19.791 19.791 0 00-4.885-1.515.074.074 0 00-.079.037c-.21.375-.444.864-.608 1.25a18.27 18.27 0 00-5.487 0 12.64 12.64 0 00-.617-1.25.077.077 0 00-.079-.037A19.736 19.736 0 003.677 4.37a.07.07 0 00-.032.027C.533 9.046-.32 13.58.099 18.057a.082.082 0 00.031.057 19.9 19.9 0 005.993 3.03.078.078 0 00.084-.028 14.09 14.09 0 001.226-1.994.076.076 0 00-.041-.106 13.107 13.107 0 01-1.873-.894.077.077 0 01-.008-.128c.126-.093.252-.19.372-.287a.075.075 0 01.077-.011 13.985 13.985 0 0012.054 0 .076.076 0 01.078.01c.12.098.246.195.373.289a.077.077 0 01-.006.127 12.299 12.299 0 01-1.873.894.077.077 0 00-.041.107 14.362 14.362 0 001.226 1.99.075.075 0 00.084.03 19.856 19.856 0 006.002-3.03.077.077 0 00.032-.054c.5-5.177-.838-9.674-3.549-13.66a.061.061 0 00-.031-.03zM8.02 15.33c-1.183 0-2.157-1.085-2.157-2.419 0-1.333.956-2.419 2.156-2.419 1.21 0 2.176 1.096 2.157 2.42 0 1.333-.956 2.418-2.156 2.418zm7.975 0c-1.183 0-2.157-1.085-2.157-2.419 0-1.333.955-2.419 2.156-2.419 1.21 0 2.176 1.096 2.157 2.42 0 1.333-.946 2.418-2.156 2.418z"/>
                </svg>
              </a>
            </div>
          </div>

          {/* Links Col 1 */}
          <div className="space-y-4">
            <h5 className="text-xs font-bold text-white uppercase tracking-wider">Product</h5>
            <ul className="space-y-2 text-xs text-slate-400">
              <li><a href="#features" className="hover:text-white transition">Features</a></li>
              <li><a href="#playground" className="hover:text-white transition">Live Simulator</a></li>
              <li><a href="#pricing" className="hover:text-white transition">Pricing Plans</a></li>
              <li><a href="#workflow" className="hover:text-white transition">How it Works</a></li>
              <li><a href="#" className="hover:text-white transition">Release Notes</a></li>
            </ul>
          </div>

          {/* Links Col 2 */}
          <div className="space-y-4">
            <h5 className="text-xs font-bold text-white uppercase tracking-wider">Integrations</h5>
            <ul className="space-y-2 text-xs text-slate-400">
              <li><a href="#" className="hover:text-white transition flex items-center"><span className="w-1.5 h-1.5 rounded-full bg-red-500 mr-2"></span>Gmail</a></li>
              <li><a href="#" className="hover:text-white transition flex items-center"><span className="w-1.5 h-1.5 rounded-full bg-emerald-500 mr-2"></span>WhatsApp</a></li>
              <li><a href="#" className="hover:text-white transition flex items-center"><span className="w-1.5 h-1.5 rounded-full bg-sky-500 mr-2"></span>Telegram</a></li>
              <li><a href="#" className="hover:text-white transition flex items-center"><span className="w-1.5 h-1.5 rounded-full bg-blue-600 mr-2"></span>Outlook</a></li>
              <li><a href="#" className="hover:text-white transition text-slate-600 flex items-center">Slack (Soon)</a></li>
            </ul>
          </div>

          {/* Links Col 3 */}
          <div className="space-y-4">
            <h5 className="text-xs font-bold text-white uppercase tracking-wider">Resources</h5>
            <ul className="space-y-2 text-xs text-slate-400">
              <li><a href="#" className="hover:text-white transition">Documentation</a></li>
              <li><a href="#" className="hover:text-white transition">API Status</a></li>
              <li><a href="#" className="hover:text-white transition">Security Guide</a></li>
              <li><a href="#" className="hover:text-white transition">Privacy Policy</a></li>
              <li><a href="#" className="hover:text-white transition">Terms of Service</a></li>
            </ul>
          </div>

          {/* Links Col 4 */}
          <div className="space-y-4">
            <h5 className="text-xs font-bold text-white uppercase tracking-wider">Company</h5>
            <ul className="space-y-2 text-xs text-slate-400">
              <li><a href="#" className="hover:text-white transition">About Us</a></li>
              <li><a href="#" className="hover:text-white transition flex items-center">Careers <span className="ml-1.5 text-[8px] bg-purple-500/20 text-purple-300 px-1.5 py-0.5 rounded font-bold uppercase tracking-wider">Hiring</span></a></li>
              <li><a href="#" className="hover:text-white transition">Blog</a></li>
              <li><a href="#" className="hover:text-white transition">Press Kit</a></li>
              <li><a href="#" className="hover:text-white transition">Contact Support</a></li>
            </ul>
          </div>
        </div>

        {/* Bottom Credits */}
        <div className="max-w-7xl mx-auto pt-8 border-t border-white/5 flex flex-col md:flex-row items-center justify-between text-xs text-slate-500 gap-4">
          <span>&copy; {new Date().getFullYear()} Alyla AI Inc. All rights reserved.</span>
          <div className="flex space-x-6">
            <a href="#" className="hover:text-slate-300 transition">Privacy Shield</a>
            <a href="#" className="hover:text-slate-300 transition">CCPA Data Privacy</a>
            <a href="#" className="hover:text-slate-300 transition">GDPR Compliance</a>
          </div>
        </div>
      </footer>

    </div>
  );
}
