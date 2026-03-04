import type { Request, Response } from "express";
import type { TokenlyConfig } from "../core/tokenly.js";
import { deleteToken, setNewToken } from "../redisService.js";
import { generateToken } from "../utils/generateToken.js";
import { hashPassword, verifyingPassword } from "../utils/password.js";
import { validateEmailDomain } from "../utils/validateEmail.js";
import type { AuthenticatedRequest } from "../middleware/authentication.js";

export const me =
  (config: TokenlyConfig) =>
  async (req: AuthenticatedRequest, res: Response) => {
    try {
      const user = req.user;
      if (!user) {
        res.status(404).json({ message: "User not found" });
        return;
      }
      res.status(200).json({
        user: {
          id: user.id,
          userName: user.userName,
          name: user.name,
          email: user.email,
        },
      });
      return;
    } catch (error) {
      res.status(500).json({ message: "Internal server error" });
    }
  };

export const signup =
  (config: TokenlyConfig) => async (req: Request, res: Response) => {
    try {
      const { userName, email, password, name } = req.body;
      if (!userName || !email || !password || !name) {
        res.status(401).json({ message: "Body can not be empty" });
        return;
      }
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
      res.status(201).json({ message: "Account created successfully." });
      return;
    } catch (error) {
      res.status(500).json({ message: "Internal server error" });
    }
  };

export const login =
  (config: TokenlyConfig) => async (req: Request, res: Response) => {
    try {
      const { email, password } = req.body;
      if (!email || !password) {
        res.status(401).json({ message: "Email or Password can not be empty" });
        return;
      }
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
      await setNewToken(findUser.id, token, config.redis);
      res.status(200).json({
        message: "Login Successful, Token is valid for 7 days",
        token,
        user: {
          id: findUser.id,
          email: findUser.email,
          userName: findUser.userName,
          name: findUser.name,
        },
      });
      return;
    } catch (error) {
      res.status(500).json({ message: "Internal server error" });
    }
  };

export const changePassword =
  (config: TokenlyConfig) =>
  async (req: AuthenticatedRequest, res: Response) => {
    try {
      const { oldPassword, newPassword } = req.body;
      if (!oldPassword || !newPassword) {
        res
          .status(401)
          .json({ message: "Old Password or New Password can not be empty" });
        return;
      }
      const user = req.user;
      if (!user) {
        res.status(404).json({ message: "User not found" });
        return;
      }
      const isPasswordValid = await verifyingPassword(
        oldPassword,
        user?.password,
      );
      if (!isPasswordValid) {
        res.status(401).json({ message: "Wrong old password" });
      }
      const hashedPassword = await hashPassword(newPassword);
      await config.adapter.updatePassword(user.id, hashedPassword);
      res.status(200).json({ message: "password changed" });
      return;
    } catch (error) {
      res.status(500).json({ message: "Internal server error" });
    }
  };

export const logout =
  (config: TokenlyConfig) =>
  async (req: AuthenticatedRequest, res: Response) => {
    try {
      const user = req.user;
      if (!user) {
        res.status(404).json({ message: "User not found" });
        return;
      }
      await deleteToken(user.id, config.redis);
      res.status(200).json({ message: "Token deleted successfully" });
      return;
    } catch (error) {
      res.status(500).json({ message: "Internal server error" });
    }
  };

export const deleteUser =
  (config: TokenlyConfig) =>
  async (req: AuthenticatedRequest, res: Response) => {
    try {
      const { password } = req.body;
      if (!password) {
        res.status(401).json({ message: "Password can not be empty" });
        return;
      }
      const user = req.user;
      if (!user) {
        res.status(404).json({ message: "User not found" });
        return;
      }
      const isPasswordValid = await verifyingPassword(password, user?.password);
      if (!isPasswordValid) {
        res.status(401).json({ message: "Wrong password" });
      }
      await deleteToken(user.id, config.redis);
      await config.adapter.deleteUser(user.id);
      res.status(200).json({ message: "User deleted successfully" });
      return;
    } catch (error) {
      res.status(500).json({ message: "Internal server error" });
    }
  };
