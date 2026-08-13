const express = require('express');
const router = express.Router();
const cptController = require('./cpt.controller');
const cptRepository = require('./cpt.repository');
const { protect, authorize, authorizeSection } = require('../../middleware/authMiddleware');

// Entry-by-id routes only have the numeric entry id in the URL, not the post
// type slug, so the right `cpt.<slug>` section key has to be looked up via
// the entry itself first. Returns null (-> denied) if the entry doesn't
// exist; the controller's own 404 handling still applies for Super
// Admin/Admin, who skip this check entirely.
const menuKeyForEntry = async (req) => {
  const entry = await cptRepository.findById(req.params.id);
  if (!entry) return null;
  const type = await cptRepository.getTypeById(entry.post_type_id);
  return type ? `cpt.${type.slug}` : null;
};

// --- Public routes ---
// Published entries only, for public listing (/industries) and detail
// (/industries/it-services) pages.
router.get('/types/active', cptController.getActiveTypes);
router.get('/:postType/public', cptController.getPublicEntries);
router.get('/:postType/public/slug/:slug', cptController.getEntryBySlug);

// --- "My entries" (founder portal) ---
// Any authenticated account (including role 4, the public/customer
// default) can see entries assigned to them via a "user" ACF field - this
// is deliberately outside the /admin section-permission system entirely,
// since it's inherently self-scoped (you can only ever see your own) and
// customers must never gain a foothold in the CMS admin surface. See the
// design discussion: founders get this endpoint, never /admin.
router.get('/:postType/mine', protect, cptController.getMyEntries);
router.get('/entries/:id/mine', protect, cptController.getMyEntryById);
router.put('/entries/:id/mine', protect, cptController.updateMyEntry);

// --- Admin: Post Type registry ---
// Registering a brand-new CPT *type* is a structural/admin action (it
// defines a new content shape sitewide), so it's Super Admin / Admin only -
// matching the access level of acf.routes.js field-group management.
router.get('/types', protect, authorize(1, 2), cptController.getAllTypes);
router.post('/types', protect, authorize(1, 2), cptController.createType);
router.put('/types/:id', protect, authorize(1, 2), cptController.updateType);
router.delete('/types/:id', protect, authorize(1, 2), cptController.deleteType);

// --- Admin: Entries within a post type ---
// Adding/editing entries (e.g. a new Industry) is content-authoring. Super
// Admin/Admin always have access; Editor(3)/Staff Viewer(5) need an
// explicit grant for that specific post type's `cpt.<slug>` section (see
// modules/permissions), which also auto-registers as a checkbox option the
// moment a post type is created - no code change needed per new CPT.
router.get('/entries/:id', protect, authorizeSection(menuKeyForEntry), cptController.getEntryById);
router.put('/entries/:id', protect, authorizeSection(menuKeyForEntry), cptController.updateEntry);
router.delete('/entries/:id', protect, authorizeSection(menuKeyForEntry), cptController.deleteEntry);
router.get('/:postType/entries', protect, authorizeSection((req) => `cpt.${req.params.postType}`), cptController.getEntries);
router.post('/:postType/entries', protect, authorizeSection((req) => `cpt.${req.params.postType}`), cptController.createEntry);

module.exports = router;
