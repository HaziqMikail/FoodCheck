/**
 * SafeBite Multimodal AI Vision Service
 * Communicates directly with Google Gemini or OpenAI to read packaging labels,
 * extract ingredients, and handle bilingual translations.
 */

const INGREDIENT_EXTRACTION_PROMPT = `You are SafeBite's expert food packaging OCR and ingredient intelligence system.
Analyze the provided food packaging image and extract the complete ingredient list with extreme precision.

Requirements:
1. Isolate ONLY the ingredients list. Omit marketing slogans, manufacturer addresses, net weight, expiry dates, and nutrition facts tables.
2. If bilingual terms are present (especially Malay or Asian terms such as Susu, Minyak Kelapa Sawit, Pepejal Susu, Soya, Lesitin, Gula, Garam), ensure standard English ingredient equivalents are provided so deterministic allergy matching will succeed.
3. Clean up the text into a readable, comma-separated format.
4. Output your response as a strict JSON object with this exact structure:
{
  "ingredients_text": "Ingredients: Wheat flour, palm oil, salt, milk solids...",
  "detected_allergens": ["wheat", "milk"],
  "confidence_score": 95,
  "summary": "Brief 1-sentence summary of the extracted label"
}`;

/**
 * Returns available provider and key from environment variables or in-app local storage.
 */
export function getActiveAiConfig() {
  const localGemini = typeof localStorage !== 'undefined' ? localStorage.getItem('safebite_gemini_api_key') : null;
  const localOpenai = typeof localStorage !== 'undefined' ? localStorage.getItem('safebite_openai_api_key') : null;

  const geminiKey = import.meta.env.VITE_GEMINI_API_KEY || import.meta.env.GEMINI_API_KEY || (localGemini ? localGemini.trim() : '');
  const openaiKey = import.meta.env.VITE_OPENAI_API_KEY || import.meta.env.OPENAI_API_KEY || (localOpenai ? localOpenai.trim() : '');

  if (geminiKey && geminiKey.trim()) {
    return { provider: 'gemini', apiKey: geminiKey.trim(), isLocal: Boolean(!import.meta.env.VITE_GEMINI_API_KEY && !import.meta.env.GEMINI_API_KEY && localGemini) };
  }
  if (openaiKey && openaiKey.trim()) {
    return { provider: 'openai', apiKey: openaiKey.trim(), isLocal: Boolean(!import.meta.env.VITE_OPENAI_API_KEY && !import.meta.env.OPENAI_API_KEY && localOpenai) };
  }
  return { provider: null, apiKey: null, isLocal: false };
}

/**
 * Saves or clears API key in localStorage for in-app configuration
 */
export function saveLocalApiKey(provider, key) {
  if (provider === 'gemini') {
    if (key && key.trim()) {
      localStorage.setItem('safebite_gemini_api_key', key.trim());
    } else {
      localStorage.removeItem('safebite_gemini_api_key');
    }
  } else if (provider === 'openai') {
    if (key && key.trim()) {
      localStorage.setItem('safebite_openai_api_key', key.trim());
    } else {
      localStorage.removeItem('safebite_openai_api_key');
    }
  }
}

/**
 * Calls Google Gemini Vision API (gemini-1.5-flash / gemini-2.0-flash)
 */
async function extractWithGemini(base64Data, mimeType, apiKey) {
  // Use gemini-1.5-flash for reliable fast multimodal processing
  const url = `https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${apiKey}`;

  const payload = {
    contents: [
      {
        parts: [
          { text: INGREDIENT_EXTRACTION_PROMPT },
          {
            inline_data: {
              mime_type: mimeType || 'image/jpeg',
              data: base64Data
            }
          }
        ]
      }
    ],
    generationConfig: {
      response_mime_type: 'application/json',
      temperature: 0.1
    }
  };

  const response = await fetch(url, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(payload)
  });

  if (!response.ok) {
    const errorData = await response.json().catch(() => ({}));
    throw new Error(errorData.error?.message || `Gemini API returned status ${response.status}`);
  }

  const result = await response.json();
  const textOutput = result.candidates?.[0]?.content?.parts?.[0]?.text;

  if (!textOutput) {
    throw new Error('No text output returned by Gemini Vision.');
  }

  try {
    const parsed = JSON.parse(textOutput);
    return {
      success: true,
      ingredientsText: parsed.ingredients_text || '',
      detectedAllergens: parsed.detected_allergens || [],
      confidenceScore: parsed.confidence_score || 90,
      summary: parsed.summary || 'Ingredients extracted successfully.',
      provider: 'Google Gemini'
    };
  } catch {
    return {
      success: true,
      ingredientsText: textOutput,
      detectedAllergens: [],
      confidenceScore: 80,
      summary: 'Extracted text returned in raw format.',
      provider: 'Google Gemini'
    };
  }
}

/**
 * Calls OpenAI GPT-4o-mini Vision API
 */
async function extractWithOpenAI(base64Data, mimeType, apiKey) {
  const url = 'https://api.openai.com/v1/chat/completions';

  const payload = {
    model: 'gpt-4o-mini',
    response_format: { type: 'json_object' },
    temperature: 0.1,
    messages: [
      {
        role: 'system',
        content: INGREDIENT_EXTRACTION_PROMPT
      },
      {
        role: 'user',
        content: [
          { type: 'text', text: 'Extract and isolate the ingredients from this food label image.' },
          {
            type: 'image_url',
            image_url: {
              url: `data:${mimeType || 'image/jpeg'};base64,${base64Data}`
            }
          }
        ]
      }
    ]
  };

  const response = await fetch(url, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${apiKey}`
    },
    body: JSON.stringify(payload)
  });

  if (!response.ok) {
    const errorData = await response.json().catch(() => ({}));
    throw new Error(errorData.error?.message || `OpenAI API returned status ${response.status}`);
  }

  const result = await response.json();
  const rawContent = result.choices?.[0]?.message?.content;

  if (!rawContent) {
    throw new Error('No content returned by OpenAI.');
  }

  try {
    const parsed = JSON.parse(rawContent);
    return {
      success: true,
      ingredientsText: parsed.ingredients_text || '',
      detectedAllergens: parsed.detected_allergens || [],
      confidenceScore: parsed.confidence_score || 90,
      summary: parsed.summary || 'Ingredients extracted successfully.',
      provider: 'OpenAI (GPT-4o-mini)'
    };
  } catch {
    return {
      success: true,
      ingredientsText: rawContent,
      detectedAllergens: [],
      confidenceScore: 80,
      summary: 'Extracted text returned in raw format.',
      provider: 'OpenAI'
    };
  }
}

/**
 * Universal extract function that routes to the configured provider.
 * @param {string} base64Data
 * @param {string} mimeType
 * @returns {Promise<{ success: boolean, ingredientsText: string, provider?: string, error?: string, message?: string }>}
 */
export async function extractIngredientsFromImage(base64Data, mimeType = 'image/jpeg') {
  const config = getActiveAiConfig();

  if (!config.apiKey) {
    return {
      success: false,
      error: 'NO_API_KEY',
      message: 'No AI Vision API key detected in .env. Please add VITE_GEMINI_API_KEY or VITE_OPENAI_API_KEY to enable live AI packaging scanning.'
    };
  }

  try {
    if (config.provider === 'gemini') {
      return await extractWithGemini(base64Data, mimeType, config.apiKey);
    } else if (config.provider === 'openai') {
      return await extractWithOpenAI(base64Data, mimeType, config.apiKey);
    } else {
      throw new Error(`Unsupported AI Vision provider: ${config.provider}`);
    }
  } catch (err) {
    console.error('AI Vision Extraction error:', err);
    return {
      success: false,
      error: 'API_ERROR',
      message: err.message || 'Failed to extract text using AI Vision.'
    };
  }
}
