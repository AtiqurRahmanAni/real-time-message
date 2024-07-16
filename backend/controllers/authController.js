import jwt from "jsonwebtoken";
import User from "../models/user.js";
import { NotFoundError, BadRequestError } from "../utils/errors.js";
import asyncHandler from "../utils/asyncHandler.js";
import { hashPassword, comparePassword } from "../utils/index.js";
import LoginDto from "../dto/loginDto.js";
import { ChatEventEnum, ChatRoomEnum } from "../constants/index.js";

const lifetime = "36000000";

export const login = asyncHandler(async (req, res) => {
  const { username, password } = req.body;
  const user = await User.findOne({ username }).select({ __v: false });

  if (!user) {
    throw new NotFoundError("User not found");
  }

  const isPasswordMatched = await comparePassword(password, user.password);

  if (!isPasswordMatched) {
    throw new BadRequestError("Wrong password");
  }

  const token = jwt.sign(
    {
      id: user.id,
      username: user.username,
    },
    process.env.JWT_SECRET,
    { expiresIn: lifetime }
  );

  res.cookie("token", token, {
    maxAge: lifetime,
    httpOnly: true,
    secure: true,
    sameSite: "none",
    path: "/",
  });
  return res.status(200).send(new LoginDto(user));
});

export const logout = asyncHandler(async (req, res) => {
  res.clearCookie("token", {
    httpOnly: true,
    secure: true,
    sameSite: "none",
    path: "/",
  });
  return res.status(200).json({ message: "Logout successful" });
});

export const signup = asyncHandler(async (req, res) => {
  const { username, displayName, password } = req.body;

  const otherUser = await User.findOne({ username }).select({ username: true });
  if (otherUser) {
    throw new BadRequestError("Username already in use");
  }

  const hashedPassword = await hashPassword(password);

  const newUser = await User.create({
    username,
    displayName,
    password: hashedPassword,
  });

  req.app
    .get("io")
    .in(ChatRoomEnum.NEW_USER_ROOM)
    .emit(ChatEventEnum.NEW_USER_EVENT, null);

  return res.status(201).json({ message: "Signup successful" });
});
