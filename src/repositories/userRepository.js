import User from '../dao/models/User.js';
import UserDTO from '../dto/userDTO.js';

class UserRepository {
  async create(userData) {
    try {
      const user = new User(userData);
      await user.save();
      return new UserDTO(user);
    } catch (error) {
      throw error;
    }
  }

  async findByEmail(email) {
    try {
      const user = await User.findOne({ email }).populate('cart');
      return user;
    } catch (error) {
      throw error;
    }
  }

  async findById(id) {
    try {
      const user = await User.findById(id).populate('cart');
      return user ? new UserDTO(user) : null;
    } catch (error) {
      throw error;
    }
  }

  async update(id, userData) {
    try {
      const user = await User.findByIdAndUpdate(
        id, 
        userData, 
        { new: true, runValidators: true }
      );
      return user ? new UserDTO(user) : null;
    } catch (error) {
      throw error;
    }
  }

  async delete(id) {
    try {
      const user = await User.findByIdAndDelete(id);
      return user ? new UserDTO(user) : null;
    } catch (error) {
      throw error;
    }
  }

  async getAll() {
    try {
      const users = await User.find().populate('cart');
      return users.map(user => new UserDTO(user));
    } catch (error) {
      throw error;
    }
  }

  async updatePassword(id, newPassword) {
    try {
      const user = await User.findById(id);
      if (!user) return null;
      
      user.password = newPassword;
      await user.save();
      return new UserDTO(user);
    } catch (error) {
      throw error;
    }
  }
}

export default new UserRepository();