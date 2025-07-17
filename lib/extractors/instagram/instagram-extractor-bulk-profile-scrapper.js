// Instagram Extractor using Resilient API
const fetch = require('node-fetch');

async function extractInstagramMetadataResilient(url) {
  const RAPIDAPI_KEY = process.env.RAPIDAPI_KEY;
  
  if (!RAPIDAPI_KEY) {
    throw new Error('RAPIDAPI_KEY environment variable is required');
  }

  const apiUrl = new URL('https://instagram-bulk-profile-scrapper.p.rapidapi.com/clients/api/ig/media_by_url');
  apiUrl.searchParams.append('ig', url);
  
  const response = await fetch(apiUrl.toString(), {
    method: 'GET',
    headers: {
      'X-RapidAPI-Key': RAPIDAPI_KEY,
      'X-RapidAPI-Host': 'instagram-bulk-profile-scrapper.p.rapidapi.com'
    }
  });

  if (!response.ok) {
    throw new Error(`Resilient API error: ${response.status} ${response.statusText}`);
  }

  const data = await response.json();
  
  if (!data || !data.response) {
    throw new Error('No data returned from Resilient API');
  }

  const post = data.response;
  
  return {
    caption: post.caption || '',
    hashtags: post.hashtags || [],
    thumbnail: post.display_url || '',
    postDate: post.taken_at_timestamp ? new Date(post.taken_at_timestamp * 1000).toISOString() : '',
    likes: post.like_count || 0,
    comments: post.comment_count || 0
  };
}

module.exports = {
  extractInstagramMetadata: extractInstagramMetadataResilient
}; 