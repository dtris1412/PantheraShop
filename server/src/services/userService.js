import db from "../models/index.js";

const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const passwordRegex = /^(?=.*[A-Z])(?=.*[a-z])(?=.*\d).{6,}$/; // ít nhất 6 ký tự, gồm chữ hoa, chữ thường, số
const phoneRegex = /^(0|\+84)[0-9]{9,10}$/; // cho phép 0xxxx hoặc +84xxxx

const getAllUsers = async () => {
  return await db.User.findAll();
};

const getUserById = async (user_id) => {
  if (!user_id) return null;
  const user = await db.User.findOne({ where: { user_id } });
  if (!user) return;
  return user;
};

const getProfile = async (user_id) => {
  if (!user_id) return null;
  const user = await db.User.findOne({
    where: { user_id },
    attributes: ["user_id", "user_name", "user_email", "user_phone"], // chọn field cần trả
  });
  return user;
};

export { getAllUsers, getUserById, getProfile };
