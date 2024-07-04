import User from "../models/user.js";
import jwt from "jsonwebtoken";
import { InternalServerError } from "../utils/errors.js";
import asyncHandler from "../utils/asyncHandler.js";
import ProfileDto from "../dto/profileDto.js";

export const getAllUsers = asyncHandler(async (req, res) => {
  try {
    const allUsers = await User.find()
      .select({ createdAt: false })
      .sort({ createdAt: -1 })
      .select({ password: false, __v: false });
    return res.status(200).send(allUsers);
  } catch (err) {
    throw new InternalServerError("Error fetching users");
  }
});

export const getProfile = asyncHandler(async (req, res) => {
  try {
    const { token } = req.cookies;
    const user = jwt.verify(token, process.env.JWT_SECRET);
    const userInfo = await User.findById(user.id).select({ __v: false });
    return res.status(200).send(new ProfileDto(userInfo));
  } catch (err) {
    throw new InternalServerError("Error fetching profile");
  }
});
