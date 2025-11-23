# StreamHub AI

The ultimate all-in-one streaming and media center. Access all your streaming services AND play your local movies from a single app - available as web, desktop, or deploy to your NAS.

## Features

### Web & TV
- 🎯 **Quick Launch** - Access all your streaming services from one place
- 🔍 **Unified Search** - Search across multiple platforms simultaneously
- 🤖 **AI Natural Language Search** - "Find me something like Inception but happier"
- ✨ **Smart Recommendations** - Personalized AI suggestions based on your taste
- 📺 **Continue Watching** - Track your progress across services
- 🆕 **What's New** - Discover new content on your platforms
- 🎮 **Smart TV Support** - TV mode with voice search and remote navigation
- 🎤 **Voice Search** - Speak your queries naturally

### Desktop App (NEW!)
- 🎯 **Kodi Integration** - Connect to Kodi for organized library with posters & metadata
- 📁 **Local Media Library** - Play your own movie files (MP4, MKV, AVI, etc.)
- 🎬 **Embedded Streaming** - All services in one window with sidebar navigation
- 🖥️ **Built-in Player** - No need for external video players
- 🔄 **Auto-Scan** - Automatically find and organize your video files
- 💾 **Persistent Logins** - Sign in once to each streaming service
- 🎭 **Flexible Playback** - Play Kodi content in Kodi or built-in player

### Privacy & Deployment
- 🔒 **Privacy First** - All settings stored locally, no accounts needed
- 🏠 **NAS Deployment** - Run on Synology for always-on access
- 🌐 **Network Access** - Access from any device on your network

## Quick Start

### Desktop App (Recommended)

```bash
# 1. Install dependencies
npm install && cd server && npm install && cd ..

# 2. Set up API key
cp server/.env.example server/.env
# Edit server/.env and add your Anthropic API key

# 3. Run the desktop app
npm run dev:electron
```

**Then:** Add your movie folder, browse streaming services, and use AI search!

### Web Version

```bash
# 1. Set up as above, then:
npm run dev          # Terminal 1: Frontend
npm run dev:server   # Terminal 2: Backend

# Open http://localhost:5173
```

### Docker (For NAS/Server)

```bash
docker-compose up -d
# Access at http://your-server-ip:3001
```

### Synology NAS with Kodi (Ultimate Setup!)

Deploy both Kodi and StreamHub together on Synology:

```bash
# See SYNOLOGY-KODI-SETUP.md for full guide
docker-compose -f docker-compose.synology.yml up -d
# Access at http://synology-ip:3001
# Kodi at http://synology-ip:8080
```

This gives you:
- ✅ Kodi library with posters/metadata
- ✅ StreamHub with streaming services
- ✅ AI search across everything
- ✅ Always-on NAS deployment

## Deployment Guides

- **[SYNOLOGY-KODI-SETUP.md](./SYNOLOGY-KODI-SETUP.md)** - 🔥 **ULTIMATE SETUP:** Kodi + StreamHub on Synology NAS
- **[DESKTOP-APP.md](./DESKTOP-APP.md)** - Desktop app with local media + streaming
- **[SYNOLOGY-SETUP.md](./SYNOLOGY-SETUP.md)** - Deploy StreamHub to Synology NAS (always-on access)
- **[TV-SETUP.md](./TV-SETUP.md)** - Smart TV setup with voice search and remote control
- **[SETUP.md](./SETUP.md)** - Detailed setup instructions and troubleshooting
- **[WSL-NETWORK-SETUP.md](./WSL-NETWORK-SETUP.md)** - WSL2 port forwarding for Windows development

## Tech Stack

- React 19 + Vite
- Node.js + Express
- Anthropic Claude API
- Docker
