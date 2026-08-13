const formsRepository = require('./forms.repository');
const ApiError = require('../../utils/ApiError');
const sendEmail = require('../../utils/mailer');

class FormsService {
  /**
   * Helper to format form data
   */
  formatForm(form) {
    if (!form) return null;
    if (typeof form.fields === 'string') form.fields = JSON.parse(form.fields);
    if (typeof form.settings === 'string') form.settings = JSON.parse(form.settings);
    return form;
  }

  /**
   * Helper to format submission data
   */
  formatSubmission(submission) {
    if (!submission) return null;
    if (typeof submission.data === 'string') submission.data = JSON.parse(submission.data);
    if (submission.form_settings && typeof submission.form_settings === 'string') {
        submission.form_settings = JSON.parse(submission.form_settings);
    }
    return submission;
  }

  async getAllForms() {
    const forms = await formsRepository.getAllForms();
    return forms.map(form => this.formatForm(form));
  }

  async getFormBySlug(slug) {
    const form = await formsRepository.getBySlug(slug);
    if (!form) throw new ApiError(404, 'Form not found');
    return this.formatForm(form);
  }

  async getFormById(id) {
    const form = await formsRepository.getById(id);
    if (!form) throw new ApiError(404, 'Form not found');
    return this.formatForm(form);
  }

  async createForm(data) {
    // Check if slug exists
    const existing = await formsRepository.getBySlug(data.slug);
    if (existing) throw new ApiError(400, 'Slug already exists');

    return await formsRepository.create(data);
  }

  async updateForm(id, data) {
    const form = await formsRepository.getById(id);
    if (!form) throw new ApiError(404, 'Form not found');

    if (data.slug && data.slug !== form.slug) {
      const existing = await formsRepository.getBySlug(data.slug);
      if (existing) throw new ApiError(400, 'Slug already exists');
    }

    await formsRepository.update(id, data);
    return true;
  }

  async deleteForm(id) {
    const form = await formsRepository.getById(id);
    if (!form) throw new ApiError(404, 'Form not found');
    await formsRepository.delete(id);
    return true;
  }

  /**
   * Submissions
   */

  async submitForm(slug, submissionData, metadata = {}) {
    const form = await formsRepository.getBySlug(slug);
    if (!form) throw new ApiError(404, 'Form not found');
    if (form.status !== 'active') throw new ApiError(400, 'Form is inactive');

    const formattedForm = this.formatForm(form);
    
    // Save submission
    const submissionId = await formsRepository.createSubmission({
      form_id: form.id,
      data: submissionData,
      ip_address: metadata.ip,
      user_agent: metadata.userAgent
    });

    const { logNotification } = require('../../utils/logger');
    logNotification('contact_enquiry', `New form submission received on form: "${form.title}"`, { 
      submissionId, 
      formId: form.id, 
      slug, 
      ipAddress: metadata.ip 
    });

    // Handle email notification
    const settings = formattedForm.settings || {};
    if (settings.admin_email) {
      const subject = settings.email_subject || `New Submission: ${formattedForm.title}`;
      
      // Build simple HTML table for data
      let htmlContent = `<h3>New form submission for ${formattedForm.title}</h3><table border="1" cellpadding="10" style="border-collapse: collapse;">`;
      for (const [key, value] of Object.entries(submissionData)) {
        // Find field label for better presentation
        const field = formattedForm.fields.find(f => f.name === key);
        const label = field ? field.label : key;
        htmlContent += `<tr><td><strong>${label}</strong></td><td>${value}</td></tr>`;
      }
      htmlContent += `</table>`;

      await sendEmail({
        email: settings.admin_email,
        subject: subject,
        html: htmlContent,
        message: `New submission for ${formattedForm.title}`
      });
    }

    return {
      submissionId,
      successMessage: settings.success_message || 'Thank you for your submission!',
      redirectUrl: settings.redirect_url || null
    };
  }

  async getAllSubmissions() {
    const submissions = await formsRepository.getAllSubmissions();
    return submissions.map(s => this.formatSubmission(s));
  }

  async getSubmissionsByFormId(formId) {
    const submissions = await formsRepository.getSubmissionsByFormId(formId);
    return submissions.map(s => this.formatSubmission(s));
  }

  async getSubmissionById(id) {
    const submission = await formsRepository.getSubmissionById(id);
    if (!submission) throw new ApiError(404, 'Submission not found');
    return this.formatSubmission(submission);
  }

  async updateSubmissionStatus(id, status) {
    await formsRepository.updateSubmissionStatus(id, status);
    return true;
  }

  async updateSalesStatus(id, sales_status) {
    await formsRepository.updateSalesStatus(id, sales_status);
    return true;
  }

  async assignSubmission(id, user_id) {
    await formsRepository.assignSubmission(id, user_id);
    return true;
  }

  async addNoteToSubmission(id, noteData, user) {
    const submission = await formsRepository.getSubmissionById(id);
    if (!submission) throw new ApiError(404, 'Submission not found');

    let notes = [];
    if (submission.internal_notes) {
      notes = typeof submission.internal_notes === 'string' ? JSON.parse(submission.internal_notes) : submission.internal_notes;
    }

    notes.push({
      text: noteData.text,
      user_id: user.id,
      user_name: user.name,
      timestamp: new Date().toISOString()
    });

    await formsRepository.updateInternalNotes(id, JSON.stringify(notes));
    return notes;
  }

  async deleteSubmission(id) {
    await formsRepository.deleteSubmission(id);
    return true;
  }
}

module.exports = new FormsService();
