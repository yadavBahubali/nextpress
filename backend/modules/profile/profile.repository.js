const db = require('../../config/db');

class ProfileRepository {
  async findById(userId) {
    return await db.select('users', 'id, name, first_name, last_name, email, phone, role_id', `id = ?`, [userId]);
  }

  async updateProfile(userId, data) {
    const { first_name, last_name, phone, name } = data;
    const updateData = {};
    if (first_name !== undefined) updateData.first_name = first_name;
    if (last_name !== undefined) updateData.last_name = last_name;
    if (phone !== undefined) updateData.phone = phone;
    if (name !== undefined) updateData.name = name;

    if (Object.keys(updateData).length === 0) return { status: true };

    return await db.update('users', updateData, `id = ?`, [userId]);
  }

  async getAddresses(userId) {
    return await db.selectAll('user_addresses', '*', `user_id = ?`, 'ORDER BY is_default DESC, created_at DESC', [userId]);
  }

  async addAddress(userId, addressData) {
    const data = {
      user_id: userId,
      type: addressData.type || 'shipping',
      address_line1: addressData.address_line1,
      address_line2: addressData.address_line2 || null,
      city: addressData.city,
      state: addressData.state,
      postal_code: addressData.postal_code,
      country: addressData.country || 'India',
      is_default: addressData.is_default ? 1 : 0
    };

    return await db.insert('user_addresses', data);
  }

  async updateAddress(userId, addressId, addressData) {
    const fields = [
      'type', 'address_line1', 'address_line2', 'city', 'state', 'postal_code', 'country', 'is_default'
    ];
    const updateData = {};
    fields.forEach(field => {
      if (addressData[field] !== undefined) {
        updateData[field] = field === 'is_default' ? (addressData[field] ? 1 : 0) : addressData[field];
      }
    });

    if (Object.keys(updateData).length === 0) return { status: true };

    return await db.update('user_addresses', updateData, `id = ? AND user_id = ?`, [addressId, userId]);
  }

  async deleteAddress(userId, addressId) {
    return await db.delete('user_addresses', `id = ? AND user_id = ?`, [addressId, userId]);
  }

  async clearDefaultAddresses(userId, type) {
    // If type is 'both', clear all. If specific, clear that type.
    if (type === 'both') {
      return await db.update('user_addresses', { is_default: 0 }, `user_id = ?`, [userId]);
    }
    return await db.update(
      'user_addresses',
      { is_default: 0 },
      `user_id = ? AND (type = ? OR type = 'both')`,
      [userId, type]
    );
  }

  async setDefaultAddress(userId, addressId) {
    // First clear defaults
    const address = await db.select('user_addresses', 'type', `id = ?`, [addressId]);
    if (!address) return { status: false };

    await this.clearDefaultAddresses(userId, address.type);
    return await db.update('user_addresses', { is_default: 1 }, `id = ? AND user_id = ?`, [addressId, userId]);
  }
}

module.exports = new ProfileRepository();
