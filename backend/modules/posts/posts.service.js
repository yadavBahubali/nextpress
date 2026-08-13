const postsRepository = require('./posts.repository');
const settingsService = require('../settings/settings.service');
const ApiError = require('../../utils/ApiError');
const { getFullUrl } = require('../../utils/getFullUrl');

class PostsService {
  async formatPost(post) {
    if (!post) return null;
    
    // Fetch extra author metadata from settings table
    const authorMeta = await settingsService.getAuthorMeta(post.author_id);
    
    // Handle FAQs parsing
    let faqs = post.faqs;
    if (typeof faqs === 'string') {
      try { faqs = JSON.parse(faqs); } catch (e) { faqs = []; }
    }

    return {
      ...post,
      featured_image_url: getFullUrl(post.featured_image_path),
      hero_image_url: getFullUrl(post.hero_image_path),
      author_details: authorMeta || null,
      faqs: faqs || [],
      // Ensure frontend sees them in acf too for the current editor logic
      acf: {
        ...(post.acf || {}),
        faq_items: faqs || []
      }
    };
  }

  generateSlug(title) {
    return title
      .toLowerCase()
      .replace(/[^\w ]+/g, '')
      .replace(/ +/g, '-');
  }

  async getAllCategories() {
    return await postsRepository.getAllCategories();
  }

  async getAllTags() {
    return await postsRepository.getAllTags();
  }

  async createTag(tagData) {
    const slug = tagData.slug || this.generateSlug(tagData.name);
    const existing = await postsRepository.findTagBySlug(slug);
    if (existing) return existing;

    const data = {
      name: tagData.name,
      slug: slug
    };
    const id = await postsRepository.createTag(data);
    return { id, ...data };
  }

  async createCategory(catData) {
    const slug = catData.slug || this.generateSlug(catData.name);
    const data = {
      name: catData.name,
      slug: slug,
      description: catData.description || '',
      parent_id: catData.parent_id || null
    };
    const id = await postsRepository.createCategory(data);
    return { id, ...data };
  }

  async getAllPosts(params) {
    const posts = await postsRepository.getAll(params);
    const formattedPosts = [];
    for (const post of posts) {
      const formatted = await this.formatPost(post);
      formatted.categories = await postsRepository.getPostCategories(post.id);
      formatted.tags = await postsRepository.getPostTags(post.id);
      formattedPosts.push(formatted);
    }
    return formattedPosts;
  }

  async getPostById(id) {
    const post = await postsRepository.findById(id);
    if (!post) throw new ApiError(404, 'Post not found');
    
    post.categories = await postsRepository.getPostCategories(id);
    post.tags = await postsRepository.getPostTags(id);
    return await this.formatPost(post);
  }

  async getPostBySlug(slug) {
    const post = await postsRepository.findBySlug(slug);
    if (!post) throw new ApiError(404, 'Post not found');
    
    post.categories = await postsRepository.getPostCategories(post.id);
    post.tags = await postsRepository.getPostTags(post.id);
    return await this.formatPost(post);
  }

  async createPost(postData, authorId) {
    const slug = postData.slug || this.generateSlug(postData.title);
    
    // Check if slug exists
    const existing = await postsRepository.findBySlug(slug);
    const finalSlug = existing ? `${slug}-${Date.now()}` : slug;

    const data = {
      title: postData.title,
      slug: finalSlug,
      content: postData.content || '',
      excerpt: postData.excerpt || '',
      status: postData.status || 'draft',
      featured_image_id: postData.featured_image_id || null,
      hero_image_id: postData.hero_image_id || null,
      reading_time: postData.reading_time || 0,
      show_toc: postData.show_toc ? 1 : 0,
      author_id: postData.author_id || authorId,
      category_id: (postData.category_ids && postData.category_ids.length > 0) ? postData.category_ids[0] : null,
      published_at: postData.status === 'published' ? new Date() : null,
      faqs: (postData.acf && postData.acf.faq_items && postData.acf.faq_items.length > 0) 
        ? JSON.stringify(postData.acf.faq_items) 
        : null
    };

    const postId = await postsRepository.create(data);

    const { logNotification } = require('../../utils/logger');
    logNotification('blog_created', `Blog post created: "${data.title}"`, { postId, status: data.status, authorId: data.author_id });

    if (postData.category_ids && Array.isArray(postData.category_ids)) {
      await postsRepository.addCategories(postId, postData.category_ids);
    }

    if (postData.tag_ids && Array.isArray(postData.tag_ids)) {
      await postsRepository.addTags(postId, postData.tag_ids);
    }

    return await this.getPostById(postId);
  }

  async updatePost(id, postData) {
    const post = await postsRepository.findById(id);
    if (!post) throw new ApiError(404, 'Post not found');

    const data = {};
    if (postData.title) data.title = postData.title;
    if (postData.slug) data.slug = postData.slug;
    if (postData.content !== undefined) data.content = postData.content;
    if (postData.excerpt !== undefined) data.excerpt = postData.excerpt;
    if (postData.status) {
      data.status = postData.status;
      if (postData.status === 'published' && !post.published_at) {
        data.published_at = new Date();
      }
    }
    if (postData.featured_image_id !== undefined) data.featured_image_id = postData.featured_image_id;
    if (postData.hero_image_id !== undefined) data.hero_image_id = postData.hero_image_id;
    if (postData.reading_time !== undefined) data.reading_time = postData.reading_time;
    if (postData.show_toc !== undefined) data.show_toc = postData.show_toc ? 1 : 0;
    if (postData.author_id !== undefined) data.author_id = postData.author_id;
    
    if (postData.acf && postData.acf.faq_items !== undefined) {
      data.faqs = (postData.acf.faq_items && postData.acf.faq_items.length > 0) 
        ? JSON.stringify(postData.acf.faq_items) 
        : null;
    }

    if (postData.category_ids && Array.isArray(postData.category_ids)) {
      data.category_id = postData.category_ids.length > 0 ? postData.category_ids[0] : null;
    }

    await postsRepository.update(id, data);

    const { logNotification } = require('../../utils/logger');
    logNotification('blog_updated', `Blog post updated: "${postData.title || post.title}"`, { postId: id, status: data.status || post.status });

    if (postData.category_ids && Array.isArray(postData.category_ids)) {
      await postsRepository.clearCategories(id);
      await postsRepository.addCategories(id, postData.category_ids);
    }

    if (postData.tag_ids && Array.isArray(postData.tag_ids)) {
      await postsRepository.clearTags(id);
      await postsRepository.addTags(id, postData.tag_ids);
    }

    return await this.getPostById(id);
  }

  async deletePost(id) {
    const post = await postsRepository.findById(id);
    if (!post) throw new ApiError(404, 'Post not found');
    
    await postsRepository.delete(id);
    return true;
  }
}

module.exports = new PostsService();
