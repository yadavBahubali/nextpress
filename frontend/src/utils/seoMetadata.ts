import { Metadata } from 'next';
import { seoService, SeoMeta } from '@/services/seo.service';
import { settingsService } from '@/services/settings.service';
import { resolveSeoVariables, SeoVariables } from '@/utils/seoVariableEngine';

/**
 * Generates dynamic Next.js Metadata with a waterfall fallback logic:
 * Page/Entity Overrides > Global SEO Templates > Hardcoded Defaults
 */
export async function generatePageMetadata(
  entityType: string, 
  entityId: number | string | null,
  contextVariables: Partial<SeoVariables> = {}
): Promise<Metadata> {
  try {
    // 1. Fetch data in parallel
    const [seoRes, globalRes, siteNameRes, siteTaglineRes, siteDomainRes, discourageRes] = await Promise.all([
      seoService.getSeo(entityType, entityId),
      seoService.getGlobalSeo(),
      settingsService.getSetting('site_name'),
      settingsService.getSetting('site_tagline'),
      settingsService.getSetting('site_domain'),
      settingsService.getSetting('reading_discourage_search_engines'),
    ]);

    const seoData: SeoMeta = seoRes.data || {};
    const globalSeo: SeoMeta = globalRes.data || {};
    const discourageSearchEngines = discourageRes?.data === "1" || discourageRes?.data === 1;

    // 2. Prepare resolution variables
    const variables: SeoVariables = {
      title: contextVariables.title || '',
      site_name: siteNameRes.data || 'NextPress',
      site_tagline: siteTaglineRes.data || '',
      site_domain: siteDomainRes.data || 'https://www.nextpress.in',
      sep: globalSeo.title_separator || '-',
      excerpt: contextVariables.excerpt || '',
      slug: contextVariables.slug || '',
      ...contextVariables
    };

    // 3. Resolve Title (Waterfall)
    // Priority: Manual Page Title > Global Title Template > Page Title + Site Name
    let titleTemplate = seoData.meta_title;
    if (!titleTemplate) {
      // Use global template if page meta is empty
      titleTemplate = globalSeo.meta_title || '%title% %sep% %site_name%';
    }
    const resolvedTitle = resolveSeoVariables(titleTemplate, variables);

    // 4. Resolve Description (Waterfall)
    // Priority: Manual Page Desc > Global Fallback Desc > Excerpt
    let descTemplate = seoData.meta_description;
    if (!descTemplate) {
      descTemplate = globalSeo.meta_description || '%excerpt%';
    }
    const resolvedDescription = resolveSeoVariables(descTemplate, variables);

    // 5. Build Metadata Object
    const metadata: Metadata = {
      title: resolvedTitle,
      description: resolvedDescription,
      alternates: {
        canonical: seoData.canonical_url || `${variables.site_domain}/${variables.slug}`,
      },
      robots: {
        index: discourageSearchEngines ? false : !seoData.is_noindex,
        follow: discourageSearchEngines ? false : !seoData.is_nofollow,
      },
      openGraph: {
        title: seoData.og_title || resolvedTitle,
        description: seoData.og_description || resolvedDescription,
        images: seoData.og_image ? [seoData.og_image] : (globalSeo.og_image ? [globalSeo.og_image] : []),
        type: 'website',
      },
      twitter: {
        card: 'summary_large_image',
        title: seoData.twitter_title || seoData.og_title || resolvedTitle,
        description: seoData.twitter_description || seoData.og_description || resolvedDescription,
        images: seoData.twitter_image ? [seoData.twitter_image] : (seoData.og_image ? [seoData.og_image] : []),
      }
    };

    return metadata;
  } catch (error) {
    console.error('Error generating metadata:', error);
    return {
      title: 'NextPress',
      description: 'Premium Enterprise Ecommerce CMS'
    };
  }
}
