const db = require('../../config/db');

class FormsRepository {
  /**
   * Get all forms
   */
  async getAllForms() {
    return await db.selectAll('forms', '*', '', 'ORDER BY created_at DESC');
  }

  /**
   * Get form by slug
   */
  async getBySlug(slug) {
    return await db.select('forms', '*', `slug = ?`, [slug]);
  }

  /**
   * Get form by ID
   */
  async getById(id) {
    return await db.select('forms', '*', `id = ?`, [id]);
  }

  /**
   * Create a new form
   */
  async create(data) {
    const result = await db.insert('forms', {
      title: data.title,
      slug: data.slug,
      description: data.description || null,
      fields: typeof data.fields === 'string' ? data.fields : JSON.stringify(data.fields),
      settings: typeof data.settings === 'string' ? data.settings : JSON.stringify(data.settings || {}),
      status: data.status || 'active'
    });
    return result.insert_id;
  }

  /**
   * Update a form
   */
  async update(id, data) {
    const updateData = { ...data };
    
    if (updateData.fields && typeof updateData.fields !== 'string') {
      updateData.fields = JSON.stringify(updateData.fields);
    }
    if (updateData.settings && typeof updateData.settings !== 'string') {
      updateData.settings = JSON.stringify(updateData.settings);
    }

    delete updateData.id;
    delete updateData.created_at;
    delete updateData.updated_at;

    await db.update('forms', updateData, `id = ?`, [id]);
  }

  /**
   * Delete a form
   */
  async delete(id) {
    await db.delete('forms', `id = ?`, [id]);
  }

  /**
   * Submissions
   */

  /**
   * Create a form submission
   */
  async createSubmission(data) {
    const result = await db.insert('form_submissions', {
      form_id: data.form_id,
      data: typeof data.data === 'string' ? data.data : JSON.stringify(data.data),
      status: data.status || 'unread',
      ip_address: data.ip_address || null,
      user_agent: data.user_agent || null
    });
    return result.insert_id;
  }

  /**
   * Get all submissions with form title
   */
  async getAllSubmissions() {
    return await db.pool.query(`
      SELECT s.*, f.title as form_title, f.slug as form_slug, u.name as assigned_user_name
      FROM form_submissions s
      JOIN forms f ON s.form_id = f.id
      LEFT JOIN users u ON s.assigned_to = u.id
      ORDER BY s.created_at DESC
    `).then(([rows]) => rows);
  }

  /**
   * Get submissions by form ID
   */
  async getSubmissionsByFormId(formId) {
    return await db.pool.query(`
      SELECT s.*, f.title as form_title, f.slug as form_slug, u.name as assigned_user_name
      FROM form_submissions s
      JOIN forms f ON s.form_id = f.id
      LEFT JOIN users u ON s.assigned_to = u.id
      WHERE s.form_id = ?
      ORDER BY s.created_at DESC
    `, [formId]).then(([rows]) => rows);
  }

  /**
   * Get submission by ID
   */
  async getSubmissionById(id) {
    return await db.pool.query(`
      SELECT s.*, f.title as form_title, f.slug as form_slug, f.settings as form_settings, u.name as assigned_user_name
      FROM form_submissions s
      JOIN forms f ON s.form_id = f.id
      LEFT JOIN users u ON s.assigned_to = u.id
      WHERE s.id = ?
    `, [id]).then(([rows]) => rows[0]);
  }

  /**
   * Update submission status
   */
  async updateSubmissionStatus(id, status) {
    await db.update('form_submissions', { status }, `id = ?`, [id]);
  }

  /**
   * Update sales status
   */
  async updateSalesStatus(id, sales_status) {
    await db.update('form_submissions', { sales_status }, `id = ?`, [id]);
  }

  /**
   * Assign submission
   */
  async assignSubmission(id, user_id) {
    await db.update('form_submissions', { assigned_to: user_id }, `id = ?`, [id]);
  }

  /**
   * Update internal notes
   */
  async updateInternalNotes(id, notesJSON) {
    await db.update('form_submissions', { internal_notes: notesJSON }, `id = ?`, [id]);
  }

  /**
   * Delete a submission
   */
  async deleteSubmission(id) {
    await db.delete('form_submissions', `id = ?`, [id]);
  }
}

module.exports = new FormsRepository();
