// Combined Instagram Extractor Endpoint
// Accepts POST requests with { url, strategy }
// strategy: 'default' | 'apify' | 'resilient'

const defaultExtractor = require('../lib/extractors/instagram/instagram-extractor-ali1');
// const backupExtractor = require('../lib/extractors/instagram/instagram-extractor-bulk-profile-scrapper');

module.exports = async function extractInstagramPostMetadata(req, res) {
  if (req.method !== 'POST') {
    res.status(405).json({ error: 'Method not allowed' });
    return;
  }

  const { url, strategy = 'default' } = req.body;
  if (!url) {
    res.status(400).json({ error: 'Missing url' });
    return;
  }

  let extractor = defaultExtractor;
  // if (strategy === 'resilient') {
  //   extractor = backupExtractor;
  // } else {
  //   extractor = defaultExtractor;
  // }

  try {
    const result = await extractor.extractInstagramMetadata(url);
    res.status(200).json(result);
  } catch (error) {
    res.status(500).json({ error: error.message || 'Extraction failed' });
  }
};
