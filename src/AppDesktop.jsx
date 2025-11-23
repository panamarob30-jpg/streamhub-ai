import React, { useEffect, useMemo, useState } from "react";
import { aiSearch, getAIRecommendations } from "./api";
import { getKodiService } from "./kodi-service";

const DEFAULT_SERVICES = [
  { id: "netflix", name: "Netflix", url: "https://www.netflix.com/browse", icon: "📺" },
  { id: "prime", name: "Prime Video", url: "https://www.primevideo.com/", icon: "📦" },
  { id: "max", name: "Max", url: "https://www.max.com/", icon: "🎬" },
  { id: "hulu", name: "Hulu", url: "https://www.hulu.com/hub/home", icon: "🟢" },
  { id: "disney", name: "Disney+", url: "https://www.disneyplus.com/home", icon: "✨" },
  { id: "apple", name: "Apple TV+", url: "https://tv.apple.com/", icon: "🍎" },
  { id: "paramount", name: "Paramount+", url: "https://www.paramountplus.com/", icon: "⛰️" },
  { id: "peacock", name: "Peacock", url: "https://www.peacocktv.com/", icon: "🦚" },
  { id: "plex", name: "Plex", url: "https://app.plex.tv/", icon: "▶️" },
];

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

export default function AppDesktop() {
  const [activeView, setActiveView] = useState("home");
  const [services, setServices] = useLocalState("streamhub.services", DEFAULT_SERVICES);
  const [enabled, setEnabled] = useLocalState(
    "streamhub.enabled",
    Object.fromEntries(DEFAULT_SERVICES.map((s) => [s.id, true]))
  );
  const [query, setQuery] = useState("");
  const [aiSearchResults, setAiSearchResults] = useState(null);
  const [aiSearchLoading, setAiSearchLoading] = useState(false);
  const [tvMode, setTvMode] = useLocalState("streamhub.tvMode", false);
  const [isListening, setIsListening] = useState(false);

  // Local Media Library
  const [mediaLibrary, setMediaLibrary] = useLocalState("streamhub.mediaLibrary", []);
  const [selectedMedia, setSelectedMedia] = useState(null);
  const [libraryPath, setLibraryPath] = useLocalState("streamhub.libraryPath", null);
  const [scanning, setScanning] = useState(false);

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

  const isElectron = typeof window !== 'undefined' && window.electronAPI?.isElectron;

  // Scan media folder
  async function selectAndScanFolder() {
    if (!isElectron) {
      alert("File browsing is only available in the desktop app");
      return;
    }

    try {
      const folder = await window.electronAPI.selectMediaFolder();
      if (folder) {
        setLibraryPath(folder);
        setScanning(true);
        const files = await window.electronAPI.scanMediaFolder(folder);
        setMediaLibrary(files);
        setScanning(false);
      }
    } catch (error) {
      console.error("Error scanning folder:", error);
      setScanning(false);
    }
  }

  // Play local media
  function playMedia(media) {
    setSelectedMedia(media);
    setActiveView("player");
  }

  // AI Search
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
      alert("AI Search failed. Make sure the backend is running.");
    } finally {
      setAiSearchLoading(false);
    }
  }

  // Voice Search
  function startVoiceSearch() {
    if (!("webkitSpeechRecognition" in window) && !("SpeechRecognition" in window)) {
      alert("Voice search not supported in this browser.");
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
    };

    recognition.onerror = (event) => {
      console.error("Voice recognition error:", event.error);
      setIsListening(false);
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

  async function playInKodi(kodiId, type) {
    try {
      const kodi = getKodiService(kodiHost, kodiPort, kodiUsername, kodiPassword);
      const success = await kodi.play(kodiId, type);

      if (success) {
        alert("▶️ Playing in Kodi!");
      } else {
        alert("Failed to start playback in Kodi");
      }
    } catch (error) {
      console.error("Failed to play in Kodi:", error);
      alert("Error: " + error.message);
    }
  }

  function playKodiMedia(media) {
    if (media.source === 'kodi') {
      // Show modal to choose: Play in Kodi or Play Here
      const choice = confirm(
        `Play "${media.title}" in Kodi?\n\n` +
        `OK = Play in Kodi\n` +
        `Cancel = Play in built-in player`
      );

      if (choice) {
        playInKodi(media.movieid || media.tvshowid, media.mediaType);
      } else {
        // Play in built-in player using file path
        setSelectedMedia({
          ...media,
          path: media.file,
          name: media.title
        });
        setActiveView("player");
      }
    }
  }

  // Auto-connect to Kodi on mount if settings exist
  useEffect(() => {
    if (kodiHost && kodiPort) {
      testKodiConnection().catch(console.error);
    }
  }, []); // Only run once on mount

  // Render different views
  function renderView() {
    if (activeView === "home") {
      return renderHomeView();
    } else if (activeView === "library") {
      return renderLibraryView();
    } else if (activeView === "player") {
      return renderPlayerView();
    } else {
      // Streaming service view
      const service = services.find(s => s.id === activeView);
      if (service) {
        return renderServiceView(service);
      }
    }
  }

  function renderHomeView() {
    return (
      <div className="view-content">
        <h1>StreamHub AI</h1>
        <p className="muted">All your streaming and local media in one place</p>

        {/* Search Bar */}
        <form className="search" onSubmit={runAISearch} style={{ marginTop: "2rem" }}>
          <input
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="AI Search: 'Find me a sci-fi movie like Inception' or 'Family comedy series'"
          />
          <button
            className="btn ghost"
            type="button"
            onClick={startVoiceSearch}
            disabled={isListening}
          >
            {isListening ? "🎤 Listening..." : "🎤"}
          </button>
          <button className="btn primary" type="submit" disabled={aiSearchLoading}>
            {aiSearchLoading ? "Thinking..." : "AI Search"}
          </button>
        </form>

        {/* AI Search Results */}
        {aiSearchResults && (
          <div className="ai-results" style={{ marginTop: "2rem" }}>
            <div className="ai-card">
              <h3>AI Understanding</h3>
              <p className="muted">{aiSearchResults.interpretation}</p>
            </div>
            <h3>Recommendations</h3>
            <div className="grid">
              {aiSearchResults.recommendations?.map((rec, i) => (
                <div key={i} className="card">
                  <div className="title">{rec.title}</div>
                  <div className="muted">{rec.service} • {rec.type}</div>
                  <div className="muted small">{rec.match}</div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Quick Access */}
        <h2 style={{ marginTop: "3rem" }}>Quick Access</h2>
        <div className="grid">
          {services.map((s) => (
            <button
              key={s.id}
              className="card service-card"
              onClick={() => setActiveView(s.id)}
            >
              <div className="icon">{s.icon}</div>
              <div className="name">{s.name}</div>
            </button>
          ))}
        </div>
      </div>
    );
  }

  function renderLibraryView() {
    const allMedia = [...kodiLibrary, ...mediaLibrary];
    const hasKodi = kodiLibrary.length > 0;
    const hasLocal = mediaLibrary.length > 0;

    return (
      <div className="view-content">
        <div className="row">
          <h1>My Library</h1>
          <div className="stack">
            {isElectron && (
              <button className="btn ghost" onClick={selectAndScanFolder} disabled={scanning}>
                {scanning ? "Scanning..." : libraryPath ? "Rescan Files" : "Add Folder"}
              </button>
            )}
            <button
              className={`btn ${kodiConnected ? "primary" : "ghost"}`}
              onClick={() => setShowKodiSettings(!showKodiSettings)}
            >
              {kodiConnected ? "✓ Kodi Connected" : "⚙️ Kodi Settings"}
            </button>
          </div>
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
                  style={{ width: "100%", marginTop: "0.5rem" }}
                />
              </div>
              <div>
                <label className="muted small">Port</label>
                <input
                  type="text"
                  value={kodiPort}
                  onChange={(e) => setKodiPort(e.target.value)}
                  placeholder="8080"
                  style={{ width: "100%", marginTop: "0.5rem" }}
                />
              </div>
              <div>
                <label className="muted small">Username (optional)</label>
                <input
                  type="text"
                  value={kodiUsername}
                  onChange={(e) => setKodiUsername(e.target.value)}
                  placeholder="kodi"
                  style={{ width: "100%", marginTop: "0.5rem" }}
                />
              </div>
              <div>
                <label className="muted small">Password (optional)</label>
                <input
                  type="password"
                  value={kodiPassword}
                  onChange={(e) => setKodiPassword(e.target.value)}
                  placeholder="password"
                  style={{ width: "100%", marginTop: "0.5rem" }}
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

        {/* Library Stats */}
        <div style={{ marginTop: "1rem", display: "flex", gap: "1rem" }}>
          {hasKodi && (
            <div className="muted">
              📦 Kodi: {kodiLibrary.filter(m => m.mediaType === 'movie').length} movies,{' '}
              {kodiLibrary.filter(m => m.mediaType === 'tvshow').length} TV shows
            </div>
          )}
          {hasLocal && (
            <div className="muted">
              📁 Local: {mediaLibrary.length} files
            </div>
          )}
        </div>

        {/* Empty State */}
        {!hasKodi && !hasLocal && (
          <div className="card" style={{ marginTop: "2rem", padding: "2rem", textAlign: "center" }}>
            <h3>Add Your Media</h3>
            <p className="muted">
              Connect to Kodi to access your organized library with metadata and artwork,
              or add a local folder to browse video files directly.
            </p>
          </div>
        )}

        {/* Combined Library Grid */}
        {allMedia.length > 0 && (
          <div className="media-grid" style={{ marginTop: "2rem" }}>
            {allMedia.map((media, i) => {
              const isKodi = media.source === 'kodi';
              const title = media.title || getMediaTitle(media.name);

              return (
                <div
                  key={`${media.source}-${i}`}
                  className="media-card"
                  onClick={() => isKodi ? playKodiMedia(media) : playMedia(media)}
                >
                  {isKodi && media.thumbnail ? (
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
                      {isKodi ? "🎬" : "📹"}
                    </div>
                  )}
                  <div className="media-info" style={{ padding: "1rem" }}>
                    <div className="title" style={{ fontSize: "16px" }}>{title}</div>
                    {media.year && <div className="muted small">{media.year}</div>}
                    {media.rating && (
                      <div className="muted small">⭐ {media.rating.toFixed(1)}/10</div>
                    )}
                    {media.genre && media.genre.length > 0 && (
                      <div className="muted small">{media.genre.slice(0, 2).join(", ")}</div>
                    )}
                    {!isKodi && <div className="muted small">{formatFileSize(media.size)}</div>}
                    <div className="badge" style={{ marginTop: "0.5rem" }}>
                      {isKodi ? `Kodi ${media.mediaType === 'movie' ? 'Movie' : 'TV Show'}` : 'Local File'}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    );
  }

  function renderPlayerView() {
    if (!selectedMedia) {
      return <div className="view-content"><p>No media selected</p></div>;
    }

    return (
      <div className="view-content player-view">
        <button className="btn ghost" onClick={() => setActiveView("library")}>
          ← Back to Library
        </button>
        <h2 style={{ marginTop: "1rem" }}>{getMediaTitle(selectedMedia.name)}</h2>
        <video
          controls
          autoPlay
          style={{
            width: "100%",
            maxHeight: "70vh",
            marginTop: "1rem",
            borderRadius: "12px",
            backgroundColor: "#000"
          }}
          src={`streamhub://${selectedMedia.path}`}
        >
          Your browser does not support the video tag.
        </video>
      </div>
    );
  }

  function renderServiceView(service) {
    if (!isElectron) {
      // Web version - open in new tab
      window.open(service.url, "_blank");
      setActiveView("home");
      return renderHomeView();
    }

    return (
      <div className="view-content webview-container">
        <webview
          src={service.url}
          style={{
            width: "100%",
            height: "100%",
            border: "none"
          }}
          allowpopups="true"
          partition="persist:streamhub"
        />
      </div>
    );
  }

  // Helper functions
  function getMediaTitle(filename) {
    // Remove extension and clean up
    return filename
      .replace(/\.[^/.]+$/, "")
      .replace(/[._-]/g, " ")
      .replace(/\d{4}/g, (year) => `(${year})`)
      .trim();
  }

  function formatFileSize(bytes) {
    if (bytes < 1024) return bytes + " B";
    if (bytes < 1024 * 1024) return (bytes / 1024).toFixed(1) + " KB";
    if (bytes < 1024 * 1024 * 1024) return (bytes / (1024 * 1024)).toFixed(1) + " MB";
    return (bytes / (1024 * 1024 * 1024)).toFixed(2) + " GB";
  }

  return (
    <div className={`desktop-app ${tvMode ? "tv-mode" : ""}`}>
      {/* Sidebar */}
      <div className="sidebar">
        <div className="sidebar-header">
          <h2>StreamHub</h2>
        </div>

        <nav className="sidebar-nav">
          <button
            className={`nav-item ${activeView === "home" ? "active" : ""}`}
            onClick={() => setActiveView("home")}
          >
            🏠 Home
          </button>

          <button
            className={`nav-item ${activeView === "library" ? "active" : ""}`}
            onClick={() => setActiveView("library")}
          >
            📁 My Library
          </button>

          <div className="nav-divider">Streaming Services</div>

          {services.map((service) => (
            <button
              key={service.id}
              className={`nav-item ${activeView === service.id ? "active" : ""}`}
              onClick={() => setActiveView(service.id)}
            >
              {service.icon} {service.name}
            </button>
          ))}
        </nav>

        <div className="sidebar-footer">
          <button
            className="btn ghost"
            onClick={() => setTvMode(!tvMode)}
            title="Toggle TV Mode"
          >
            📺 {tvMode ? "TV Mode ON" : "TV Mode"}
          </button>
        </div>
      </div>

      {/* Main Content */}
      <div className="main-content">
        {renderView()}
      </div>
    </div>
  );
}
