# Smart TV Setup Guide

StreamHub AI now supports Smart TV access with optimized TV mode, voice search, and remote control navigation!

## ⚠️ WSL2 Users (Windows)

If you're running this in WSL2 on Windows, you need to set up port forwarding first:

**Run this in Windows PowerShell as Administrator:**
```powershell
cd path\to\streamhub-ai
.\setup-wsl-network.ps1
```

Or follow the manual setup in [WSL-NETWORK-SETUP.md](./WSL-NETWORK-SETUP.md).

Then use your **Windows PC's IP** (not WSL IP) to access from your TV.

---

## Quick Setup

### 1. Start the Server

**Option A: Development Mode**
```bash
# Terminal 1 - Backend
cd server
npm install
npm start

# Terminal 2 - Frontend
npm install
npm run dev
```

**Option B: Docker (Recommended for NAS)**
```bash
docker-compose up -d
```

### 2. Find Your Server IP Address

**Linux/Mac:**
```bash
hostname -I
# Example output: 192.168.1.100
```

**Windows:**
```bash
ipconfig
# Look for "IPv4 Address" under your active network adapter
```

### 3. Connect from Your Smart TV

1. Open the **web browser** on your Smart TV
   - Samsung: Internet Browser
   - LG: Web Browser
   - Sony/Android TV: Chrome or built-in browser
   - Fire TV: Silk Browser or Firefox

2. Navigate to your server:
   - Development: `http://YOUR_IP:5173`
   - Docker/Production: `http://YOUR_IP:3001`
   - Example: `http://192.168.1.100:3001`

3. Click the **📺 TV Mode** button in the top right

## TV Mode Features

### Remote Control Navigation
- **Arrow Keys/D-pad**: Navigate between buttons and links
- **Enter/Select**: Activate focused element
- **Back**: Browser back (varies by TV)

### Voice Search
- Click the **🎤 Voice** button
- Speak your query naturally
- Works best with Chrome-based TV browsers
- Example: "Find me a family-friendly sci-fi movie"

### Optimized UI
- **Larger text** - Easy to read from couch
- **Bigger buttons** - Easy to click with remote
- **Enhanced focus** - Clear blue outline shows what's selected
- **Bold colors** - High contrast for TV screens

## Supported Smart TV Browsers

| TV Brand | Browser | TV Mode | Voice Search | Navigation |
|----------|---------|---------|--------------|------------|
| Samsung (2018+) | Internet | ✅ | ✅ | ✅ |
| LG WebOS | Web Browser | ✅ | ✅ | ✅ |
| Android TV | Chrome | ✅ | ✅ | ✅ |
| Fire TV | Silk/Firefox | ✅ | ⚠️ Limited | ✅ |
| Apple TV | Safari | ✅ | ⚠️ Limited | ✅ |
| Roku | Web App | ✅ | ❌ | ✅ |

✅ = Full support | ⚠️ = Partial support | ❌ = Not supported

## Tips for Best TV Experience

### 1. Bookmark the Page
Save the URL in your TV browser for quick access

### 2. Use AI Search Mode
Perfect for voice search on TV:
- "Something like Breaking Bad but less dark"
- "Family movie for kids under 10"
- "30-minute comedy series"

### 3. Casting Alternative
If your TV browser doesn't work well:
- Open on phone/tablet
- Cast/mirror screen to TV
- Use phone as remote

### 4. Network Performance
- Use wired Ethernet on TV if possible
- Keep server on same network/VLAN
- 5GHz WiFi for best wireless performance

## Troubleshooting

### Can't Connect from TV

**Check firewall:**
```bash
# Linux - allow port
sudo ufw allow 3001

# Check if port is open
netstat -tuln | grep 3001
```

**Verify server is listening on network:**
```bash
# Should show 0.0.0.0:3001 not 127.0.0.1:3001
netstat -tuln | grep 3001
```

### Voice Search Not Working
- Try AI Search with keyboard instead
- Voice requires Chrome-based browser
- Some TV browsers don't support WebSpeech API

### Navigation Issues
- Enable TV Mode for better navigation
- Some remotes have a "pointer" mode - disable it
- Use arrow keys, not pointer

### Performance Issues
- Close other apps on TV
- Clear TV browser cache
- Use Docker deployment (faster than dev mode)
- Reduce AI recommendation requests

## Advanced: Static IP Setup

For permanent TV access, set static IP on your server:

**Linux (netplan):**
```yaml
# /etc/netplan/01-netcfg.yaml
network:
  version: 2
  ethernets:
    eth0:
      dhcp4: no
      addresses: [192.168.1.100/24]
      gateway4: 192.168.1.1
      nameservers:
        addresses: [8.8.8.8, 1.1.1.1]
```

Then bookmark: `http://192.168.1.100:3001`

## NAS Deployment for TV

If running on a NAS (Synology, QNAP, etc.):

1. Install Docker on NAS
2. Upload streamhub-ai folder
3. Configure `.env` with API key
4. Run `docker-compose up -d`
5. Access via NAS IP: `http://nas-ip:3001`

Many NAS systems have static IPs by default.

## Feature Comparison

| Feature | Desktop | Mobile | Smart TV |
|---------|---------|--------|----------|
| AI Search | ✅ | ✅ | ✅ |
| Voice Search | ✅ | ✅ | ✅* |
| Multi-tab Search | ✅ | ✅ | ⚠️ |
| Service Grid | ✅ | ✅ | ✅ |
| Remote Navigation | ⚠️ | ❌ | ✅ |
| TV Mode | Optional | Optional | Recommended |

*Voice search availability depends on TV browser

## Support

TV Mode works best on:
- Modern Smart TVs (2018+)
- Chrome-based browsers
- Android TV devices
- Fire TV with updated browsers

For issues or feature requests, visit the project repository.
