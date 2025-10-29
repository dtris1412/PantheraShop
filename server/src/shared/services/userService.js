import db from "../../shared/models/index.js";
import bcrypt from "bcrypt";

const SALT_ROUNDS = 10;
const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const passwordRegex = /^(?=.*[A-Z])(?=.*[a-z])(?=.*\d).{6,}$/; // ít nhất 6 ký tự, gồm chữ hoa, chữ thường, số
const phoneRegex = /^(0|\+84)[0-9]{9,10}$/; // cho phép 0xxxx hoặc +84xxxx

const getAllUsers = async () => {
  const users = await db.User.findAll();
  if (!users) return { success: false, message: "No users found" };
  return { success: true, data: users };
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
    attributes: [
      "user_id",
      "user_name",
      "user_email",
      "user_phone",
      "user_address",
      "avatar",
    ], // chọn field cần trả
  });
  return user;
};

const updateProfile = async (
  user_id,
  { user_name, user_email, user_phone, user_address, role_id, avatar }
) => {
  if (!user_id) return { success: false, message: "Missing user_id" };

  if (user_phone && !phoneRegex.test(user_phone)) {
    return { success: false, message: "Phone number is incorrect format" };
  }

  const user = await db.User.findOne({ where: { user_id } });
  if (!user) return { success: false, message: "User not found" };

  const updateData = {
    user_name,
    user_email,
    user_phone,
    user_address,
  };

  // Only update role_id if provided and valid
  if (role_id !== undefined && [0, 1, 2].includes(role_id)) {
    updateData.role_id = role_id;
  }

  // Only update avatar if provided
  if (avatar) {
    updateData.avatar = avatar;
  }

  await db.User.update(updateData, {
    where: { user_id },
  });

  const updatedUser = await db.User.findOne({ where: { user_id } });

  return {
    success: true,
    message: "Profile updated successfully",
    user: updatedUser,
  };
};

const updatePassword = async (user_id, current_password, new_password) => {
  if (!user_id || !current_password || !new_password) {
    return { success: false, message: "Please enter all required information" };
  }
  if (!passwordRegex.test(new_password)) {
    return {
      success: false,
      message: "Password must have uppper, lower, number and 6+ chars",
    };
  }
  const user = await db.User.findOne({ where: { user_id } });
  if (!user) return { success: false, message: "User not found" };
  const isMatch = await bcrypt.compare(current_password, user.user_password);
  if (!isMatch) return { success: false, message: "Old password is incorrect" };

  const hashedPassword = await bcrypt.hash(new_password, SALT_ROUNDS);
  await db.User.update(
    {
      user_password: hashedPassword,
    },
    { where: { user_id } }
  );
  // const updatedUser = await db.User.findOne({ where: { user_id } });
  return {
    success: true,
    message: "Password updated successfully",
  };
};

const updateAvatar = async (user_id, avatar_url) => {
  if (!user_id) {
    return { success: false, message: "Missing user_id" };
  }
  await db.User.update(
    {
      avatar: avatar_url,
    },
    { where: { user_id } }
  );
  const updatedUser = await db.User.findOne({ where: { user_id } });
  return {
    success: true,
    message: "Avatar updated successfully",
    user: updatedUser,
  };
};

const getNameById = async (user_id) => {
  if (!user_id) return null;
  const user = await db.User.findOne({ where: { user_id } });
  if (!user) return;
  return user.user_name;
};
export {
  getAllUsers,
  getUserById,
  getProfile,
  updateProfile,
  updatePassword,
  updateAvatar,
  getNameById,
};
