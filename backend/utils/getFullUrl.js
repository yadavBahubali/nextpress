/**
 * Shared URL utility for media/uploads.
 *
 * DB stores only relative paths (e.g. `/uploads/images/file.jpg`).
 * This helper prepends the configured BASE_URL at runtime so that:
 *   - Local dev   → http://localhost:8000/uploads/images/file.jpg
 *   - Production  → https://api.yourdomain.com/uploads/images/file.jpg
 *
 * Set BASE_URL in your .env file. No code changes needed when deploying.
 */

/**
 * Convert a relative upload path to a fully-qualified URL.
 * @param {string|null} filePath  - e.g. "/uploads/images/photo.jpg"
 * @returns {string|null}         - Full URL or null if no path
 */
function getFullUrl(filePath) {
  if (!filePath) return null;
  // If it's already an absolute URL (e.g. CDN), return as-is
  if (filePath.startsWith('http://') || filePath.startsWith('https://')) return filePath;
  const baseUrl = process.env.BASE_URL || `http://localhost:${process.env.PORT || 8000}`;
  // Avoid double slashes
  const normalizedBase = baseUrl.replace(/\/$/, '');
  const normalizedPath = filePath.startsWith('/') ? filePath : `/${filePath}`;
  return `${normalizedBase}${normalizedPath}`;
}

module.exports = { getFullUrl };
