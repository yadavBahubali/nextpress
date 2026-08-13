const express = require('express');
const setupController = require('./setup.controller');

const router = express.Router();

// The install wizard rewrites backend/.env, runs every migration against
// attacker-supplied DB credentials, and creates a Super Admin account - all
// with no authentication, by design (there's no admin account to log in with
// on a fresh install). That makes it safe only for the few minutes of a
// first-time setup and dangerous to leave reachable afterward: anyone who
// finds `/api/v1/setup/*` on a live site can re-point it at their own
// database, mint their own Super Admin, or (via /test-connection, which has
// no guard at all) probe arbitrary internal hosts/ports.
//
// It's opt-in and off by default. Set ALLOW_SETUP_WIZARD=true in .env only
// while actually running first-time setup, then unset it.
router.use((req, res, next) => {
  if (process.env.ALLOW_SETUP_WIZARD !== 'true') {
    return res.status(404).json({ status: 'fail', message: 'Not found' });
  }
  next();
});

router.get('/status', setupController.getStatus);
router.post('/test-connection', setupController.testConnection);
router.post('/install', setupController.install);

module.exports = router;
