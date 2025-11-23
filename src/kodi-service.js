/**
 * Kodi JSON-RPC API Client
 * Connects to Kodi to fetch library, metadata, and control playback
 */

class KodiService {
  constructor(host = 'localhost', port = 8080, username = '', password = '') {
    this.host = host;
    this.port = port;
    this.username = username;
    this.password = password;
    this.baseUrl = `http://${host}:${port}/jsonrpc`;
  }

  /**
   * Make a JSON-RPC call to Kodi
   */
  async request(method, params = {}) {
    const payload = {
      jsonrpc: '2.0',
      method: method,
      params: params,
      id: 1
    };

    const headers = {
      'Content-Type': 'application/json'
    };

    // Add basic auth if credentials provided
    if (this.username) {
      const auth = btoa(`${this.username}:${this.password}`);
      headers['Authorization'] = `Basic ${auth}`;
    }

    try {
      const response = await fetch(this.baseUrl, {
        method: 'POST',
        headers,
        body: JSON.stringify(payload)
      });

      if (!response.ok) {
        throw new Error(`Kodi API error: ${response.status}`);
      }

      const data = await response.json();

      if (data.error) {
        throw new Error(`Kodi error: ${data.error.message}`);
      }

      return data.result;
    } catch (error) {
      console.error('Kodi request failed:', error);
      throw error;
    }
  }

  /**
   * Test connection to Kodi
   */
  async testConnection() {
    try {
      const result = await this.request('JSONRPC.Ping');
      return result === 'pong';
    } catch (error) {
      return false;
    }
  }

  /**
   * Get Kodi version info
   */
  async getVersion() {
    return await this.request('Application.GetProperties', {
      properties: ['version', 'name']
    });
  }

  /**
   * Get all movies from Kodi library
   */
  async getMovies() {
    try {
      const result = await this.request('VideoLibrary.GetMovies', {
        properties: [
          'title',
          'year',
          'rating',
          'runtime',
          'genre',
          'director',
          'plot',
          'plotoutline',
          'tagline',
          'thumbnail',
          'fanart',
          'file',
          'playcount',
          'dateadded',
          'lastplayed',
          'mpaa',
          'imdbnumber',
          'trailer'
        ],
        sort: { order: 'ascending', method: 'title' }
      });

      if (!result || !result.movies) {
        return [];
      }

      // Convert Kodi image paths to full URLs
      return result.movies.map(movie => ({
        ...movie,
        thumbnail: this.getImageUrl(movie.thumbnail),
        fanart: this.getImageUrl(movie.fanart),
        type: 'movie',
        source: 'kodi'
      }));
    } catch (error) {
      console.error('Failed to get Kodi movies:', error);
      return [];
    }
  }

  /**
   * Get all TV shows from Kodi library
   */
  async getTVShows() {
    try {
      const result = await this.request('VideoLibrary.GetTVShows', {
        properties: [
          'title',
          'year',
          'rating',
          'genre',
          'plot',
          'plotoutline',
          'thumbnail',
          'fanart',
          'playcount',
          'episode',
          'watchedepisodes',
          'dateadded',
          'lastplayed',
          'mpaa',
          'imdbnumber'
        ],
        sort: { order: 'ascending', method: 'title' }
      });

      if (!result || !result.tvshows) {
        return [];
      }

      return result.tvshows.map(show => ({
        ...show,
        thumbnail: this.getImageUrl(show.thumbnail),
        fanart: this.getImageUrl(show.fanart),
        type: 'tvshow',
        source: 'kodi'
      }));
    } catch (error) {
      console.error('Failed to get Kodi TV shows:', error);
      return [];
    }
  }

  /**
   * Get recently added movies
   */
  async getRecentlyAddedMovies(limit = 10) {
    try {
      const result = await this.request('VideoLibrary.GetRecentlyAddedMovies', {
        properties: [
          'title',
          'year',
          'rating',
          'runtime',
          'genre',
          'plot',
          'thumbnail',
          'fanart',
          'file',
          'dateadded'
        ],
        limits: { end: limit }
      });

      if (!result || !result.movies) {
        return [];
      }

      return result.movies.map(movie => ({
        ...movie,
        thumbnail: this.getImageUrl(movie.thumbnail),
        fanart: this.getImageUrl(movie.fanart),
        type: 'movie',
        source: 'kodi'
      }));
    } catch (error) {
      console.error('Failed to get recently added movies:', error);
      return [];
    }
  }

  /**
   * Search Kodi library
   */
  async search(query) {
    const movies = await this.getMovies();
    const tvshows = await this.getTVShows();

    const allContent = [...movies, ...tvshows];
    const lowerQuery = query.toLowerCase();

    return allContent.filter(item =>
      item.title.toLowerCase().includes(lowerQuery) ||
      (item.plot && item.plot.toLowerCase().includes(lowerQuery)) ||
      (item.genre && item.genre.some(g => g.toLowerCase().includes(lowerQuery)))
    );
  }

  /**
   * Play a movie or episode in Kodi
   */
  async play(kodiId, type = 'movie') {
    try {
      const method = type === 'movie' ? 'Player.Open' : 'Player.Open';
      const item = type === 'movie'
        ? { movieid: kodiId }
        : { episodeid: kodiId };

      await this.request(method, { item });
      return true;
    } catch (error) {
      console.error('Failed to play in Kodi:', error);
      return false;
    }
  }

  /**
   * Get currently playing item
   */
  async getNowPlaying() {
    try {
      const players = await this.request('Player.GetActivePlayers');

      if (!players || players.length === 0) {
        return null;
      }

      const playerId = players[0].playerid;
      const item = await this.request('Player.GetItem', {
        playerid: playerId,
        properties: ['title', 'thumbnail', 'fanart']
      });

      return {
        ...item.item,
        thumbnail: this.getImageUrl(item.item.thumbnail),
        fanart: this.getImageUrl(item.item.fanart)
      };
    } catch (error) {
      console.error('Failed to get now playing:', error);
      return null;
    }
  }

  /**
   * Control playback
   */
  async playPause() {
    try {
      const players = await this.request('Player.GetActivePlayers');
      if (players && players.length > 0) {
        await this.request('Player.PlayPause', { playerid: players[0].playerid });
        return true;
      }
      return false;
    } catch (error) {
      console.error('Failed to play/pause:', error);
      return false;
    }
  }

  async stop() {
    try {
      const players = await this.request('Player.GetActivePlayers');
      if (players && players.length > 0) {
        await this.request('Player.Stop', { playerid: players[0].playerid });
        return true;
      }
      return false;
    } catch (error) {
      console.error('Failed to stop:', error);
      return false;
    }
  }

  /**
   * Convert Kodi image path to full URL
   */
  getImageUrl(imagePath) {
    if (!imagePath) return null;

    // Kodi images are encoded, need to decode and convert to URL
    const decoded = decodeURIComponent(imagePath);

    // If it's already a URL, return it
    if (decoded.startsWith('http')) {
      return decoded;
    }

    // Remove image:// prefix if present
    const cleanPath = decoded.replace('image://', '');

    // Encode for URL
    const encoded = encodeURIComponent(cleanPath);

    // Return as Kodi VFS path
    return `http://${this.host}:${this.port}/image/${encoded}`;
  }

  /**
   * Update connection settings
   */
  updateSettings(host, port, username, password) {
    this.host = host;
    this.port = port;
    this.username = username;
    this.password = password;
    this.baseUrl = `http://${host}:${port}/jsonrpc`;
  }
}

// Export singleton instance
let kodiInstance = null;

export function getKodiService(host, port, username, password) {
  if (!kodiInstance || host || port) {
    kodiInstance = new KodiService(host, port, username, password);
  }
  return kodiInstance;
}

export default KodiService;
