// backend/middleware/authmiddleware.js
const jwt = require('jsonwebtoken');
const ApiError = require('../utils/ApiError');
const asyncHandler = require('../utils/asyncHandler');
const authRepository = require('../modules/auth/auth.repository');

const protect = asyncHandler(async (req, res, next) => {
  let token;
  let tokenSource;

  // 1. Check cookies for token (Primary)
  if (req.cookies && req.cookies.accessToken) {
    token = req.cookies.accessToken;
    tokenSource = 'cookie';
  }
  // 2. Check Authorization header (Fallback)
  else if (
    req.headers.authorization &&
    req.headers.authorization.startsWith('Bearer')
  ) {
    token = req.headers.authorization.split(' ')[1];
    tokenSource = 'authorization header';
  }

  if (process.env.NODE_ENV !== 'production') {
    console.log('Auth request:', {
      cookies: Object.keys(req.cookies || {}),
      hasAuthorizationHeader: Boolean(req.headers.authorization),
      tokenSource: tokenSource || null
    });
  }

  if (!token) {
    throw new ApiError(401, 'Not authorized to access this route');
  }

  try {
    // Verify token
    const decoded = jwt.verify(token, process.env.JWT_SECRET);

    // Get user from database
    const user = await authRepository.findById(decoded.id);
    
    if (!user) {
      throw new ApiError(401, 'User no longer exists');
    }

    req.user = user;
    next();
  } catch (err) {
    if (process.env.NODE_ENV !== 'production') {
      console.error('Auth verification failed:', err.name, err.message);
    }

    if (err instanceof ApiError) {
      throw err;
    }

    const message = process.env.NODE_ENV === 'production'
      ? 'Not authorized to access this route'
      : err.message;

    throw new ApiError(401, message);
  }
});

// Grant access to specific roles (using role_id)
const authorize = (...roleIds) => {
  return (req, res, next) => {
    if (!req.user || !roleIds.includes(req.user.role_id)) {
      throw new ApiError(
        403,
        `User role ID ${req.user ? req.user.role_id : 'none'} is not authorized to access this route`
      );
    }
    next();
  };
};

// Gate a route behind a granular section grant (see user_permissions /
// modules/permissions). Super Admin (1) and Admin (2) always pass - they're
// never restricted by section. Editor (3) and Staff Viewer (5) must have an
// explicit grant for `menuKey`; Staff Viewer additionally can't perform any
// mutating request (anything but GET/HEAD/OPTIONS) even on a granted
// section, since their whole point is read-only access. Any other role_id
// (including 4, the public/customer default) is always denied - section
// access is opt-in per user, never implied by role alone.
//
// `menuKeyOrFn` can be a fixed string, or a (req) => string|Promise<string>
// for routes whose section can't be known from the URL alone - e.g. a CPT
// entry addressed only by numeric id, where the post type slug (and
// therefore the right `cpt.<slug>` key) has to be looked up first.
const authorizeSection = (menuKeyOrFn) => {
  return asyncHandler(async (req, res, next) => {
    if (!req.user) {
      throw new ApiError(401, 'Not authorized to access this route');
    }

    if ([1, 2].includes(req.user.role_id)) {
      return next();
    }

    if ([3, 5].includes(req.user.role_id)) {
      const menuKey = typeof menuKeyOrFn === 'function' ? await menuKeyOrFn(req) : menuKeyOrFn;

      // Lazy require: permissions.service -> users.repository has no cycle
      // back here today, but requiring at call time keeps it that way even
      // if that changes later.
      const permissionsService = require('../modules/permissions/permissions.service');
      const hasAccess = menuKey ? await permissionsService.hasPermission(req.user.id, menuKey) : false;
      if (!hasAccess) {
        throw new ApiError(403, "You don't have access to this section");
      }

      const isMutating = !['GET', 'HEAD', 'OPTIONS'].includes(req.method);
      if (req.user.role_id === 5 && isMutating) {
        throw new ApiError(403, 'Your account has read-only access to this section');
      }

      return next();
    }

    throw new ApiError(403, 'Not authorized to access this route');
  });
};

// Populate req.user if a valid token is present, but never reject the request
// if it's missing/invalid. Used for endpoints that are public by default but
// need to expose extra data to authenticated callers.
const optionalAuth = asyncHandler(async (req, res, next) => {
  let token;

  if (req.cookies && req.cookies.accessToken) {
    token = req.cookies.accessToken;
  } else if (
    req.headers.authorization &&
    req.headers.authorization.startsWith('Bearer')
  ) {
    token = req.headers.authorization.split(' ')[1];
  }

  if (!token) {
    return next();
  }

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    const user = await authRepository.findById(decoded.id);
    if (user) {
      req.user = user;
    }
  } catch (err) {
    // Invalid/expired token on an optionally-authenticated route: proceed as anonymous.
  }

  next();
});

module.exports = { protect, authorize, authorizeSection, optionalAuth };
