import Anthropic from '@anthropic-ai/sdk';

const anthropic = new Anthropic({
  apiKey: process.env.ANTHROPIC_API_KEY,
});

const STREAMING_SERVICES = [
  'Netflix', 'Prime Video', 'Max', 'Hulu', 'Disney+', 'Apple TV+',
  'Paramount+', 'Peacock', 'Plex', 'Starz', 'Showtime'
];

/**
 * Natural Language Search - converts user's natural language into structured search
 */
export async function searchWithNaturalLanguage(query, availableServices = []) {
  const services = availableServices.length > 0
    ? availableServices
    : STREAMING_SERVICES;

  const prompt = `You are a streaming content search assistant. A user wants to find something to watch.

User's search query: "${query}"

Available streaming services: ${services.join(', ')}

Analyze this query and provide:
1. The actual content they're looking for (title if specific, or genre/theme)
2. Key attributes (genre, mood, year, actors, themes, etc.)
3. Which streaming services are most likely to have this content
4. 3-5 specific recommendations that match their request

Be conversational and helpful. If the query is vague, make reasonable assumptions.

Respond in JSON format:
{
  "interpretation": "What you understood from their request",
  "searchTerms": ["term1", "term2"],
  "attributes": {
    "genre": ["genre1", "genre2"],
    "mood": "mood description",
    "themes": ["theme1", "theme2"],
    "other": "any other relevant info"
  },
  "recommendations": [
    {
      "title": "Show/Movie Name",
      "type": "Movie/Series",
      "service": "Service Name",
      "match": "Why this matches their request",
      "year": 2023
    }
  ],
  "suggestedServices": ["Service1", "Service2"]
}`;

  try {
    const message = await anthropic.messages.create({
      model: 'claude-3-haiku-20240307',
      max_tokens: 2000,
      messages: [{
        role: 'user',
        content: prompt
      }]
    });

    const responseText = message.content[0].text;

    // Extract JSON from response (Claude might wrap it in markdown)
    const jsonMatch = responseText.match(/\{[\s\S]*\}/);
    if (jsonMatch) {
      const parsed = JSON.parse(jsonMatch[0]);
      return {
        success: true,
        ...parsed,
        originalQuery: query
      };
    }

    throw new Error('Failed to parse AI response');
  } catch (error) {
    console.error('AI Search Error:', error);
    throw error;
  }
}

/**
 * Smart Recommendations - personalized content suggestions
 */
export async function getRecommendations(watchHistory = [], preferences = {}, services = []) {
  const serviceList = services.length > 0 ? services : STREAMING_SERVICES;

  const watchHistoryText = watchHistory.length > 0
    ? watchHistory.map(item => `- ${item.title} (${item.service}) - ${item.type || 'Unknown type'}`).join('\n')
    : 'No watch history provided';

  const preferencesText = Object.keys(preferences).length > 0
    ? JSON.stringify(preferences, null, 2)
    : 'No specific preferences provided';

  const prompt = `You are a personalized streaming recommendation engine. Based on a user's watching patterns, provide intelligent recommendations.

Watch History:
${watchHistoryText}

User Preferences:
${preferencesText}

Available Services: ${serviceList.join(', ')}

Analyze their taste and provide 5-7 personalized recommendations. Consider:
- Patterns in genres, themes, and moods they enjoy
- Variety (don't recommend all the same genre)
- Hidden gems they might not know about
- Recent releases that match their taste
- Mix of movies and series

Respond in JSON format:
{
  "analysis": "Brief analysis of their watching patterns and taste",
  "recommendations": [
    {
      "title": "Show/Movie Name",
      "type": "Movie/Series",
      "service": "Service Name",
      "genre": ["genre1", "genre2"],
      "year": 2023,
      "reasoning": "Why this matches their taste",
      "confidence": 85,
      "mood": "uplifting/dark/thrilling/etc",
      "hiddenGem": false
    }
  ],
  "moodProfile": "Overall description of their content preferences"
}`;

  try {
    const message = await anthropic.messages.create({
      model: 'claude-3-haiku-20240307',
      max_tokens: 2500,
      messages: [{
        role: 'user',
        content: prompt
      }]
    });

    const responseText = message.content[0].text;

    // Extract JSON from response
    const jsonMatch = responseText.match(/\{[\s\S]*\}/);
    if (jsonMatch) {
      const parsed = JSON.parse(jsonMatch[0]);
      return {
        success: true,
        ...parsed
      };
    }

    throw new Error('Failed to parse AI response');
  } catch (error) {
    console.error('AI Recommendations Error:', error);
    throw error;
  }
}
