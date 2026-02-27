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

const RESPONSIVE_STYLES = `
  *, *::before, *::after { box-sizing: border-box; }
  html, body { margin: 0; padding: 0; overflow-x: hidden; width: 100%; }

  ::-webkit-scrollbar { height: 4px; width: 4px; }
  ::-webkit-scrollbar-track { background: #FEF3C7; }
  ::-webkit-scrollbar-thumb { background: #FCD34D; border-radius: 99px; }
  input::placeholder { color: #C4B9B3; }
  @keyframes spin { to { transform: rotate(360deg); } }

  .fw-root {
    width: 100%; max-width: 100vw; min-height: 100vh;
    background: #FFFBF0; color: #1C1917;
    font-family: 'Nunito', sans-serif;
    overflow-x: hidden;
    text-align: left;
    -webkit-tap-highlight-color: transparent;
  }

  /* ── Header ── */
  .fw-header {
    border-bottom: 2px solid #FDE68A;
    background: rgba(255,251,240,0.95);
    position: sticky; top: 0; z-index: 100;
    backdrop-filter: blur(12px);
  }
  .fw-header-inner {
    max-width: 1100px; margin: 0 auto;
    padding: 0 20px;
    display: flex; align-items: center; justify-content: space-between;
    height: 56px; gap: 8px;
  }
  @media (min-width: 640px) { .fw-header-inner { padding: 0 24px; } }
  .fw-logo { display: flex; align-items: center; gap: 8px; flex-shrink: 0; min-width: 0; }
  .fw-logo-icon {
    width: 32px; height: 32px; border-radius: 10px; flex-shrink: 0;
    background: linear-gradient(135deg, #F59E0B, #EF4444);
    display: flex; align-items: center; justify-content: center; font-size: 17px;
  }
  .fw-logo-text {
    font-weight: 900; font-size: 17px; letter-spacing: -0.02em; color: #1C1917;
    white-space: nowrap;
  }
  @media (min-width: 400px) { .fw-logo-text { font-size: 20px; } }
  .fw-beta {
    font-size: 10px; color: #D97706; background: #FEF3C7;
    border: 1px solid #FCD34D; padding: 2px 7px; border-radius: 99px;
    font-weight: 800; letter-spacing: 0.08em; flex-shrink: 0;
    display: none;
  }
  @media (min-width: 360px) { .fw-beta { display: inline; } }
  .fw-stats { display: flex; gap: 5px; flex-wrap: nowrap; flex-shrink: 0; }
  .fw-stat {
    font-size: 11px; padding: 3px 8px; border-radius: 99px;
    font-weight: 700; white-space: nowrap;
  }
  @media (min-width: 420px) { .fw-stat { font-size: 12px; padding: 4px 10px; } }

  /* ── Hero ── */
  .fw-hero {
    max-width: 1100px; margin: 0 auto;
    padding: 28px 20px 24px;
    border-bottom: 2px dashed #FDE68A;
  }
  @media (min-width: 640px) { .fw-hero { padding: 44px 24px 32px; } }
  .fw-hero h1 {
    font-size: clamp(24px, 6vw, 52px);
    font-weight: 900; line-height: 1.1;
    margin: 12px 0 10px; letter-spacing: -0.03em; color: #1C1917;
  }
  .fw-hero p {
    font-size: 14px; color: #78716C;
    max-width: 500px; line-height: 1.65; margin: 0;
  }
  @media (min-width: 640px) { .fw-hero p { font-size: 15px; } }

  /* ── Controls ── */
  .fw-controls { max-width: 1100px; margin: 0 auto; padding: 18px 20px 0; overflow: hidden; }
  @media (min-width: 640px) { .fw-controls { padding: 22px 24px 0; } }

  /* Search row: stacked on mobile, side-by-side on wider */
  .fw-search-row { display: flex; gap: 8px; margin-bottom: 10px; flex-direction: column; }
  @media (min-width: 480px) { .fw-search-row { flex-direction: row; } }
  .fw-search-wrap { position: relative; flex: 1 1 auto; min-width: 0; }
  .fw-search-icon { position: absolute; left: 13px; top: 50%; transform: translateY(-50%); font-size: 14px; pointer-events: none; }
  .fw-search-input {
    width: 100%; padding: 11px 12px 11px 38px;
    background: #fff; border: 2px solid #FDE68A; border-radius: 12px;
    color: #1C1917; font-size: 14px; outline: none;
    font-family: inherit; font-weight: 600;
  }
  .fw-search-input:focus { border-color: #F59E0B; box-shadow: 0 0 0 3px rgba(245,158,11,0.15); }
  .fw-sort-select {
    padding: 11px 12px; background: #fff; border: 2px solid #FDE68A;
    border-radius: 12px; color: #78716C; font-size: 13px;
    cursor: pointer; font-family: inherit; font-weight: 700; outline: none;
    width: 100%;
  }
  @media (min-width: 480px) { .fw-sort-select { width: auto; flex-shrink: 0; } }

  /* Horizontally scrollable pills — hidden scrollbar */
  .fw-pills-scroll {
    overflow-x: auto; padding-bottom: 6px; margin-bottom: 12px;
    -webkit-overflow-scrolling: touch; scrollbar-width: none;
  }
  .fw-pills-scroll::-webkit-scrollbar { display: none; }
  .fw-pills-inner { display: flex; gap: 6px; width: max-content; }
  .fw-pill {
    padding: 8px 13px; border-radius: 99px; font-size: 12px; font-weight: 700;
    cursor: pointer; border: 2px solid #E7E5E4; background: #fff; color: #78716C;
    transition: all 0.15s; white-space: nowrap;
    min-height: 38px; display: inline-flex; align-items: center;
    font-family: inherit;
  }
  .fw-pill:active { transform: scale(0.96); }
  .fw-pill-divider { width: 1px; background: #FDE68A; margin: 4px 2px; align-self: stretch; flex-shrink: 0; }
  .fw-result-count { font-size: 12px; color: #A8A29E; font-weight: 600; margin-bottom: 12px; }

  /* ── Festival grid ── */
  .fw-main { max-width: 1100px; margin: 0 auto; padding: 0 20px 60px; overflow: hidden; }
  @media (min-width: 640px) { .fw-main { padding: 0 24px 80px; } }

  /* 1 col → 2 col → 3 col */
  .fw-grid { display: grid; grid-template-columns: 1fr; gap: 14px; width: 100%; max-width: 100%; }
  @media (min-width: 700px) { .fw-grid { grid-template-columns: repeat(2, 1fr); } }
  @media (min-width: 1024px) { .fw-grid { grid-template-columns: repeat(3, 1fr); gap: 16px; } }

  /* ── Card ── */
  .fw-card {
    background: #fff; border: 2px solid #FDE68A; border-radius: 18px;
    padding: 18px; display: flex; flex-direction: column; gap: 10px;
    transition: border-color 0.2s, transform 0.2s, box-shadow 0.2s;
    min-width: 0; max-width: 100%; overflow: hidden;
  }
  .fw-card:hover {
    border-color: #FDBA74; transform: translateY(-2px);
    box-shadow: 0 10px 28px rgba(251,191,36,0.15);
  }
  .fw-card-closed { opacity: 0.5; }
  @media (min-width: 640px) { .fw-card { padding: 20px; } }

  .fw-card-header { display: flex; justify-content: space-between; align-items: flex-start; gap: 8px; min-width: 0; max-width: 100%; }
  .fw-card-title-area { flex: 1; min-width: 0; }
  .fw-card-badges { display: flex; align-items: center; gap: 5px; margin-bottom: 5px; flex-wrap: wrap; }
  .fw-card-name {
    margin: 0; font-size: 15px; font-weight: 800; color: #1C1917;
    font-family: 'Nunito', sans-serif; line-height: 1.25;
    overflow-wrap: anywhere; word-break: break-word;
  }
  @media (min-width: 480px) { .fw-card-name { font-size: 17px; } }

  .fw-star {
    flex-shrink: 0; border-radius: 10px; cursor: pointer; font-size: 18px;
    line-height: 1; min-width: 40px; min-height: 40px;
    display: flex; align-items: center; justify-content: center;
    transition: all 0.15s; padding: 0;
  }

  .fw-card-desc {
    margin: 0; font-size: 13px; color: #78716C; line-height: 1.6;
    overflow: hidden; display: -webkit-box;
    -webkit-line-clamp: 3; -webkit-box-orient: vertical;
    overflow-wrap: anywhere; word-break: break-word;
  }

  .fw-tags { display: flex; flex-wrap: wrap; gap: 4px; }
  .fw-tag { font-size: 11px; padding: 3px 9px; border-radius: 99px; font-weight: 600; }

  .fw-card-footer {
    display: flex; justify-content: space-between; align-items: center;
    padding-top: 10px; border-top: 1px dashed #FDE68A;
    flex-wrap: wrap; gap: 8px; margin-top: auto;
  }
  .fw-footer-left { display: flex; gap: 6px; align-items: center; flex-wrap: wrap; }

  .fw-badge {
    padding: 3px 10px; border-radius: 99px; font-size: 11px;
    font-weight: 700; letter-spacing: 0.04em; display: inline-block; white-space: nowrap;
  }
  .fw-submit-btn {
    font-size: 13px; font-weight: 800; color: #fff; text-decoration: none;
    padding: 8px 16px; border-radius: 12px;
    background: linear-gradient(135deg, #F59E0B, #EF4444);
    box-shadow: 0 2px 8px rgba(245,158,11,0.3);
    transition: all 0.15s; display: inline-flex; align-items: center;
    white-space: nowrap; min-height: 36px;
  }
  .fw-submit-btn:hover { transform: scale(1.04); box-shadow: 0 4px 16px rgba(245,158,11,0.4); }
  .fw-submit-btn:active { transform: scale(0.97); }

  /* ── Footer ── */
  .fw-footer { border-top: 2px dashed #FDE68A; padding: 24px 20px; text-align: center; background: #FFFBF0; }
  @media (min-width: 640px) { .fw-footer { padding: 28px 24px; } }
  .fw-footer p { margin: 0; font-size: 12px; color: #A8A29E; font-weight: 600; }
`;

function getDaysUntil(deadline) {
  if (!deadline || deadline === "TBA") return null;
  const now = new Date();
  const d = new Date(deadline);
  return Math.ceil((d - now) / (1000 * 60 * 60 * 24));
}

function DeadlineBadge({ deadline }) {
  const days = getDaysUntil(deadline);
  if (days === null) return <span className="fw-badge" style={{ background: "#F3F4F6", color: "#9CA3AF", border: "1px solid #E5E7EB" }}>TBA</span>;
  if (days < 0)      return <span className="fw-badge" style={{ background: "#F3F4F6", color: "#D1D5DB", border: "1px solid #E5E7EB" }}>Closed</span>;
  if (days <= 7)     return <span className="fw-badge" style={{ background: "#FEE2E2", color: "#B91C1C", border: "1px solid #FCA5A5" }}>🔥 {days}d left</span>;
  if (days <= 30)    return <span className="fw-badge" style={{ background: "#FEF3C7", color: "#92400E", border: "1px solid #FCD34D" }}>⚡ {days}d left</span>;
  return               <span className="fw-badge" style={{ background: "#D1FAE5", color: "#065F46", border: "1px solid #6EE7B7" }}>✓ {days}d left</span>;
}

const typeEmoji = { "Digital Expo": "💻", "Digital Awards": "🏆", "Physical Expo": "🎪" };

// If description is just a raw URL, don't render it
function isRawUrl(str) {
  if (!str) return true;
  const t = str.trim();
  return /^https?:\/\//i.test(t) || t.includes("docs.google.com/forms") || t.includes(",https://");
}

function FestivalCard({ festival, saved, onToggleSave }) {
  const days = getDaysUntil(festival.deadline);
  const isOpen = days === null || days >= 0;
  const steamFeature = festival.steam_feature ?? festival.steamFeature;
  const officialUrl = festival.official_url ?? festival.url;
  const tags = Array.isArray(festival.tags) ? festival.tags : [];
  const emoji = typeEmoji[festival.type] || "🎮";
  const hasDesc = festival.description && !isRawUrl(festival.description);

  return (
    <div className={`fw-card${isOpen ? "" : " fw-card-closed"}`}>
      {/* Header */}
      <div className="fw-card-header">
        <div className="fw-card-title-area">
          <div className="fw-card-badges">
            <span style={{
              fontSize: 10, fontWeight: 700, letterSpacing: "0.08em",
              color: "#D97706", textTransform: "uppercase",
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
          <h3 className="fw-card-name">{festival.name}</h3>
        </div>
        <button
          onClick={() => onToggleSave(festival.id)}
          className="fw-star"
          title={saved ? "Remove" : "Save"}
          style={{
            background: saved ? "#FEF3C7" : "#FAFAF9",
            border: `2px solid ${saved ? "#FCD34D" : "#E7E5E4"}`,
            color: saved ? "#D97706" : "#A8A29E",
          }}
        >
          {saved ? "★" : "☆"}
        </button>
      </div>

      {/* Description — only show if not a raw URL */}
      {hasDesc && <p className="fw-card-desc">{festival.description}</p>}

      {/* Tags */}
      {tags.length > 0 && (
        <div className="fw-tags">
          {tags.map(tag => {
            const c = TAG_COLORS[tag] || { bg: "#F3F4F6", color: "#374151", border: "#E5E7EB" };
            return (
              <span key={tag} className="fw-tag" style={{ background: c.bg, color: c.color, border: `1px solid ${c.border}` }}>
                {tag}
              </span>
            );
          })}
        </div>
      )}

      {/* Footer */}
      <div className="fw-card-footer">
        <div className="fw-footer-left">
          <DeadlineBadge deadline={festival.deadline} />
          {festival.price === "Free"
            ? <span className="fw-badge" style={{ background: "#D1FAE5", color: "#059669", border: "1px solid #6EE7B7" }}>Free</span>
            : festival.price && <span style={{ fontSize: 12, fontWeight: 600, color: "#78716C" }}>{festival.price}</span>
          }
        </div>
        <a href={officialUrl} target="_blank" rel="noopener noreferrer" className="fw-submit-btn">
          Submit →
        </a>
      </div>
    </div>
  );
}

function Pill({ label, active, onClick, activeColor = "#F59E0B" }) {
  return (
    <button
      onClick={onClick}
      className="fw-pill"
      style={active ? { background: activeColor, color: "#fff", border: `2px solid ${activeColor}` } : {}}
    >
      {label}
    </button>
  );
}

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
      list = list.filter(f => f.name?.toLowerCase().includes(q) || f.description?.toLowerCase().includes(q));
    }
    return [...list].sort((a, b) => {
      if (sortBy === "deadline") return (getDaysUntil(a.deadline) ?? 9999) - (getDaysUntil(b.deadline) ?? 9999);
      if (sortBy === "name") return a.name.localeCompare(b.name);
      if (sortBy === "price") return (a.price === "Free" ? 0 : 1) - (b.price === "Free" ? 0 : 1);
      return 0;
    });
  }, [festivals, search, filterFree, filterSteam, filterType, filterOpen, savedIds, activeTab, sortBy]);

  const openCount = festivals.filter(f => { const d = getDaysUntil(f.deadline); return d === null || d >= 0; }).length;
  const closingSoon = festivals.filter(f => { const d = getDaysUntil(f.deadline); return d !== null && d >= 0 && d <= 30; }).length;

  return (
    <div className="fw-root">
      <link href="https://fonts.googleapis.com/css2?family=Nunito:wght@400;600;700;800;900&display=swap" rel="stylesheet" />
      <style>{RESPONSIVE_STYLES}</style>

      {/* Rainbow stripe */}
      <div style={{ height: 4, background: "linear-gradient(90deg, #F59E0B, #EF4444, #EC4899, #8B5CF6, #3B82F6, #10B981)" }} />

      {/* Header */}
      <header className="fw-header">
        <div className="fw-header-inner">
          <div className="fw-logo">
            <div className="fw-logo-icon">🎮</div>
            <span className="fw-logo-text">FestivalWatch</span>
            <span className="fw-beta">BETA</span>
          </div>
          <div className="fw-stats">
            <span className="fw-stat" style={{ background: "#D1FAE5", color: "#065F46", border: "1px solid #6EE7B7" }}>
              {openCount} open
            </span>
            <span className="fw-stat" style={{ background: "#FEF3C7", color: "#92400E", border: "1px solid #FCD34D" }}>
              ⚡ {closingSoon}
            </span>
            {savedIds.size > 0 && (
              <span className="fw-stat" style={{ background: "#FEE2E2", color: "#991B1B", border: "1px solid #FCA5A5" }}>
                ★ {savedIds.size}
              </span>
            )}
          </div>
        </div>
      </header>

      {/* Hero */}
      <div className="fw-hero">
        <div style={{
          display: "inline-block", fontSize: 10, fontWeight: 800,
          letterSpacing: "0.12em", color: "#D97706", textTransform: "uppercase",
          background: "#FEF3C7", border: "2px solid #FCD34D",
          padding: "3px 12px", borderRadius: 99,
        }}>
          🎪 Indie Game Festival Directory
        </div>
        <h1>
          Find your next<br />
          <span style={{ background: "linear-gradient(90deg, #F59E0B, #EF4444)", WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent" }}>
            festival showcase.
          </span>
          {" "}🚀
        </h1>
        <p>
          Curated from the HTMAG community spreadsheet.<br />
          Browse open submissions, apply, and get your game seen.<br />
          Created by <a href="https://x.com/rotub" target="_blank">@rotub</a> with ❤️ for indie devs.
        </p>
      </div>

      {/* Grid */}
      <main className="fw-main">
        {loading ? (
          <div style={{ textAlign: "center", padding: "80px 0", color: "#A8A29E" }}>
            <div style={{ fontSize: 48, marginBottom: 16 }}>⏳</div>
            <p style={{ fontSize: 16, fontWeight: 700 }}>Loading festivals...</p>
          </div>
        ) : filtered.length === 0 ? (
          <div style={{ textAlign: "center", padding: "60px 24px", color: "#A8A29E" }}>
            <div style={{ fontSize: 48, marginBottom: 12 }}>🎪</div>
            <p style={{ fontSize: 16, fontWeight: 700, color: "#78716C", margin: "0 0 4px" }}>No festivals found!</p>
            <p style={{ fontSize: 14, margin: 0 }}>Try adjusting your filters.</p>
          </div>
        ) : (
          <div className="fw-grid">
            {filtered.map(f => (
              <FestivalCard key={f.id} festival={f} saved={savedIds.has(f.id)} onToggleSave={toggleSave} />
            ))}
          </div>
        )}
      </main>

      {/* Footer */}
      <footer className="fw-footer">
        <p>
          Data sourced from the{" "}
          <a href="https://howtomarketagame.com/festivals" target="_blank" rel="noopener noreferrer"
            style={{ color: "#D97706", textDecoration: "underline", fontWeight: 700 }}>
            HTMAG Worthy Festivals Spreadsheet
          </a>
          {" "}by Chris Zukowski & community. 🎮
        </p>
      </footer>
    </div>
  );
}