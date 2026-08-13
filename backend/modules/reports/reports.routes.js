const express = require('express');
const router = express.Router();
const reportsController = require('./reports.controller');
const { protect, authorize, authorizeSection } = require('../../middleware/authMiddleware');

// Business/analytics dashboards. All still require an authenticated staff
// account (never a plain Viewer/Customer, role 4, which `protect` alone used
// to allow) - split by module to match the frontend nav's per-section grants.
router.use(protect);

// Rendered on every admin's landing dashboard and the persistent topbar for
// any staff account - not section-gated, since there's no meaningful reason
// to hide "you have new leads" style notifications from a Viewer who has
// access to nothing else yet.
router.get('/general-dashboard', authorize(1, 2, 3, 5), reportsController.getGeneralDashboard);
router.get('/notifications', authorize(1, 2, 3, 5), reportsController.getNotifications);
// Matches the equivalent section grant on the underlying data.
router.get('/sales-dashboard', authorizeSection('sales.dashboard'), reportsController.getSalesDashboard);
router.get('/ecommerce-dashboard', authorizeSection('ecommerce.dashboard'), reportsController.getEcommerceDashboard);
router.get('/hr-dashboard', authorizeSection('hr.dashboard'), reportsController.getHrDashboard);

module.exports = router;
