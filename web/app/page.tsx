"use client";

import { useRouter } from "next/navigation";
import { useState, useEffect, useRef, useCallback } from "react";
import Link from "next/link";

interface Place { display_name: string; lat: string; lon: string; }

const FEATURES = [
  {
    category: "Core Management",
    accent: "#00d4ff",
    items: [
      { icon: "🏢", title: "Property Management" },
      { icon: "👋", title: "Resident Onboarding" },
      { icon: "🛏️", title: "Room Allocation" },
      { icon: "🔧", title: "Maintenance Requests" },
      { icon: "💳", title: "Payment Tracking" }
    ]
  },
  {
    category: "Automation",
    accent: "#a78bfa",
    items: [
      { icon: "⚡", title: "Automated Rent Generation" },
      { icon: "🚨", title: "Overdue Payment Detection" },
      { icon: "🔔", title: "Automated Reminders" },
      { icon: "⏱️", title: "Scheduled System Tasks" }
    ]
  },
  {
    category: "Intelligence (Unique)",
    accent: "#f59e0b",
    items: [
      { icon: "📈", title: "Revenue Forecasting" },
      { icon: "🔮", title: "Occupancy Prediction" },
      { icon: "⚠️", title: "Churn Risk Detection" },
      { icon: "🛠️", title: "Maintenance Forecasting" },
      { icon: "🧠", title: "Operational Insights" }
    ]
  },
  {
    category: "Real-Time",
    accent: "#34d399",
    items: [
      { icon: "📲", title: "Instant Notifications" },
      { icon: "📜", title: "Activity Logs" },
      { icon: "🎯", title: "Event Tracking" },
      { icon: "📊", title: "Live Dashboards" }
    ]
  }
];

const STATS = [
  { value: "2,400+", label: "Active Beds" },
  { value: "98.2%", label: "Uptime SLA" },
  { value: "₹4.2Cr", label: "Rent Processed" },
  { value: "<340ms", label: "Avg Response" },
];

const TESTIMONIALS = [
  { name: "Ravi Kumar", role: "PG Owner · Bangalore", quote: "TAGT cut my rent collection time from 3 days to 3 minutes. It's a completely different game." },
  { name: "Priya Sharma", role: "Portfolio Owner · Pune", quote: "Managing 4 PGs used to be a nightmare. Now I check everything in one dashboard over morning coffee." },
  { name: "Arjun Mehta", role: "Co-Living Operator · Hyderabad", quote: "The automated late fees alone paid for the platform in the first month." },
];

export default function LandingPage() {
  const router = useRouter();
  const [query, setQuery] = useState("");
  const [suggestions, setSuggestions] = useState<Place[]>([]);
  const [selectedPlace, setSelectedPlace] = useState<Place | null>(null);
  const [showDropdown, setShowDropdown] = useState(false);
  const [type, setType] = useState("");
  const [mounted, setMounted] = useState(false);
  const [scrollY, setScrollY] = useState(0);
  const [activeTestimonial, setActiveTestimonial] = useState(0);
  const debounceRef = useRef<NodeJS.Timeout | null>(null);
  const wrapperRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    // 🚀 Defer mounted state to avoid synchronous cascading renders
    Promise.resolve().then(() => setMounted(true));

    const onScroll = () => setScrollY(window.scrollY);
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  // Auto rotate testimonials
  useEffect(() => {
    const iv = setInterval(() => setActiveTestimonial(v => (v + 1) % TESTIMONIALS.length), 4000);
    return () => clearInterval(iv);
  }, []);

  useEffect(() => {
    function onClickOutside(e: MouseEvent) {
      if (wrapperRef.current && !wrapperRef.current.contains(e.target as Node)) setShowDropdown(false);
    }
    document.addEventListener("mousedown", onClickOutside);
    return () => document.removeEventListener("mousedown", onClickOutside);
  }, []);

  const fetchSuggestions = useCallback(async (q: string) => {
    if (q.length < 2) { setSuggestions([]); return; }
    try {
      const res = await fetch(`/api/geocode?q=${encodeURIComponent(q)}`);
      const data: Place[] = await res.json();
      setSuggestions(data);
      setShowDropdown(data.length > 0);
    } catch { setSuggestions([]); }
  }, []);

  function onQueryChange(e: React.ChangeEvent<HTMLInputElement>) {
    const val = e.target.value;
    setQuery(val); setSelectedPlace(null);
    if (debounceRef.current) clearTimeout(debounceRef.current);
    debounceRef.current = setTimeout(() => fetchSuggestions(val), 350);
  }

  function selectPlace(place: Place) {
    setQuery(place.display_name.split(",").slice(0, 2).join(", "));
    setSelectedPlace(place); setSuggestions([]); setShowDropdown(false);
  }

  function handleSearch(e: React.FormEvent) {
    e.preventDefault();
    if (!query.trim()) return;
    const params = new URLSearchParams({ location: query, type });
    if (selectedPlace) { params.set("lat", selectedPlace.lat); params.set("lng", selectedPlace.lon); }
    router.push(`/search?${params.toString()}`);
  }

  const navBg = scrollY > 40
    ? "rgba(4,7,12,0.92)"
    : "transparent";

  return (
    <div style={{ minHeight: "100vh", background: "#04070c", color: "#f0f4f8", fontFamily: "'Inter', sans-serif", overflowX: "hidden" }}>

      {/* ─── Ambient orbs ─── */}
      <div style={{ position: "fixed", inset: 0, pointerEvents: "none", zIndex: 0, overflow: "hidden" }}>
        <div style={{
          position: "absolute", top: "-20vh", left: "10%",
          width: "60vw", height: "60vw", borderRadius: "50%",
          background: "radial-gradient(circle, rgba(0,180,255,0.10) 0%, transparent 70%)",
          filter: "blur(40px)", transform: `translateY(${scrollY * 0.15}px)`,
          transition: "transform 0.1s linear",
        }} />
        <div style={{
          position: "absolute", top: "30vh", right: "-15%",
          width: "50vw", height: "50vw", borderRadius: "50%",
          background: "radial-gradient(circle, rgba(139,92,246,0.09) 0%, transparent 70%)",
          filter: "blur(50px)", transform: `translateY(${scrollY * -0.08}px)`,
          transition: "transform 0.1s linear",
        }} />
        <div style={{
          position: "absolute", bottom: "10vh", left: "20%",
          width: "40vw", height: "40vw", borderRadius: "50%",
          background: "radial-gradient(circle, rgba(245,158,11,0.06) 0%, transparent 70%)",
          filter: "blur(60px)",
        }} />
        {/* Fine grid */}
        <div style={{
          position: "absolute", inset: 0,
          backgroundImage: "linear-gradient(rgba(255,255,255,0.025) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.025) 1px, transparent 1px)",
          backgroundSize: "80px 80px",
        }} />
      </div>

      {/* ─── Nav ─── */}
      <nav style={{
        position: "fixed", top: 0, left: 0, right: 0, zIndex: 100,
        padding: "0 40px", height: "68px",
        display: "flex", alignItems: "center", justifyContent: "space-between",
        background: navBg,
        backdropFilter: scrollY > 40 ? "blur(28px)" : "none",
        WebkitBackdropFilter: scrollY > 40 ? "blur(28px)" : "none",
        borderBottom: scrollY > 40 ? "1px solid rgba(255,255,255,0.06)" : "1px solid transparent",
        transition: "all 0.4s ease",
      }}>
        <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
          <div style={{
            width: "32px", height: "32px", borderRadius: "10px",
            background: "linear-gradient(135deg, #00d4ff, #0066cc)",
            display: "flex", alignItems: "center", justifyContent: "center",
            boxShadow: "0 0 16px rgba(0,212,255,0.35)",
          }}>
            <span style={{ color: "#000", fontWeight: 900, fontSize: "14px" }}>T</span>
          </div>
          <span style={{ fontWeight: 800, fontSize: "20px", letterSpacing: "-0.03em", background: "linear-gradient(135deg, #ffffff, #a0b4cc)", WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent" }}>
            TAGT
          </span>
        </div>
        <div style={{ display: "flex", alignItems: "center", gap: "6px" }}>
          <Link href="/login" style={{
            padding: "9px 20px", borderRadius: "10px", fontSize: "13px", fontWeight: 500,
            color: "rgba(255,255,255,0.7)", textDecoration: "none",
            transition: "all 0.2s",
          }}
            onMouseEnter={e => (e.currentTarget as HTMLElement).style.color = "#fff"}
            onMouseLeave={e => (e.currentTarget as HTMLElement).style.color = "rgba(255,255,255,0.7)"}
          >Sign In</Link>
          <Link href="/signup" style={{
            padding: "9px 22px", borderRadius: "10px", fontSize: "13px", fontWeight: 600,
            background: "linear-gradient(135deg, #00d4ff, #0066cc)",
            color: "#000", textDecoration: "none",
            boxShadow: "0 0 20px rgba(0,212,255,0.3)",
            transition: "all 0.25s",
          }}
            onMouseEnter={e => { (e.currentTarget as HTMLElement).style.transform = "translateY(-1px)"; (e.currentTarget as HTMLElement).style.boxShadow = "0 4px 28px rgba(0,212,255,0.45)"; }}
            onMouseLeave={e => { (e.currentTarget as HTMLElement).style.transform = "translateY(0)"; (e.currentTarget as HTMLElement).style.boxShadow = "0 0 20px rgba(0,212,255,0.3)"; }}
          >Get Started →</Link>
        </div>
      </nav>

      {/* ─── Hero ─── */}
      <section style={{
        minHeight: "100vh", display: "flex", flexDirection: "column",
        alignItems: "center", justifyContent: "center",
        padding: "120px 24px 80px",
        position: "relative", zIndex: 1,
        textAlign: "center",
      }}>

        {/* Eyebrow */}
        <div style={{
          opacity: mounted ? 1 : 0, transform: mounted ? "translateY(0)" : "translateY(16px)",
          transition: "all 0.7s ease", marginBottom: "28px",
        }}>
          <span style={{
            display: "inline-flex", alignItems: "center", gap: "8px",
            padding: "7px 16px", borderRadius: "100px",
            border: "1px solid rgba(0,212,255,0.22)",
            background: "rgba(0,212,255,0.06)",
            fontSize: "11px", fontWeight: 600, letterSpacing: "0.12em",
            color: "#00d4ff",
          }}>
            <span style={{ width: "6px", height: "6px", borderRadius: "50%", background: "#00d4ff", boxShadow: "0 0 10px #00d4ff", display: "inline-block" }} />
            AI POWERED PROPERTY OPERATIONS PLATFORM
          </span>
        </div>

        {/* Headline */}
        <h1 style={{
          fontSize: "clamp(48px, 9vw, 92px)",
          fontWeight: 900,
          letterSpacing: "-0.04em",
          lineHeight: 1.05,
          marginBottom: "28px",
          maxWidth: "1100px",
          opacity: mounted ? 1 : 0,
          transform: mounted ? "translateY(0)" : "translateY(20px)",
          transition: "all 0.8s ease 0.1s",
        }}>
          <span style={{ background: "linear-gradient(135deg, #ffffff 30%, #a0b4cc)", WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent" }}>
            The New Standard in
          </span>
          <br />
          <span style={{
            background: "linear-gradient(135deg, #00d4ff 0%, #0099ff 40%, #a855f7 100%)",
            WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent",
            filter: "drop-shadow(0 0 40px rgba(0,180,255,0.3))",
          }}>
            Property Operations
          </span>
        </h1>

        {/* Subheading */}
        <p style={{
          fontSize: "clamp(18px, 2.5vw, 24px)", color: "rgba(255,255,255,0.65)",
          maxWidth: "680px", lineHeight: 1.5, marginBottom: "52px",
          opacity: mounted ? 1 : 0, transform: mounted ? "translateY(0)" : "translateY(20px)",
          transition: "all 0.8s ease 0.2s",
          fontWeight: 500,
        }}>
          Manage properties. Automate operations. Predict revenue.
        </p>

        {/* Search box - Keeping for SEO/discovery but moving down a bit */}
        <form onSubmit={handleSearch} style={{
          display: "flex", gap: "0", flexWrap: "wrap", justifyContent: "center",
          borderRadius: "18px",
          border: "1px solid rgba(255,255,255,0.1)",
          background: "rgba(255,255,255,0.04)",
          backdropFilter: "blur(24px)", WebkitBackdropFilter: "blur(24px)",
          marginBottom: "72px",
          width: "100%", maxWidth: "680px",
          overflow: "hidden",
          boxShadow: "0 8px 60px rgba(0,0,0,0.5), inset 0 1px 0 rgba(255,255,255,0.06)",
          opacity: mounted ? 1 : 0, transform: mounted ? "translateY(0)" : "translateY(20px)",
          transition: "all 0.8s ease 0.3s",
          position: "relative",
        }}>
          <div ref={wrapperRef} style={{ flex: 1, minWidth: "180px", position: "relative" }}>
            <input
              placeholder="📍 Search for properties to rent…"
              value={query}
              onChange={onQueryChange}
              onFocus={() => suggestions.length > 0 && setShowDropdown(true)}
              autoComplete="off"
              required
              style={{
                width: "100%", background: "transparent", border: "none", outline: "none",
                color: "#fff", fontFamily: "inherit", fontSize: "15px",
                padding: "16px 18px", caretColor: "#00d4ff",
              }}
            />
            {showDropdown && suggestions.length > 0 && (
              <ul style={{
                position: "absolute", top: "calc(100% + 8px)", left: 0, right: 0,
                background: "rgba(8,14,24,0.98)", border: "1px solid rgba(255,255,255,0.1)",
                borderRadius: "14px", boxShadow: "0 20px 60px rgba(0,0,0,0.7)",
                padding: "6px", zIndex: 200, listStyle: "none",
                maxHeight: "260px", overflowY: "auto",
              }}>
                {suggestions.map((s, i) => (
                  <li key={i}
                    onMouseDown={e => { e.preventDefault(); selectPlace(s); }}
                    style={{
                      padding: "10px 14px", borderRadius: "9px", cursor: "pointer",
                      fontSize: "13px", color: "rgba(255,255,255,0.7)",
                      display: "flex", gap: "10px", alignItems: "flex-start",
                    }}
                    onMouseEnter={e => (e.currentTarget as HTMLElement).style.background = "rgba(0,212,255,0.08)"}
                    onMouseLeave={e => (e.currentTarget as HTMLElement).style.background = "transparent"}
                  >
                    <span style={{ opacity: 0.5, flexShrink: 0 }}>📍</span>
                    <span style={{ lineHeight: 1.4 }}>{s.display_name}</span>
                  </li>
                ))}
              </ul>
            )}
          </div>

          <button type="submit" style={{
            flexShrink: 0, margin: "8px",
            padding: "10px 24px", borderRadius: "12px",
            background: "linear-gradient(135deg, #00d4ff, #0066cc)",
            color: "#000", border: "none", cursor: "pointer",
            fontSize: "14px", fontWeight: 700, fontFamily: "inherit",
            boxShadow: "0 0 20px rgba(0,212,255,0.4)",
            transition: "all 0.2s",
            display: "flex", alignItems: "center", gap: "6px",
          }}
            onMouseEnter={e => { (e.currentTarget as HTMLElement).style.transform = "scale(1.03)"; (e.currentTarget as HTMLElement).style.boxShadow = "0 0 30px rgba(0,212,255,0.6)"; }}
            onMouseLeave={e => { (e.currentTarget as HTMLElement).style.transform = "scale(1)"; (e.currentTarget as HTMLElement).style.boxShadow = "0 0 20px rgba(0,212,255,0.4)"; }}
          >
            Search
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
              <circle cx="11" cy="11" r="8" /><path d="m21 21-4.35-4.35" />
            </svg>
          </button>
        </form>

        {/* Stats */}
        <div style={{
          display: "flex", gap: "64px", flexWrap: "wrap", justifyContent: "center",
          opacity: mounted ? 1 : 0, transform: mounted ? "translateY(0)" : "translateY(20px)",
          transition: "all 0.8s ease 0.45s",
        }}>
          {STATS.map(s => (
            <div key={s.label} style={{ textAlign: "center" }}>
              <div style={{
                fontSize: "clamp(24px, 3vw, 32px)", fontWeight: 800,
                letterSpacing: "-0.04em",
                background: "linear-gradient(135deg, #ffffff, #a0c4e0)",
                WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent",
              }}>{s.value}</div>
              <div style={{ fontSize: "11px", color: "rgba(255,255,255,0.38)", letterSpacing: "0.1em", textTransform: "uppercase", marginTop: "4px", fontWeight: 500 }}>{s.label}</div>
            </div>
          ))}
        </div>

        {/* Scroll hint */}
        <div style={{
          position: "absolute", bottom: "36px", left: "50%", transform: "translateX(-50%)",
          display: "flex", flexDirection: "column", alignItems: "center", gap: "6px",
          color: "rgba(255,255,255,0.2)", fontSize: "11px", letterSpacing: "0.1em",
          animation: "bounceY 2s ease-in-out infinite",
        }}>
          <span>SCROLL</span>
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <path d="M12 5v14M5 12l7 7 7-7" />
          </svg>
        </div>
      </section>

      {/* ─── Divider ─── */}
      <div style={{ height: "1px", background: "linear-gradient(90deg, transparent, rgba(0,212,255,0.15), transparent)", margin: "0 40px" }} />

      {/* ─── Platform Capabilities (Repositioned) ─── */}
      <section style={{ padding: "120px 40px", position: "relative", zIndex: 1, maxWidth: "1280px", margin: "0 auto" }}>
        <div style={{ textAlign: "center", marginBottom: "80px" }}>
          <div style={{ fontSize: "10px", fontWeight: 700, letterSpacing: "0.2em", color: "#00d4ff", textTransform: "uppercase", marginBottom: "16px" }}>
            The AI Platform Advantage
          </div>
          <h2 style={{
            fontSize: "clamp(32px, 5vw, 56px)", fontWeight: 900,
            letterSpacing: "-0.04em", lineHeight: 1.1,
            background: "linear-gradient(135deg, #fff 50%, #6090b0)",
            WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent",
            marginBottom: "20px"
          }}>
            Built to scale your portfolio.
          </h2>
          <p style={{ color: "rgba(255,255,255,0.45)", fontSize: "18px", maxWidth: "680px", margin: "0 auto" }}>
            Move beyond messy spreadsheets. Our unified platform combines core management with advanced AI intelligence to maximize your operational efficiency and minimize revenue leaks.
          </p>
        </div>

        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(280px, 1fr))", gap: "24px" }}>
          {FEATURES.map((category, i) => (
            <div
              key={category.category}
              style={{
                padding: "36px 32px",
                borderRadius: "24px",
                border: "1px solid rgba(255,255,255,0.07)",
                background: "rgba(255,255,255,0.02)",
                backdropFilter: "blur(10px)",
                transition: "all 0.35s ease",
                position: "relative", overflow: "hidden",
                display: "flex", flexDirection: "column"
              }}
              onMouseEnter={e => {
                const el = e.currentTarget as HTMLElement;
                el.style.borderColor = `${category.accent}30`;
                el.style.background = `linear-gradient(180deg, ${category.accent}0a, rgba(255,255,255,0.02))`;
                el.style.transform = "translateY(-4px)";
                el.style.boxShadow = `0 20px 60px rgba(0,0,0,0.4), inset 0 1px 0 rgba(255,255,255,0.05)`;
              }}
              onMouseLeave={e => {
                const el = e.currentTarget as HTMLElement;
                el.style.borderColor = "rgba(255,255,255,0.07)";
                el.style.background = "rgba(255,255,255,0.02)";
                el.style.transform = "translateY(0)";
                el.style.boxShadow = "none";
              }}
            >
              <div style={{
                position: "absolute", top: 0, left: 0,
                width: "100%", height: "2px",
                background: `linear-gradient(90deg, ${category.accent}, transparent)`,
                opacity: 0.5
              }} />

              <h3 style={{ fontSize: "20px", fontWeight: 800, marginBottom: "28px", letterSpacing: "-0.02em", color: "#fff", display: "flex", alignItems: "center", gap: "10px" }}>
                <span style={{ width: "8px", height: "8px", borderRadius: "50%", background: category.accent, display: "inline-block", boxShadow: `0 0 10px ${category.accent}` }} />
                {category.category}
              </h3>

              <ul style={{ listStyle: "none", padding: 0, margin: 0, display: "flex", flexDirection: "column", gap: "16px", flex: 1 }}>
                {category.items.map(item => (
                  <li key={item.title} style={{ display: "flex", alignItems: "center", gap: "12px", color: "rgba(255,255,255,0.7)", fontSize: "15px", fontWeight: 500 }}>
                    <span style={{ fontSize: "18px", opacity: 0.9 }}>{item.icon}</span>
                    {item.title}
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>
      </section>

      {/* ─── Divider ─── */}
      <div style={{ height: "1px", background: "linear-gradient(90deg, transparent, rgba(139,92,246,0.15), transparent)", margin: "0 40px" }} />

      {/* ─── Testimonials ─── */}
      <section style={{ padding: "120px 40px", position: "relative", zIndex: 1, maxWidth: "900px", margin: "0 auto", textAlign: "center" }}>
        <div style={{ fontSize: "10px", fontWeight: 700, letterSpacing: "0.2em", color: "#a78bfa", textTransform: "uppercase", marginBottom: "16px" }}>
          Trusted by Operators
        </div>
        <h2 style={{
          fontSize: "clamp(28px, 4vw, 44px)", fontWeight: 900, letterSpacing: "-0.04em",
          marginBottom: "60px",
          background: "linear-gradient(135deg, #fff 50%, #7090a0)",
          WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent",
        }}>What operators are saying</h2>

        <div style={{ position: "relative", minHeight: "160px" }}>
          {TESTIMONIALS.map((t, i) => (
            <div
              key={t.name}
              style={{
                position: i === 0 ? "relative" : "absolute",
                top: 0, left: 0, right: 0,
                opacity: activeTestimonial === i ? 1 : 0,
                transform: activeTestimonial === i ? "translateY(0) scale(1)" : "translateY(10px) scale(0.98)",
                transition: "all 0.5s ease",
                pointerEvents: activeTestimonial === i ? "auto" : "none",
              }}
            >
              <blockquote style={{
                fontSize: "clamp(17px, 2.5vw, 22px)", lineHeight: 1.65,
                color: "rgba(255,255,255,0.85)", fontStyle: "italic",
                fontWeight: 400, marginBottom: "28px",
              }}>
                &ldquo;{t.quote}&rdquo;
              </blockquote>
              <div style={{ display: "flex", alignItems: "center", justifyContent: "center", gap: "12px" }}>
                <div style={{
                  width: "38px", height: "38px", borderRadius: "50%",
                  background: "linear-gradient(135deg, #00d4ff, #a78bfa)",
                  display: "flex", alignItems: "center", justifyContent: "center",
                  fontSize: "16px", fontWeight: 700, color: "#000",
                }}>
                  {t.name[0]}
                </div>
                <div style={{ textAlign: "left" }}>
                  <div style={{ fontSize: "14px", fontWeight: 700, color: "#fff" }}>{t.name}</div>
                  <div style={{ fontSize: "12px", color: "rgba(255,255,255,0.4)" }}>{t.role}</div>
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Dots */}
        <div style={{ display: "flex", justifyContent: "center", gap: "8px", marginTop: "40px" }}>
          {TESTIMONIALS.map((_, i) => (
            <button
              key={i}
              onClick={() => setActiveTestimonial(i)}
              style={{
                width: activeTestimonial === i ? "24px" : "8px",
                height: "8px", borderRadius: "4px",
                background: activeTestimonial === i ? "#00d4ff" : "rgba(255,255,255,0.2)",
                border: "none", cursor: "pointer",
                transition: "all 0.3s ease",
                boxShadow: activeTestimonial === i ? "0 0 10px rgba(0,212,255,0.5)" : "none",
              }}
            />
          ))}
        </div>
      </section>

      {/* ─── Divider ─── */}
      <div style={{ height: "1px", background: "linear-gradient(90deg, transparent, rgba(245,158,11,0.15), transparent)", margin: "0 40px" }} />

      {/* ─── Pricing ─── */}
      <section style={{ padding: "120px 40px", position: "relative", zIndex: 1, maxWidth: "1100px", margin: "0 auto" }}>
        <div style={{ textAlign: "center", marginBottom: "80px" }}>
          <div style={{ fontSize: "10px", fontWeight: 700, letterSpacing: "0.2em", color: "#f59e0b", textTransform: "uppercase", marginBottom: "16px" }}>
            Transparent Pricing
          </div>
          <h2 style={{
            fontSize: "clamp(32px, 5vw, 56px)", fontWeight: 900,
            letterSpacing: "-0.04em", lineHeight: 1.1,
            background: "linear-gradient(135deg, #fff 50%, #d0b060)",
            WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent",
            marginBottom: "20px"
          }}>
            Pay as you grow.
          </h2>
          <p style={{ color: "rgba(255,255,255,0.45)", fontSize: "18px", maxWidth: "600px", margin: "0 auto" }}>
            Start for free. Upgrade when your portfolio demands it.
          </p>
        </div>

        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(300px, 1fr))", gap: "24px", alignItems: "center" }}>
          {/* Free Tier */}
          <div style={{
            padding: "40px 32px", borderRadius: "24px",
            border: "1px solid rgba(255,255,255,0.07)",
            background: "rgba(255,255,255,0.02)",
            backdropFilter: "blur(10px)",
          }}>
            <h3 style={{ fontSize: "20px", fontWeight: 700, marginBottom: "8px", color: "rgba(255,255,255,0.6)" }}>Starter</h3>
            <div style={{ fontSize: "40px", fontWeight: 800, letterSpacing: "-0.04em", marginBottom: "24px", color: "#fff" }}>Free</div>
            <ul style={{ listStyle: "none", padding: 0, margin: "0 0 32px", display: "flex", flexDirection: "column", gap: "12px" }}>
              {["Up to 10 Rooms", "Up to 20 Residents", "Basic Maintenance Tracker", "Manual Billing"].map(f => (
                <li key={f} style={{ fontSize: "14px", color: "rgba(255,255,255,0.5)", display: "flex", gap: "10px" }}>
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="rgba(255,255,255,0.4)" strokeWidth="2.5" style={{ flexShrink: 0 }}><polyline points="20 6 9 17 4 12" /></svg>
                  {f}
                </li>
              ))}
            </ul>
            <Link href="/signup" style={{
              display: "block", textAlign: "center", width: "100%", padding: "14px", borderRadius: "12px",
              background: "rgba(255,255,255,0.05)", border: "1px solid rgba(255,255,255,0.1)",
              color: "#fff", textDecoration: "none", fontWeight: 600, fontSize: "14px", transition: "var(--transition)"
            }}>Get Started</Link>
          </div>

          {/* Pro Tier (Highlighted) */}
          <div style={{
            padding: "48px 32px", borderRadius: "24px", position: "relative",
            border: "1px solid rgba(0,212,255,0.3)",
            background: "linear-gradient(145deg, rgba(0,212,255,0.06), rgba(8,14,24,0.9))",
            boxShadow: "0 20px 80px rgba(0,0,0,0.6), inset 0 1px 0 rgba(255,255,255,0.1)",
            transform: "scale(1.05)", zIndex: 10,
          }}>
            <div style={{ position: "absolute", top: "-12px", left: "50%", transform: "translateX(-50%)", background: "linear-gradient(135deg, #00d4ff, #0066cc)", color: "#000", fontWeight: 800, fontSize: "11px", letterSpacing: "0.1em", padding: "4px 12px", borderRadius: "100px", textTransform: "uppercase", boxShadow: "0 4px 12px rgba(0,212,255,0.3)" }}>
              Most Popular
            </div>
            <h3 style={{ fontSize: "20px", fontWeight: 700, marginBottom: "8px", color: "#00d4ff" }}>Professional</h3>
            <div style={{ fontSize: "48px", fontWeight: 800, letterSpacing: "-0.04em", marginBottom: "8px", color: "#fff" }}>₹999<span style={{ fontSize: "16px", color: "rgba(255,255,255,0.4)", fontWeight: 500 }}>/mo</span></div>
            <p style={{ fontSize: "13px", color: "rgba(255,255,255,0.4)", marginBottom: "28px" }}>Billed monthly, cancel anytime.</p>
            <ul style={{ listStyle: "none", padding: 0, margin: "0 0 32px", display: "flex", flexDirection: "column", gap: "12px" }}>
              {["Up to 100 Rooms & 500 Residents", "Automated Rent Invoicing", "Auto-Late Fee Calculation", "Email & SMS Reminders", "Financial Analytics Dashboard"].map(f => (
                <li key={f} style={{ fontSize: "14px", color: "rgba(255,255,255,0.8)", display: "flex", gap: "10px" }}>
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#00d4ff" strokeWidth="2.5" style={{ flexShrink: 0 }}><polyline points="20 6 9 17 4 12" /></svg>
                  {f}
                </li>
              ))}
            </ul>
            <Link href="/signup" style={{
              display: "block", textAlign: "center", width: "100%", padding: "16px", borderRadius: "12px",
              background: "linear-gradient(135deg, #00d4ff, #0066cc)", border: "none",
              color: "#000", textDecoration: "none", fontWeight: 700, fontSize: "14px",
              boxShadow: "0 8px 30px rgba(0,212,255,0.3)"
            }}>Start 14-Day Free Trial</Link>
          </div>

          {/* Enterprise Tier */}
          <div style={{
            padding: "40px 32px", borderRadius: "24px",
            border: "1px solid rgba(255,255,255,0.07)",
            background: "rgba(255,255,255,0.02)",
            backdropFilter: "blur(10px)",
          }}>
            <h3 style={{ fontSize: "20px", fontWeight: 700, marginBottom: "8px", color: "#a78bfa" }}>Enterprise</h3>
            <div style={{ fontSize: "40px", fontWeight: 800, letterSpacing: "-0.04em", marginBottom: "8px", color: "#fff" }}>₹2,999<span style={{ fontSize: "16px", color: "rgba(255,255,255,0.4)", fontWeight: 500 }}>/mo</span></div>
            <p style={{ fontSize: "13px", color: "rgba(255,255,255,0.4)", marginBottom: "28px" }}>For large operators.</p>
            <ul style={{ listStyle: "none", padding: 0, margin: "0 0 32px", display: "flex", flexDirection: "column", gap: "12px" }}>
              {["Unlimited Properties & Rooms", "Unlimited Residents", "Revenue Leak Detection", "Prioritized 24/7 Support", "Custom API Integrations"].map(f => (
                <li key={f} style={{ fontSize: "14px", color: "rgba(255,255,255,0.5)", display: "flex", gap: "10px" }}>
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#a78bfa" strokeWidth="2.5" style={{ flexShrink: 0 }}><polyline points="20 6 9 17 4 12" /></svg>
                  {f}
                </li>
              ))}
            </ul>
            <Link href="/signup" style={{
              display: "block", textAlign: "center", width: "100%", padding: "14px", borderRadius: "12px",
              background: "rgba(167,139,250,0.1)", border: "1px solid rgba(167,139,250,0.2)",
              color: "#a78bfa", textDecoration: "none", fontWeight: 600, fontSize: "14px"
            }}>Go Enterprise</Link>
          </div>
        </div>
      </section>

      {/* ─── CTA ─── */}
      <section style={{ padding: "80px 40px 140px", position: "relative", zIndex: 1, textAlign: "center" }}>
        <div style={{
          maxWidth: "680px", margin: "0 auto",
          padding: "72px 48px",
          borderRadius: "32px",
          border: "1px solid rgba(0,212,255,0.15)",
          background: "linear-gradient(145deg, rgba(0,212,255,0.04), rgba(139,92,246,0.06))",
          boxShadow: "0 40px 120px rgba(0,0,0,0.5), inset 0 1px 0 rgba(255,255,255,0.05)",
          position: "relative", overflow: "hidden",
        }}>
          {/* Background glow */}
          <div style={{
            position: "absolute", top: "-50%", left: "50%", transform: "translateX(-50%)",
            width: "500px", height: "300px", borderRadius: "50%",
            background: "radial-gradient(circle, rgba(0,180,255,0.06) 0%, transparent 70%)",
            filter: "blur(40px)", pointerEvents: "none",
          }} />

          <div style={{
            display: "inline-flex", alignItems: "center", gap: "8px",
            padding: "6px 14px", borderRadius: "100px",
            border: "1px solid rgba(245,158,11,0.3)",
            background: "rgba(245,158,11,0.06)",
            fontSize: "11px", fontWeight: 600, color: "#f59e0b",
            letterSpacing: "0.1em", marginBottom: "28px",
          }}>
            ✦ LAUNCH YOUR PROPERTY TODAY
          </div>

          <h2 style={{
            fontSize: "clamp(32px, 5vw, 52px)", fontWeight: 900,
            letterSpacing: "-0.04em", lineHeight: 1.1, marginBottom: "18px",
            background: "linear-gradient(135deg, #fff, #90b8d0)",
            WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent",
          }}>
            Ready to run your PG<br />like a CEO?
          </h2>
          <p style={{ color: "rgba(255,255,255,0.45)", fontSize: "16px", lineHeight: 1.75, marginBottom: "40px" }}>
            Join hundreds of PG operators who have automated their operations with TAGT.
          </p>

          <div style={{ display: "flex", gap: "12px", justifyContent: "center", flexWrap: "wrap" }}>
            <Link href="/signup" style={{
              padding: "16px 40px", borderRadius: "14px", fontSize: "15px", fontWeight: 700,
              background: "linear-gradient(135deg, #00d4ff, #0066cc)",
              color: "#000", textDecoration: "none",
              boxShadow: "0 8px 40px rgba(0,212,255,0.4)",
              transition: "all 0.25s", display: "inline-block",
            }}
              onMouseEnter={e => { (e.currentTarget as HTMLElement).style.transform = "translateY(-2px)"; (e.currentTarget as HTMLElement).style.boxShadow = "0 12px 50px rgba(0,212,255,0.55)"; }}
              onMouseLeave={e => { (e.currentTarget as HTMLElement).style.transform = "translateY(0)"; (e.currentTarget as HTMLElement).style.boxShadow = "0 8px 40px rgba(0,212,255,0.4)"; }}
            >
              Start Free — No Card Needed →
            </Link>
            <Link href="/login" style={{
              padding: "16px 32px", borderRadius: "14px", fontSize: "15px", fontWeight: 600,
              border: "1px solid rgba(255,255,255,0.12)",
              color: "rgba(255,255,255,0.75)", textDecoration: "none",
              transition: "all 0.2s", display: "inline-block",
            }}
              onMouseEnter={e => { (e.currentTarget as HTMLElement).style.borderColor = "rgba(255,255,255,0.25)"; (e.currentTarget as HTMLElement).style.color = "#fff"; }}
              onMouseLeave={e => { (e.currentTarget as HTMLElement).style.borderColor = "rgba(255,255,255,0.12)"; (e.currentTarget as HTMLElement).style.color = "rgba(255,255,255,0.75)"; }}
            >Sign In</Link>
          </div>
        </div>
      </section>

      {/* ─── Footer ─── */}
      <footer style={{
        padding: "32px 40px",
        borderTop: "1px solid rgba(255,255,255,0.05)",
        display: "flex", alignItems: "center", justifyContent: "space-between",
        color: "rgba(255,255,255,0.28)", fontSize: "13px",
        position: "relative", zIndex: 1,
        flexWrap: "wrap", gap: "16px",
      }}>
        <span style={{ fontWeight: 800, letterSpacing: "-0.02em", fontSize: "16px", color: "rgba(255,255,255,0.45)" }}>TAGT</span>
        <span>© {new Date().getFullYear()} TAGT — Property Management Platform</span>
        <div style={{ display: "flex", gap: "24px" }}>
          <Link href="/login" style={{ color: "rgba(255,255,255,0.28)", textDecoration: "none", transition: "color 0.2s" }}
            onMouseEnter={e => (e.currentTarget as HTMLElement).style.color = "#fff"}
            onMouseLeave={e => (e.currentTarget as HTMLElement).style.color = "rgba(255,255,255,0.28)"}
          >Login</Link>
          <Link href="/signup" style={{ color: "rgba(255,255,255,0.28)", textDecoration: "none", transition: "color 0.2s" }}
            onMouseEnter={e => (e.currentTarget as HTMLElement).style.color = "#fff"}
            onMouseLeave={e => (e.currentTarget as HTMLElement).style.color = "rgba(255,255,255,0.28)"}
          >Sign Up</Link>
        </div>
      </footer>

      <style>{`
        @keyframes bounceY {
          0%, 100% { transform: translateX(-50%) translateY(0); }
          50% { transform: translateX(-50%) translateY(6px); }
        }
        ::placeholder { color: rgba(255,255,255,0.28) !important; }
        * { box-sizing: border-box; }
      `}</style>
    </div>
  );
}