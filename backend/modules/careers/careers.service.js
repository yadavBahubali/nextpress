const careersRepository = require('./careers.repository');
const ApiError = require('../../utils/ApiError');
const fs = require('fs');
const path = require('path');

class CareersService {
  
  // --- Jobs ---
  async getPublicJobs() {
    return await careersRepository.getAllJobs(false);
  }

  async getAllJobs() {
    return await careersRepository.getAllJobs(true);
  }

  async getJobBySlug(slug) {
    const job = await careersRepository.getJobBySlug(slug);
    if (!job) throw new ApiError(404, 'Job not found');
    return job;
  }

  async getJobById(id) {
    const job = await careersRepository.getJobById(id);
    if (!job) throw new ApiError(404, 'Job not found');
    return job;
  }

  async createJob(data, file) {
    if (!data.title || !data.description || !data.slug) {
      throw new ApiError(400, 'Title, slug, and description are required');
    }
    const existing = await careersRepository.getJobBySlug(data.slug);
    if (existing) throw new ApiError(400, 'Slug already exists');

    let attachmentPath = null;
    if (file) {
      attachmentPath = `/uploads/docs/${file.filename}`;
    }

    return await careersRepository.createJob({
      ...data,
      attachment_path: attachmentPath || data.attachment_path
    });
  }

  async updateJob(id, data, file) {
    const job = await careersRepository.getJobById(id);
    if (!job) throw new ApiError(404, 'Job not found');
    
    if (data.slug && data.slug !== job.slug) {
      const existing = await careersRepository.getJobBySlug(data.slug);
      if (existing) throw new ApiError(400, 'Slug already exists');
    }

    let attachmentPath = data.attachment_path;
    if (file) {
      attachmentPath = `/uploads/docs/${file.filename}`;
    }

    await careersRepository.updateJob(id, {
      ...data,
      attachment_path: attachmentPath !== undefined ? attachmentPath : job.attachment_path
    });
    return true;
  }

  async deleteJob(id) {
    const job = await careersRepository.getJobById(id);
    if (!job) throw new ApiError(404, 'Job not found');
    await careersRepository.deleteJob(id);
    return true;
  }

  // --- Applications ---
  async submitApplication(jobId, data, file) {
    const job = await careersRepository.getJobById(jobId);
    if (!job) throw new ApiError(404, 'Job not found');
    if (job.status !== 'published') throw new ApiError(400, 'This job is no longer accepting applications');
    
    if (!file) {
      throw new ApiError(400, 'Resume file is required');
    }

    if (!data.name || !data.email) {
      throw new ApiError(400, 'Name and email are required');
    }

    const relativePath = `/uploads/docs/${file.filename}`;

    const applicationId = await careersRepository.createApplication({
      job_id: jobId,
      name: data.name,
      email: data.email,
      phone: data.phone,
      linkedin_url: data.linkedin_url,
      resume_path: relativePath
    });

    return applicationId;
  }

  async getAllApplications(jobId) {
    const apps = await careersRepository.getAllApplications(jobId);
    return apps.map(this.formatApplication);
  }

  async getApplicationById(id) {
    const app = await careersRepository.getApplicationById(id);
    if (!app) throw new ApiError(404, 'Application not found');
    return this.formatApplication(app);
  }

  async updateApplicationStatus(id, status) {
    await careersRepository.updateApplicationStatus(id, status);
    return true;
  }

  async addNoteToApplication(id, text, user) {
    const app = await careersRepository.getApplicationById(id);
    if (!app) throw new ApiError(404, 'Application not found');

    let notes = [];
    if (app.internal_notes) {
      notes = typeof app.internal_notes === 'string' ? JSON.parse(app.internal_notes) : app.internal_notes;
    }

    notes.push({
      text: text,
      user_name: user.name,
      timestamp: new Date().toISOString()
    });

    await careersRepository.updateApplicationNotes(id, JSON.stringify(notes));
    return notes;
  }

  async deleteApplication(id) {
    const app = await careersRepository.getApplicationById(id);
    if (!app) throw new ApiError(404, 'Application not found');

    // Optionally delete the resume file from disk
    if (app.resume_path) {
      try {
        const filePath = path.join(__dirname, '../../', app.resume_path);
        if (fs.existsSync(filePath)) {
          fs.unlinkSync(filePath);
        }
      } catch (err) {
        console.error('Failed to delete resume file:', err);
      }
    }

    await careersRepository.deleteApplication(id);
    return true;
  }

  formatApplication(app) {
    if (!app) return null;
    if (typeof app.internal_notes === 'string') {
      try {
        app.internal_notes = JSON.parse(app.internal_notes);
      } catch (e) {
        app.internal_notes = [];
      }
    }
    return app;
  }

  // --- Dashboard ---
  async getHrDashboardStats() {
    return await careersRepository.getHrDashboardStats();
  }
}

module.exports = new CareersService();
