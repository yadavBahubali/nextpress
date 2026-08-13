const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const cookieParser = require('cookie-parser');
const path = require('path');
const errorMiddleware = require('./middleware/errorMiddleware');
const ApiError = require('./utils/ApiError');

const app = express();

// Security headers (X-Content-Type-Options, X-Frame-Options, HSTS, etc.).
// contentSecurityPolicy is disabled: this is a JSON API + static media
// server (images/PDFs/video under /uploads), not an HTML-rendering app, so
// helmet's default CSP directives aren't applicable here and would only add
// surprising failure modes for embedded/direct media requests.
app.use(helmet({ contentSecurityPolicy: false }));

// Middleware
// Origins allowed to make credentialed (cookie-based) cross-origin requests.
// Configured explicitly via env vars rather than a substring check, since
// `origin.includes('localhost')` also matches attacker-controlled hosts like
// "https://localhost.evil.com" or "https://evil.com?localhost".
const allowedOrigins = [process.env.CORS_ORIGIN, process.env.FRONTEND_URL].filter(Boolean);

app.use(cors({
  origin: function (origin, callback) {
    // Requests with no Origin header (curl, server-to-server, same-origin
    // navigation) aren't subject to CORS at all.
    if (!origin) return callback(null, true);

    let hostname;
    try {
      hostname = new URL(origin).hostname;
    } catch (err) {
      return callback(new Error('Not allowed by CORS'));
    }

    // Local development origins (any port) are always allowed.
    if (hostname === 'localhost' || hostname === '127.0.0.1') {
      return callback(null, true);
    }

    if (allowedOrigins.includes(origin)) {
      return callback(null, true);
    }

    return callback(new Error('Not allowed by CORS'));
  },
  credentials: true
}));
app.use(cookieParser());
// Default body-parser limit is 100kb, which a real CMS payload blows past
// easily - a page/CPT entry's content_json can hold several WYSIWYG fields,
// repeaters, etc. Actual file uploads (images/docs) go through multer on
// their own routes with settings-driven limits, so this only governs
// JSON/form payloads.
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// Static uploads folder.
// SVGs can embed <script>; force them to download instead of rendering
// inline so an uploaded SVG can't execute as stored XSS in the site's
// origin, regardless of the current media_allowed_extensions setting or
// files uploaded before that setting excluded svg.
app.use('/uploads', express.static(path.join(__dirname, 'uploads'), {
  setHeaders: (res, filePath) => {
    if (path.extname(filePath).toLowerCase() === '.svg') {
      res.setHeader('Content-Disposition', 'attachment');
    }
  }
}));

// Request logging (simple version)
app.use((req, res, next) => {
  if (process.env.NODE_ENV !== 'production') {
    console.log(`${req.method} ${req.url}`);
  }
  next();
});

// Routes
// We'll add routes here later
app.get('/', (req, res) => {
  res.json({ message: 'CMS Backend API is running' });
});

// API Routes prefix
const apiPrefix = process.env.API_PREFIX || '/api/v1';
app.use(apiPrefix, require('./routes'));

// Catch 404 and forward to error handler
app.use((req, res, next) => {
  next(new ApiError(404, 'Route not found'));
});

// Global Error Handler
app.use(errorMiddleware);

module.exports = app;
