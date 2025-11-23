# Synology + Kodi Deployment Checklist

Quick checklist for deploying StreamHub AI + Kodi to your Synology NAS.

## Before You Start

- [ ] Synology NAS with Docker/Container Manager installed
- [ ] Media files (movies/TV) stored on NAS
- [ ] SSH access enabled on Synology
- [ ] Anthropic API key ready
- [ ] Know your media folder paths (e.g., `/volume1/movies`)

## Step-by-Step Deployment

### 1. Prepare Files

- [ ] Build the frontend: `npm run build`
- [ ] Verify `dist/` folder exists
- [ ] Upload entire project to Synology `/docker/streamhub-ai`
- [ ] Verify these files are present:
  - [ ] `docker-compose.synology.yml`
  - [ ] `Dockerfile`
  - [ ] `server/` folder
  - [ ] `dist/` folder
  - [ ] `server/.env.example`

### 2. Configure

- [ ] Copy `server/.env.example` to `server/.env`
- [ ] Add Anthropic API key to `server/.env`
- [ ] Edit `docker-compose.synology.yml`
- [ ] Update media volume paths (movies, TV shows)
- [ ] Update timezone if needed

### 3. Deploy

- [ ] SSH into Synology: `ssh admin@synology-ip`
- [ ] Navigate to project: `cd /volume1/docker/streamhub-ai`
- [ ] Deploy services: `sudo docker-compose -f docker-compose.synology.yml up -d`
- [ ] Check status: `sudo docker-compose -f docker-compose.synology.yml ps`
- [ ] Both containers should show "running"

### 4. Configure Kodi

- [ ] Open Kodi web interface: `http://synology-ip:8080`
- [ ] Add media sources:
  - [ ] Movies: Browse to `/media/movies`
  - [ ] TV Shows: Browse to `/media/tv`
- [ ] Start library scan
- [ ] Wait for metadata scraping (30 min - 2 hours for first scan)
- [ ] Verify posters/metadata appear

### 5. Connect StreamHub to Kodi

- [ ] Open StreamHub: `http://synology-ip:3001`
- [ ] Scroll to "Kodi Library" section
- [ ] Click "⚙️ Connect to Kodi"
- [ ] Enter settings:
  - [ ] Host: `kodi`
  - [ ] Port: `8080`
  - [ ] Username: (leave blank)
  - [ ] Password: (leave blank)
- [ ] Click "Connect to Kodi"
- [ ] Verify success message appears
- [ ] Check library loads with posters

### 6. Test Access

- [ ] From desktop: `http://synology-ip:3001` ✓
- [ ] From Smart TV: `http://synology-ip:3001` ✓
- [ ] Enable TV Mode on TV ✓
- [ ] Test AI search ✓
- [ ] Test voice search ✓
- [ ] Browse Kodi library ✓
- [ ] Click streaming service ✓

### 7. Bookmark

- [ ] Add to Smart TV browser bookmarks
- [ ] Add to phone/tablet home screen
- [ ] Add to desktop bookmarks
- [ ] Share URL with family members

## Troubleshooting

If something doesn't work, check:

- [ ] Both containers are running: `sudo docker ps`
- [ ] Check Kodi logs: `sudo docker logs streamhub-kodi`
- [ ] Check StreamHub logs: `sudo docker logs streamhub-ai`
- [ ] Verify API key in `server/.env`
- [ ] Test Kodi direct: `http://synology-ip:8080`
- [ ] Verify media folders exist and are readable
- [ ] Check firewall settings (if enabled)

## Optional Enhancements

- [ ] Set static IP on Synology
- [ ] Configure reverse proxy for HTTPS
- [ ] Enable Kodi auto-library updates
- [ ] Set up Synology auto-backup
- [ ] Configure firewall rules
- [ ] Add more media folders

## You're Done! 🎉

Your unified media center is now:
✅ Always-on (NAS runs 24/7)
✅ Network accessible (any device)
✅ Beautiful UI (Netflix-style with posters)
✅ AI-powered (natural language search)
✅ Unified (local media + streaming services)

Access URL: **http://YOUR_SYNOLOGY_IP:3001**

Enjoy! 🍿📺
