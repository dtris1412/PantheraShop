import db from "../../shared/models/index.js";
import { Op } from "sequelize";
import jwt from "jsonwebtoken";
import bcrypt from "bcrypt";

const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const phoneRegex = /^\d{9,11}$/;
const passwordRegex = /^(?=.*[A-Z])(?=.*[a-z])(?=.*\d).{6,}$/;
const SALT_ROUDS = 10;

const register = async (
  user_name,
  user_email,
  user_password,
  user_phone,
  role_id,
  avatar,
  user_address,
  user_status
) => {
  // Kiểm tra dữ liệu bắt buộc
  if (!user_name || !user_email || !user_password) {
    return { success: false, message: "Please enter all required information" };
  }

  // Validate định dạng
  if (!emailRegex.test(user_email))
    return { success: false, message: "Email is incorrect format" };

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

  const hashedPassword = await bcrypt.hash(user_password, SALT_ROUDS);
  // Tạo user mới
  const newUser = await db.User.create({
    user_name,
    user_email,
    user_password: hashedPassword,
    user_phone,
    user_address: user_address || null,
    role_id: role_id || 2,
    avatar: avatar || null,
    user_status: user_status !== undefined ? user_status : true, // Default active
    created_at: new Date(),
  });

  const token = jwt.sign(
    { user_id: newUser.user_id, roles: newUser.role_id },
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

const login = async (user_email, user_password) => {
  console.log("loginService called with:", user_email, user_password); // <--- test
  console.log("loginService called with:", user_email);

  const user = await db.User.findOne({ where: { user_email } });
  if (!user) return null;

  // Check if user account is active
  if (!user.user_status) {
    return {
      success: false,
      message: "Account is deactivated. Please contact administrator.",
    };
  }

  console.log("User from DB:", user.user_email, user.user_password);

  // const isMatch = user_password === user.user_password;
  const isMatch = await bcrypt.compare(user_password, user.user_password);
  console.log("Password match?", isMatch);

  if (!isMatch) return null;

  const token = jwt.sign(
    { user_id: user.user_id, role_id: user.role_id },
    process.env.JWT_SECRET,
    { expiresIn: "1h" }
  );

  return {
    success: true,
    message: "Login successful",
    user: {
      user_id: user.user_id,
      user_email: user.user_email,
      user_name: user.user_name,
      role_id: user.role_id,
      user_status: user.user_status,
    },
    token,
  };
};

// Universal lock/unlock function for user_status (BOOLEAN)
const updateStatusUser = async (user_id, shouldLock) => {
  if (!user_id) {
    return { success: false, message: "Missing user_id" };
  }

  // Check if user exists
  const user = await db.User.findOne({ where: { user_id } });
  if (!user) {
    return { success: false, message: "User not found" };
  }

  // Prevent locking/unlocking admin users
  if (user.role_id === 0) {
    return { success: false, message: "Cannot change admin user status" };
  }

  // Determine new status (BOOLEAN)
  let newStatus;
  if (shouldLock !== undefined) {
    // shouldLock true = lock user (set user_status false)
    // shouldLock false = unlock user (set user_status true)
    newStatus = !shouldLock;
  } else {
    // If shouldLock not provided, toggle current status
    newStatus = !user.user_status;
  }

  // Ensure newStatus is boolean
  newStatus = Boolean(newStatus);

  await db.User.update({ user_status: newStatus }, { where: { user_id } });

  const updatedUser = await db.User.findOne({ where: { user_id } });

  const action = newStatus === true ? "mở khóa" : "khóa";
  return {
    success: true,
    message: `User "${user.user_name}" đã ${action} thành công`,
    user: updatedUser,
  };
};

export { register, login, updateStatusUser };
