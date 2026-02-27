import { useState, useMemo, useEffect } from "react";
import { supabase } from "./supabase";

const TAG_COLORS = {
  "puzzle":         { bg: "#FEF3C7", color: "#92400E", border: "#FDE68A" },
  "strategy":       { bg: "#DBEAFE", color: "#1E40AF", border: "#BFDBFE" },
  "horror":         { bg: "#FCE7F3", color: "#9D174D", border: "#FBCFE8" },
  "co-op":          { bg: "#D1FAE5", color: "#065F46", border: "#A7F3D0" },
  "cozy":           { bg: "#FEF3C7", color: "#78350F", border: "#FDE68A" },
  "pixel art":      { bg: "#EDE9FE", color: "#4C1D95", border: "#DDD6FE" },
  "narrative":      { bg: "#EDE9FE", color: "#4C1D95", border: "#DDD6FE" },
  "story-rich":     { bg: "#EDE9FE", color: "#4C1D95", border: "#DDD6FE" },
  "roguelike":      { bg: "#D1FAE5", color: "#064E3B", border: "#A7F3D0" },
  "racing":         { bg: "#FEE2E2", color: "#7C2D12", border: "#FECACA" },
  "vehicles":       { bg: "#FEF3C7", color: "#78350F", border: "#FDE68A" },
  "awards":         { bg: "#FEF9C3", color: "#713F12", border: "#FEF08A" },
  "retro":          { bg: "#DBEAFE", color: "#1E3A8A", border: "#BFDBFE" },
  "2D":             { bg: "#DBEAFE", color: "#1E3A8A", border: "#BFDBFE" },
  "multiplayer":    { bg: "#D1FAE5", color: "#065F46", border: "#A7F3D0" },
  "simulation":     { bg: "#DBEAFE", color: "#1E40AF", border: "#BFDBFE" },
  "art":            { bg: "#FDF4FF", color: "#701A75", border: "#F5D0FE" },
  "all genres":     { bg: "#F3F4F6", color: "#374151", border: "#E5E7EB" },
  "family-friendly":{ bg: "#D1FAE5", color: "#065F46", border: "#A7F3D0" },
};

function getDaysUntil(deadline) {
  if (!deadline || deadline === "TBA") return null;
  const now = new Date();
  const d = new Date(deadline);
  return Math.ceil((d - now) / (1000 * 60 * 60 * 24));
}

function DeadlineBadge({ deadline }) {
  const days = getDaysUntil(deadline);
  const base = { padding: "4px 12px", borderRadius: 99, fontSize: 11, fontWeight: 700, letterSpacing: "0.04em", display: "inline-block" };
  if (days === null) return <span style={{ ...base, background: "#F3F4F6", color: "#9CA3AF", border: "1px solid #E5E7EB" }}>TBA</span>;
  if (days < 0)  return <span style={{ ...base, background: "#F3F4F6", color: "#D1D5DB", border: "1px solid #E5E7EB" }}>Closed</span>;
  if (days <= 7) return <span style={{ ...base, background: "#FEE2E2", color: "#B91C1C", border: "1px solid #FCA5A5" }}>🔥 {days}d left</span>;
  if (days <= 30) return <span style={{ ...base, background: "#FEF3C7", color: "#92400E", border: "1px solid #FCD34D" }}>⚡ {days}d left</span>;
  return <span style={{ ...base, background: "#D1FAE5", color: "#065F46", border: "1px solid #6EE7B7" }}>✓ {days}d left</span>;
}

const typeEmoji = {
  "Digital Expo": "💻",
  "Digital Awards": "🏆",
  "Physical Expo": "🎪",
};

function FestivalCard({ festival, saved, onToggleSave }) {
  const [hovered, setHovered] = useState(false);
  const days = getDaysUntil(festival.deadline);
  const isOpen = days === null || days >= 0;

  const steamFeature = festival.steam_feature ?? festival.steamFeature;
  const officialUrl = festival.official_url ?? festival.url;
  const tags = Array.isArray(festival.tags) ? festival.tags : [];
  const emoji = typeEmoji[festival.type] || "🎮";

  return (
    <div
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      style={{
        background: "#FFFFFF",
        border: `2px solid ${hovered ? "#FDBA74" : "#FDE68A"}`,
        borderRadius: 20,
        padding: "20px",
        display: "flex",
        flexDirection: "column",
        gap: 12,
        transition: "all 0.2s ease",
        transform: hovered ? "translateY(-3px)" : "none",
        boxShadow: hovered
          ? "0 12px 32px rgba(251, 191, 36, 0.18), 0 2px 8px rgba(0,0,0,0.06)"
          : "0 2px 8px rgba(0,0,0,0.05)",
        opacity: isOpen ? 1 : 0.55,
      }}
    >
      {/* Header */}
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", gap: 8 }}>
        <div style={{ flex: 1 }}>
          <div style={{ display: "flex", alignItems: "center", gap: 6, marginBottom: 6, flexWrap: "wrap" }}>
            <span style={{
              fontSize: 10, fontWeight: 700, letterSpacing: "0.1em",
              color: "#F59E0B", textTransform: "uppercase",
              background: "#FFFBEB", border: "1px solid #FDE68A",
              padding: "2px 8px", borderRadius: 99,
            }}>
              {emoji} {festival.type}
            </span>
            {steamFeature && (
              <span style={{
                fontSize: 10, background: "#EFF6FF", color: "#1D4ED8",
                border: "1px solid #BFDBFE", padding: "2px 8px", borderRadius: 99, fontWeight: 700,
              }}>
                Steam ✓
              </span>
            )}
          </div>
          <h3 style={{
            margin: 0, fontSize: 17, fontWeight: 800, color: "#1C1917",
            fontFamily: "'Nunito', 'Quicksand', sans-serif", lineHeight: 1.25,
          }}>
            {festival.name}
          </h3>
        </div>
        <button
          onClick={() => onToggleSave(festival.id)}
          title={saved ? "Remove from saved" : "Save"}
          style={{
            background: saved ? "#FEF3C7" : "#FAFAF9",
            border: `2px solid ${saved ? "#FCD34D" : "#E7E5E4"}`,
            borderRadius: 12,
            padding: "8px 10px",
            cursor: "pointer",
            fontSize: 18,
            lineHeight: 1,
            color: saved ? "#D97706" : "#A8A29E",
            transition: "all 0.15s",
            flexShrink: 0,
            minWidth: 42,
            minHeight: 42,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
          }}
        >
          {saved ? "★" : "☆"}
        </button>
      </div>

      {/* Description */}
      <p style={{ margin: 0, fontSize: 13, color: "#78716C", lineHeight: 1.65 }}>
        {festival.description}
      </p>

      {/* Tags */}
      {tags.length > 0 && (
        <div style={{ display: "flex", flexWrap: "wrap", gap: 5 }}>
          {tags.map(tag => {
            const c = TAG_COLORS[tag] || { bg: "#F3F4F6", color: "#374151", border: "#E5E7EB" };
            return (
              <span key={tag} style={{
                fontSize: 11, padding: "3px 10px", borderRadius: 99,
                background: c.bg, color: c.color,
                border: `1px solid ${c.border}`,
                fontWeight: 600,
              }}>
                {tag}
              </span>
            );
          })}
        </div>
      )}

      {/* Footer */}
      <div style={{
        display: "flex", justifyContent: "space-between", alignItems: "center",
        marginTop: 4, paddingTop: 12, borderTop: "1px dashed #FDE68A",
        flexWrap: "wrap", gap: 8,
      }}>
        <div style={{ display: "flex", gap: 8, alignItems: "center", flexWrap: "wrap" }}>
          <DeadlineBadge deadline={festival.deadline} />
          {festival.price === "Free"
            ? <span style={{ fontSize: 12, fontWeight: 700, color: "#059669", background: "#D1FAE5", border: "1px solid #6EE7B7", padding: "3px 10px", borderRadius: 99 }}>Free</span>
            : <span style={{ fontSize: 12, fontWeight: 600, color: "#78716C" }}>{festival.price}</span>
          }
        </div>
        <a
          href={officialUrl}
          target="_blank"
          rel="noopener noreferrer"
          style={{
            fontSize: 13, fontWeight: 800, color: "#FFFFFF",
            textDecoration: "none",
            padding: "8px 16px",
            borderRadius: 12,
            background: "linear-gradient(135deg, #F59E0B, #EF4444)",
            boxShadow: "0 2px 8px rgba(245,158,11,0.3)",
            transition: "all 0.15s",
            letterSpacing: "0.02em",
            minHeight: 36,
            display: "inline-flex",
            alignItems: "center",
          }}
          onMouseEnter={e => { e.target.style.transform = "scale(1.05)"; e.target.style.boxShadow = "0 4px 16px rgba(245,158,11,0.4)"; }}
          onMouseLeave={e => { e.target.style.transform = "scale(1)"; e.target.style.boxShadow = "0 2px 8px rgba(245,158,11,0.3)"; }}
        >
          Submit →
        </a>
      </div>
    </div>
  );
}

const PILL_BTN = (active, activeColor = "#F59E0B") => ({
  padding: "10px 16px",
  borderRadius: 99,
  fontSize: 13,
  fontWeight: 700,
  cursor: "pointer",
  background: active ? activeColor : "#FFFFFF",
  color: active ? "#FFFFFF" : "#78716C",
  border: `2px solid ${active ? activeColor : "#E7E5E4"}`,
  transition: "all 0.15s",
  minHeight: 40,
  whiteSpace: "nowrap",
});

export default function FestivalWatch() {
  const [festivals, setFestivals] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [filterFree, setFilterFree] = useState(false);
  const [filterSteam, setFilterSteam] = useState(false);
  const [filterType, setFilterType] = useState("All");
  const [filterOpen, setFilterOpen] = useState(true);
  const [savedIds, setSavedIds] = useState(new Set());
  const [activeTab, setActiveTab] = useState("all");
  const [sortBy, setSortBy] = useState("deadline");

  useEffect(() => {
    supabase
      .from("festivals")
      .select("*")
      .order("deadline", { ascending: true, nullsFirst: false })
      .then(({ data, error }) => {
        if (error) console.error("Supabase error:", error);
        setFestivals(data || []);
        setLoading(false);
      });
  }, []);

  const toggleSave = (id) => {
    setSavedIds(prev => {
      const next = new Set(prev);
      next.has(id) ? next.delete(id) : next.add(id);
      return next;
    });
  };

  const filtered = useMemo(() => {
    let list = festivals;
    if (activeTab === "saved") list = list.filter(f => savedIds.has(f.id));
    if (filterFree) list = list.filter(f => f.price === "Free");
    if (filterSteam) list = list.filter(f => f.steam_feature);
    if (filterType !== "All") list = list.filter(f => f.type === filterType);
    if (filterOpen) list = list.filter(f => { const d = getDaysUntil(f.deadline); return d === null || d >= 0; });
    if (search) {
      const q = search.toLowerCase();
      list = list.filter(f =>
        f.name?.toLowerCase().includes(q) ||
        f.description?.toLowerCase().includes(q)
      );
    }
    list = [...list].sort((a, b) => {
      if (sortBy === "deadline") {
        const da = getDaysUntil(a.deadline) ?? 9999;
        const db = getDaysUntil(b.deadline) ?? 9999;
        return da - db;
      }
      if (sortBy === "name") return a.name.localeCompare(b.name);
      if (sortBy === "price") return (a.price === "Free" ? 0 : 1) - (b.price === "Free" ? 0 : 1);
      return 0;
    });
    return list;
  }, [festivals, search, filterFree, filterSteam, filterType, filterOpen, savedIds, activeTab, sortBy]);

  const openCount = festivals.filter(f => { const d = getDaysUntil(f.deadline); return d === null || d >= 0; }).length;
  const closingSoon = festivals.filter(f => { const d = getDaysUntil(f.deadline); return d !== null && d >= 0 && d <= 30; }).length;

  return (
    <div style={{
      minHeight: "100vh",
      background: "#FFFBF0",
      color: "#1C1917",
      fontFamily: "'Nunito', 'Quicksand', 'Helvetica Neue', sans-serif",
    }}>
      <link href="https://fonts.googleapis.com/css2?family=Nunito:wght@400;600;700;800;900&family=Quicksand:wght@500;600;700&display=swap" rel="stylesheet" />

      {/* Decorative top bar */}
      <div style={{ height: 5, background: "linear-gradient(90deg, #F59E0B, #EF4444, #EC4899, #8B5CF6, #3B82F6, #10B981)" }} />

      {/* Header */}
      <header style={{
        background: "rgba(255, 251, 240, 0.92)",
        borderBottom: "2px solid #FDE68A",
        position: "sticky",
        top: 0,
        zIndex: 100,
        backdropFilter: "blur(12px)",
      }}>
        <div style={{
          maxWidth: 1100, margin: "0 auto",
          padding: "0 16px",
          display: "flex", alignItems: "center", justifyContent: "space-between",
          height: 60, gap: 12,
        }}>
          <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
            <div style={{
              width: 36, height: 36, borderRadius: 12,
              background: "linear-gradient(135deg, #F59E0B, #EF4444)",
              display: "flex", alignItems: "center", justifyContent: "center",
              fontSize: 20, boxShadow: "0 2px 8px rgba(245,158,11,0.4)",
            }}>🎮</div>
            <span style={{
              fontFamily: "'Nunito', sans-serif", fontWeight: 900, fontSize: 20,
              letterSpacing: "-0.02em", color: "#1C1917",
            }}>
              FestivalWatch
            </span>
            <span style={{
              fontSize: 10, color: "#D97706", background: "#FEF3C7",
              border: "1px solid #FCD34D", padding: "2px 8px", borderRadius: 99, fontWeight: 800,
              letterSpacing: "0.08em",
            }}>
              BETA
            </span>
          </div>

          {/* Stats - hide on very small screens via flex wrapping */}
          <div style={{ display: "flex", gap: 12, fontSize: 12, flexShrink: 0, flexWrap: "wrap", justifyContent: "flex-end" }}>
            <span style={{ background: "#D1FAE5", color: "#065F46", padding: "4px 10px", borderRadius: 99, fontWeight: 700, border: "1px solid #6EE7B7" }}>
              {openCount} open
            </span>
            <span style={{ background: "#FEF3C7", color: "#92400E", padding: "4px 10px", borderRadius: 99, fontWeight: 700, border: "1px solid #FCD34D" }}>
              {closingSoon} closing soon
            </span>
            {savedIds.size > 0 && (
              <span style={{ background: "#FEE2E2", color: "#991B1B", padding: "4px 10px", borderRadius: 99, fontWeight: 700, border: "1px solid #FCA5A5" }}>
                ★ {savedIds.size}
              </span>
            )}
          </div>
        </div>
      </header>

      {/* Hero */}
      <div style={{
        maxWidth: 1100, margin: "0 auto",
        padding: "40px 16px 32px",
        borderBottom: "2px dashed #FDE68A",
      }}>
        <div style={{
          display: "inline-block", fontSize: 11, fontWeight: 800,
          letterSpacing: "0.12em", color: "#D97706", textTransform: "uppercase",
          background: "#FEF3C7", border: "2px solid #FCD34D",
          padding: "4px 14px", borderRadius: 99, marginBottom: 18,
        }}>
          🎪 Indie Game Festival Directory
        </div>
        <h1 style={{
          fontFamily: "'Nunito', sans-serif",
          fontSize: "clamp(30px, 6vw, 54px)",
          fontWeight: 900,
          lineHeight: 1.1,
          margin: "0 0 14px",
          letterSpacing: "-0.03em",
          color: "#1C1917",
        }}>
          Find your next<br />
          <span style={{ background: "linear-gradient(90deg, #F59E0B, #EF4444)", WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent" }}>
            festival showcase.
          </span>
          <span style={{ fontSize: "0.7em" }}> 🚀</span>
        </h1>
        <p style={{ fontSize: 15, color: "#78716C", maxWidth: 500, lineHeight: 1.7, margin: 0 }}>
          Curated from the HTMAG community spreadsheet. Browse open submission windows, filter by what matters to you, and get your game seen.
        </p>
      </div>

      {/* Controls */}
      <div style={{ maxWidth: 1100, margin: "0 auto", padding: "20px 16px 0" }}>
        {/* Search + Sort */}
        <div style={{ display: "flex", gap: 10, marginBottom: 14, flexWrap: "wrap" }}>
          <div style={{ position: "relative", flex: "1 1 240px", minWidth: 0 }}>
            <span style={{ position: "absolute", left: 14, top: "50%", transform: "translateY(-50%)", fontSize: 16 }}>🔍</span>
            <input
              value={search}
              onChange={e => setSearch(e.target.value)}
              placeholder="Search festivals..."
              style={{
                width: "100%", padding: "12px 14px 12px 42px",
                background: "#FFFFFF",
                border: "2px solid #FDE68A",
                borderRadius: 14,
                color: "#1C1917", fontSize: 14,
                outline: "none", boxSizing: "border-box",
                fontFamily: "inherit", fontWeight: 600,
                boxShadow: "0 2px 8px rgba(0,0,0,0.04)",
              }}
              onFocus={e => { e.target.style.borderColor = "#F59E0B"; e.target.style.boxShadow = "0 0 0 3px rgba(245,158,11,0.15)"; }}
              onBlur={e => { e.target.style.borderColor = "#FDE68A"; e.target.style.boxShadow = "0 2px 8px rgba(0,0,0,0.04)"; }}
            />
          </div>
          <select
            value={sortBy}
            onChange={e => setSortBy(e.target.value)}
            style={{
              padding: "12px 14px",
              background: "#FFFFFF", border: "2px solid #FDE68A",
              borderRadius: 14, color: "#78716C", fontSize: 13,
              cursor: "pointer", fontFamily: "inherit", fontWeight: 700,
              outline: "none", minHeight: 46,
            }}
          >
            <option value="deadline">⏰ By Deadline</option>
            <option value="name">🔤 By Name</option>
            <option value="price">💚 Free First</option>
          </select>
        </div>

        {/* Scrollable filter pills */}
        <div style={{ overflowX: "auto", paddingBottom: 6, marginBottom: 20, WebkitOverflowScrolling: "touch" }}>
          <div style={{ display: "flex", gap: 8, width: "max-content", paddingRight: 16 }}>
            {/* Tab buttons */}
            <button onClick={() => setActiveTab("all")} style={PILL_BTN(activeTab === "all", "#F59E0B")}>
              All ({festivals.length})
            </button>
            <button onClick={() => setActiveTab("saved")} style={PILL_BTN(activeTab === "saved", "#EF4444")}>
              ★ Saved ({savedIds.size})
            </button>

            {/* Divider */}
            <div style={{ width: 1, background: "#FDE68A", margin: "4px 4px", alignSelf: "stretch" }} />

            {/* Type filters */}
            {["All", "Digital Expo", "Digital Awards", "Physical Expo"].map(t => (
              <button key={t} onClick={() => setFilterType(t)} style={PILL_BTN(filterType === t, "#8B5CF6")}>
                {t === "All" ? "📦 All Types" : t === "Digital Expo" ? "💻 Digital Expo" : t === "Digital Awards" ? "🏆 Awards" : "🎪 Physical"}
              </button>
            ))}

            <div style={{ width: 1, background: "#FDE68A", margin: "4px 4px", alignSelf: "stretch" }} />

            {/* Toggle filters */}
            {[
              { label: "💚 Free only", active: filterFree, onClick: () => setFilterFree(v => !v), color: "#10B981" },
              { label: "🎮 Steam", active: filterSteam, onClick: () => setFilterSteam(v => !v), color: "#3B82F6" },
              { label: "✓ Open Now", active: filterOpen, onClick: () => setFilterOpen(v => !v), color: "#F59E0B" },
            ].map(({ label, active, onClick, color }) => (
              <button key={label} onClick={onClick} style={PILL_BTN(active, color)}>
                {label}
              </button>
            ))}
          </div>
        </div>

        {/* Result count */}
        <div style={{ marginBottom: 16, fontSize: 13, color: "#A8A29E", fontWeight: 600 }}>
          Showing {filtered.length} festival{filtered.length !== 1 ? "s" : ""}
        </div>
      </div>

      {/* Grid */}
      <main style={{ maxWidth: 1100, margin: "0 auto", padding: "0 16px 80px" }}>
        {loading ? (
          <div style={{ textAlign: "center", padding: "80px 0", color: "#A8A29E" }}>
            <div style={{ fontSize: 56, marginBottom: 16, animation: "spin 1s linear infinite" }}>⏳</div>
            <p style={{ fontSize: 16, fontWeight: 700 }}>Loading festivals...</p>
          </div>
        ) : filtered.length === 0 ? (
          <div style={{ textAlign: "center", padding: "80px 24px", color: "#A8A29E" }}>
            <div style={{ fontSize: 56, marginBottom: 16 }}>🎪</div>
            <p style={{ fontSize: 16, fontWeight: 700, color: "#78716C" }}>No festivals found!</p>
            <p style={{ fontSize: 14 }}>Try adjusting your filters.</p>
          </div>
        ) : (
          <div style={{
            display: "grid",
            gridTemplateColumns: "repeat(auto-fill, minmax(min(100%, 340px), 1fr))",
            gap: 14,
          }}>
            {filtered.map(f => (
              <FestivalCard key={f.id} festival={f} saved={savedIds.has(f.id)} onToggleSave={toggleSave} />
            ))}
          </div>
        )}
      </main>

      {/* Footer */}
      <footer style={{
        borderTop: "2px dashed #FDE68A",
        padding: "24px 16px",
        textAlign: "center",
        background: "#FFFBF0",
      }}>
        <p style={{ margin: 0, fontSize: 12, color: "#A8A29E", fontWeight: 600 }}>
          Data sourced from the{" "}
          <a href="https://howtomarketagame.com/festivals" target="_blank" rel="noopener noreferrer"
            style={{ color: "#D97706", textDecoration: "underline", fontWeight: 700 }}>
            HTMAG Worthy Festivals Spreadsheet
          </a>
          {" "}by Chris Zukowski & community. 🎮
        </p>
      </footer>

      <style>{`
        * { box-sizing: border-box; }
        body { margin: 0; }
        ::-webkit-scrollbar { height: 4px; width: 4px; }
        ::-webkit-scrollbar-track { background: #FEF3C7; }
        ::-webkit-scrollbar-thumb { background: #FCD34D; border-radius: 99px; }
        input::placeholder { color: #C4B9B3; }
        @keyframes spin { to { transform: rotate(360deg); } }
        @media (max-width: 480px) {
          h1 { font-size: 28px !important; }
        }
      `}</style>
    </div>
  );
}