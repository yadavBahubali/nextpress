const db = require('../../config/db');

class CareersRepository {
  // --- Jobs ---
  async getAllJobs(includeDrafts = false) {
    let whereClause = '';
    if (!includeDrafts) {
      whereClause = "status = 'published'";
    }
    return await db.selectAll('jobs', '*', whereClause, 'ORDER BY created_at DESC');
  }

  async getJobById(id) {
    return await db.select('jobs', '*', `id = ?`, [id]);
  }

  async getJobBySlug(slug) {
    return await db.select('jobs', '*', `slug = ?`, [slug]);
  }

  async createJob(data) {
    const result = await db.insert('jobs', {
      title: data.title,
      slug: data.slug,
      department: data.department || null,
      location: data.location || null,
      type: data.type || 'full-time',
      description: data.description,
      requirements: data.requirements || null,
      status: data.status || 'draft',
      attachment_path: data.attachment_path || null
    });
    return result.insert_id;
  }

  async updateJob(id, data) {
    const updateData = { ...data };
    delete updateData.id;
    delete updateData.created_at;
    delete updateData.updated_at;
    await db.update('jobs', updateData, `id = ?`, [id]);
  }

  async deleteJob(id) {
    await db.delete('jobs', `id = ?`, [id]);
  }

  // --- Applications ---
  async createApplication(data) {
    const result = await db.insert('job_applications', {
      job_id: data.job_id,
      name: data.name,
      email: data.email,
      phone: data.phone || null,
      linkedin_url: data.linkedin_url || null,
      resume_path: data.resume_path,
      status: 'new'
    });
    return result.insert_id;
  }

  async getAllApplications(jobId = null) {
    let query = `
      SELECT a.*, j.title as job_title, j.department 
      FROM job_applications a
      JOIN jobs j ON a.job_id = j.id
    `;
    let params = [];

    if (jobId) {
      query += ` WHERE a.job_id = ? `;
      params.push(jobId);
    }
    query += ` ORDER BY a.created_at DESC`;
    
    const [rows] = await db.pool.query(query, params);
    return rows;
  }

  async getApplicationById(id) {
    const [rows] = await db.pool.query(`
      SELECT a.*, j.title as job_title, j.department 
      FROM job_applications a
      JOIN jobs j ON a.job_id = j.id
      WHERE a.id = ?
    `, [id]);
    return rows[0];
  }

  async updateApplicationStatus(id, status) {
    await db.update('job_applications', { status }, `id = ?`, [id]);
  }

  async updateApplicationNotes(id, notesJSON) {
    await db.update('job_applications', { internal_notes: notesJSON }, `id = ?`, [id]);
  }

  async deleteApplication(id) {
    await db.delete('job_applications', `id = ?`, [id]);
  }

  // --- Dashboard Stats ---
  async getHrDashboardStats() {
    const [jobsTotal] = await db.pool.query('SELECT COUNT(*) as count FROM jobs');
    const [jobsActive] = await db.pool.query("SELECT COUNT(*) as count FROM jobs WHERE status = 'published'");
    const [appsTotal] = await db.pool.query('SELECT COUNT(*) as count FROM job_applications');
    const [appsHired] = await db.pool.query("SELECT COUNT(*) as count FROM job_applications WHERE status = 'hired'");
    const [appsRecent] = await db.pool.query('SELECT COUNT(*) as count FROM job_applications WHERE created_at >= DATE_SUB(NOW(), INTERVAL 30 DAY)');

    // Recent applications
    const [recentApplications] = await db.pool.query(`
      SELECT a.id, a.name, a.status, a.created_at, j.title as job_title
      FROM job_applications a
      JOIN jobs j ON a.job_id = j.id
      ORDER BY a.created_at DESC
      LIMIT 5
    `);

    // Status breakdown
    const [statusBreakdown] = await db.pool.query(`
      SELECT status, COUNT(*) as count
      FROM job_applications
      GROUP BY status
    `);

    // Ensure all counts are regular numbers (mysql2 can return BigInts for COUNT)
    const formattedStatusBreakdown = statusBreakdown.map(item => ({
      status: item.status,
      count: Number(item.count)
    }));

    return {
      jobs: {
        total: Number(jobsTotal[0].count),
        active: Number(jobsActive[0].count)
      },
      applications: {
        total: Number(appsTotal[0].count),
        hired: Number(appsHired[0].count),
        recent30Days: Number(appsRecent[0].count)
      },
      recentApplications,
      statusBreakdown: formattedStatusBreakdown
    };
  }
}

module.exports = new CareersRepository();
