# Quick Start Guide

## 🚀 Get Running in 5 Minutes

### Step 1: Get Your API Key
1. Go to https://console.anthropic.com/
2. Sign up/login
3. Create an API key
4. Copy the key

### Step 2: Configure
```bash
cd /home/robbie/streamhub-ai
cp server/.env.example server/.env
nano server/.env
```

Add your key:
```
ANTHROPIC_API_KEY=sk-ant-your-key-here
PORT=3001
NODE_ENV=development
```

### Step 3: Install & Run (Development)

**Terminal 1 - Backend:**
```bash
cd server
npm install
npm start
```

**Terminal 2 - Frontend:**
```bash
npm install
npm run dev
```

Open http://localhost:5173

### Step 4: Test AI Features

1. **Try Natural Language Search:**
   - Click "AI Search" button
   - Type: "sci-fi movie with time travel, family friendly"
   - Click "AI Search"
   - Wait 3-5 seconds for AI response

2. **Try Smart Recommendations:**
   - Scroll to "AI Recommendations" section
   - Click "Get AI Suggestions"
   - Wait for personalized recommendations

## 📦 Deploy to NAS (Docker)

```bash
# 1. Set up environment
cp server/.env.example server/.env
# Edit server/.env with your API key

# 2. Build and run
docker-compose up -d

# 3. Check status
docker-compose ps
docker-compose logs

# 4. Access
# http://your-nas-ip:3001
```

## 🔧 Troubleshooting

**AI features not working?**
```bash
# Check backend is running:
curl http://localhost:3001/health

# Should return: {"status":"ok","message":"StreamHub AI API is running"}

# Check API key is set:
cd server && cat .env
```

**Port already in use?**
```bash
# Change port in server/.env:
PORT=3002

# Or stop conflicting service:
lsof -i :3001
```

**Docker issues?**
```bash
# Check logs:
docker-compose logs -f

# Rebuild:
docker-compose down
docker-compose up -d --build
```

## 📝 What's Next?

After setup:
1. Add your streaming services (or use defaults)
2. Enable/disable services for search
3. Create `data/continue-watching.json` for tracking
4. Create `data/new-this-week.json` for discoveries
5. Try AI search with natural language
6. Get personalized recommendations

## 🎯 Example AI Queries

**Natural Language Search:**
- "Something like Breaking Bad but less dark"
- "Romantic comedy from the 2010s"
- "Sci-fi series under 30 minute episodes"
- "That show with the guy from The Office"
- "Family movie I can watch with 8 year old"

**Tips:**
- Be specific about mood, genre, length
- Mention similar shows you liked
- Specify restrictions (family-friendly, no gore, etc.)
- AI understands context and preferences

## 📊 Project Structure

```
streamhub-ai/
├── src/               # React frontend
│   ├── App.jsx       # Main component
│   ├── api.js        # API client
│   └── index.css     # Styles
├── server/           # Backend API
│   ├── index.js      # Express server
│   ├── ai-service.js # Claude AI integration
│   └── .env          # Your config (not in git)
├── data/             # Optional JSON feeds
│   ├── continue-watching.json
│   └── new-this-week.json
├── Dockerfile        # Docker build
├── docker-compose.yml
└── SETUP.md          # Full documentation
```

## 💡 Pro Tips

1. **Multiple terminals in development:**
   - Use tmux or screen
   - Or use VS Code split terminal

2. **For NAS:**
   - Use docker-compose (easiest)
   - Set static IP for NAS
   - Add bookmark to phone/devices

3. **Privacy:**
   - No accounts stored on server
   - Settings in browser localStorage
   - Only AI queries sent to Anthropic

4. **Future features:**
   - Voice search coming soon
   - Plex integration planned
   - Watch party recommendations
   - Content summaries
