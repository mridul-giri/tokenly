import bcrypt from "bcrypt";

export const hashPassword = async (password: string) => {
  const saltRound = process.env.SALT_ROUNDS ?? 10;
  return await bcrypt.hash(password, saltRound);
};

export const verifyingPassword = async (
  password: string,
  hashedPassword: string,
) => {
  return await bcrypt.compare(password, hashedPassword);
};
