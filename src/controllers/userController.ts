import type { TokenlyConfig } from "../core/tokenly.js";
import { setNewToken } from "../redisCache.js";
import { generateToken } from "../utils/generateToken.js";
import { hashPassword, verifyingPassword } from "../utils/password.js";
import { validateEmailDomain } from "../utils/validateEmail.js";

export const signup = (config: TokenlyConfig) => async (req: any, res: any) => {
  try {
    const { userName, email, password, name } = req.body;
    const findUniqueUser = await config.adapter.findUserByEmail(email);
    if (findUniqueUser) {
      res.status(409).json("User already exists");
      return;
    }
    const validateEmail = await validateEmailDomain(email);
    if (!validateEmail) {
      res.status(400).json({ message: "Invalid email" });
      return;
    }
    const hashedPassword = await hashPassword(password);
    const data = { userName, email, name, password: hashedPassword };

    await config.adapter.createUser(data);

    res.status(201).json({ msg: "Account created successfully." });
    return;
  } catch (error) {
    console.log("error", error);
    res.status(500).json({ message: "Internal server error" });
  }
};

export const login = (config: TokenlyConfig) => async (req: any, res: any) => {
  try {
    const { email, password } = req.body;
    const findUser = await config.adapter.findUserByEmail(email);
    if (!findUser) {
      res.status(404).json({ message: "User not found" });
      return;
    }
    const isPasswordValid = await verifyingPassword(
      password,
      findUser.password,
    );
    if (!isPasswordValid) {
      res.status(401).json({ message: "Wrong password" });
    }
    const token = generateToken(findUser.id);
    await setNewToken(findUser.id, token);

    res.status(200).json({
      msg: `Login Successful, Token is valid for 7 days`,
      token,
    });
    return;
  } catch (error) {
    console.log("error", error);
    res.status(500).json({ message: "Internal server error" });
  }
};
