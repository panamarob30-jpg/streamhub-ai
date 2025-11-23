# StreamHub AI Desktop App

The ultimate all-in-one streaming and media center. Access all your streaming services AND play your local movie files from a single, beautiful desktop application.

## Features

### 🎬 Unified Interface
- **Sidebar Navigation** - Quick access to all services
- **Home Dashboard** - AI search and quick launch
- **Tab-like Experience** - Switch between services seamlessly

### 📁 Local Media Library
- **Kodi Integration** - Connect to Kodi for organized library with metadata
- **Browse Your Files** - Select any folder containing movies
- **Auto-Scan** - Automatically finds video files
- **Built-in Player** - Play MP4, MKV, AVI, MOV, and more
- **Smart Titles** - Automatically formats filenames
- **Poster Artwork** - Beautiful posters from Kodi library
- **Flexible Playback** - Play in Kodi or built-in player

### 🌊 Streaming Services (Embedded)
- Netflix, Prime Video, Disney+, Hulu, Max
- Apple TV+, Paramount+, Peacock, Plex
- Each service in its own webview
- Persistent logins (cookies saved)

### 🤖 AI-Powered
- **Natural Language Search** - "Find me a family-friendly sci-fi movie"
- **Voice Search** - Speak your queries
- **Cross-Platform Search** - Search across streaming + your library

### 📺 TV Mode
- Large UI optimized for TV viewing
- Remote control navigation
- Perfect for HTPC setups

## Quick Start

### 1. Install Dependencies

```bash
npm install
cd server && npm install && cd ..
```

### 2. Configure API Key

```bash
# Already done if you set up the web version
# Make sure server/.env has your Anthropic API key
```

### 3. Run the Desktop App

```bash
npm run dev:electron
```

This will:
- Start the backend API server
- Start the frontend dev server
- Launch the Electron desktop app

## Kodi Integration (Recommended!)

StreamHub can connect to your Kodi library to display your movies and TV shows with beautiful posters, ratings, and metadata.

### Setup Kodi for Web Access

1. Open Kodi
2. Go to **Settings → Services → Control**
3. Enable **"Allow remote control via HTTP"**
4. Note the port (default: 8080)
5. Optionally set a username/password

### Connect StreamHub to Kodi

1. Click **"My Library"** in StreamHub sidebar
2. Click **"⚙️ Kodi Settings"** button
3. Enter your Kodi connection details:
   - **Host**: `localhost` (if Kodi is on same machine) or Kodi's IP address
   - **Port**: `8080` (or your custom port)
   - **Username/Password**: If you set one in Kodi
4. Click **"Connect to Kodi"**
5. Your library will load automatically!

### Using Kodi Library

- **Beautiful Posters** - All artwork from Kodi's scrapers
- **Metadata** - Ratings, genres, years, descriptions
- **Play Options** - Choose to play in Kodi or built-in player
- **TV Shows** - Browse your entire TV library
- **Mixed Library** - Kodi content + local files in one view

### Kodi + Local Files

You can use BOTH Kodi and local file browsing:
- **Kodi Library** - Organized content with metadata
- **Local Files** - Quick access to any video folder
- Both appear together in "My Library"

## Adding Local Files (Without Kodi)

1. Click **"My Library"** in the sidebar
2. Click **"Add Folder"**
3. Choose a folder containing your movies
4. StreamHub will scan for video files (MP4, MKV, AVI, MOV, etc.)
5. Click any movie to play it!

### Supported Video Formats

- MP4 (.mp4, .m4v)
- MKV (.mkv)
- AVI (.avi)
- MOV (.mov)
- WMV (.wmv)
- FLV (.flv)
- WebM (.webm)

## Using Streaming Services

### First Time Setup

1. Click a service in the sidebar (e.g., "Netflix")
2. Sign in to that service (it will remember you)
3. Browse and watch as normal
4. Switch to other services anytime via sidebar

### Tips

- **Logins Persist** - You only need to sign in once per service
- **Multiple Accounts** - Each service remembers your login separately
- **Full Features** - All streaming features work (profiles, search, etc.)

## Building for Distribution

### Build for Your Platform

```bash
# Build the app
npm run build:electron
```

This creates installers in the `release/` folder:

- **Windows**: `.exe` installer
- **Mac**: `.dmg` image
- **Linux**: `.AppImage`

### Install on Another Computer

1. Copy the installer from `release/` folder
2. Run the installer
3. Configure your API key (first launch)
4. Add your movie library
5. Sign in to streaming services

## Advanced Usage

### Network Access (For Remote Devices)

The desktop app includes a built-in server that can be accessed from other devices:

1. Find your computer's IP address
2. On another device, go to `http://YOUR_IP:3001`
3. You'll get the web version with full functionality

### Synology NAS Deployment

Want always-on access? Deploy to your Synology NAS:

See **[SYNOLOGY-SETUP.md](./SYNOLOGY-SETUP.md)** for complete instructions.

## Keyboard Shortcuts

| Shortcut | Action |
|----------|--------|
| `Ctrl/Cmd + 1` | Go to Home |
| `Ctrl/Cmd + 2` | Go to My Library |
| `Ctrl/Cmd + K` | Focus search bar |
| `Ctrl/Cmd + T` | Toggle TV Mode |
| `Esc` | Go back/Exit fullscreen |
| `Space` | Play/Pause (in player) |
| `F` | Fullscreen (in player) |

## File Organization Tips

### Recommended Folder Structure

```
/Movies
  ├── Action
  │   ├── Movie Name (2023).mp4
  │   └── Another Movie (2022).mkv
  ├── Comedy
  │   └── Funny Movie (2024).mp4
  └── Sci-Fi
      └── Space Movie (2023).mkv
```

### Naming Conventions

For best results, name your files:
```
Movie Title (Year).extension
```

Examples:
- `Inception (2010).mp4`
- `The Matrix (1999).mkv`
- `Interstellar (2014).mp4`

StreamHub will automatically:
- Remove file extensions
- Replace dots/underscores with spaces
- Extract year information
- Format as readable titles

## Troubleshooting

### Streaming Service Won't Load

**Issue**: Service shows blank screen or error

**Solutions**:
1. Check your internet connection
2. Try signing out and back in
3. Clear the app cache:
   - Windows: `%APPDATA%/streamhub-ai`
   - Mac: `~/Library/Application Support/streamhub-ai`
   - Linux: `~/.config/streamhub-ai`
4. Restart the app

### Local Media Won't Play

**Issue**: Video file won't play or shows error

**Possible Causes**:
1. **Codec not supported** - Re-encode to H.264/AAC (most compatible)
2. **File corrupted** - Try playing in VLC to verify
3. **File permissions** - Make sure the app can read the file

**Solutions**:
```bash
# Test file with VLC or another player first
# If it plays elsewhere, convert to MP4:
ffmpeg -i input.mkv -c:v libx264 -c:a aac output.mp4
```

### AI Search Not Working

**Issue**: AI search fails or returns errors

**Solutions**:
1. Check backend is running (automatic in desktop app)
2. Verify API key in `server/.env`
3. Check API key has credits/is valid
4. Restart the app

### Performance Issues

**Issue**: App is slow or laggy

**Solutions**:
1. Close unused streaming service tabs (go to Home)
2. Clear old data from cache
3. Check system resources (CPU/RAM)
4. Reduce number of items in library scan
5. Disable TV Mode if not needed

## Privacy & Security

### What's Stored Locally

- Streaming service cookies (your logins)
- Library scan results (file paths only)
- Search history
- UI preferences (TV mode, sidebar state)

### What's Sent to APIs

- AI search queries → Anthropic Claude API
- Nothing else is sent externally

### Your Data

- All streaming logins stay local
- File paths never leave your computer
- No telemetry or tracking
- No accounts or cloud sync

## Technical Details

### Architecture

```
┌─────────────────────────────────┐
│   Electron Desktop App          │
│  ┌─────────────────────────┐   │
│  │  React Frontend         │   │
│  │  - Sidebar Navigation   │   │
│  │  - Webviews for Services│   │
│  │  - Video Player         │   │
│  └─────────────────────────┘   │
│           ↕ IPC                 │
│  ┌─────────────────────────┐   │
│  │  Electron Main Process  │   │
│  │  - File System Access   │   │
│  │  - Media Scanner        │   │
│  │  - Window Management    │   │
│  └─────────────────────────┘   │
└─────────────────────────────────┘
           ↕ HTTP
┌─────────────────────────────────┐
│   Express Backend (Built-in)    │
│   - Claude AI Integration       │
│   - Search & Recommendations    │
└─────────────────────────────────┘
```

### Tech Stack

- **Electron** - Desktop framework
- **React 19** - UI framework
- **Express** - Backend API
- **Anthropic Claude** - AI features
- **HTML5 Video** - Local playback
- **Webviews** - Streaming embeds

### Storage Locations

**Config & Cache**:
- Windows: `%APPDATA%/streamhub-ai`
- Mac: `~/Library/Application Support/streamhub-ai`
- Linux: `~/.config/streamhub-ai`

**Logs**:
- Same as above, in `logs/` subfolder

## Future Features (Planned)

- 🎯 Plex/Jellyfin integration
- 📊 Watch statistics and history
- 🎨 Custom themes
- 🔍 Local subtitle search
- 📱 Mobile companion app
- 🎮 Controller support
- 📺 Chromecast integration
- 🌐 Browser extension companion

## FAQ

### Can I use this without the AI features?

Yes! The AI search requires an API key, but:
- Local media playback works without API key
- Streaming services work without API key
- Only AI search/recommendations need the API

### Does this work offline?

Partially:
- ✅ Local media playback works offline
- ❌ Streaming services need internet
- ❌ AI search needs internet

### Can I run multiple instances?

Yes, but:
- Only one instance per computer (desktop app)
- Multiple devices can access the web version
- Deploy to NAS for always-on access

### Is this legal?

Yes! StreamHub is:
- A media player for your files
- A web browser for streaming sites
- An AI search tool
- Does not download/pirate content
- Requires valid streaming subscriptions

## Support

For issues, feature requests, or questions:
- Check the troubleshooting section above
- Review other docs: SETUP.md, TV-SETUP.md, SYNOLOGY-SETUP.md
- Open an issue on GitHub

## License

This project is for personal use. Streaming services remain property of their respective owners. Use requires valid subscriptions to streaming platforms.
