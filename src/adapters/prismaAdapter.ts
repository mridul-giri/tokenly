import type { AuthAdapter } from "../interfaces/adapter.js";

export const prismaAdapter = (prisma: any): AuthAdapter => ({
  createUser: async (data) => {
    return await prisma.user.create({ data });
  },
  findUserByEmail: async (email) => {
    return await prisma.user.findFirst({ where: { email } });
  },
});
