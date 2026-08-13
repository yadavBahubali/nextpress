const reportsRepository = require('./reports.repository');

class ReportsService {
  async getDashboardSummary() {
    const data = await reportsRepository.getInquiriesSummary();

    // Calculate some derived metrics
    const wonCount = data.statusBreakdown.find(s => s.sales_status === 'won')?.count || 0;
    const closedCount = data.statusBreakdown.find(s => s.sales_status === 'won' || s.sales_status === 'lost')?.count || 0;
    
    let conversionRate = 0;
    if (closedCount > 0) {
      conversionRate = ((wonCount / closedCount) * 100).toFixed(1);
    }

    // Format trend data for charting
    const formattedTrend = data.trendData.map(t => ({
      date: new Date(t.date).toISOString().split('T')[0],
      count: t.count
    }));

    return {
      kpis: {
        totalLeads: data.totalLeads,
        recentLeads30Days: data.recentLeads,
        wonLeads: wonCount,
        conversionRate: parseFloat(conversionRate)
      },
      charts: {
        byForm: data.formBreakdown,
        byStatus: data.statusBreakdown,
        trend30Days: formattedTrend
      }
    };
  }

  async getEcommerceDashboard() {
    const data = await reportsRepository.getEcommerceSummary();

    const formattedTrend = data.salesTrend.map(t => ({
      date: new Date(t.date).toISOString().split('T')[0],
      revenue: Number(t.revenue),
      orders: Number(t.orders)
    }));

    return {
      kpis: data.financials,
      inventory: data.inventory,
      charts: {
        salesTrend: formattedTrend,
        orderStatus: data.orderStatuses,
        topProducts: data.topProducts
      }
    };
  }

  async getHrDashboard() {
    return await reportsRepository.getHrSummary();
  }

  async getGeneralDashboard() {
    return await reportsRepository.getGeneralSummary();
  }

  async getNotifications() {
    const db = require('../../config/db');
    const [rows] = await db.pool.query(
      'SELECT id, type, message, details_json, created_at FROM notification_logs ORDER BY created_at DESC LIMIT 20'
    );
    return rows.map(r => {
      if (r.details_json && typeof r.details_json === 'string') {
        try { r.details_json = JSON.parse(r.details_json); } catch (e) {}
      }
      return r;
    });
  }
}

module.exports = new ReportsService();
