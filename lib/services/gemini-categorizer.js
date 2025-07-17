// Gemini Categorization Service (Reusable Function)
// Extracted from api/gemini-categorize.js - LOGIC UNCHANGED
// Returns: { folderPath, detectedLanguage, originalPath, keywords, title }

const fetch = require('node-fetch');

// Valid parent categories for Sortiq - UNCHANGED
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

// Language code mappings - UNCHANGED
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

// Multi-language prompt templates - UNCHANGED
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

/**
 * Detect the language of the content - UNCHANGED LOGIC (now with dynamic import)
 */
async function detectLanguage(text) {
  try {
    if (!text || text.trim().length < 10) {
      return 'en';
    }
    
    // Dynamic import for ESM module
    const { franc } = await import('franc');
    const detected = franc(text);
    
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
    return 'en';
  }
}

/**
 * Get prompt template - UNCHANGED LOGIC
 */
function getPromptForLanguage(detectedLang, content, userLang = 'en') {
  const template = PROMPT_TEMPLATES[detectedLang] || PROMPT_TEMPLATES.en;
  return template(content, userLang);
}

/**
 * Translate folder path - UNCHANGED LOGIC
 */
async function translateFolderPath(folderPath, targetLang) {
  if (targetLang === 'en' || !folderPath) {
    return folderPath;
  }

  try {
    const translationPrompt = `Translate the following folder path to ${LANGUAGE_NAMES[targetLang] || targetLang} language. Keep the same structure with "/" separators. Only respond with the translated path, no other text.

Folder path to translate: ${folderPath}`;

    const response = await fetch('https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent', {
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
  
  return folderPath;
}

/**
 * Categorize content with Gemini AI - EXACT SAME LOGIC as original endpoint
 * @param {Object} params - { caption, hashtags, keywords, url, userLanguage, platform }
 * @returns {Promise<{folderPath: string, detectedLanguage: string, originalPath: string, keywords: string[], title: string}>}
 */
async function categorizeWithGemini({ caption, hashtags = [], keywords = [], url, userLanguage = 'en', platform }) {
  if (!API_KEY) {
    throw new Error('GEMINI_API_KEY environment variable is required');
  }

  try {
    // Combine all text for language detection - UNCHANGED
    const combinedText = [caption, ...hashtags, ...keywords].join(' ');
    const detectedLanguage = await detectLanguage(combinedText);
    
    console.log('Language detection:', {
      detectedLanguage,
      userLanguage,
      textSample: combinedText.substring(0, 100)
    });

    // Prepare content object - UNCHANGED
    const content = {
      caption,
      hashtags: hashtags.join(', '),
      keywords: keywords.join(', '),
      url
    };

    // Get appropriate prompt - UNCHANGED
    const prompt = getPromptForLanguage(detectedLanguage, content, userLanguage);

    // Call Gemini API - UNCHANGED
    const response = await fetch('https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-goog-api-key': API_KEY
      },
      body: JSON.stringify({
        contents: [{
          parts: [{ text: prompt }]
        }],
        generationConfig: {
          temperature: 0.1,
          maxOutputTokens: 200,
        }
      })
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error('Gemini API error:', errorText);
      throw new Error(`Gemini API error: ${errorText}`);
    }

    const data = await response.json();
    
    // Extract folder path - UNCHANGED
    let folderPath = data.candidates?.[0]?.content?.parts?.[0]?.text?.trim();
    
    if (!folderPath) {
      console.error('Invalid Gemini response format:', JSON.stringify(data, null, 2));
      throw new Error('Invalid response format from Gemini API');
    }

    // Translate if needed - UNCHANGED
    let translatedPath = folderPath;
    if (userLanguage !== 'en' && detectedLanguage !== userLanguage) {
      translatedPath = await translateFolderPath(folderPath, userLanguage);
    }

    // Extract keywords and title from folder path
    const pathSegments = translatedPath.split('/').map(s => s.trim());
    const extractedKeywords = pathSegments.filter(s => s.length > 0);
    const title = pathSegments[pathSegments.length - 1] || 'Imported Content';

    return { 
      folderPath: translatedPath,
      originalPath: folderPath,
      detectedLanguage,
      userLanguage,
      keywords: extractedKeywords,
      title: title
    };

  } catch (error) {
    console.error('Categorization error:', error);
    throw error;
  }
}

module.exports = { categorizeWithGemini }; 