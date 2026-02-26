import { useState, useMemo, useEffect } from "react";
import { supabase } from "./supabase";

const TAG_COLORS = {
  "puzzle": "#7C3AED", "strategy": "#1D4ED8", "horror": "#991B1B", "co-op": "#065F46",
  "cozy": "#92400E", "pixel art": "#1E3A5F", "narrative": "#4C1D95", "story-rich": "#4C1D95",
  "roguelike": "#064E3B", "racing": "#7C2D12", "vehicles": "#78350F", "awards": "#713F12",
  "retro": "#1E3A5F", "2D": "#1E3A5F", "multiplayer": "#065F46", "simulation": "#1E40AF",
  "art": "#701A75", "all genres": "#374151", "family-friendly": "#065F46",
};

function getDaysUntil(deadline) {
  if (!deadline || deadline === "TBA") return null;
  const now = new Date();
  const d = new Date(deadline);
  return Math.ceil((d - now) / (1000 * 60 * 60 * 24));
}

function DeadlineBadge({ deadline }) {
  const days = getDaysUntil(deadline);
  if (days === null) return <span style={{ background: "#1F2937", color: "#9CA3AF", padding: "3px 10px", borderRadius: 20, fontSize: 11, fontWeight: 600, letterSpacing: "0.05em" }}>TBA</span>;
  if (days < 0) return <span style={{ background: "#1F2937", color: "#6B7280", padding: "3px 10px", borderRadius: 20, fontSize: 11, fontWeight: 600 }}>CLOSED</span>;
  if (days <= 7) return <span style={{ background: "#7F1D1D", color: "#FCA5A5", padding: "3px 10px", borderRadius: 20, fontSize: 11, fontWeight: 700, letterSpacing: "0.08em" }}>🔥 {days}d LEFT</span>;
  if (days <= 30) return <span style={{ background: "#78350F", color: "#FCD34D", padding: "3px 10px", borderRadius: 20, fontSize: 11, fontWeight: 600 }}>⚡ {days}d left</span>;
  return <span style={{ background: "#14532D", color: "#86EFAC", padding: "3px 10px", borderRadius: 20, fontSize: 11, fontWeight: 600 }}>{days}d left</span>;
}

function FestivalCard({ festival, saved, onToggleSave }) {
  const [hovered, setHovered] = useState(false);
  const days = getDaysUntil(festival.deadline);
  const isOpen = days === null || days >= 0;

  // DB uses snake_case, so map accordingly
  const steamFeature = festival.steam_feature ?? festival.steamFeature;
  const officialUrl = festival.official_url ?? festival.url;
  const tags = Array.isArray(festival.tags) ? festival.tags : [];

  return (
    <div
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      style={{
        background: hovered ? "#161B27" : "#0F1420",
        border: `1px solid ${hovered ? "#2D3A54" : "#1C2333"}`,
        borderRadius: 16,
        padding: "24px 24px 20px",
        display: "flex",
        flexDirection: "column",
        gap: 14,
        transition: "all 0.2s ease",
        transform: hovered ? "translateY(-2px)" : "none",
        boxShadow: hovered ? "0 8px 32px rgba(0,0,0,0.4)" : "none",
        opacity: isOpen ? 1 : 0.55,
        cursor: "default",
        position: "relative",
      }}
    >
      {/* Header */}
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", gap: 8 }}>
        <div style={{ flex: 1 }}>
          <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 4 }}>
            <span style={{ fontSize: 10, fontWeight: 700, letterSpacing: "0.12em", color: "#4B5563", textTransform: "uppercase" }}>
              {festival.type}
            </span>
            {steamFeature && (
              <span style={{ fontSize: 10, background: "#1B2838", color: "#66B0F4", padding: "2px 7px", borderRadius: 4, fontWeight: 600 }}>
                STEAM ✓
              </span>
            )}
          </div>
          <h3 style={{ margin: 0, fontSize: 17, fontWeight: 700, color: "#F1F5F9", fontFamily: "'Syne', sans-serif", lineHeight: 1.3 }}>
            {festival.name}
          </h3>
        </div>
        <button
          onClick={() => onToggleSave(festival.id)}
          title={saved ? "Remove from saved" : "Save festival"}
          style={{
            background: saved ? "rgba(250, 204, 21, 0.12)" : "transparent",
            border: `1px solid ${saved ? "#854D0E" : "#1C2333"}`,
            borderRadius: 8,
            padding: "6px 8px",
            cursor: "pointer",
            fontSize: 16,
            lineHeight: 1,
            color: saved ? "#FCD34D" : "#4B5563",
            transition: "all 0.15s",
            flexShrink: 0,
          }}
        >
          {saved ? "★" : "☆"}
        </button>
      </div>

      {/* Description */}
      <p style={{ margin: 0, fontSize: 13, color: "#6B7280", lineHeight: 1.6 }}>
        {festival.description}
      </p>

      {/* Tags */}
      {tags.length > 0 && (
        <div style={{ display: "flex", flexWrap: "wrap", gap: 6 }}>
          {tags.map(tag => (
            <span key={tag} style={{
              fontSize: 11,
              padding: "3px 9px",
              borderRadius: 20,
              background: `${TAG_COLORS[tag] || "#374151"}33`,
              color: "#94A3B8",
              border: `1px solid ${TAG_COLORS[tag] || "#374151"}55`,
              fontWeight: 500,
            }}>
              {tag}
            </span>
          ))}
        </div>
      )}

      {/* Footer */}
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginTop: 4, paddingTop: 14, borderTop: "1px solid #1C2333" }}>
        <div style={{ display: "flex", gap: 12, alignItems: "center" }}>
          <DeadlineBadge deadline={festival.deadline} />
          <span style={{ fontSize: 12, color: "#4B5563", fontWeight: 500 }}>
            {festival.price === "Free"
              ? <span style={{ color: "#4ADE80" }}>Free</span>
              : <span style={{ color: "#D1D5DB" }}>{festival.price}</span>}
          </span>
          <span style={{ fontSize: 12, color: "#4B5563" }}>{festival.month}</span>
        </div>
        <a
          href={officialUrl}
          target="_blank"
          rel="noopener noreferrer"
          style={{
            fontSize: 12,
            fontWeight: 700,
            color: "#3B82F6",
            textDecoration: "none",
            padding: "6px 14px",
            border: "1px solid #1D4ED855",
            borderRadius: 8,
            background: "#1D4ED811",
            transition: "all 0.15s",
            letterSpacing: "0.04em",
          }}
          onMouseEnter={e => { e.target.style.background = "#1D4ED833"; e.target.style.borderColor = "#3B82F6"; }}
          onMouseLeave={e => { e.target.style.background = "#1D4ED811"; e.target.style.borderColor = "#1D4ED855"; }}
        >
          Submit →
        </a>
      </div>
    </div>
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
      if (sortBy === "price") {
        return (a.price === "Free" ? 0 : 1) - (b.price === "Free" ? 0 : 1);
      }
      return 0;
    });
    return list;
  }, [festivals, search, filterFree, filterSteam, filterType, filterOpen, savedIds, activeTab, sortBy]);

  const openCount = festivals.filter(f => { const d = getDaysUntil(f.deadline); return d === null || d >= 0; }).length;
  const closingSoon = festivals.filter(f => { const d = getDaysUntil(f.deadline); return d !== null && d >= 0 && d <= 30; }).length;

  return (
    <div style={{
      minHeight: "100vh",
      background: "#080C14",
      color: "#E2E8F0",
      fontFamily: "'DM Sans', 'Helvetica Neue', sans-serif",
    }}>
      <link href="https://fonts.googleapis.com/css2?family=Syne:wght@600;700;800&family=DM+Sans:wght@400;500;600&display=swap" rel="stylesheet" />

      {/* Header */}
      <header style={{
        borderBottom: "1px solid #1C2333",
        background: "#080C14",
        position: "sticky",
        top: 0,
        zIndex: 100,
        backdropFilter: "blur(12px)",
      }}>
        <div style={{ maxWidth: 1200, margin: "0 auto", padding: "0 24px", display: "flex", alignItems: "center", justifyContent: "space-between", height: 64 }}>
          <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
            <div style={{
              width: 32, height: 32, borderRadius: 8,
              background: "linear-gradient(135deg, #3B82F6, #8B5CF6)",
              display: "flex", alignItems: "center", justifyContent: "center",
              fontSize: 16,
            }}>🎮</div>
            <span style={{ fontFamily: "'Syne', sans-serif", fontWeight: 800, fontSize: 20, letterSpacing: "-0.02em", color: "#F8FAFC" }}>
              FestivalWatch
            </span>
            <span style={{ fontSize: 11, color: "#4B5563", background: "#0F1420", border: "1px solid #1C2333", padding: "2px 8px", borderRadius: 20, fontWeight: 600 }}>
              BETA
            </span>
          </div>
          <div style={{ display: "flex", gap: 20, fontSize: 13, color: "#6B7280" }}>
            <span><span style={{ color: "#4ADE80", fontWeight: 700 }}>{openCount}</span> open</span>
            <span><span style={{ color: "#FCD34D", fontWeight: 700 }}>{closingSoon}</span> closing soon</span>
            <span><span style={{ color: "#94A3B8", fontWeight: 700 }}>{savedIds.size}</span> saved</span>
          </div>
        </div>
      </header>

      {/* Hero */}
      <div style={{ maxWidth: 1200, margin: "0 auto", padding: "64px 24px 40px", borderBottom: "1px solid #1C2333" }}>
        <div style={{
          display: "inline-block",
          fontSize: 11, fontWeight: 700, letterSpacing: "0.14em",
          color: "#3B82F6", textTransform: "uppercase",
          background: "#1D4ED811", border: "1px solid #1D4ED833",
          padding: "4px 12px", borderRadius: 20, marginBottom: 20,
        }}>
          Indie Game Festival Directory
        </div>
        <h1 style={{
          fontFamily: "'Syne', sans-serif",
          fontSize: "clamp(36px, 5vw, 60px)",
          fontWeight: 800,
          lineHeight: 1.05,
          margin: "0 0 16px",
          letterSpacing: "-0.03em",
          color: "#F8FAFC",
        }}>
          Find your next<br />
          <span style={{ background: "linear-gradient(90deg, #3B82F6, #8B5CF6)", WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent" }}>
            festival showcase.
          </span>
        </h1>
        <p style={{ fontSize: 16, color: "#6B7280", maxWidth: 540, lineHeight: 1.7, margin: 0 }}>
          Curated from the HTMAG community spreadsheet. Browse open submission windows, filter by what matters to you, and get your game in front of players.
        </p>
      </div>

      {/* Controls */}
      <div style={{ maxWidth: 1200, margin: "0 auto", padding: "24px 24px 0" }}>
        <div style={{ display: "flex", gap: 12, marginBottom: 16, flexWrap: "wrap" }}>
          <div style={{ position: "relative", flex: "1 1 280px" }}>
            <span style={{ position: "absolute", left: 14, top: "50%", transform: "translateY(-50%)", color: "#4B5563", fontSize: 16 }}>🔍</span>
            <input
              value={search}
              onChange={e => setSearch(e.target.value)}
              placeholder="Search by name, genre, keyword..."
              style={{
                width: "100%", padding: "11px 14px 11px 40px",
                background: "#0F1420", border: "1px solid #1C2333",
                borderRadius: 10, color: "#E2E8F0", fontSize: 14,
                outline: "none", boxSizing: "border-box",
                fontFamily: "inherit",
              }}
            />
          </div>
          <select
            value={sortBy}
            onChange={e => setSortBy(e.target.value)}
            style={{
              padding: "11px 14px", background: "#0F1420", border: "1px solid #1C2333",
              borderRadius: 10, color: "#94A3B8", fontSize: 13, cursor: "pointer",
              fontFamily: "inherit", outline: "none",
            }}
          >
            <option value="deadline">Sort: Deadline</option>
            <option value="name">Sort: Name</option>
            <option value="price">Sort: Free First</option>
          </select>
        </div>

        <div style={{ display: "flex", gap: 8, flexWrap: "wrap", marginBottom: 24, alignItems: "center" }}>
          {["all", "saved"].map(tab => (
            <button key={tab} onClick={() => setActiveTab(tab)} style={{
              padding: "7px 16px", borderRadius: 8, fontSize: 13, fontWeight: 600, cursor: "pointer",
              background: activeTab === tab ? "#1D4ED8" : "#0F1420",
              color: activeTab === tab ? "#fff" : "#6B7280",
              border: `1px solid ${activeTab === tab ? "#1D4ED8" : "#1C2333"}`,
              transition: "all 0.15s",
            }}>
              {tab === "all" ? `All (${festivals.length})` : `Saved (${savedIds.size})`}
            </button>
          ))}

          <div style={{ width: 1, height: 24, background: "#1C2333", margin: "0 4px" }} />

          {["All", "Digital Expo", "Digital Awards", "Physical Expo"].map(t => (
            <button key={t} onClick={() => setFilterType(t)} style={{
              padding: "7px 14px", borderRadius: 8, fontSize: 12, fontWeight: 600, cursor: "pointer",
              background: filterType === t ? "#14532D22" : "#0F1420",
              color: filterType === t ? "#4ADE80" : "#6B7280",
              border: `1px solid ${filterType === t ? "#14532D" : "#1C2333"}`,
              transition: "all 0.15s",
            }}>
              {t}
            </button>
          ))}

          <div style={{ width: 1, height: 24, background: "#1C2333", margin: "0 4px" }} />

          {[
            { label: "Free only", active: filterFree, onClick: () => setFilterFree(v => !v) },
            { label: "Steam Feature", active: filterSteam, onClick: () => setFilterSteam(v => !v) },
            { label: "Open Now", active: filterOpen, onClick: () => setFilterOpen(v => !v) },
          ].map(({ label, active, onClick }) => (
            <button key={label} onClick={onClick} style={{
              padding: "7px 14px", borderRadius: 8, fontSize: 12, fontWeight: 600, cursor: "pointer",
              background: active ? "#3B82F611" : "#0F1420",
              color: active ? "#60A5FA" : "#6B7280",
              border: `1px solid ${active ? "#1D4ED855" : "#1C2333"}`,
              transition: "all 0.15s",
            }}>
              {active ? "✓ " : ""}{label}
            </button>
          ))}

          <span style={{ marginLeft: "auto", fontSize: 12, color: "#4B5563" }}>
            {filtered.length} result{filtered.length !== 1 ? "s" : ""}
          </span>
        </div>
      </div>

      {/* Grid */}
      <main style={{ maxWidth: 1200, margin: "0 auto", padding: "0 24px 80px" }}>
        {loading ? (
          <div style={{ textAlign: "center", padding: "80px 0", color: "#4B5563" }}>
            <div style={{ fontSize: 48, marginBottom: 16 }}>⏳</div>
            <p style={{ fontSize: 16 }}>Loading festivals...</p>
          </div>
        ) : filtered.length === 0 ? (
          <div style={{ textAlign: "center", padding: "80px 0", color: "#4B5563" }}>
            <div style={{ fontSize: 48, marginBottom: 16 }}>🎪</div>
            <p style={{ fontSize: 16 }}>No festivals found. Try adjusting your filters.</p>
          </div>
        ) : (
          <div style={{
            display: "grid",
            gridTemplateColumns: "repeat(auto-fill, minmax(340px, 1fr))",
            gap: 16,
          }}>
            {filtered.map(f => (
              <FestivalCard key={f.id} festival={f} saved={savedIds.has(f.id)} onToggleSave={toggleSave} />
            ))}
          </div>
        )}
      </main>

      {/* Footer */}
      <footer style={{ borderTop: "1px solid #1C2333", padding: "24px", textAlign: "center" }}>
        <p style={{ margin: 0, fontSize: 12, color: "#374151" }}>
          Data sourced from the{" "}
          <a href="https://howtomarketagame.com/festivals" target="_blank" rel="noopener noreferrer" style={{ color: "#4B5563", textDecoration: "underline" }}>
            HTMAG Worthy Festivals Spreadsheet
          </a>
          {" "}by Chris Zukowski & community.
        </p>
      </footer>
    </div>
  );
}