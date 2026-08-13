const usersRepository = require('./users.repository');
const ApiError = require('../../utils/ApiError');
const bcrypt = require('bcrypt');

class UsersService {
  async getAllUsers() {
    return await usersRepository.getAll();
  }

  async getUserById(id) {
    const user = await usersRepository.findById(id);
    if (!user) throw new ApiError(404, 'User not found');
    return user;
  }

  async createUser(data, actor = null) {
    const { password, role, ...rest } = data;

    const requestedRoleId = parseInt(role) || 2;
    if (requestedRoleId === 1 && (!actor || actor.role_id !== 1)) {
      throw new ApiError(403, 'Only a Super Admin can create another Super Admin');
    }

    const insertData = {
      ...rest,
      password_hash: await bcrypt.hash(password || 'NextPress123!', 10),
      role_id: requestedRoleId
    };

    const { insertId } = await usersRepository.create(insertData);
    return await this.getUserById(insertId);
  }

  async updateUser(id, data, actor = null) {
    await this.getUserById(id);

    const { password, role, ...updateData } = data;

    if (password) {
      updateData.password_hash = await bcrypt.hash(password, 10);
    }

    if (role) {
      const newRoleId = parseInt(role);

      // Only a Super Admin (role_id 1) may grant Super Admin. This stops an
      // Admin (role_id 2) - or anyone who reaches this route - from
      // escalating themselves or another account to the top role.
      if (newRoleId === 1 && (!actor || actor.role_id !== 1)) {
        throw new ApiError(403, 'Only a Super Admin can grant the Super Admin role');
      }

      updateData.role_id = newRoleId;
    }

    await usersRepository.update(id, updateData);
    return await this.getUserById(id);
  }

  async deleteUser(id) {
    // Protect Super Admin (ID 1)
    if (parseInt(id) === 1) {
      throw new ApiError(403, 'The Super-Admin account cannot be deleted.');
    }
    
    await this.getUserById(id);
    return await usersRepository.delete(id);
  }
}

module.exports = new UsersService();
