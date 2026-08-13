const pageRepository = require('./pages.repository');
const acfService = require('../acf/acf.service');
const mediaService = require('../media/media.service');
const ApiError = require('../../utils/ApiError');
const { getFullUrl } = require('../../utils/getFullUrl');

class PageService {
  /**
   * Helper to format page data
   */
  formatPage(page) {
    if (!page) return null;
    
    // Parse JSON strings
    if (typeof page.content_json === 'string') page.content_json = JSON.parse(page.content_json);
    if (typeof page.seo_meta === 'string') page.seo_meta = JSON.parse(page.seo_meta);
    
    // Resolve full URL for featured image
    if (page.featured_image_url) {
      page.featured_image_url = getFullUrl(page.featured_image_url);
    }
    
    return page;
  }

  /**
   * Get page by ID with sections and ACF data
   */
  async getPageById(id) {
    const page = await pageRepository.findById(id);
    if (!page) throw new ApiError(404, 'Page not found');

    const formattedPage = this.formatPage(page);
    const sections = await pageRepository.getSectionsByPageId(id);
    const acf = await acfService.getMergedAcfData('page', id);

    return {
      ...formattedPage,
      sections,
      acf
    };
  }

  /**
   * Get page by slug with sections and ACF data
   */
  async getPageBySlug(slug) {
    const page = await pageRepository.findBySlug(slug);
    if (!page) throw new ApiError(404, 'Page not found');

    const formattedPage = this.formatPage(page);
    const sections = await pageRepository.getSectionsByPageId(formattedPage.id);
    const acf = await acfService.getMergedAcfData('page', formattedPage.id);

    return {
      ...formattedPage,
      sections,
      acf
    };
  }

  /**
   * Get all pages
   */
  async getAllPages() {
    const pages = await pageRepository.getAllPages();
    return pages.map(page => this.formatPage(page));
  }

  /**
   * Get all published pages
   */
  async getPublicPages() {
    const pages = await pageRepository.getPublicPages();
    return pages.map(page => this.formatPage(page));
  }

  /**
   * Get available templates
   */
  async getTemplates() {
    return ['home', 'about', 'contact', 'services', 'default'];
  }

  /**
   * Create page with sections
   */
  async createPage(pageData, sections = []) {
    // Validate slug uniqueness
    const existing = await pageRepository.findBySlug(pageData.slug);
    if (existing) throw new ApiError(400, 'Slug already exists');

    const pageId = await pageRepository.create(pageData);

    if (sections && sections.length > 0) {
      for (const section of sections) {
        await pageRepository.createSection({
          ...section,
          page_id: pageId
        });
      }
    }

    return pageId;
  }

  /**
   * Update page and its sections
   */
  async updatePage(id, pageData, sections = null) {
    const page = await pageRepository.findById(id);
    if (!page) throw new ApiError(404, 'Page not found');

    // Validate slug uniqueness if slug is being updated
    if (pageData.slug && pageData.slug !== page.slug) {
      const existing = await pageRepository.findBySlugExcludingId(pageData.slug, id);
      if (existing) throw new ApiError(400, 'Slug already exists');
    }

    await pageRepository.update(id, pageData);

    if (sections !== null) {
      await pageRepository.deleteSectionsByPageId(id);
      for (const section of sections) {
        await pageRepository.createSection({
          ...section,
          page_id: id
        });
      }
    }

    return true;
  }

  /**
   * Delete page
   */
  async deletePage(id) {
    const page = await pageRepository.findById(id);
    if (!page) throw new ApiError(404, 'Page not found');

    await pageRepository.delete(id);
    return true;
  }
}

module.exports = new PageService();
