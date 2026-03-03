import jwt from "jsonwebtoken";

export interface JwtPayload {
  sub: string;
}

export const generateToken = (userId: string) => {
  const jwtTTL = 7 * 24 * 60 * 60;
  const secret = process.env.JWT_SECRET!;

  const payload: JwtPayload = {
    sub: userId,
  };

  return jwt.sign(payload, secret, { expiresIn: jwtTTL });
};
