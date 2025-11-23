# Synology NAS Deployment Guide

Deploy StreamHub AI to your Synology NAS for permanent, always-on access from any device including Smart TVs.

## Prerequisites

- Synology NAS with Docker installed
- SSH access enabled (Control Panel > Terminal & SNMP > Enable SSH)
- Port 3001 available (or change in .env)

## Installation Methods

### Method 1: Using Synology File Station + SSH (Recommended)

#### Step 1: Upload Files

1. Open **File Station** in DSM
2. Create folder: `/docker/streamhub-ai`
3. Upload all project files to this folder
4. Upload should include:
   - `server/` folder
   - `src/` folder
   - `public/` folder
   - `data/` folder
   - `Dockerfile`
   - `docker-compose.yml`
   - `package.json`
   - etc.

#### Step 2: Configure Environment

1. In File Station, navigate to `/docker/streamhub-ai/server/`
2. Copy `.env.example` to `.env`
3. Right-click `.env` > Edit
4. Add your Anthropic API key:
   ```env
   ANTHROPIC_API_KEY=sk-ant-your-key-here
   PORT=3001
   NODE_ENV=production
   ```

#### Step 3: SSH Deployment

1. SSH into your Synology:
   ```bash
   ssh your-username@synology-ip
   ```

2. Navigate to project:
   ```bash
   cd /volume1/docker/streamhub-ai
   ```

3. Build and run:
   ```bash
   sudo docker-compose up -d
   ```

4. Check status:
   ```bash
   sudo docker-compose ps
   sudo docker-compose logs -f
   ```

### Method 2: Using Synology Container Manager (GUI)

#### Step 1: Upload Files
Same as Method 1 - upload all files to `/docker/streamhub-ai`

#### Step 2: Build Image

1. Open **Container Manager** in DSM
2. Go to **Image** tab
3. Click **Add** > **Build Image from Dockerfile**
4. Select folder: `/docker/streamhub-ai`
5. Image name: `streamhub-ai`
6. Click **Build**

#### Step 3: Create Container

1. Go to **Container** tab
2. Click **Create**
3. Select image: `streamhub-ai`
4. Container name: `streamhub-ai`
5. Click **Advanced Settings**:

   **Port Settings:**
   - Local Port: 3001
   - Container Port: 3001
   - Type: TCP

   **Environment:**
   - Add: `ANTHROPIC_API_KEY` = `your-api-key`
   - Add: `NODE_ENV` = `production`
   - Add: `PORT` = `3001`

   **Volume:**
   - Add Folder: `/docker/streamhub-ai/data` → `/app/server/public/data`

   **Auto-restart:**
   - Enable: Unless stopped

6. Click **Apply** > **Next** > **Done**

## Access StreamHub

### From Any Device on Your Network:
```
http://SYNOLOGY_IP:3001
```

Example: `http://192.168.1.50:3001`

### From Smart TV:
1. Open TV browser
2. Go to `http://SYNOLOGY_IP:3001`
3. Click **📺 TV Mode** button
4. Bookmark for easy access

### Find Your Synology IP:
- DSM: Control Panel > Network > Network Interface
- Usually: `192.168.1.x` or `10.0.0.x`
- Can be static (recommended) or DHCP

## Set Static IP (Recommended)

For permanent access without IP changes:

1. DSM: Control Panel > Network > Network Interface
2. Select your interface (usually LAN or eth0)
3. Click **Edit**
4. Select **Use manual configuration**
5. Set:
   - IP Address: `192.168.1.50` (example, use available IP)
   - Subnet Mask: `255.255.255.0`
   - Gateway: `192.168.1.1` (your router)
   - DNS: `8.8.8.8` or your router IP

Then bookmark: `http://192.168.1.50:3001` on all your devices!

## Reverse Proxy (Optional - for HTTPS/domain)

If you want to access via `https://streamhub.local`:

1. DSM: Control Panel > Login Portal > Advanced > Reverse Proxy
2. Click **Create**:
   - Description: StreamHub AI
   - Source:
     - Protocol: HTTPS
     - Hostname: streamhub.local (or your domain)
     - Port: 443
   - Destination:
     - Protocol: HTTP
     - Hostname: localhost
     - Port: 3001
3. Enable **WebSocket**
4. Click **Save**

## Updating

### Update via SSH:
```bash
cd /volume1/docker/streamhub-ai
git pull  # if using git
sudo docker-compose down
sudo docker-compose up -d --build
```

### Update via Container Manager:
1. Rebuild image (Image tab)
2. Recreate container with new image

## Data Management

### Continue Watching & New Releases

Create JSON files in `/docker/streamhub-ai/data/`:

**continue-watching.json:**
```json
{
  "updated": "2025-11-23",
  "items": [
    {
      "title": "Breaking Bad",
      "service": "Netflix",
      "type": "Series",
      "progress": 75,
      "link": "https://www.netflix.com/title/70143836"
    }
  ]
}
```

**new-this-week.json:**
```json
{
  "updated": "2025-11-23",
  "items": [
    {
      "title": "The Last of Us S2",
      "service": "Max",
      "type": "Series",
      "note": "New episodes weekly",
      "link": "https://www.max.com/shows/the-last-of-us"
    }
  ]
}
```

Access via File Station or SSH to edit these files.

## Firewall (if enabled)

If you have Synology Firewall enabled:

1. Control Panel > Security > Firewall
2. Edit Rules for your profile
3. Create > Select Applications > Custom:
   - Ports: TCP 3001
   - Source IP: All
4. Action: Allow

## Monitoring

### View Logs:
```bash
sudo docker-compose logs -f streamhub-ai
```

### Container Manager GUI:
1. Container Manager > Container tab
2. Select `streamhub-ai`
3. Click **Details** > **Log** tab

### Health Check:
```
http://SYNOLOGY_IP:3001/health
```
Should return: `{"status":"ok","message":"StreamHub AI API is running"}`

## Troubleshooting

### Container Won't Start
```bash
# Check logs
sudo docker-compose logs

# Common issues:
# 1. Missing API key in .env
# 2. Port 3001 already in use
# 3. Insufficient permissions
```

### Can't Access from Other Devices
- Check firewall settings
- Verify Synology IP is correct
- Ensure devices are on same network
- Try from Synology itself: `http://localhost:3001`

### Port Conflict
Change port in `.env` and `docker-compose.yml`:
```yaml
ports:
  - "3002:3002"  # Use 3002 instead
```

And in `.env`:
```env
PORT=3002
```

## Performance Tips

### Synology CPU/RAM
- Minimum: 2GB RAM, dual-core CPU
- Recommended: 4GB+ RAM for smooth AI responses
- AI calls use minimal resources (external API)

### Auto-Start on Boot
Already configured in `docker-compose.yml`:
```yaml
restart: unless-stopped
```

### Schedule Updates
Use Synology Task Scheduler to auto-update:
1. Control Panel > Task Scheduler
2. Create > Scheduled Task > User-defined script
3. Schedule: Weekly
4. Script:
   ```bash
   cd /volume1/docker/streamhub-ai
   docker-compose pull
   docker-compose up -d
   ```

## Backup

### Backup Configuration
```bash
# Backup entire config
tar -czf streamhub-backup.tar.gz /volume1/docker/streamhub-ai
```

### What to Backup:
- `/docker/streamhub-ai/server/.env` (API key)
- `/docker/streamhub-ai/data/` (watch history, feeds)
- (Everything else can be re-downloaded from git)

## Benefits of Synology Deployment

✅ Always-on access from any device
✅ Direct network access (no WSL issues)
✅ Easy to manage via DSM GUI
✅ Auto-restart on power failure
✅ Better performance than dev mode
✅ Can access remotely via QuickConnect/VPN
✅ Built-in backup/snapshot support

## Next Steps

Once deployed:
1. Bookmark `http://SYNOLOGY_IP:3001` on all devices
2. Enable TV Mode on Smart TV
3. Set up data feeds (continue-watching, new releases)
4. Configure static IP or reverse proxy
5. Set up Synology backup/snapshots
