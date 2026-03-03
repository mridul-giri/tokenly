import type { AuthAdapter } from "../interfaces/adapter.js";

export const mongoDBAdaptet = (userModel: any): AuthAdapter => ({
  createUser: async (data) => {
    return await userModel.create(data);
  },
  findUserByEmail: async (email) => {
    return await userModel.findOne({ email });
  },
  findUserById: async (userId) => {
    return await userModel.findById({ _id: userId });
  },
  updatePassword: async (userId, newPassword) => {
    return await userModel.findByIdAndUpdate(
      { _id: userId },
      { password: newPassword },
    );
  },
  deleteUser: async (userId) => {
    return await userModel.findByIdAndDelete({ _id: userId });
  },
});
