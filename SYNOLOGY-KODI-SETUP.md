# StreamHub AI + Kodi on Synology NAS

Complete guide to deploy both Kodi and StreamHub AI together on your Synology NAS for the ultimate media center.

## What This Sets Up

```
┌─────────────────────────────────────────────┐
│         Synology NAS (Always On)            │
│                                             │
│  ┌────────────────────────────────────┐    │
│  │  Kodi Headless                     │    │
│  │  - Port 8080                       │    │
│  │  - Scans your media folders        │    │
│  │  - Provides metadata & artwork     │    │
│  └────────────────────────────────────┘    │
│              ↓ (internal network)           │
│  ┌────────────────────────────────────┐    │
│  │  StreamHub AI                      │    │
│  │  - Port 3001                       │    │
│  │  - Connects to Kodi automatically  │    │
│  │  - AI search & streaming services  │    │
│  └────────────────────────────────────┘    │
└─────────────────────────────────────────────┘
                    ↓
        Access from any device:
        http://SYNOLOGY_IP:3001
```

## Prerequisites

1. **Synology NAS** with Docker/Container Manager installed
2. **Media files** stored on your NAS (movies, TV shows)
3. **SSH access** enabled on Synology
4. **Anthropic API key** for AI features

## Quick Start (5 Minutes)

### Step 1: Upload Files to Synology

1. Open **File Station** in DSM
2. Create folder: `/docker/streamhub-ai`
3. Upload ALL project files to this folder
4. Make sure these files are included:
   - `docker-compose.synology.yml`
   - `Dockerfile`
   - `server/` folder
   - `dist/` folder (run `npm run build` first if not present)
   - All other project files

### Step 2: Configure Environment

1. In File Station, navigate to `/docker/streamhub-ai/server/`
2. Copy `.env.example` to `.env`
3. Edit `.env` and add your API key:

```env
ANTHROPIC_API_KEY=sk-ant-your-key-here
PORT=3001
NODE_ENV=production
```

### Step 3: Update Media Paths

1. Edit `docker-compose.synology.yml`
2. Update the volume paths under the `kodi` service:

```yaml
volumes:
  # Change these to match YOUR Synology folder structure!
  - /volume1/movies:/media/movies:ro          # Your movies folder
  - /volume1/tv-shows:/media/tv:ro            # Your TV shows folder
  - /volume1/music:/media/music:ro            # Your music folder
```

**Common Synology paths:**
- Movies: `/volume1/video/movies` or `/volume1/movies`
- TV: `/volume1/video/tv` or `/volume1/tv-shows`
- Check your actual paths in File Station!

### Step 4: Deploy via SSH

1. **SSH into your Synology:**
   ```bash
   ssh your-username@synology-ip
   ```

2. **Navigate to project:**
   ```bash
   cd /volume1/docker/streamhub-ai
   ```

3. **Deploy both services:**
   ```bash
   sudo docker-compose -f docker-compose.synology.yml up -d
   ```

4. **Check status:**
   ```bash
   sudo docker-compose -f docker-compose.synology.yml ps
   ```

### Step 5: Initial Kodi Setup

1. **Access Kodi web interface:**
   ```
   http://YOUR_SYNOLOGY_IP:8080
   ```

2. **Enable web server** (if prompted):
   - Settings → Services → Control
   - Enable "Allow remote control via HTTP"

3. **Add media sources:**
   - Movies: Browse to `/media/movies`
   - TV Shows: Browse to `/media/tv`

4. **Scan library:**
   - Let Kodi scrape metadata (this takes a while first time)
   - It will download posters, ratings, plot summaries

5. **Wait for scanning to complete** (can take 30 min - 2 hours depending on library size)

### Step 6: Access StreamHub

1. **Open StreamHub:**
   ```
   http://YOUR_SYNOLOGY_IP:3001
   ```

2. **Scroll down to "Kodi Library" section**

3. **Click "⚙️ Connect to Kodi"**

4. **Enter connection details:**
   - **Host:** `kodi` (Docker service name - they're on same network!)
   - **Port:** `8080`
   - **Username:** *(leave blank)*
   - **Password:** *(leave blank)*

5. **Click "Connect to Kodi"**

6. **Your library loads with posters!** 🎉

## What You Get

### From Kodi:
✅ Organized movie/TV library
✅ Beautiful posters and artwork
✅ Ratings, genres, cast info
✅ Automatic metadata scraping
✅ Works with your existing media files

### From StreamHub:
✅ Browse Kodi library with Netflix-style UI
✅ All streaming services in one place
✅ AI-powered search across everything
✅ Voice search
✅ TV mode for Smart TVs
✅ Always-on access

## Managing the Services

### View Logs

```bash
# Both services
sudo docker-compose -f docker-compose.synology.yml logs -f

# Just Kodi
sudo docker logs streamhub-kodi -f

# Just StreamHub
sudo docker logs streamhub-ai -f
```

### Restart Services

```bash
# Restart both
sudo docker-compose -f docker-compose.synology.yml restart

# Restart just Kodi
sudo docker restart streamhub-kodi

# Restart just StreamHub
sudo docker restart streamhub-ai
```

### Stop Services

```bash
sudo docker-compose -f docker-compose.synology.yml down
```

### Update Services

```bash
cd /volume1/docker/streamhub-ai

# Pull latest images
sudo docker-compose -f docker-compose.synology.yml pull

# Rebuild and restart
sudo docker-compose -f docker-compose.synology.yml up -d --build
```

## Synology Container Manager (GUI Method)

Alternatively, use Synology's Container Manager GUI:

1. **Open Container Manager**

2. **Project Tab:**
   - Create New
   - Name: streamhub-ai
   - Path: `/docker/streamhub-ai`
   - Set compose file: `docker-compose.synology.yml`

3. **Deploy** - It will pull images and start both containers

4. **Monitor** - View logs and status in GUI

## Accessing Your Services

### From Smart TV:
```
http://SYNOLOGY_IP:3001
```
- Enable TV Mode (📺 button)
- Use remote D-pad to navigate
- Connect to Kodi from settings

### From Desktop/Laptop:
```
http://SYNOLOGY_IP:3001
```
- Full web interface
- Browse Kodi library
- Access all streaming services

### From Mobile:
```
http://SYNOLOGY_IP:3001
```
- Works on any browser
- Responsive design

### Kodi Web Interface (Direct):
```
http://SYNOLOGY_IP:8080
```
- Manage Kodi settings
- View scan progress
- Add media sources

## Troubleshooting

### Kodi Not Scanning Media

**Check folder permissions:**
```bash
sudo chmod -R 755 /volume1/movies
sudo chmod -R 755 /volume1/tv-shows
```

**Check Kodi can see folders:**
```bash
sudo docker exec streamhub-kodi ls -la /media/movies
```

### StreamHub Can't Connect to Kodi

**Check Kodi is running:**
```bash
sudo docker ps | grep kodi
```

**Test connection from StreamHub container:**
```bash
sudo docker exec streamhub-ai curl http://kodi:8080/jsonrpc
```

**Check both are on same network:**
```bash
sudo docker network inspect streamhub-ai_streamhub-network
```

### Ports Already in Use

**Check what's using the port:**
```bash
sudo netstat -tulpn | grep 3001
sudo netstat -tulpn | grep 8080
```

**Change ports in `docker-compose.synology.yml`:**
```yaml
ports:
  - "3002:3001"  # Use 3002 instead of 3001
  - "8081:8080"  # Use 8081 instead of 8080
```

### Slow Performance

**Allocate more resources:**
Edit docker-compose.synology.yml:
```yaml
services:
  kodi:
    mem_limit: 2g
    cpus: '2.0'
  streamhub:
    mem_limit: 1g
    cpus: '1.0'
```

## Updating Your Library

### Add New Movies/TV Shows

1. Add files to your media folders on Synology
2. In Kodi web interface (port 8080):
   - Settings → Media → Library
   - Click "Update Library"
3. Wait for scan to complete
4. Refresh StreamHub to see new content

### Automatic Library Updates

**Enable Kodi auto-scan:**
1. Kodi web interface → Settings
2. Media → Library
3. Enable "Update library on startup"
4. Set "Update library interval" (e.g., every 30 minutes)

## Advanced Configuration

### Set Static IP for Synology

Recommended for reliable access:

1. DSM: Control Panel → Network → Network Interface
2. Edit your network interface
3. Select "Use manual configuration"
4. Set static IP (e.g., 192.168.1.50)

Then bookmark: `http://192.168.1.50:3001`

### Enable HTTPS (Reverse Proxy)

1. DSM: Control Panel → Application Portal → Reverse Proxy
2. Create new rule:
   - Source: `https://streamhub.local:443`
   - Destination: `http://localhost:3001`
3. Enable WebSocket support
4. Access via: `https://streamhub.local`

### Firewall Configuration

If firewall is enabled:

1. Control Panel → Security → Firewall
2. Edit Rules
3. Allow ports: 3001, 8080
4. Source: All or your local subnet

## Performance Tips

### For Large Libraries (>1000 movies):

**Kodi settings:**
- Increase cache size
- Use MySQL database (advanced)
- Schedule scans during off-hours

**Synology settings:**
- Use SSD cache if available
- Enable hardware transcoding
- Schedule resource-intensive tasks overnight

### Network Optimization:

- Use wired Ethernet when possible
- Enable Jumbo Frames (if supported)
- Use 5GHz WiFi for wireless devices

## Backup & Restore

### Backup Configuration:

```bash
# Backup Kodi config
sudo docker cp streamhub-kodi:/config ./kodi-config-backup

# Backup StreamHub data
cp -r /volume1/docker/streamhub-ai/data ./streamhub-data-backup
```

### Restore Configuration:

```bash
# Restore Kodi config
sudo docker cp ./kodi-config-backup/. streamhub-kodi:/config

# Restart Kodi
sudo docker restart streamhub-kodi
```

## Benefits of This Setup

✅ **Always-On** - NAS runs 24/7, access anytime
✅ **Centralized** - All media in one place
✅ **Network Access** - Any device can connect
✅ **Auto-Updates** - Kodi keeps library current
✅ **Beautiful UI** - Netflix-style browsing
✅ **AI Search** - Find content naturally
✅ **Unified** - Local + streaming in one app
✅ **Privacy** - All data stays on your NAS
✅ **No Subscriptions** - One-time setup, free forever

## Next Steps

1. ✅ Deploy both services (done above)
2. ✅ Let Kodi scan your library (wait for completion)
3. ✅ Connect StreamHub to Kodi
4. 🎬 Browse your library with beautiful posters
5. 📺 Access from Smart TV
6. 🔍 Try AI search
7. 🎤 Use voice search
8. 🌐 Access from anywhere on your network

## Support

For issues:
- Check Kodi logs: `sudo docker logs streamhub-kodi`
- Check StreamHub logs: `sudo docker logs streamhub-ai`
- Verify media paths in docker-compose.synology.yml
- Ensure API key is set in server/.env

Enjoy your unified media center! 🎉
