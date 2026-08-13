const setupService = require('./setup.service');
const asyncHandler = require('../../utils/asyncHandler');
const ApiError = require('../../utils/ApiError');

exports.getStatus = asyncHandler(async (req, res) => {
  const status = await setupService.getStatus();
  res.status(200).json({
    status: 'success',
    data: status
  });
});

exports.testConnection = asyncHandler(async (req, res) => {
  const { db_host, db_user, db_password, db_name } = req.body;
  
  if (!db_host || !db_user || !db_name) {
    throw new ApiError(400, 'Please provide all database credentials');
  }

  const result = await setupService.testConnection({ db_host, db_user, db_password, db_name });
  
  if (result.ok) {
    res.status(200).json({
      status: 'success',
      message: 'Database connection successful'
    });
  } else {
    res.status(400).json({
      status: 'fail',
      message: result.message
    });
  }
});

exports.install = asyncHandler(async (req, res) => {
  const status = await setupService.getStatus();
  
  if (status.isInstalled) {
    throw new ApiError(400, 'Application is already installed');
  }

  const { db_config, admin_data, site_data } = req.body;

  if (!db_config || !admin_data || !site_data) {
    throw new ApiError(400, 'Please provide database config, admin data, and site data');
  }

  await setupService.install(db_config, admin_data, site_data);

  res.status(200).json({
    status: 'success',
    message: 'Installation completed successfully. Please restart the server.'
  });
});
