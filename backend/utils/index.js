import bcrypt from "bcrypt";
import fs from "fs";

const saltRounds = 10;

export const hashPassword = async (password) => {
  const salt = await bcrypt.genSalt(saltRounds);
  const hash = await bcrypt.hash(password, salt);
  return hash;
};

export const comparePassword = async (password, hashedPassword) => {
  return await bcrypt.compare(password, hashedPassword);
};

export const deleteFiles = (files) => {
  files.forEach((element) => {
    fs.unlink(element, (err) => {
      if (err) {
        console.error("Failed to delete temporary attachment files:", err);
      }
    });
  });
};
