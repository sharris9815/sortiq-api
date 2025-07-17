// Instagram Metadata Extractor (Reusable Function)
// Extracted from api/instagram-metadata.js - LOGIC UNCHANGED
// Returns: { caption, hashtags, thumbnail, postDate }

const https = require('https');

const RAPIDAPI_KEY = process.env.RAPIDAPI_KEY;
const RAPIDAPI_HOST = process.env.RAPIDAPI_HOST;

/**
 * Extract Instagram metadata from URL using RapidAPI
 * EXACT SAME LOGIC as original api/instagram-metadata.js
 * @param {string} url - Instagram post URL
 * @returns {Promise<{caption: string, hashtags: string[], thumbnail: string|null, postDate: string|null}>}
 */
async function extractInstagramMetadata(url) {
  if (!url) {
    throw new Error('Missing Instagram URL');
  }

  if (!RAPIDAPI_KEY || !RAPIDAPI_HOST) {
    throw new Error('Missing RapidAPI credentials on server');
  }

  const cleanUrl = url.split('?')[0];
  const path = `/media_info_from_url/v1/?url=${encodeURIComponent(cleanUrl)}&raw=true`;

  const options = {
    method: 'GET',
    hostname: 'instagram-scraper-ai1.p.rapidapi.com',
    port: null,
    path: path,
    headers: {
      'x-rapidapi-key': RAPIDAPI_KEY,
      'x-rapidapi-host': RAPIDAPI_HOST
    }
  };

  return new Promise((resolve, reject) => {
    const req = https.request(options, function (response) {
      const chunks = [];

      response.on('data', function (chunk) {
        chunks.push(chunk);
      });

      response.on('end', function () {
        const body = Buffer.concat(chunks);
        try {
          const data = JSON.parse(body.toString());
          
          if (!response.statusCode || response.statusCode >= 400) {
            console.error('RapidAPI Error:', data);
            
            // Handle specific error cases
            if (response.statusCode === 429) {
              reject(new Error('Rate limit exceeded. Please wait before making more requests.'));
              return;
            }
            
            if (data && data.message && data.message.includes('rate limit')) {
              reject(new Error(`Rate limit exceeded: ${data.message}`));
              return;
            }
            
            reject(new Error(`RapidAPI HTTP ${response.statusCode}: ${response.statusMessage}`));
            return;
          }

          if (!data?.items?.[0]) {
            console.error('Invalid Response Structure:', data);
            
            // Handle specific service error messages
            if (data && data.status === 'fail' && data.details) {
              if (data.details.includes('something went wrong')) {
                reject(new Error('Instagram scraper service is currently unavailable. Please try again later.'));
                return;
              }
              reject(new Error(`Instagram scraper error: ${data.details}`));
              return;
            }
            
            reject(new Error('Invalid response structure from RapidAPI'));
            return;
          }

          const item = data.items[0];
          const caption = item.caption?.text || '';
          const hashtags = caption.match(/#[\w]+/g)?.map(tag => tag.slice(1)) || [];
          const thumbnail =
            item.image_versions2?.candidates?.[0]?.url ||
            item.carousel_media?.[0]?.image_versions2?.candidates?.[0]?.url ||
            null;
          const postDate = item.taken_at ? new Date(item.taken_at * 1000).toISOString() : null;

          const result = { caption, hashtags, thumbnail, postDate };
          console.log('Extracted Metadata:', result);
          resolve(result);
        } catch (error) {
          console.error('Error processing RapidAPI response:', error);
          reject(new Error('Failed to process RapidAPI response: ' + error.message));
        }
      });
    });

    req.on('error', function (error) {
      console.error('RapidAPI Request Error:', error);
      reject(new Error('RapidAPI request failed: ' + error.message));
    });

    req.end();
  });
}

module.exports = { extractInstagramMetadata };
