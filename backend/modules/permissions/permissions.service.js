const permissionsRepository = require('./permissions.repository');
const usersRepository = require('../users/users.repository');
const ApiError = require('../../utils/ApiError');

// The full catalog of grantable sections, matching Sidebar.tsx's leaf items.
// Several sidebar links point at the same underlying admin capability (e.g.
// "Lead Inbox" under Sales & Leads and "Submissions" under Forms both need
// forms.submissions), so this is keyed by capability, not by every sidebar
// label - checking one box shows every sidebar entry that maps to it.
const GRANTABLE_SECTIONS = [
  { key: 'dashboard', label: 'Dashboard (Overview)' },
  { key: 'sales.dashboard', label: 'Sales Dashboard' },
  { key: 'sales.leads', label: 'Lead Inbox / Form Submissions' },
  { key: 'hr.dashboard', label: 'HR Dashboard' },
  { key: 'hr.jobs', label: 'Job Board' },
  { key: 'hr.applications', label: 'Applicants ATS' },
  { key: 'cms.pages', label: 'Pages' },
  { key: 'cms.acf', label: 'ACF Fields' },
  { key: 'cms.blogs', label: 'Blogs' },
  { key: 'cms.media', label: 'Media Library' },
  { key: 'cms.menus', label: 'Menus' },
  { key: 'cms.forms', label: 'Forms (builder)' },
  { key: 'ecommerce.dashboard', label: 'Shop Dashboard' },
  { key: 'ecommerce.products', label: 'Products & Categories' },
  { key: 'ecommerce.orders', label: 'Orders' },
  { key: 'ecommerce.customers', label: 'Customers' },
  { key: 'admin.settings', label: 'Settings' },
  { key: 'admin.users', label: 'Users & Authors' },
  { key: 'admin.seo', label: 'SEO Manager' },
  { key: 'admin.posttypes', label: 'Post Types' },
];

const CONFIGURABLE_ROLE_IDS = [3, 5]; // Editor, Staff Viewer

class PermissionsService {
  // CPTs are registered at runtime (see modules/cpt) - a brand-new post type
  // must be grantable/checkbox-able immediately, with no code change here,
  // the same way it appears in the sidebar with no code change. So the
  // catalog is the fixed list plus one entry per currently active post type.
  async getGrantableSections() {
    const cptRepository = require('../cpt/cpt.repository');
    const activeTypes = await cptRepository.getActiveTypes();
    const cptSections = activeTypes.map((t) => ({
      key: `cpt.${t.slug}`,
      label: `${t.label} (Custom Content)`,
    }));
    return [...GRANTABLE_SECTIONS, ...cptSections];
  }

  async getForUser(userId) {
    return await permissionsRepository.getForUser(userId);
  }

  async setForUser(userId, menuKeys) {
    const user = await usersRepository.findById(userId);
    if (!user) throw new ApiError(404, 'User not found');

    if (!CONFIGURABLE_ROLE_IDS.includes(user.role_id)) {
      throw new ApiError(400, 'Only Editor or Viewer accounts have configurable section permissions');
    }

    const grantable = await this.getGrantableSections();
    const validKeys = new Set(grantable.map((s) => s.key));
    const invalid = menuKeys.filter((k) => !validKeys.has(k));
    if (invalid.length > 0) {
      throw new ApiError(400, `Unknown section key(s): ${invalid.join(', ')}`);
    }

    await permissionsRepository.setForUser(userId, menuKeys);
    return await permissionsRepository.getForUser(userId);
  }

  async hasPermission(userId, menuKey) {
    return await permissionsRepository.hasPermission(userId, menuKey);
  }
}

module.exports = new PermissionsService();
