const db = require('../../config/db');

class ReportsRepository {
  /**
   * Get overall inquiry summary
   */
  async getInquiriesSummary() {
    // Total leads
    const [totalRows] = await db.pool.query('SELECT COUNT(*) as total FROM form_submissions');
    const totalLeads = totalRows[0].total;

    // Leads in the last 30 days
    const [recentRows] = await db.pool.query(`
      SELECT COUNT(*) as recent 
      FROM form_submissions 
      WHERE created_at >= DATE_SUB(NOW(), INTERVAL 30 DAY)
    `);
    const recentLeads = recentRows[0].recent;

    // Leads by Form
    const [formBreakdown] = await db.pool.query(`
      SELECT f.title, COUNT(s.id) as count
      FROM forms f
      LEFT JOIN form_submissions s ON f.id = s.form_id
      GROUP BY f.id
    `);

    // Leads by Sales Status
    const [statusBreakdown] = await db.pool.query(`
      SELECT sales_status, COUNT(*) as count
      FROM form_submissions
      GROUP BY sales_status
    `);

    // Leads per day (Last 30 days) for charts
    const [trendData] = await db.pool.query(`
      SELECT DATE(created_at) as date, COUNT(*) as count
      FROM form_submissions
      WHERE created_at >= DATE_SUB(NOW(), INTERVAL 30 DAY)
      GROUP BY DATE(created_at)
      ORDER BY date ASC
    `);

    return {
      totalLeads,
      recentLeads,
      formBreakdown,
      statusBreakdown,
      trendData
    };
  }

  /**
   * Get overall ecommerce summary
   */
  async getEcommerceSummary() {
    // 1. Financials
    const [revenueRows] = await db.pool.query("SELECT SUM(total_amount) as total FROM orders WHERE payment_status = 'paid'");
    const totalRevenue = revenueRows[0].total || 0;

    const [orderCountRows] = await db.pool.query("SELECT COUNT(*) as total FROM orders");
    const totalOrders = orderCountRows[0].total || 0;

    const avgOrderValue = totalOrders > 0 ? (totalRevenue / totalOrders).toFixed(2) : 0;

    // 2. Inventory
    const [lowStockRows] = await db.pool.query("SELECT COUNT(*) as count FROM products WHERE stock_quantity <= 5 AND stock_quantity > 0");
    const lowStockCount = lowStockRows[0].count;

    const [outOfStockRows] = await db.pool.query("SELECT COUNT(*) as count FROM products WHERE stock_quantity = 0");
    const outOfStockCount = outOfStockRows[0].count;

    // 3. Sales Trend (Last 30 Days)
    const [salesTrend] = await db.pool.query(`
      SELECT DATE(created_at) as date, SUM(total_amount) as revenue, COUNT(*) as orders
      FROM orders 
      WHERE created_at >= DATE_SUB(NOW(), INTERVAL 30 DAY)
      AND payment_status = 'paid'
      GROUP BY DATE(created_at)
      ORDER BY date ASC
    `);

    // 4. Order Status Breakdown
    const [orderStatuses] = await db.pool.query(`
      SELECT status, COUNT(*) as count
      FROM orders
      GROUP BY status
    `);

    // 5. Top Products
    const [topProducts] = await db.pool.query(`
      SELECT p.name, COUNT(oi.id) as sales_count, SUM(oi.price * oi.quantity) as total_revenue
      FROM products p
      JOIN order_items oi ON p.id = oi.product_id
      JOIN orders o ON oi.order_id = o.id
      WHERE o.payment_status = 'paid'
      GROUP BY p.id
      ORDER BY sales_count DESC
      LIMIT 5
    `);

    return {
      financials: {
        totalRevenue: Number(totalRevenue),
        totalOrders: Number(totalOrders),
        avgOrderValue: Number(avgOrderValue)
      },
      inventory: {
        lowStock: Number(lowStockCount),
        outOfStock: Number(outOfStockCount)
      },
      salesTrend,
      orderStatuses,
      topProducts
    };
  }

  async getHrSummary() {
    const [jobsRows] = await db.pool.query('SELECT COUNT(*) as total FROM jobs');
    const totalJobs = jobsRows[0].total;

    const [activeJobsRows] = await db.pool.query("SELECT COUNT(*) as active FROM jobs WHERE status = 'published'");
    const activeJobs = activeJobsRows[0].active;

    const [appsRows] = await db.pool.query('SELECT COUNT(*) as total FROM job_applications');
    const totalApplicants = appsRows[0].total;

    const [newAppsRows] = await db.pool.query("SELECT COUNT(*) as newApps FROM job_applications WHERE status = 'new'");
    const newApplicants = newAppsRows[0].newApps;

    return { totalJobs, activeJobs, totalApplicants, newApplicants };
  }

  async getGeneralSummary() {
    const [pagesRows] = await db.pool.query('SELECT COUNT(*) as total FROM pages');
    const totalPages = pagesRows[0].total;

    const [postsRows] = await db.pool.query('SELECT COUNT(*) as total FROM posts');
    const totalPosts = postsRows[0].total;

    const [usersRows] = await db.pool.query('SELECT COUNT(*) as total FROM users');
    const totalUsers = usersRows[0].total;

    return { totalPages, totalPosts, totalUsers };
  }
}

module.exports = new ReportsRepository();
