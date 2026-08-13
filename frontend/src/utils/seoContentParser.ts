/**
 * SEO Content Parser
 * Utilities to extract SEO-friendly metadata from raw HTML or ACF JSON content.
 */

/**
 * Extracts plain text from an HTML string and returns the first paragraph or first N characters.
 */
export const extractExcerptFromHtml = (html: string, length: number = 160): string => {
  if (!html) return '';

  // Remove HTML tags
  const plainText = html.replace(/<[^>]*>/g, ' ').replace(/\s\s+/g, ' ').trim();
  
  if (plainText.length <= length) return plainText;
  
  return plainText.substring(0, length).trim() + '...';
};

/**
 * Extracts text from ACF JSON structure.
 * Scans for the first available text-heavy field.
 */
export const extractExcerptFromJson = (jsonStr: string, length: number = 160): string => {
  try {
    const data = JSON.parse(jsonStr);
    let extractedText = '';

    // If it's an array (typical for ACF sections)
    if (Array.isArray(data)) {
      for (const section of data) {
        if (section.content_json) {
          const content = typeof section.content_json === 'string' ? JSON.parse(section.content_json) : section.content_json;
          
          // Check common text fields
          const text = content.text || content.content || content.description || content.paragraph || '';
          if (text) {
            extractedText = text;
            break;
          }
        }
      }
    } else if (typeof data === 'object') {
      // Direct object mapping
      extractedText = data.text || data.content || data.description || '';
    }

    // Clean up HTML if present in JSON fields
    return extractExcerptFromHtml(extractedText, length);
  } catch (e) {
    // If not JSON, try treating as HTML
    return extractExcerptFromHtml(jsonStr, length);
  }
};
