# StreamHub AI

An all-in-one streaming services hub with AI-powered search and recommendations.

## Features

- 🎯 **Quick Launch** - Access all your streaming services from one place
- 🔍 **Unified Search** - Search across multiple platforms simultaneously
- 🤖 **AI Natural Language Search** - "Find me something like Inception but happier"
- ✨ **Smart Recommendations** - Personalized AI suggestions based on your taste
- 📺 **Continue Watching** - Track your progress across services
- 🆕 **What's New** - Discover new content on your platforms
- 🔒 **Privacy First** - All settings stored locally, no accounts needed

## Quick Start

1. **Set up API key:**
   ```bash
   cp server/.env.example server/.env
   # Add your Anthropic API key to server/.env
   ```

2. **Run with Docker:**
   ```bash
   docker-compose up -d
   ```

3. **Or run in development:**
   ```bash
   npm install && cd server && npm install && cd ..
   npm run dev          # Terminal 1: Frontend
   npm run dev:server   # Terminal 2: Backend
   ```

See [SETUP.md](./SETUP.md) for detailed instructions, NAS deployment, and troubleshooting.

## Tech Stack

- React 19 + Vite
- Node.js + Express
- Anthropic Claude API
- Docker
