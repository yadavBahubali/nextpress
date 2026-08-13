import { SeoCheck } from "@/store/slices/seoSlice";

/**
 * SEO Analyzer Utility V3
 * Professional grade scoring engine with deep content inspection.
 */
export const analyzeSeo = (
  focusKeyword: string,
  metaTitle: string,
  metaDescription: string,
  slug: string,
  content: string // Expected to be JSON string of ACF content
): { score: number; checks: SeoCheck[] } => {
  const checks: SeoCheck[] = [];
  let totalScore = 0;

  if (!focusKeyword) {
    return {
      score: 0,
      checks: [{
        id: 'no-keyword',
        label: 'Focus Keyword',
        status: 'error',
        message: 'Please set a focus keyword to begin SEO analysis.',
        score: 0
      }]
    };
  }

  const keyword = focusKeyword.toLowerCase().trim();
  const keywordRegex = new RegExp(`\\b${keyword}\\b`, 'gi');

  // --- HELPER: Extract Text from JSON Content ---
  const extractTextFromAcf = (jsonStr: string): string => {
    try {
      const data = JSON.parse(jsonStr);
      let text = "";
      
      // Recursively find strings in the JSON object
      const traverse = (obj: any) => {
        if (typeof obj === 'string') {
          // Remove HTML tags
          text += " " + obj.replace(/<[^>]*>?/gm, '');
        } else if (Array.isArray(obj)) {
          obj.forEach(traverse);
        } else if (obj && typeof obj === 'object') {
          Object.values(obj).forEach(traverse);
        }
      };
      
      traverse(data);
      return text.trim();
    } catch (e) {
      return jsonStr.replace(/<[^>]*>?/gm, ''); // Fallback for raw HTML
    }
  };

  const plainText = extractTextFromAcf(content);
  const wordCount = plainText.split(/\s+/).filter(w => w.length > 0).length;

  // --- 1. BASIC SEO CHECKS (45 pts) ---
  
  // Keyword in Title (15 pts)
  const titleLower = metaTitle.toLowerCase();
  if (titleLower.includes(keyword)) {
    const isAtStart = titleLower.indexOf(keyword) < (titleLower.length / 2);
    checks.push({
      id: 'keyword-title',
      label: 'Keyword in SEO Title',
      status: 'good',
      message: isAtStart 
        ? 'Great! Your focus keyword is near the beginning of the title.' 
        : 'Keyword found in title. For better impact, try moving it closer to the start.',
      score: 15
    });
    totalScore += 15;
  } else {
    checks.push({
      id: 'keyword-title',
      label: 'Keyword in SEO Title',
      status: 'error',
      message: 'Critical: The focus keyword does not appear in the SEO title.',
      score: 0
    });
  }

  // Keyword in Description (10 pts)
  if (metaDescription.toLowerCase().includes(keyword)) {
    checks.push({
      id: 'keyword-desc',
      label: 'Keyword in Meta Description',
      status: 'good',
      message: 'Keyword found in meta description.',
      score: 10
    });
    totalScore += 10;
  } else {
    checks.push({
      id: 'keyword-desc',
      label: 'Keyword in Meta Description',
      status: 'warning',
      message: 'Consider adding your focus keyword to the meta description to improve search visibility.',
      score: 0
    });
  }

  // Keyword in URL (10 pts)
  const slugTarget = keyword.replace(/\s+/g, '-');
  if (slug.toLowerCase().includes(slugTarget)) {
    checks.push({
      id: 'keyword-slug',
      label: 'Keyword in URL',
      status: 'good',
      message: 'Keyword is present in the URL slug.',
      score: 10
    });
    totalScore += 10;
  } else {
    checks.push({
      id: 'keyword-slug',
      label: 'Keyword in URL',
      status: 'warning',
      message: 'Keyword not found in URL slug. Updating this can improve rankings (caution: set a redirect if you change it).',
      score: 0
    });
  }

  // Keyword in Introduction (10 pts)
  const first100Words = plainText.split(/\s+/).slice(0, 100).join(' ').toLowerCase();
  if (first100Words.includes(keyword)) {
    checks.push({
      id: 'keyword-intro',
      label: 'Keyword in Introduction',
      status: 'good',
      message: 'Your focus keyword appears in the first paragraph.',
      score: 10
    });
    totalScore += 10;
  } else {
    checks.push({
      id: 'keyword-intro',
      label: 'Keyword in Introduction',
      status: 'warning',
      message: 'Try to include your focus keyword in the first 100 words of your content.',
      score: 0
    });
  }

  // --- 2. CONTENT ANALYSIS (35 pts) ---
  
  // Keyword Density (10 pts)
  const matches = plainText.match(keywordRegex);
  const keywordCount = matches ? matches.length : 0;
  const density = wordCount > 0 ? (keywordCount / wordCount) * 100 : 0;

  if (density >= 0.5 && density <= 2.5) {
    checks.push({ id: 'density', label: 'Keyword Density', status: 'good', message: `Optimal density (${density.toFixed(2)}%). Keyword appears ${keywordCount} times.`, score: 10 });
    totalScore += 10;
  } else if (density > 2.5) {
    checks.push({ id: 'density', label: 'Keyword Density', status: 'warning', message: `Density too high (${density.toFixed(2)}%). Avoid "keyword stuffing" for better ranking.`, score: 5 });
    totalScore += 5;
  } else {
    checks.push({ id: 'density', label: 'Keyword Density', status: 'warning', message: `Density is low (${density.toFixed(2)}%). Use the keyword a few more times in your content.`, score: 2 });
    totalScore += 2;
  }

  // Word Count (15 pts)
  if (wordCount >= 900) {
    checks.push({ id: 'word-count', label: 'Content Length', status: 'good', message: `Excellent content depth with ${wordCount} words.`, score: 15 });
    totalScore += 15;
  } else if (wordCount >= 600) {
    checks.push({ id: 'word-count', label: 'Content Length', status: 'good', message: `Good length (${wordCount} words). Well within ranking norms.`, score: 12 });
    totalScore += 12;
  } else if (wordCount >= 300) {
    checks.push({ id: 'word-count', label: 'Content Length', status: 'warning', message: `Content is ${wordCount} words. Consider adding more detail for high competition keywords.`, score: 5 });
    totalScore += 5;
  } else {
    checks.push({ id: 'word-count', label: 'Content Length', status: 'error', message: `Thin content detected (${wordCount} words). Minimum recommended is 300 words.`, score: 0 });
  }

  // Links & Media (10 pts)
  const hasLinks = content.includes('href=') || content.includes('"url"');
  const hasImages = content.includes('<img') || content.includes('"type":"image"') || content.includes('"image"');
  
  if (hasLinks && hasImages) {
    checks.push({ id: 'media', label: 'Links & Images', status: 'good', message: 'Page is rich with media and internal/external links.', score: 10 });
    totalScore += 10;
  } else if (hasLinks || hasImages) {
    checks.push({ id: 'media', label: 'Links & Images', status: 'warning', message: 'Add both images and links to provide a better user experience.', score: 5 });
    totalScore += 5;
  } else {
    checks.push({ id: 'media', label: 'Links & Images', status: 'warning', message: 'No links or images detected in content.', score: 0 });
  }

  // --- 3. TAG OPTIMIZATION (20 pts) ---

  // Title Length (10 pts)
  const titleLen = metaTitle.length;
  if (titleLen >= 45 && titleLen <= 60) {
    checks.push({ id: 'title-len', label: 'SEO Title Length', status: 'good', message: 'Your SEO Title has the perfect length.', score: 10 });
    totalScore += 10;
  } else if (titleLen > 60) {
    checks.push({ id: 'title-len', label: 'SEO Title Length', status: 'error', message: 'Title is too long and will be cut off by search engines.', score: 0 });
  } else {
    checks.push({ id: 'title-len', label: 'SEO Title Length', status: 'warning', message: 'Title is too short. Add more context or branding.', score: 5 });
    totalScore += 5;
  }

  // Description Length (10 pts)
  const descLen = metaDescription.length;
  if (descLen >= 120 && descLen <= 160) {
    checks.push({ id: 'desc-len', label: 'Meta Description Length', status: 'good', message: 'Meta description length is optimal.', score: 10 });
    totalScore += 10;
  } else if (descLen > 160) {
    checks.push({ id: 'desc-len', label: 'Meta Description Length', status: 'error', message: 'Description is too long. Google will truncate it.', score: 0 });
  } else {
    checks.push({ id: 'desc-len', label: 'Meta Description Length', status: 'warning', message: 'Description is too short. Use this space to pitch your value.', score: 5 });
    totalScore += 5;
  }

  return {
    score: Math.min(Math.round(totalScore), 100),
    checks: checks
  };
};
