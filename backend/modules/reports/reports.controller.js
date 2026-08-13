const reportsService = require('./reports.service');
const asyncHandler = require('../../utils/asyncHandler');

exports.getSalesDashboard = asyncHandler(async (req, res) => {
  const summary = await reportsService.getDashboardSummary();
  res.json({
    status: 'success',
    data: summary
  });
});

exports.getEcommerceDashboard = asyncHandler(async (req, res) => {
    const summary = await reportsService.getEcommerceDashboard();
    res.json({
      status: 'success',
      data: summary
    });
});

exports.getHrDashboard = asyncHandler(async (req, res) => {
    const summary = await reportsService.getHrDashboard();
    res.json({ status: 'success', data: summary });
});

exports.getGeneralDashboard = asyncHandler(async (req, res) => {
    const summary = await reportsService.getGeneralDashboard();
    res.json({ status: 'success', data: summary });
});

exports.getNotifications = asyncHandler(async (req, res) => {
  const notifications = await reportsService.getNotifications();
  res.json({
    status: 'success',
    data: notifications
  });
});
