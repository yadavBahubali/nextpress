const acfRepository = require('./acf.repository');
const db = require('../../config/db');
const ApiError = require('../../utils/ApiError');
const crypto = require('crypto');

class AcfService {
  /**
   * List all field groups with pagination and search
   */
  async listGroups(query) {
    const { limit = 10, page = 1, search = '' } = query;
    const offset = (page - 1) * limit;

    return await acfRepository.getGroups({ limit, offset, search });
  }

  /**
   * Get groups matching a specific page (Schema Mapper)
   */
  async getGroupsForPage(pageId) {
    // 1. Fetch the page
    const page = await db.select('pages', '*', `id = ?`, [pageId]);
    if (!page) throw new ApiError(404, 'Page not found');

    // 2. Fetch groups linked directly via page_id
    const directGroups = await acfRepository.getGroupsByPageId(pageId);

    // 3. Fetch all active field groups for location rule matching
    const allActiveGroups = await acfRepository.getAllActiveGroups();

    // 4. Filter by location rules
    const ruleMatchedGroups = allActiveGroups.filter(group => {
      // Avoid duplicates if already in directGroups
      if (directGroups.some(dg => dg.id === group.id)) return false;

      let settings = group.settings;
      if (typeof settings === 'string') settings = JSON.parse(settings);
      
      if (!settings || !settings.location_rules || !Array.isArray(settings.location_rules)) {
        return false;
      }

      return settings.location_rules.some(ruleSet => {
        if (!Array.isArray(ruleSet)) {
          const rule = ruleSet;
          return (rule.param === 'page' && parseInt(rule.value) === page.id) ||
                 (rule.param === 'template' && rule.value === page.template);
        }
        
        return ruleSet.every(rule => {
          if (rule.param === 'page') return parseInt(rule.value) === page.id;
          if (rule.param === 'template') return rule.value === page.template;
          return false;
        });
      });
    });

    // Combine both (Direct linked first, then rule-based)
    return [...directGroups, ...ruleMatchedGroups];
  }

  /**
   * Get groups matching a specific post (Blog Schema Mapper)
   */
  async getGroupsForPost(postId) {
    // 1. Fetch the post
    const post = await db.select('posts', '*', `id = ?`, [postId]);
    if (!post) throw new ApiError(404, 'Post not found');

    // 2. Fetch groups linked directly via post_id
    const directGroups = await acfRepository.getGroupsByPostId(postId);

    // 3. Fetch all active field groups for location rule matching
    const allActiveGroups = await acfRepository.getAllActiveGroups();

    // 4. Filter by location rules
    const ruleMatchedGroups = allActiveGroups.filter(group => {
      if (directGroups.some(dg => dg.id === group.id)) return false;

      let settings = group.settings;
      if (typeof settings === 'string') settings = JSON.parse(settings);
      
      if (!settings || !settings.location_rules || !Array.isArray(settings.location_rules)) {
        return false;
      }

      return settings.location_rules.some(ruleSet => {
        if (!Array.isArray(ruleSet)) {
          const rule = ruleSet;
          return (rule.param === 'post' && parseInt(rule.value) === post.id) ||
                 (rule.param === 'post_type' && rule.value === 'post');
        }
        
        return ruleSet.every(rule => {
          if (rule.param === 'post') return parseInt(rule.value) === post.id;
          if (rule.param === 'post_type') return rule.value === 'post';
          return false;
        });
      });
    });

    return [...directGroups, ...ruleMatchedGroups];
  }

  /**
   * Get field groups whose location rules target a given Custom Post Type
   * (matched by its slug, e.g. 'industries'). Unlike getGroupsForPage/
   * getGroupsForPost, there is no direct FK column on acf_field_groups for
   * CPTs - every post type is matched purely through location_rules, so
   * registering a brand-new post type never requires an acf_field_groups
   * schema change.
   */
  async getGroupsForPostType(postTypeSlug) {
    const allActiveGroups = await acfRepository.getAllActiveGroups();

    const matchesRule = (rule) => rule.param === 'post_type' && rule.value === postTypeSlug;

    return allActiveGroups.filter((group) => {
      let settings = group.settings;
      if (typeof settings === 'string') settings = JSON.parse(settings);

      if (!settings || !settings.location_rules || !Array.isArray(settings.location_rules)) {
        return false;
      }

      return settings.location_rules.some((ruleSet) => {
        if (!Array.isArray(ruleSet)) return matchesRule(ruleSet);
        return ruleSet.every(matchesRule);
      });
    });
  }

  /**
   * Update page mappings (Simplified to direct column update)
   */
  async updatePageMappings(pageId, fieldGroupIds) {
    // 1. Clear previous direct links for this page
    await db.query_All('UPDATE acf_field_groups SET page_id = NULL WHERE page_id = ?', [pageId]);
    
    // 2. Set new direct links
    for (let i = 0; i < fieldGroupIds.length; i++) {
      await acfRepository.update(fieldGroupIds[i], {
        page_id: pageId,
        order_index: i
      });
    }
    
    return true;
  }

  /**
   * Get merged ACF values for an entity
   */
  async getMergedAcfData(entityType, entityId) {
    let table = '';
    if (entityType === 'page') table = 'pages';
    else if (entityType === 'product') table = 'products';
    else if (entityType === 'cpt') table = 'cpt_entries';

    if (table) {
      try {
        const entity = await db.select(table, 'content_json', `id = ?`, [entityId]);
        if (entity && entity.content_json) {
          return typeof entity.content_json === 'string' ? JSON.parse(entity.content_json) : entity.content_json;
        }
      } catch (err) {
        // Table or column might not exist
        return {};
      }
    }
    
    return {};
  }

  /**
   * Keeps acf_user_assignments in sync with any "user" type fields on the
   * given entity's attached field groups. Called after an entity's
   * content_json is saved (see cpt.service.js) - the field value itself
   * lives in content_json like any other field, this just mirrors it into
   * an indexed table so "show me only my assigned entries" is a fast
   * lookup instead of scanning JSON. Only top-level fields are indexed for
   * now, not ones nested inside a repeater.
   */
  async syncUserFieldAssignments(entityType, entityId, contentJson, fieldGroups) {
    const assignments = [];

    for (const group of fieldGroups) {
      let fields = group.fields;
      if (typeof fields === 'string') fields = JSON.parse(fields);
      if (!Array.isArray(fields)) continue;

      const groupValues = (contentJson && contentJson[group.group_key]) || {};

      for (const field of fields) {
        if (field.type !== 'user') continue;
        const rawValue = groupValues[field.name];
        const userId = parseInt(rawValue, 10);
        if (rawValue && Number.isInteger(userId)) {
          // field_key is scoped by group so two groups can each have their
          // own "user" field without colliding.
          assignments.push({ field_key: `${group.group_key}.${field.name}`, user_id: userId });
        }
      }
    }

    await acfRepository.replaceUserAssignments(entityType, entityId, assignments);
  }

  async getAssignedEntityIds(entityType, userId) {
    return await acfRepository.getAssignedEntityIds(entityType, userId);
  }

  /**
   * Get a single group definition
   */
  async getGroup(id) {
    const group = await acfRepository.getGroup(id);
    if (!group) throw new ApiError(404, 'Field group not found');
    return group;
  }

  /**
   * Create a new field group
   */
  async createGroup(data) {
    // Validate basics
    if (!data.title || !data.group_key) {
      throw new ApiError(400, 'Title and Group Key are required');
    }

    // Check if key already exists
    const existing = await acfRepository.getGroupByKey(data.group_key);
    if (existing) {
      throw new ApiError(400, `Group key '${data.group_key}' already exists`);
    }

    // Process fields
    const fields = this.validateAndSanitizeFields(data.fields || []);

    const result = await acfRepository.create({
      ...data,
      uuid: crypto.randomUUID(),
      fields
    });

    return result.insert_id;
  }

  /**
   * Update an existing field group
   */
  async updateGroup(id, data) {
    const group = await acfRepository.getGroup(id);
    if (!group) throw new ApiError(404, 'Field group not found');

    if (data.fields) {
      data.fields = this.validateAndSanitizeFields(data.fields);
    }

    await acfRepository.update(id, data);
    return true;
  }

  /**
   * Delete a field group
   */
  async deleteGroup(id) {
    const group = await acfRepository.getGroup(id);
    if (!group) throw new ApiError(404, 'Field group not found');
    
    await acfRepository.delete(id);
    return true;
  }

  /**
   * Recursive utility to validate and sanitize fields
   */
  validateAndSanitizeFields(fields) {
    if (!Array.isArray(fields)) return [];

    return fields.map(field => {
      // 1. Validate required field properties
      if (!field.name || !field.label || !field.type) {
        throw new ApiError(400, `Field is missing required properties (name, label, or type): ${JSON.stringify(field)}`);
      }

      // 2. Sanitize and structure
      const sanitizedField = {
        key: field.key || null,
        name: field.name,
        label: field.label,
        type: field.type,
        instructions: field.instructions || '',
        required: !!field.required,
        default_value: field.default_value || null,
        placeholder: field.placeholder || '',
        settings: field.settings || {},
        wrapper: field.wrapper || { width: '100%' }
      };

      // 3. Handle recursion for nested fields (repeater, group)
      if (['repeater', 'group'].includes(field.type)) {
        sanitizedField.sub_fields = this.validateAndSanitizeFields(field.sub_fields || []);
      }

      return sanitizedField;
    });
  }
}

module.exports = new AcfService();
