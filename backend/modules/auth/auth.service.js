const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const authRepository = require('./auth.repository');
const ApiError = require('../../utils/ApiError');

class AuthService {
  async register(userData) {
    const { name, email, password, first_name, last_name, phone } = userData;

    // Check if user already exists
    const existingUser = await authRepository.findByEmail(email);
    if (existingUser) {
      throw new ApiError(400, 'User with this email already exists');
    }

    // Hash password
    const hashedPassword = await bcrypt.hash(password, 10);

    // Create user
    const result = await authRepository.createUser({
      name,
      email,
      password: hashedPassword,
      first_name,
      last_name,
      phone
    });

    const user = await authRepository.findById(result.insert_id);
    
    // Generate tokens
    const tokens = this.generateTokens(user.id);
    
    // Save refresh token
    await authRepository.updateRefreshToken(user.id, tokens.refreshToken);

    return {
      user,
      ...tokens
    };
  }

  async login(email, password) {
    const user = await authRepository.findByEmail(email);
    
    if (!user) {
      throw new ApiError(401, 'Invalid email or password');
    }

    const isPasswordMatch = await bcrypt.compare(password, user.password_hash);
    if (!isPasswordMatch) {
      throw new ApiError(401, 'Invalid email or password');
    }

    // Generate tokens
    const tokens = this.generateTokens(user.id);
    
    // Save refresh token
    await authRepository.updateRefreshToken(user.id, tokens.refreshToken);

    return {
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
        role_id: user.role_id
      },
      ...tokens
    };
  }

  async refreshToken(refreshToken) {
    if (!refreshToken) {
      throw new ApiError(401, 'Refresh token is required');
    }

    try {
      // Verify refresh token
      const decoded = jwt.verify(refreshToken, process.env.JWT_REFRESH_SECRET);
      
      // Check if user exists and token matches
      const user = await authRepository.findById(decoded.id);
      const dbUser = await authRepository.findByRefreshToken(refreshToken);

      if (!user || !dbUser || dbUser.id !== user.id) {
        throw new ApiError(401, 'Invalid refresh token');
      }

      // Generate new tokens
      const tokens = this.generateTokens(user.id);
      
      // Update refresh token in DB
      await authRepository.updateRefreshToken(user.id, tokens.refreshToken);

      return tokens;
    } catch (err) {
      throw new ApiError(401, 'Invalid or expired refresh token');
    }
  }

  generateTokens(userId) {
    const accessToken = jwt.sign(
      { id: userId },
      process.env.JWT_SECRET,
      { expiresIn: process.env.JWT_EXPIRES_IN || '15m' }
    );

    const refreshToken = jwt.sign(
      { id: userId },
      process.env.JWT_REFRESH_SECRET,
      { expiresIn: process.env.JWT_REFRESH_EXPIRES_IN || '7d' }
    );

    return { accessToken, refreshToken };
  }

  async getCurrentUser(userId) {
    const user = await authRepository.findById(userId);
    if (!user) {
      throw new ApiError(404, 'User not found');
    }
    return user;
  }

  async getAllUsers() {
    return await authRepository.getAllUsers();
  }
}

module.exports = new AuthService();
