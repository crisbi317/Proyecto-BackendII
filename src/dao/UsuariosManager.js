import User from '../dao/models/User.js';

class UsuariosManager {
  async getAll() {
    return await User.find();
  }

  async getById(id) {
    return await User.findById(id);
  }

  async create(user) {
    const newUser = new User(user);
    await newUser.save();
    return newUser;
  }

  async update(id, user) {
    await User.findByIdAndUpdate(id, user);
  }

  async delete(id) {
    await User.findByIdAndDelete(id);
  }
}

export default new UsuariosManager();
