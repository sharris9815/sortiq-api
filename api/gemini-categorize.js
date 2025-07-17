// Gemini Folder Categorisation API Endpoint with Multi-Language Support (BACKWARD COMPATIBILITY)
// POST /api/gemini-categorize
// Body: { caption, hashtags, keywords, url, model, userLanguage }
// Response: { folderPath, detectedLanguage, translatedPath }

/**
 * @swagger
 * /api/gemini-categorize:
 *   post:
 *     summary: Categorize content using Gemini AI with multi-language support
 *     description: Analyzes content and suggests folder paths using AI, with automatic language detection and translation
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - caption
 *             properties:
 *               caption:
 *                 type: string
 *                 description: Content caption or description to categorize
 *               hashtags:
 *                 type: array
 *                 items:
 *                   type: string
 *                 default: []
 *                 description: Array of hashtags from the content
 *               keywords:
 *                 type: array
 *                 items:
 *                   type: string
 *                 default: []
 *                 description: Additional keywords for categorization
 *               url:
 *                 type: string
 *                 description: URL of the content (optional, for context)
 *               userLanguage:
 *                 type: string
 *                 default: "en"
 *                 description: User's preferred language for folder names
 *     responses:
 *       200:
 *         description: Content categorized successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 folderPath:
 *                   type: string
 *                   description: AI-suggested folder path in user's preferred language
 *                   example: "Recipes/Desserts/Chocolate Cake"
 *                 originalPath:
 *                   type: string
 *                   description: Original folder path before translation
 *                   example: "Recipes/Desserts/Chocolate Cake"
 *                 detectedLanguage:
 *                   type: string
 *                   description: Detected language of the content
 *                   example: "en"
 *                 userLanguage:
 *                   type: string
 *                   description: User's preferred language
 *                   example: "en"
 *       400:
 *         description: Bad request - missing required fields
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 error:
 *                   type: string
 *                   example: "Missing required field: caption"
 *       500:
 *         description: Internal server error
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 error:
 *                   type: string
 *                   example: "Internal server error"
 *                 details:
 *                   type: string
 */
// Valid parent categories for Sortiq
const VALID_PARENT_CATEGORIES = [
  'Recipes',
  'Restaurants',
  'Music',
  'Fitness',
  'Travel',
  'Fashion',
  'Beauty',
  'Home',
  'Learning',
  'Wellness',
  'Finance',
  'Tech',
  'Memes',
  'Inspiration',
  'Pets',
  'DIY',
  'Events'
];

// Language code mappings (ISO 639-1 to full names)
const LANGUAGE_NAMES = {
  'en': 'English',
  'es': 'Spanish',
  'fr': 'French', 
  'de': 'German',
  'it': 'Italian',
  'pt': 'Portuguese',
  'ja': 'Japanese',
  'ko': 'Korean',
  'zh': 'Chinese',
  'ar': 'Arabic',
  'hi': 'Hindi',
  'ru': 'Russian',
  'nl': 'Dutch',
  'sv': 'Swedish',
  'no': 'Norwegian',
  'da': 'Danish',
  'pl': 'Polish',
  'tr': 'Turkish',
  'th': 'Thai',
  'vi': 'Vietnamese'
};

// Multi-language prompt templates
const PROMPT_TEMPLATES = {
  en: (content, userLang) => `You are a content categorization expert. Based on the following social media post content, suggest a folder path using the format "parent/child/grandchild" where:
- Parent is a high-level category (e.g., Recipes, Restaurants, Music)
- Child is a more specific subcategory  
- Grandchild is the most specific category

${userLang !== 'en' ? `IMPORTANT: Respond with folder names in ${LANGUAGE_NAMES[userLang] || userLang} language.` : ''}

Content to categorize:
Caption: ${content.caption}
Hashtags: ${content.hashtags}
Keywords: ${content.keywords}
URL: ${content.url}

Please respond with ONLY the folder path in the format "parent/child/grandchild". No other text.`,

  es: (content, userLang) => `Eres un experto en categorización de contenido. Basándote en el siguiente contenido de redes sociales, sugiere una ruta de carpeta usando el formato "padre/hijo/nieto" donde:
- Padre es una categoría de alto nivel (ej: Recetas, Restaurantes, Música)
- Hijo es una subcategoría más específica
- Nieto es la categoría más específica

${userLang !== 'es' ? `IMPORTANTE: Responde con nombres de carpetas en idioma ${LANGUAGE_NAMES[userLang] || userLang}.` : ''}

Contenido a categorizar:
Descripción: ${content.caption}
Hashtags: ${content.hashtags}
Palabras clave: ${content.keywords}
URL: ${content.url}

Por favor responde SOLO con la ruta de carpeta en formato "padre/hijo/nieto". Sin otro texto.`,

  fr: (content, userLang) => `Vous êtes un expert en catégorisation de contenu. Basé sur le contenu de réseaux sociaux suivant, suggérez un chemin de dossier utilisant le format "parent/enfant/petit-enfant" où:
- Parent est une catégorie de haut niveau (ex: Recettes, Restaurants, Musique)
- Enfant est une sous-catégorie plus spécifique
- Petit-enfant est la catégorie la plus spécifique

${userLang !== 'fr' ? `IMPORTANT: Répondez avec des noms de dossiers en langue ${LANGUAGE_NAMES[userLang] || userLang}.` : ''}

Contenu à catégoriser:
Légende: ${content.caption}
Hashtags: ${content.hashtags}
Mots-clés: ${content.keywords}
URL: ${content.url}

Veuillez répondre SEULEMENT avec le chemin de dossier au format "parent/enfant/petit-enfant". Aucun autre texte.`,

  de: (content, userLang) => `Sie sind ein Experte für Inhaltskategorisierung. Basierend auf dem folgenden Social-Media-Inhalt, schlagen Sie einen Ordnerpfad im Format "Eltern/Kind/Enkel" vor, wobei:
- Eltern ist eine übergeordnete Kategorie (z.B. Rezepte, Restaurants, Musik)
- Kind ist eine spezifischere Unterkategorie
- Enkel ist die spezifischste Kategorie

${userLang !== 'de' ? `WICHTIG: Antworten Sie mit Ordnernamen in ${LANGUAGE_NAMES[userLang] || userLang} Sprache.` : ''}

Zu kategorisierender Inhalt:
Beschriftung: ${content.caption}
Hashtags: ${content.hashtags}
Schlüsselwörter: ${content.keywords}
URL: ${content.url}

Bitte antworten Sie NUR mit dem Ordnerpfad im Format "Eltern/Kind/Enkel". Kein anderer Text.`,

  ja: (content, userLang) => `あなたはコンテンツ分類の専門家です。以下のソーシャルメディア投稿内容に基づいて、「親/子/孫」の形式でフォルダパスを提案してください：
- 親は高レベルカテゴリ（例：レシピ、レストラン、音楽）
- 子はより具体的なサブカテゴリ
- 孫は最も具体的なカテゴリ

${userLang !== 'ja' ? `重要：${LANGUAGE_NAMES[userLang] || userLang}言語でフォルダ名を回答してください。` : ''}

分類するコンテンツ:
キャプション: ${content.caption}
ハッシュタグ: ${content.hashtags}
キーワード: ${content.keywords}
URL: ${content.url}

「親/子/孫」形式のフォルダパスのみで回答してください。他のテキストは不要です。`
};

const API_KEY = process.env.GEMINI_API_KEY;
if (!API_KEY) {
  throw new Error('GEMINI_API_KEY environment variable is required');
}

// Log environment for debugging
console.log('Environment check:', {
  NODE_ENV: process.env.NODE_ENV,
  VERCEL_ENV: process.env.VERCEL_ENV,
  hasGeminiKey: !!API_KEY
});

/**
 * Detect the language of the content
 * @param {string} text - Text to analyze
 * @returns {string} - ISO 639-1 language code
 */
function detectLanguage(text) {
  try {
    if (!text || text.trim().length < 10) {
      return 'en'; // Default to English for short text
    }
    
    const detected = franc(text);
    
    // Map franc codes to our supported languages
    const langMap = {
      'eng': 'en',
      'spa': 'es', 
      'fra': 'fr',
      'deu': 'de',
      'ita': 'it',
      'por': 'pt',
      'jpn': 'ja',
      'kor': 'ko',
      'cmn': 'zh',
      'arb': 'ar',
      'hin': 'hi',
      'rus': 'ru',
      'nld': 'nl',
      'swe': 'sv',
      'nor': 'no',
      'dan': 'da',
      'pol': 'pl',
      'tur': 'tr',
      'tha': 'th',
      'vie': 'vi'
    };
    
    return langMap[detected] || 'en';
  } catch (error) {
    console.log('Language detection error:', error);
    return 'en'; // Fallback to English
  }
}

/**
 * Get the appropriate prompt template based on detected language
 * @param {string} detectedLang - Detected content language
 * @param {Object} content - Content object
 * @param {string} userLang - User's preferred language
 * @returns {string} - Formatted prompt
 */
function getPromptForLanguage(detectedLang, content, userLang = 'en') {
  // Use detected language template if available, otherwise use English
  const template = PROMPT_TEMPLATES[detectedLang] || PROMPT_TEMPLATES.en;
  return template(content, userLang);
}

/**
 * Translate folder path if needed using Gemini
 * @param {string} folderPath - Original folder path
 * @param {string} targetLang - Target language code
 * @returns {Promise<string>} - Translated folder path
 */
async function translateFolderPath(folderPath, targetLang) {
  if (targetLang === 'en' || !folderPath) {
    return folderPath; // No translation needed
  }

  try {
    const translationPrompt = `Translate the following folder path to ${LANGUAGE_NAMES[targetLang] || targetLang} language. Keep the same structure with "/" separators. Only respond with the translated path, no other text.

Folder path to translate: ${folderPath}`;

    const response = await fetch('https://generativelanguage.googleapis.com/v1/models/gemini-2.0-flash:generateContent', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-goog-api-key': API_KEY
      },
      body: JSON.stringify({
        contents: [{
          parts: [{ text: translationPrompt }]
        }],
        generationConfig: {
          temperature: 0.1,
          maxOutputTokens: 100,
        }
      })
    });

    if (response.ok) {
      const data = await response.json();
      const translatedPath = data.candidates?.[0]?.content?.parts?.[0]?.text?.trim();
      return translatedPath || folderPath;
    }
  } catch (error) {
    console.log('Translation error:', error);
  }
  
  return folderPath; // Return original if translation fails
}

// Use the new service while maintaining the same API interface
const { categorizeWithGemini } = require('../lib/services/gemini-categorizer');

module.exports = async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const { caption, hashtags = [], keywords = [], url, userLanguage = 'en' } = req.body;

    // Use the new modular categorizer (same logic, cleaner architecture)
    const result = await categorizeWithGemini({
      caption,
      hashtags,
      keywords,
      url,
      userLanguage,
      platform: 'unknown' // Not needed for backward compatibility
    });

    console.log('Categorization result (legacy endpoint):', {
      folderPath: result.folderPath,
      detectedLanguage: result.detectedLanguage
    });

    // Return the same format as the original endpoint
    return res.status(200).json({ 
      folderPath: result.folderPath,
      originalPath: result.originalPath,
      detectedLanguage: result.detectedLanguage,
      userLanguage: result.userLanguage
    });

  } catch (error) {
    console.error('Gemini categorization error:', error);
    return res.status(500).json({ 
      error: 'Internal server error', 
      details: error.message 
    });
  }
};
