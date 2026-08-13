const cptRepository = require('./cpt.repository');
const acfService = require('../acf/acf.service');
const ApiError = require('../../utils/ApiError');
const { getFullUrl } = require('../../utils/getFullUrl');

// Slugs that would collide with existing/internal API routes if used as a
// post type slug (e.g. a CPT named "cpt" would break /cpt/:postType/public).
const RESERVED_SLUGS = [
  'posts', 'pages', 'media', 'users', 'settings', 'auth', 'acf', 'seo',
  'menus', 'forms', 'reports', 'careers', 'profile', 'ecommerce', 'designer',
  'setup', 'cpt', 'types', 'entries', 'public',
];

class CptService {
  formatEntry(entry) {
    if (!entry) return null;

    if (typeof entry.content_json === 'string' && entry.content_json) {
      try {
        entry.content_json = JSON.parse(entry.content_json);
      } catch (e) {
        // Leave as raw string if it's not valid JSON.
      }
    }

    if (entry.featured_image_path) {
      entry.featured_image_url = getFullUrl(entry.featured_image_path);
    }

    return entry;
  }

  // --- Post Types ---

  async getAllTypes() {
    return await cptRepository.getAllTypes();
  }

  async getActiveTypes() {
    return await cptRepository.getActiveTypes();
  }

  async getTypeBySlug(slug) {
    const type = await cptRepository.getTypeBySlug(slug);
    if (!type) throw new ApiError(404, 'Post type not found');
    return type;
  }

  async createType(data) {
    if (!data.slug || !data.label || !data.singular_label) {
      throw new ApiError(400, 'slug, label and singular_label are required');
    }

    const slug = String(data.slug).toLowerCase().trim().replace(/[^a-z0-9-]/g, '-');
    if (!slug) throw new ApiError(400, 'slug is invalid');
    if (RESERVED_SLUGS.includes(slug)) {
      throw new ApiError(400, `"${slug}" is a reserved name and can't be used as a post type slug`);
    }

    const existing = await cptRepository.getTypeBySlug(slug);
    if (existing) throw new ApiError(400, 'A post type with this slug already exists');

    const id = await cptRepository.createType({ ...data, slug });
    return await cptRepository.getTypeById(id);
  }

  async updateType(id, data) {
    const type = await cptRepository.getTypeById(id);
    if (!type) throw new ApiError(404, 'Post type not found');

    const updateData = { ...data };
    if (updateData.slug && updateData.slug !== type.slug) {
      const slug = String(updateData.slug).toLowerCase().trim().replace(/[^a-z0-9-]/g, '-');
      if (RESERVED_SLUGS.includes(slug)) {
        throw new ApiError(400, `"${slug}" is a reserved name and can't be used as a post type slug`);
      }
      const existing = await cptRepository.getTypeBySlug(slug);
      if (existing) throw new ApiError(400, 'A post type with this slug already exists');
      updateData.slug = slug;
    }

    await cptRepository.updateType(id, updateData);
    return await cptRepository.getTypeById(id);
  }

  async deleteType(id) {
    const type = await cptRepository.getTypeById(id);
    if (!type) throw new ApiError(404, 'Post type not found');
    await cptRepository.deleteType(id);
    return true;
  }

  // --- Entries ---

  async getEntries(postTypeSlug, filters = {}, user = null) {
    const type = await this.getTypeBySlug(postTypeSlug);
    let entries = await cptRepository.getEntries(type.id, filters);
    entries = await this.restrictToAssigned(entries, user);
    return entries.map((e) => this.formatEntry(e));
  }

  // Founder portal (see cpt.routes.js) - always "assigned to this specific
  // user", regardless of their role. Unlike getEntries above (where Super
  // Admin/Admin bypass filtering to see everything in the CMS), calling
  // /mine as a Super Admin still only returns what's personally assigned to
  // them - it's a personal view, not an admin view.
  async getMyEntries(postTypeSlug, userId) {
    const type = await this.getTypeBySlug(postTypeSlug);
    const assignedIds = new Set(await acfService.getAssignedEntityIds('cpt', userId));
    if (assignedIds.size === 0) return [];

    const entries = await cptRepository.getEntries(type.id, {});
    return entries.filter((e) => assignedIds.has(e.id)).map((e) => this.formatEntry(e));
  }

  // Super Admin/Admin see every entry unfiltered. Everyone else (Editor,
  // Staff Viewer, or any future role) sees only entries with a "user" ACF
  // field assigning them specifically - including entries with nobody
  // assigned at all, which stay invisible to everyone but Super Admin/Admin
  // until someone claims them.
  async restrictToAssigned(entries, user) {
    if (!user || [1, 2].includes(user.role_id)) return entries;
    const assignedIds = new Set(await acfService.getAssignedEntityIds('cpt', user.id));
    return entries.filter((e) => assignedIds.has(e.id));
  }

  async getPublicEntries(postTypeSlug) {
    const type = await this.getTypeBySlug(postTypeSlug);
    if (!type.is_public) throw new ApiError(404, 'Not found');
    const entries = await cptRepository.getPublicEntries(type.id);
    return entries.map((e) => this.formatEntry(e));
  }

  async getEntryById(id, user = null) {
    const entry = await cptRepository.findById(id);
    if (!entry) throw new ApiError(404, 'Entry not found');

    if (user && ![1, 2].includes(user.role_id)) {
      const assignedIds = await acfService.getAssignedEntityIds('cpt', user.id);
      if (!assignedIds.includes(entry.id)) {
        // 404, not 403 - a non-admin shouldn't be able to tell the
        // difference between "doesn't exist" and "not assigned to you".
        throw new ApiError(404, 'Entry not found');
      }
    }

    const type = await cptRepository.getTypeById(entry.post_type_id);
    const formatted = this.formatEntry(entry);
    const acf = await acfService.getMergedAcfData('cpt', id);
    const fieldGroups = type ? await acfService.getGroupsForPostType(type.slug) : [];

    return { ...formatted, post_type: type, acf, fieldGroups };
  }

  // Founder portal - single-entry view. Strips any "user" type field out of
  // both the schema and the values before returning: the assignment
  // mechanism itself (who else might be assigned, the field that controls
  // it) is an admin concern, never something a founder's UI should even
  // know exists.
  async getMyEntryById(id, userId) {
    const entry = await cptRepository.findById(id);
    if (!entry) throw new ApiError(404, 'Entry not found');

    const assignedIds = await acfService.getAssignedEntityIds('cpt', userId);
    if (!assignedIds.includes(entry.id)) throw new ApiError(404, 'Entry not found');

    const type = await cptRepository.getTypeById(entry.post_type_id);
    const formatted = this.formatEntry(entry);
    const acf = await acfService.getMergedAcfData('cpt', id);
    const fieldGroups = type ? await acfService.getGroupsForPostType(type.slug) : [];

    const { fieldGroups: safeFieldGroups, values: safeAcf } = this.stripUserFields(fieldGroups, acf);

    return { ...formatted, post_type: type, acf: safeAcf, fieldGroups: safeFieldGroups };
  }

  // Merges a founder's edits into the entry's existing content_json,
  // field-by-field, explicitly skipping any "user" type field regardless
  // of what the request body contains - so a founder can never reassign
  // themselves or anyone else, even via a hand-crafted request that the UI
  // would never send. Groups/fields the request doesn't mention are left
  // exactly as they were.
  async updateMyEntry(id, userId, incomingContentJson) {
    const entry = await cptRepository.findById(id);
    if (!entry) throw new ApiError(404, 'Entry not found');

    const assignedIds = await acfService.getAssignedEntityIds('cpt', userId);
    if (!assignedIds.includes(entry.id)) throw new ApiError(404, 'Entry not found');

    const type = await cptRepository.getTypeById(entry.post_type_id);
    const fieldGroups = await acfService.getGroupsForPostType(type.slug);

    const existingContentJson = typeof entry.content_json === 'string'
      ? JSON.parse(entry.content_json || '{}')
      : (entry.content_json || {});
    const incoming = typeof incomingContentJson === 'string'
      ? JSON.parse(incomingContentJson || '{}')
      : (incomingContentJson || {});

    const mergedContentJson = { ...existingContentJson };

    for (const group of fieldGroups) {
      let fields = group.fields;
      if (typeof fields === 'string') fields = JSON.parse(fields);
      if (!Array.isArray(fields)) continue;

      const existingGroupValues = existingContentJson[group.group_key] || {};
      const incomingGroupValues = incoming[group.group_key] || {};
      const mergedGroupValues = { ...existingGroupValues };

      for (const field of fields) {
        if (field.type === 'user') continue;
        if (Object.prototype.hasOwnProperty.call(incomingGroupValues, field.name)) {
          mergedGroupValues[field.name] = incomingGroupValues[field.name];
        }
      }

      mergedContentJson[group.group_key] = mergedGroupValues;
    }

    await cptRepository.update(id, { content_json: mergedContentJson });
    // The merge above already guarantees no "user" field was touched, but
    // re-sync anyway for consistency with the admin update path.
    await acfService.syncUserFieldAssignments('cpt', id, mergedContentJson, fieldGroups);

    return true;
  }

  // Removes "user" type fields from a fieldGroups schema and their values
  // from the matching content object. Used to keep the assignment
  // mechanism invisible to the founder portal (see getMyEntryById above).
  stripUserFields(fieldGroups, values) {
    const safeValues = { ...values };

    const safeFieldGroups = fieldGroups.map((group) => {
      let fields = group.fields;
      if (typeof fields === 'string') fields = JSON.parse(fields);
      if (!Array.isArray(fields)) return group;

      const userFieldNames = fields.filter((f) => f.type === 'user').map((f) => f.name);
      if (userFieldNames.length > 0 && safeValues[group.group_key]) {
        const groupValues = { ...safeValues[group.group_key] };
        userFieldNames.forEach((name) => delete groupValues[name]);
        safeValues[group.group_key] = groupValues;
      }

      return { ...group, fields: fields.filter((f) => f.type !== 'user') };
    });

    return { fieldGroups: safeFieldGroups, values: safeValues };
  }

  async getEntryBySlug(postTypeSlug, entrySlug) {
    const type = await this.getTypeBySlug(postTypeSlug);
    const entry = await cptRepository.findBySlug(type.id, entrySlug);
    if (!entry || entry.status !== 'published') throw new ApiError(404, 'Entry not found');

    const formatted = this.formatEntry(entry);
    const acf = await acfService.getMergedAcfData('cpt', entry.id);

    return { ...formatted, post_type: type, acf };
  }

  async createEntry(postTypeSlug, data, authorId) {
    const type = await this.getTypeBySlug(postTypeSlug);
    if (!data.title || !data.slug) {
      throw new ApiError(400, 'title and slug are required');
    }

    const existing = await cptRepository.findBySlug(type.id, data.slug);
    if (existing) throw new ApiError(400, 'An entry with this slug already exists for this post type');

    const entryId = await cptRepository.create({ ...data, post_type_id: type.id, author_id: authorId });
    await this.syncAssignmentsFromContentJson('cpt', entryId, type.slug, data.content_json);

    return entryId;
  }

  async updateEntry(id, data) {
    const entry = await cptRepository.findById(id);
    if (!entry) throw new ApiError(404, 'Entry not found');

    if (data.slug && data.slug !== entry.slug) {
      const existing = await cptRepository.findBySlugExcludingId(entry.post_type_id, data.slug, id);
      if (existing) throw new ApiError(400, 'An entry with this slug already exists for this post type');
    }

    await cptRepository.update(id, data);

    // Only re-sync if this update actually touched field values - avoids
    // wiping the assignment index on a status-only/title-only save.
    if (data.content_json !== undefined) {
      const type = await cptRepository.getTypeById(entry.post_type_id);
      await this.syncAssignmentsFromContentJson('cpt', id, type.slug, data.content_json);
    }

    return true;
  }

  async syncAssignmentsFromContentJson(entityType, entityId, postTypeSlug, rawContentJson) {
    const contentJson = typeof rawContentJson === 'string'
      ? JSON.parse(rawContentJson || '{}')
      : (rawContentJson || {});
    const fieldGroups = await acfService.getGroupsForPostType(postTypeSlug);
    await acfService.syncUserFieldAssignments(entityType, entityId, contentJson, fieldGroups);
  }

  async deleteEntry(id) {
    const entry = await cptRepository.findById(id);
    if (!entry) throw new ApiError(404, 'Entry not found');
    await cptRepository.delete(id);
    return true;
  }
}

module.exports = new CptService();
