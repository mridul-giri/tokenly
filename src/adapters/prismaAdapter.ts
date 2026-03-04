import type { AuthAdapter } from "../interfaces/adapter.js";

export const prismaAdapter = (prisma: any): AuthAdapter => ({
  createUser: async (data) => {
    return await prisma.user.create({ data });
  },
  findUserByEmail: async (email) => {
    return await prisma.user.findFirst({ where: { email } });
  },
  findUserById: async (userId) => {
    return await prisma.user.findFirst({ where: { id: userId } });
  },
  updatePassword: async (userId, newPassword) => {
    return await prisma.user.update({
      where: { id: userId },
      data: { password: newPassword },
    });
  },
  deleteUser: async (userId) => {
    return await prisma.user.delete({ where: { id: userId } });
  },
});
