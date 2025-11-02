// API service for backend communication
const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:3001';

export async function aiSearch(query, services) {
  const response = await fetch(`${API_BASE_URL}/api/search`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ query, services })
  });

  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.message || 'Search failed');
  }

  return response.json();
}

export async function getAIRecommendations(watchHistory, preferences, services) {
  const response = await fetch(`${API_BASE_URL}/api/recommendations`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ watchHistory, preferences, services })
  });

  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.message || 'Failed to get recommendations');
  }

  return response.json();
}
