# StreamHub AI - Setup Guide

StreamHub AI is an all-in-one streaming services hub with AI-powered search and recommendations.

## Features

### 🎯 Core Features
- **Quick Launch** - Access all your streaming services from one place
- **Unified Search** - Search across multiple platforms at once
- **Continue Watching** - Track your watch progress
- **What's New** - Discover new content on your services

### 🤖 AI Features
- **Natural Language Search** - "Find me something like Inception but happier"
- **Smart Recommendations** - Personalized suggestions based on your taste
- **Context Understanding** - AI understands mood, themes, and preferences

## Quick Start

### Option 1: Docker (Recommended for NAS)

1. **Set up your API key:**
   ```bash
   cp server/.env.example server/.env
   # Edit server/.env and add your Anthropic API key
   ```

2. **Build and run:**
   ```bash
   docker-compose up -d
   ```

3. **Access the app:**
   Open http://your-nas-ip:3001

### Option 2: Development Mode

1. **Install dependencies:**
   ```bash
   # Frontend
   npm install

   # Backend
   cd server && npm install && cd ..
   ```

2. **Set up environment:**
   ```bash
   cp server/.env.example server/.env
   # Edit server/.env and add your Anthropic API key
   ```

3. **Run backend:**
   ```bash
   cd server
   npm start
   # Backend runs on http://localhost:3001
   ```

4. **Run frontend (in another terminal):**
   ```bash
   npm run dev
   # Frontend runs on http://localhost:5173
   ```

### Option 3: Production Build

1. **Build frontend:**
   ```bash
   npm run build
   cp -r dist/* server/public/
   ```

2. **Run server only:**
   ```bash
   cd server
   npm start
   # Serves both frontend and API on http://localhost:3001
   ```

## Getting an Anthropic API Key

1. Go to https://console.anthropic.com/
2. Sign up or log in
3. Go to API Keys section
4. Create a new API key
5. Copy the key to your `.env` file

## NAS Deployment

### Synology NAS

1. **Install Docker** (via Package Center)

2. **Upload files:**
   - Upload the entire project folder to your NAS
   - SSH into your NAS or use File Station

3. **Create .env file:**
   ```bash
   cd /volume1/docker/streamhub-ai
   cp server/.env.example server/.env
   nano server/.env  # Add your API key
   ```

4. **Run with Docker Compose:**
   ```bash
   docker-compose up -d
   ```

5. **Configure port forwarding** (optional):
   - Go to Control Panel > Login Portal > Advanced
   - Add reverse proxy rule if desired

### QNAP NAS

1. **Install Container Station**

2. **Create container:**
   - Use the provided Dockerfile
   - Map port 3001
   - Add environment variable: ANTHROPIC_API_KEY

3. **Access via Container Station UI or CLI**

### TrueNAS / Generic Linux NAS

1. **Install Docker and Docker Compose**

2. **Clone or upload project**

3. **Follow Docker deployment steps above**

## Data Directory

The `/data` folder contains optional JSON feeds:

### continue-watching.json
```json
{
  "updated": "2024-01-15",
  "items": [
    {
      "title": "Breaking Bad",
      "service": "Netflix",
      "type": "Series",
      "progress": 45,
      "note": "S3 E7",
      "link": "https://netflix.com/..."
    }
  ]
}
```

### new-this-week.json
```json
{
  "updated": "2024-01-15",
  "items": [
    {
      "title": "New Movie",
      "service": "Disney+",
      "type": "Movie",
      "note": "Just added"
    }
  ]
}
```

These files are optional but enable the Continue Watching and What's New features.

## Environment Variables

| Variable | Required | Description |
|----------|----------|-------------|
| ANTHROPIC_API_KEY | Yes | Your Anthropic Claude API key |
| PORT | No | Server port (default: 3001) |
| NODE_ENV | No | Environment (development/production) |

## Troubleshooting

### AI features not working
- Check that backend is running on port 3001
- Verify ANTHROPIC_API_KEY is set correctly
- Check browser console for errors
- Ensure you have API credits in your Anthropic account

### Docker container won't start
- Check logs: `docker-compose logs`
- Verify .env file exists and has API key
- Ensure port 3001 is not in use

### Cannot access from other devices
- Check firewall settings on NAS
- Verify port 3001 is accessible
- For Synology, check Login Portal settings

## Custom Services

Click "Add Service" to add custom streaming platforms:
- Enter service name (e.g., "Crunchyroll")
- Enter homepage URL
- Service will be saved to browser localStorage

## Privacy

- All settings stored locally in browser
- No accounts or credentials stored on server
- AI requests sent to Anthropic API only
- Watch history stays in your browser

## Support

For issues or questions:
- Check logs: `docker-compose logs` or `npm run dev`
- Verify API key is correct
- Ensure you're using Node.js 18+

## Future Features (Coming Soon)

- Voice search
- Content summaries
- Smart grouping
- Watch party recommendations
- Calendar integration
- Plex integration
