/**
 * SEO Variable Engine
 * Handles parsing and replacement of dynamic tags in SEO fields.
 */

export interface SeoVariables {
  title?: string;          // Entity Title (e.g. Page Title)
  site_name?: string;      // Website Name
  site_domain?: string;    // Website URL
  sep?: string;            // Separator (| or -)
  tagline?: string;        // Site Tagline
  excerpt?: string;        // Page Excerpt/Content summary
  slug?: string;           // URL segment
  category?: string;       // Primary Category
  author?: string;         // Author Name
  current_year?: string;   // 2024, etc.
  featured_image?: string; // URL of featured image
  
  // Company Info
  company_name?: string;
  company_address?: string;
  company_phone?: string;
  company_email?: string;
  
  // Social Handles
  social_x?: string;
  social_facebook?: string;
  social_instagram?: string;
  social_linkedin?: string;
  
  [key: string]: string | undefined;
}

export const SEO_AVAILABLE_VARIABLES = [
  { tag: '%title%', label: 'Page Title', description: 'The title of the current page or post' },
  { tag: '%excerpt%', label: 'Excerpt', description: 'A brief summary of the content' },
  { tag: '%site_name%', label: 'Site Name', description: 'The global name of your website' },
  { tag: '%site_domain%', label: 'Site Domain', description: 'The primary URL of your website' },
  { tag: '%sep%', label: 'Separator', description: 'The character used as a separator (e.g. - or |)' },
  { tag: '%tagline%', label: 'Site Tagline', description: 'The global tagline of your website' },
  { tag: '%current_year%', label: 'Current Year', description: 'The current calendar year' },
  { tag: '%category%', label: 'Primary Category', description: 'The main category of the post/product' },
  { tag: '%company_name%', label: 'Company Name', description: 'Your business name from settings' },
];

/**
 * Replaces tags with actual values.
 * Supports waterfall: if tag value is missing, it returns an empty string or default.
 */
export const resolveSeoVariables = (text: string | null | undefined, variables: SeoVariables): string => {
  if (!text) return '';
  
  let resolved = text;
  
  // Standard replacements mapping
  const mapping: Record<string, string | undefined> = {
    '%title%': variables.title,
    '%site_name%': variables.site_name || 'NextPress',
    '%site_domain%': variables.site_domain,
    '%sep%': variables.sep || '-',
    '%tagline%': variables.tagline,
    '%excerpt%': variables.excerpt,
    '%slug%': variables.slug,
    '%category%': variables.category,
    '%author%': variables.author,
    '%current_year%': variables.current_year || new Date().getFullYear().toString(),
    '%company_name%': variables.company_name,
    '%company_address%': variables.company_address,
    '%company_phone%': variables.company_phone,
    '%company_email%': variables.company_email,
    '%social_x%': variables.social_x,
    '%social_facebook%': variables.social_facebook,
    '%social_instagram%': variables.social_instagram,
    '%social_linkedin%': variables.social_linkedin,
  };

  Object.entries(mapping).forEach(([tag, value]) => {
    // Escape special regex characters if any were in tags
    const regex = new RegExp(tag.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'), 'g');
    resolved = resolved.replace(regex, value || '');
  });

  // Post-processing: clean up messy artifacts like double spaces or trailing separators
  return resolved
    .replace(/\s\s+/g, ' ')
    .trim()
    .replace(/[-|]\s*$/, '') // Remove trailing separators if title is empty
    .trim();
};
