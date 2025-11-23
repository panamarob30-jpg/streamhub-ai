import React, { useEffect, useMemo, useState } from "react";
import { aiSearch, getAIRecommendations } from "./api";
import { getKodiService } from "./kodi-service";

const DEFAULT_SERVICES = [
  { id: "netflix", name: "Netflix", url: "https://www.netflix.com/browse" },
  { id: "prime", name: "Prime Video", url: "https://www.primevideo.com/" },
  { id: "max", name: "Max", url: "https://www.max.com/" },
  { id: "hulu", name: "Hulu", url: "https://www.hulu.com/hub/home" },
  { id: "disney", name: "Disney+", url: "https://www.disneyplus.com/home" },
  { id: "apple", name: "Apple TV+", url: "https://tv.apple.com/" },
  { id: "paramount", name: "Paramount+", url: "https://www.paramountplus.com/" },
  { id: "peacock", name: "Peacock", url: "https://www.peacocktv.com/" },
  { id: "plexdiscover", name: "Plex Discover", url: "https://app.plex.tv/desktop/#!/discover" },
  { id: "plex", name: "Plex Web", url: "https://app.plex.tv/" },
  { id: "starz", name: "Starz", url: "https://www.starz.com/" },
  { id: "showtime", name: "Showtime", url: "https://www.showtime.com/" }
];

const PROVIDER_SEARCH = {
  justwatch: (q) => `https://www.justwatch.com/us/search?q=${encodeURIComponent(q)}`,
  reelgood: (q) => `https://reelgood.com/search?q=${encodeURIComponent(q)}`,
  netflix: (q) => `https://www.netflix.com/search?q=${encodeURIComponent(q)}`,
  prime: (q) => `https://www.primevideo.com/search/ref=atv_nb_sr?phrase=${encodeURIComponent(q)}`,
  hulu: (q) => `https://www.hulu.com/search?q=${encodeURIComponent(q)}`,
  max: (q) => `https://www.max.com/search?q=${encodeURIComponent(q)}`,
  disney: (q) => `https://www.disneyplus.com/search?q=${encodeURIComponent(q)}`,
  apple: (q) => `https://tv.apple.com/search?term=${encodeURIComponent(q)}`,
  paramount: (q) => `https://www.paramountplus.com/search/${encodeURIComponent(q)}/`,
  peacock: (q) => `https://www.peacocktv.com/search?query=${encodeURIComponent(q)}`,
  plexdiscover: (q) => `https://app.plex.tv/desktop/#!/discover?query=${encodeURIComponent(q)}`
};

function useLocalState(key, initial) {
  const [value, setValue] = useState(() => {
    try {
      const raw = localStorage.getItem(key);
      return raw ? JSON.parse(raw) : initial;
    } catch {
      return initial;
    }
  });
  useEffect(() => {
    try { localStorage.setItem(key, JSON.stringify(value)); } catch {}
  }, [key, value]);
  return [value, setValue];
}

function Badge({ children }) {
  return <span className="badge">{children}</span>;
}

function Progress({ value = 0 }) {
  const safe = Math.min(100, Math.max(0, value));
  return (
    <div className="progress">
      <div className="progress-bar" style={{ width: `${safe}%` }} />
    </div>
  );
}

export default function App() {
  const [services, setServices] = useLocalState("streamhub.services", DEFAULT_SERVICES);
  const [enabled, setEnabled] = useLocalState(
    "streamhub.enabled",
    Object.fromEntries(DEFAULT_SERVICES.map((s) => [s.id, true]))
  );
  const [query, setQuery] = useState("");
  const [newData, setNewData] = useState(null);
  const [cwData, setCwData] = useState(null);
  const [loadingNew, setLoadingNew] = useState(false);
  const [loadingCW, setLoadingCW] = useState(false);
  const [aiSearchResults, setAiSearchResults] = useState(null);
  const [aiSearchLoading, setAiSearchLoading] = useState(false);
  const [aiRecommendations, setAiRecommendations] = useState(null);
  const [aiRecsLoading, setAiRecsLoading] = useState(false);
  const [searchMode, setSearchMode] = useState("unified"); // "unified" or "ai"
  const [tvMode, setTvMode] = useLocalState("streamhub.tvMode", false);
  const [isListening, setIsListening] = useState(false);

  // Kodi Integration
  const [kodiHost, setKodiHost] = useLocalState("streamhub.kodiHost", "localhost");
  const [kodiPort, setKodiPort] = useLocalState("streamhub.kodiPort", "8080");
  const [kodiUsername, setKodiUsername] = useLocalState("streamhub.kodiUsername", "");
  const [kodiPassword, setKodiPassword] = useLocalState("streamhub.kodiPassword", "");
  const [kodiConnected, setKodiConnected] = useState(false);
  const [kodiLibrary, setKodiLibrary] = useState([]);
  const [kodiLoading, setKodiLoading] = useState(false);
  const [showKodiSettings, setShowKodiSettings] = useState(false);

  const activeServices = useMemo(
    () => services.filter((s) => enabled[s.id]),
    [services, enabled]
  );

  // Load optional feeds
  useEffect(() => {
    (async () => {
      setLoadingNew(true);
      try {
        const r = await fetch("/data/new-this-week.json", { cache: "no-store" });
        if (r.ok) setNewData(await r.json());
      } catch {}
      setLoadingNew(false);
    })();
  }, []);
  useEffect(() => {
    (async () => {
      setLoadingCW(true);
      try {
        const r = await fetch("/data/continue-watching.json", { cache: "no-store" });
        if (r.ok) setCwData(await r.json());
      } catch {}
      setLoadingCW(false);
    })();
  }, []);

  // D-pad/Keyboard navigation for TV mode
  useEffect(() => {
    if (!tvMode) return;

    const handleKeyDown = (e) => {
      const focusable = Array.from(document.querySelectorAll('button, a, input, [tabindex="0"]'));
      const currentIndex = focusable.indexOf(document.activeElement);

      switch (e.key) {
        case "ArrowDown":
        case "ArrowRight":
          e.preventDefault();
          if (currentIndex < focusable.length - 1) {
            focusable[currentIndex + 1]?.focus();
          }
          break;
        case "ArrowUp":
        case "ArrowLeft":
          e.preventDefault();
          if (currentIndex > 0) {
            focusable[currentIndex - 1]?.focus();
          }
          break;
        case "Enter":
          // Let default behavior handle it
          break;
        default:
          break;
      }
    };

    document.addEventListener("keydown", handleKeyDown);
    return () => document.removeEventListener("keydown", handleKeyDown);
  }, [tvMode]);

  function toggleService(id) {
    setEnabled((p) => ({ ...p, [id]: !p[id] }));
  }

  function addService() {
    const name = prompt("Service name (e.g., Crunchyroll)");
    const url = name ? prompt("Homepage URL") : null;
    if (name && url) {
      const id = name.toLowerCase().replace(/[^a-z0-9]+/g, "").slice(0, 24) || `svc${Date.now()}`;
      const svc = { id, name, url };
      setServices((s) => [...s, svc]);
      setEnabled((e) => ({ ...e, [id]: true }));
    }
  }

  function runUnifiedSearch(e) {
    e?.preventDefault?.();
    if (!query.trim()) return;
    const tabs = [PROVIDER_SEARCH.justwatch(query), PROVIDER_SEARCH.reelgood(query)];
    activeServices.slice(0, 5).forEach((s) => {
      const fn = PROVIDER_SEARCH[s.id];
      if (fn) tabs.push(fn(query));
    });
    for (const u of tabs) window.open(u, "_blank");
  }

  async function runAISearch(e) {
    e?.preventDefault?.();
    if (!query.trim()) return;

    setAiSearchLoading(true);
    setAiSearchResults(null);

    try {
      const serviceNames = activeServices.map((s) => s.name);
      const results = await aiSearch(query, serviceNames);
      setAiSearchResults(results);
    } catch (error) {
      console.error("AI Search failed:", error);
      alert("AI Search failed. Make sure the backend is running and API key is configured.");
    } finally {
      setAiSearchLoading(false);
    }
  }

  async function loadAIRecommendations() {
    setAiRecsLoading(true);
    setAiRecommendations(null);

    try {
      const serviceNames = activeServices.map((s) => s.name);
      const watchHistory = (cwData?.items || []).map((item) => ({
        title: item.title,
        service: item.service,
        type: item.type || "Unknown"
      }));

      const results = await getAIRecommendations(watchHistory, {}, serviceNames);
      setAiRecommendations(results);
    } catch (error) {
      console.error("AI Recommendations failed:", error);
      alert("AI Recommendations failed. Make sure the backend is running and API key is configured.");
    } finally {
      setAiRecsLoading(false);
    }
  }

  function startVoiceSearch() {
    if (!("webkitSpeechRecognition" in window) && !("SpeechRecognition" in window)) {
      alert("Voice search not supported in this browser. Try Chrome or Edge.");
      return;
    }

    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
    const recognition = new SpeechRecognition();
    recognition.lang = "en-US";
    recognition.interimResults = false;

    recognition.onstart = () => setIsListening(true);
    recognition.onend = () => setIsListening(false);

    recognition.onresult = (event) => {
      const transcript = event.results[0][0].transcript;
      setQuery(transcript);
      setSearchMode("ai"); // Voice search uses AI by default
    };

    recognition.onerror = (event) => {
      console.error("Voice recognition error:", event.error);
      setIsListening(false);
      alert(`Voice search error: ${event.error}`);
    };

    recognition.start();
  }

  // Kodi Functions
  async function testKodiConnection() {
    setKodiLoading(true);
    try {
      const kodi = getKodiService(kodiHost, kodiPort, kodiUsername, kodiPassword);
      const connected = await kodi.testConnection();
      setKodiConnected(connected);

      if (connected) {
        alert("✅ Connected to Kodi successfully!");
        await loadKodiLibrary();
      } else {
        alert("❌ Could not connect to Kodi. Check your settings and make sure Kodi is running with web server enabled.");
      }
    } catch (error) {
      console.error("Kodi connection failed:", error);
      setKodiConnected(false);
      alert("❌ Connection failed: " + error.message);
    } finally {
      setKodiLoading(false);
    }
  }

  async function loadKodiLibrary() {
    setKodiLoading(true);
    try {
      const kodi = getKodiService(kodiHost, kodiPort, kodiUsername, kodiPassword);
      const [movies, tvshows] = await Promise.all([
        kodi.getMovies(),
        kodi.getTVShows()
      ]);

      const combined = [
        ...movies.map(m => ({ ...m, mediaType: 'movie' })),
        ...tvshows.map(t => ({ ...t, mediaType: 'tvshow' }))
      ];

      setKodiLibrary(combined);
      console.log(`Loaded ${movies.length} movies and ${tvshows.length} TV shows from Kodi`);
    } catch (error) {
      console.error("Failed to load Kodi library:", error);
      alert("Failed to load Kodi library: " + error.message);
    } finally {
      setKodiLoading(false);
    }
  }

  return (
    <div className={`wrap ${tvMode ? "tv-mode" : ""}`}>
      <header className="header">
        <div>
          <h1>StreamHub</h1>
          <div className="sub">All your streaming in one home screen {tvMode ? "• TV Mode" : ""}</div>
        </div>
        <div className="header-actions">
          <button
            className={`btn ${tvMode ? "primary" : "ghost"}`}
            onClick={() => setTvMode(!tvMode)}
            title="Toggle TV Mode - larger UI and remote control navigation"
          >
            {tvMode ? "📺 TV Mode ON" : "📺 TV Mode"}
          </button>
          <a className="btn ghost" href="/data/new-this-week.json" target="_blank" rel="noreferrer">Feed JSON</a>
          <button className="btn ghost" onClick={addService}>Add Service</button>
        </div>
      </header>

      {/* Search Section */}
      <section className="section">
        <div className="row" style={{ marginBottom: "1rem" }}>
          <h2>Search</h2>
          <div className="chips">
            <button
              className={`btn ${searchMode === "unified" ? "primary" : "ghost"}`}
              onClick={() => setSearchMode("unified")}
            >
              Multi-Tab Search
            </button>
            <button
              className={`btn ${searchMode === "ai" ? "primary" : "ghost"}`}
              onClick={() => setSearchMode("ai")}
            >
              AI Search
            </button>
          </div>
        </div>
        <form className="search" onSubmit={searchMode === "ai" ? runAISearch : runUnifiedSearch}>
          <input
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder={
              searchMode === "ai"
                ? "Try: 'Something like Inception but happier' or 'Sci-fi series under 30 min episodes'"
                : "Search a title once. We'll open JustWatch + providers"
            }
          />
          <button
            className="btn ghost"
            type="button"
            onClick={startVoiceSearch}
            disabled={isListening}
            title="Voice Search"
          >
            {isListening ? "🎤 Listening..." : "🎤 Voice"}
          </button>
          <button className="btn primary" type="submit" disabled={aiSearchLoading}>
            {searchMode === "ai" ? (aiSearchLoading ? "Thinking..." : "AI Search") : "Unified Search"}
          </button>
        </form>
        {searchMode === "unified" && (
          <div className="chips">
            <Badge>Opens multiple tabs</Badge>
            <Badge>No logins stored</Badge>
            <Badge>Local settings only</Badge>
          </div>
        )}

        {/* AI Search Results */}
        {searchMode === "ai" && aiSearchResults && (
          <div className="ai-results">
            <div className="ai-card">
              <h3>AI Understanding</h3>
              <p className="muted">{aiSearchResults.interpretation}</p>
              {aiSearchResults.attributes && (
                <div className="chips">
                  {aiSearchResults.attributes.genre?.map((g, i) => (
                    <Badge key={i}>{g}</Badge>
                  ))}
                  {aiSearchResults.attributes.mood && <Badge>{aiSearchResults.attributes.mood}</Badge>}
                </div>
              )}
            </div>
            <h3>Recommendations</h3>
            <div className="list">
              {aiSearchResults.recommendations?.map((rec, i) => (
                <div key={i} className="card item">
                  <div className="row">
                    <div className="title">{rec.title}</div>
                    <Badge>{rec.type}</Badge>
                  </div>
                  <div className="muted">{rec.service} {rec.year && `• ${rec.year}`}</div>
                  <div className="muted small">{rec.match}</div>
                </div>
              ))}
            </div>
          </div>
        )}
      </section>

      {/* Kodi Library Section */}
      <section className="section">
        <div className="row">
          <h2>Kodi Library</h2>
          <button
            className={`btn ${kodiConnected ? "primary" : "ghost"}`}
            onClick={() => setShowKodiSettings(!showKodiSettings)}
          >
            {kodiConnected ? "✓ Kodi Connected" : "⚙️ Connect to Kodi"}
          </button>
        </div>

        {/* Kodi Settings Panel */}
        {showKodiSettings && (
          <div className="card" style={{ marginTop: "1rem", padding: "1.5rem" }}>
            <h3>Kodi Connection Settings</h3>
            <div style={{ display: "grid", gap: "1rem", marginTop: "1rem" }}>
              <div>
                <label className="muted small">Host</label>
                <input
                  type="text"
                  value={kodiHost}
                  onChange={(e) => setKodiHost(e.target.value)}
                  placeholder="localhost or IP address"
                  style={{ width: "100%", marginTop: "0.5rem", padding: "12px", borderRadius: "8px", border: "1px solid var(--line)", background: "var(--card)", color: "var(--fg)" }}
                />
              </div>
              <div>
                <label className="muted small">Port</label>
                <input
                  type="text"
                  value={kodiPort}
                  onChange={(e) => setKodiPort(e.target.value)}
                  placeholder="8080"
                  style={{ width: "100%", marginTop: "0.5rem", padding: "12px", borderRadius: "8px", border: "1px solid var(--line)", background: "var(--card)", color: "var(--fg)" }}
                />
              </div>
              <div>
                <label className="muted small">Username (optional)</label>
                <input
                  type="text"
                  value={kodiUsername}
                  onChange={(e) => setKodiUsername(e.target.value)}
                  placeholder="kodi"
                  style={{ width: "100%", marginTop: "0.5rem", padding: "12px", borderRadius: "8px", border: "1px solid var(--line)", background: "var(--card)", color: "var(--fg)" }}
                />
              </div>
              <div>
                <label className="muted small">Password (optional)</label>
                <input
                  type="password"
                  value={kodiPassword}
                  onChange={(e) => setKodiPassword(e.target.value)}
                  placeholder="password"
                  style={{ width: "100%", marginTop: "0.5rem", padding: "12px", borderRadius: "8px", border: "1px solid var(--line)", background: "var(--card)", color: "var(--fg)" }}
                />
              </div>
            </div>
            <div style={{ marginTop: "1rem", display: "flex", gap: "0.5rem" }}>
              <button className="btn primary" onClick={testKodiConnection} disabled={kodiLoading}>
                {kodiLoading ? "Connecting..." : "Connect to Kodi"}
              </button>
              {kodiConnected && (
                <button className="btn ghost" onClick={loadKodiLibrary} disabled={kodiLoading}>
                  {kodiLoading ? "Loading..." : "Refresh Library"}
                </button>
              )}
            </div>
            <p className="muted small" style={{ marginTop: "1rem" }}>
              Make sure Kodi's web server is enabled in Settings → Services → Control → Allow remote control via HTTP
            </p>
          </div>
        )}

        {/* Kodi Library Grid */}
        {kodiLibrary.length > 0 && (
          <div className="media-grid" style={{ marginTop: "2rem" }}>
            {kodiLibrary.slice(0, 20).map((media, i) => (
              <div key={`kodi-${i}`} className="media-card">
                {media.thumbnail ? (
                  <div
                    className="media-poster"
                    style={{
                      backgroundImage: `url(${media.thumbnail})`,
                      backgroundSize: "cover",
                      backgroundPosition: "center",
                      height: "300px",
                      borderRadius: "12px 12px 0 0"
                    }}
                  />
                ) : (
                  <div
                    className="media-poster-placeholder"
                    style={{
                      height: "300px",
                      background: "linear-gradient(135deg, #3a3f52, #232838)",
                      borderRadius: "12px 12px 0 0",
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      fontSize: "48px"
                    }}
                  >
                    🎬
                  </div>
                )}
                <div className="media-info" style={{ padding: "1rem" }}>
                  <div className="title" style={{ fontSize: "16px" }}>{media.title}</div>
                  {media.year && <div className="muted small">{media.year}</div>}
                  {media.rating && (
                    <div className="muted small">⭐ {media.rating.toFixed(1)}/10</div>
                  )}
                  {media.genre && media.genre.length > 0 && (
                    <div className="muted small">{media.genre.slice(0, 2).join(", ")}</div>
                  )}
                  <div className="badge" style={{ marginTop: "0.5rem" }}>
                    {media.mediaType === 'movie' ? 'Movie' : 'TV Show'}
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}

        {kodiLibrary.length === 0 && !showKodiSettings && (
          <div className="muted" style={{ marginTop: "1rem" }}>
            Connect to your Kodi library to see your movies and TV shows with artwork and metadata
          </div>
        )}
      </section>

      {/* Services Grid */}
      <section className="section">
        <div className="row">
          <h2>My Services</h2>
        </div>
        <div className="grid">
          {services.map((s) => (
            <a key={s.id} className={`card service ${enabled[s.id] ? "" : "disabled"}`} href={s.url} target="_blank" rel="noreferrer">
              <div className="icon" />
              <div className="name">{s.name}</div>
              <div className="muted">Quick Launch</div>
              <label className="toggle">
                <input type="checkbox" checked={!!enabled[s.id]} onChange={() => toggleService(s.id)} />
                <span>Enable for search</span>
              </label>
            </a>
          ))}
        </div>
      </section>

      {/* AI Recommendations */}
      <section className="section">
        <div className="row">
          <h2>AI Recommendations</h2>
          <button className="btn primary" onClick={loadAIRecommendations} disabled={aiRecsLoading}>
            {aiRecsLoading ? "Analyzing..." : "Get AI Suggestions"}
          </button>
        </div>
        <div className="muted small">
          Personalized recommendations based on your watching patterns
        </div>
        {aiRecommendations && (
          <>
            <div className="ai-card" style={{ marginTop: "1rem" }}>
              <h3>Your Taste Profile</h3>
              <p className="muted">{aiRecommendations.analysis}</p>
              {aiRecommendations.moodProfile && (
                <div className="muted small" style={{ marginTop: "0.5rem" }}>
                  <strong>Mood:</strong> {aiRecommendations.moodProfile}
                </div>
              )}
            </div>
            <div className="list">
              {aiRecommendations.recommendations?.map((rec, i) => (
                <div key={i} className="card item">
                  <div className="row">
                    <div className="title">{rec.title}</div>
                    <div className="chips">
                      <Badge>{rec.type}</Badge>
                      {rec.hiddenGem && <Badge>Hidden Gem</Badge>}
                      {rec.confidence && <Badge>{rec.confidence}% match</Badge>}
                    </div>
                  </div>
                  <div className="muted">{rec.service} {rec.year && `• ${rec.year}`}</div>
                  {rec.genre && (
                    <div className="chips">
                      {rec.genre.map((g, gi) => (
                        <Badge key={gi}>{g}</Badge>
                      ))}
                    </div>
                  )}
                  <div className="muted small">{rec.reasoning}</div>
                  {rec.mood && <div className="muted small">Mood: {rec.mood}</div>}
                </div>
              ))}
            </div>
          </>
        )}
      </section>

      {/* Continue Watching */}
      <section className="section">
        <div className="row">
          <h2>Continue Watching</h2>
          <button
            className="btn ghost"
            onClick={async () => {
              setLoadingCW(true);
              try {
                const r = await fetch("/data/continue-watching.json", { cache: "no-store" });
                if (r.ok) setCwData(await r.json());
              } catch {}
              setLoadingCW(false);
            }}
          >
            Refresh
          </button>
        </div>
        <div className="muted small">
          {cwData?.updated ? `Updated: ${cwData.updated}` : (loadingCW ? "Loading…" : "No feed yet. Create /data/continue-watching.json")}
        </div>
        <div className="list">
          {(cwData?.items || []).map((it, i) => (
            <a key={i} className="card item" href={it.link || "#"} target={it.link ? "_blank" : undefined} rel="noreferrer">
              <div className="row">
                <div className="title">{it.title}</div>
                <Badge>{it.type || "Title"}</Badge>
              </div>
              <div className="muted">{it.service}</div>
              {typeof it.progress === "number" && (
                <div className="stack">
                  <Progress value={it.progress} />
                  <div className="muted small">{Math.round(it.progress)}%</div>
                </div>
              )}
              {it.note && <div className="muted small">{it.note}</div>}
            </a>
          ))}
        </div>
      </section>

      {/* What's New */}
      <section className="section">
        <div className="row">
          <h2>What’s New</h2>
          <button
            className="btn ghost"
            onClick={async () => {
              setLoadingNew(true);
              try {
                const r = await fetch("/data/new-this-week.json", { cache: "no-store" });
                if (r.ok) setNewData(await r.json());
              } catch {}
              setLoadingNew(false);
            }}
          >
            Refresh
          </button>
        </div>
        <div className="muted small">
          {newData?.updated ? `Updated: ${newData.updated}` : (loadingNew ? "Loading…" : "No feed yet. Create /data/new-this-week.json")}
        </div>
        <div className="list">
          {(newData?.items || []).map((it, i) => (
            <a key={i} className="card item" href={it.link || "#"} target={it.link ? "_blank" : undefined} rel="noreferrer">
              <div className="row">
                <div className="title">{it.title}</div>
                <Badge>{it.type || "Title"}</Badge>
              </div>
              <div className="muted">{it.service}</div>
              {it.note && <div className="muted small">{it.note}</div>}
            </a>
          ))}
        </div>
      </section>

      <footer className="footer">StreamHub prototype • Local dev • No accounts stored</footer>
    </div>
  );
}
