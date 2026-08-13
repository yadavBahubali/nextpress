const authService = require('./auth.service');
const asyncHandler = require('../../utils/asyncHandler');

class AuthController {
  cookieOptions = {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: process.env.NODE_ENV === 'production' ? 'none' : 'lax',
    path: '/'
  };

  register = asyncHandler(async (req, res) => {
    const { name, email, password, first_name, last_name, phone } = req.body;

    if (!name || !email || !password) {
      return res.status(400).json({
        success: false,
        message: 'Please provide name, email and password'
      });
    }

    const { user, accessToken, refreshToken } = await authService.register({ 
      name, 
      email, 
      password, 
      first_name, 
      last_name, 
      phone 
    });

    res.cookie('accessToken', accessToken, {
      ...this.cookieOptions,
      maxAge: 15 * 60 * 1000 // 15 minutes
    });

    res.cookie('refreshToken', refreshToken, {
      ...this.cookieOptions,
      maxAge: 7 * 24 * 60 * 60 * 1000 // 7 days
    });

    res.status(201).json({
      success: true,
      message: 'User registered successfully',
      user
    });
  });

  login = asyncHandler(async (req, res) => {
    const { email, password } = req.body;
    
    if (!email || !password) {
      return res.status(400).json({
        success: false,
        message: 'Please provide email and password'
      });
    }

    const { user, accessToken, refreshToken } = await authService.login(email, password);

    res.cookie('accessToken', accessToken, {
      ...this.cookieOptions,
      maxAge: 15 * 60 * 1000 // 15 minutes
    });

    res.cookie('refreshToken', refreshToken, {
      ...this.cookieOptions,
      maxAge: 7 * 24 * 60 * 60 * 1000 // 7 days
    });

    res.status(200).json({
      success: true,
      user
    });
  });

  refresh = asyncHandler(async (req, res) => {
    const refreshToken = req.cookies.refreshToken;

    if (!refreshToken) {
      return res.status(401).json({
        success: false,
        message: 'Refresh token is required'
      });
    }

    const tokens = await authService.refreshToken(refreshToken);

    res.cookie('accessToken', tokens.accessToken, {
      ...this.cookieOptions,
      maxAge: 15 * 60 * 1000 // 15 minutes
    });

    res.cookie('refreshToken', tokens.refreshToken, {
      ...this.cookieOptions,
      maxAge: 7 * 24 * 60 * 60 * 1000 // 7 days
    });

    res.status(200).json({
      success: true,
      message: 'Token refreshed successfully'
    });
  });

  me = asyncHandler(async (req, res) => {
    const user = await authService.getCurrentUser(req.user.id);
    
    res.status(200).json({
      success: true,
      user
    });
  });

  getUsers = asyncHandler(async (req, res) => {
    const users = await authService.getAllUsers();
    res.status(200).json({
      success: true,
      data: users
    });
  });

  logout = asyncHandler(async (req, res) => {
    res.clearCookie('accessToken', this.cookieOptions);
    res.clearCookie('refreshToken', this.cookieOptions);
    
    res.status(200).json({
      success: true,
      message: 'Logged out successfully'
    });
  });
}

module.exports = new AuthController();
