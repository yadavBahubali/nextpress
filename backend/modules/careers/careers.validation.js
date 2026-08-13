const { z } = require('zod');

// Submitted via multipart/form-data (uploadDocument runs first and populates
// req.body with the non-file text fields), so values arrive as strings.
const applicationSchema = z.object({
  name: z.string().trim().min(1, 'Name is required').max(150),
  email: z.string().trim().toLowerCase().email('Invalid email address').max(255),
  phone: z.string().trim().max(30).optional().or(z.literal('')),
  linkedin_url: z.string().trim().max(500).optional().or(z.literal('')),
});

module.exports = { applicationSchema };
