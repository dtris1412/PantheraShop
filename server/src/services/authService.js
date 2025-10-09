import db from "../models/index.js";
import { Op } from "sequelize";

const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const phoneRegex = /^\d{9,11}$/;
const passwordRegex = /^(?=.*[A-Z])(?=.*[a-z])(?=.*\d).{6,}$/;

const register = async (
  user_name,
  user_email,
  user_password,
  user_phone,
  role_id,
  avatar
) => {
  // Kiểm tra dữ liệu bắt buộc
  if (!user_name || !user_email || !user_password || !user_phone) {
    return { success: false, message: "Please enter all required information" };
  }

  // Validate định dạng
  if (!emailRegex.test(user_email))
    return { success: false, message: "Email is incorrect format" };

  if (!phoneRegex.test(user_phone))
    return { success: false, message: "Phone number is incorrect format" };

  if (!passwordRegex.test(user_password))
    return {
      success: false,
      message: "Password must have upper, lower, number and 6+ chars",
    };

  // Kiểm tra tồn tại
  const existedUser = await db.User.findOne({
    where: {
      [Op.or]: [{ user_email }, { user_name }],
    },
  });

  if (existedUser)
    return { success: false, message: "Email or username already exists" };

  // Tạo user mới
  const newUser = await db.User.create({
    user_name,
    user_email,
    user_password, // có thể hash bcrypt
    user_phone,
    role_id: role_id || 2,
    avatar: avatar || null,
  });

  const token = jwt.sign(
    { user_id: newUser.user_id, roles: newUser.roles },
    process.env.JWT_SECRET,
    { expiresIn: "1h" }
  );

  return {
    success: true,
    message: "User created successfully",
    user: newUser,
    token,
  };
};

export { register };
