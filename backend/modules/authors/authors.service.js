const authorsRepository = require('./authors.repository');
const ApiError = require('../../utils/ApiError');
const { getFullUrl } = require('../../utils/getFullUrl');

class AuthorsService {
  async getAllAuthors() {
    const authors = await authorsRepository.getAll();
    return authors.map(author => this.formatAuthor(author));
  }

  async getAuthorById(id) {
    const author = await authorsRepository.findById(id);
    if (!author) throw new ApiError(404, 'Author not found');
    return this.formatAuthor(author);
  }

  async createAuthor(data) {
    if (!data.name) throw new ApiError(400, 'Author name is required');
    
    // Auto-generate slug if not provided
    if (!data.slug) {
      data.slug = data.name.toLowerCase().replace(/ /g, '-').replace(/[^\w-]+/g, '');
    }

    const id = await authorsRepository.create(data);
    return await this.getAuthorById(id);
  }

  async updateAuthor(id, data) {
    await this.getAuthorById(id); // Ensure exists
    await authorsRepository.update(id, data);
    return await this.getAuthorById(id);
  }

  async deleteAuthor(id) {
    await this.getAuthorById(id); // Ensure exists
    return await authorsRepository.delete(id);
  }

  formatAuthor(author) {
    if (!author) return null;
    
    // Format social links
    let socialLinks = author.social_links;
    if (typeof socialLinks === 'string') {
      try {
        socialLinks = JSON.parse(socialLinks);
      } catch (e) {
        socialLinks = {};
      }
    }

    // Format image URL using shared utility (reads BASE_URL from .env)
    let profile_image_path = getFullUrl(author.profile_image_path);

    return {
      ...author,
      social_links: socialLinks || {},
      profile_image_path
    };
  }
}

module.exports = new AuthorsService();
