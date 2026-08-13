const profileRepository = require('./profile.repository');
const ApiError = require('../../utils/ApiError');

class ProfileService {
  async getProfile(userId) {
    const user = await profileRepository.findById(userId);
    if (!user) {
      throw new ApiError(404, 'User not found');
    }
    return user;
  }

  async updateProfile(userId, data) {
    // Basic validation
    if (data.email) {
       throw new ApiError(400, 'Email cannot be changed via profile update');
    }
    return await profileRepository.updateProfile(userId, data);
  }

  async getAddresses(userId) {
    return await profileRepository.getAddresses(userId);
  }

  async addAddress(userId, addressData) {
    if (!addressData.address_line1 || !addressData.city || !addressData.postal_code) {
      throw new ApiError(400, 'Required address fields are missing');
    }

    if (addressData.is_default) {
      await profileRepository.clearDefaultAddresses(userId, addressData.type || 'shipping');
    }

    return await profileRepository.addAddress(userId, addressData);
  }

  async updateAddress(userId, addressId, addressData) {
    if (addressData.is_default) {
      const address = await profileRepository.getAddresses(userId).then(list => list.find(a => a.id === parseInt(addressId)));
      if (address) {
        await profileRepository.clearDefaultAddresses(userId, addressData.type || address.type);
      }
    }
    return await profileRepository.updateAddress(userId, addressId, addressData);
  }

  async deleteAddress(userId, addressId) {
    return await profileRepository.deleteAddress(userId, addressId);
  }

  async setDefaultAddress(userId, addressId) {
    return await profileRepository.setDefaultAddress(userId, addressId);
  }
}

module.exports = new ProfileService();
