import { pagesService } from '@/services/pages.service';
import { menusService } from '@/services/menus.service';
import { blogsService } from '@/services/blogs.service';
import { seoService } from '@/services/seo.service';
import { cptService } from '@/services/cpt.service';
import formsService from '@/services/forms.service';

/**
 * Fetch SEO metadata for a specific entity (e.g. 'page', 'post') and its ID.
 * 
 * @param entityType - 'page' | 'post' etc.
 * @param entityId - The ID of the page or blog post.
 */
export async function getPublicSeo(entityType: string, entityId: number | string) {
  try {
    const response = await seoService.getSeo(entityType, entityId);
    return response.data;
  } catch (error) {
    console.error(`Error fetching SEO for ${entityType} ID ${entityId}:`, error);
    return null;
  }
}

/**
 * Fetch global SEO settings (e.g., site name, global title templates, etc.).
 */
export async function getPublicGlobalSeo() {
  try {
    const response = await seoService.getGlobalSeo();
    return response.data;
  } catch (error) {
    console.error('Error fetching global SEO:', error);
    return null;
  }
}


/**
 * Fetch a list of published blogs/posts.
 * 
 * @param params - Optional query filters (e.g. { search: 'keyword', category_id: 1 })
 */
export async function getPublicBlogs(params?: { search?: string; category_id?: number }) {
  try {
    const response = await blogsService.getAll({ ...params, status: 'published' });
    return response.data;
  } catch (error) {
    console.error('Error fetching public blogs:', error);
    return [];
  }
}

/**
 * Fetch a single blog post by its slug.
 * 
 * @param slug - The blog post slug (e.g. 'how-to-use-react')
 */
export async function getPublicBlogBySlug(slug: string) {
  try {
    const response = await blogsService.getBySlug(slug);
    return response.data;
  } catch (error) {
    console.error(`Error fetching blog slug "${slug}":`, error);
    return null;
  }
}

/**
 * Fetch a public page by its slug.
 * Can be used anywhere in the project (Client or Server components).
 * 
 * @param slug - The page slug (e.g. 'home', 'about-us')
 */
export async function getPublicPageBySlug(slug: string) {
  try {
    const response = await pagesService.getPageBySlug(slug);
    return response.data;
  } catch (error) {
    console.error(`Error fetching page slug "${slug}":`, error);
    return null;
  }
}

/**
 * Fetch a public menu by its location name.
 * Can be used to build dynamic header/footer navigation anywhere.
 * 
 * @param location - The assigned menu location (e.g. 'header', 'footer')
 */
export async function getPublicMenuByLocation(location: string) {
  try {
    const response = await menusService.getMenuByLocation(location);
    return response.data;
  } catch (error) {
    console.error(`Error fetching menu location "${location}":`, error);
    return { items: [] };
  }
}

/**
 * Fetch a public menu by its unique slug.
 *
 * @param slug - The menu slug (e.g. 'main-menu', 'footer-links')
 */
export async function getPublicMenuBySlug(slug: string) {
  try {
    const response = await menusService.getMenuBySlug(slug);
    return response.data;
  } catch (error) {
    console.error(`Error fetching menu slug "${slug}":`, error);
    return null;
  }
}

/**
 * Fetch published entries for a Custom Post Type (CPT), e.g. 'industries'.
 * Works for any post type registered in the CMS (Content > Post Types) -
 * new post types (Events, News, ...) don't need a new helper function, just
 * a different `postType` argument.
 *
 * @param postType - The post type's slug (e.g. 'industries')
 */
export async function getPublicCptEntries(postType: string) {
  try {
    const response = await cptService.getPublicEntries(postType);
    return response.data;
  } catch (error) {
    console.error(`Error fetching public entries for post type "${postType}":`, error);
    return [];
  }
}

/**
 * Fetch a single published Custom Post Type entry by its slug.
 *
 * @param postType - The post type's slug (e.g. 'industries')
 * @param slug - The entry's slug (e.g. 'it-services')
 */
export async function getPublicCptEntryBySlug(postType: string, slug: string) {
  try {
    const response = await cptService.getPublicEntryBySlug(postType, slug);
    return response.data;
  } catch (error) {
    console.error(`Error fetching entry "${slug}" for post type "${postType}":`, error);
    return null;
  }
}

/**
 * Fetch a form definition (fields + settings) by its slug, for rendering on
 * a public page (e.g. the "contact-us" form on /contact). Returns null if
 * the form doesn't exist or is inactive - callers should treat that as "no
 * form to show" rather than an error.
 *
 * @param slug - The form's slug (e.g. 'contact-us')
 */
export async function getPublicFormBySlug(slug: string) {
  try {
    const form = await formsService.getFormBySlug(slug);
    return form;
  } catch (error) {
    console.error(`Error fetching form slug "${slug}":`, error);
    return null;
  }
}
