import {
  getAllUsers as getAllUsersService,
  updateProfile as updateProfileService,
} from "../../shared/services/userService.js";

const getAllUsers = async (req, res) => {
  try {
    const result = await getAllUsersService();
    if (!result.success) {
      return res.status(400).json({ message: result.message });
    }
    res.status(200).json(result);
  } catch (err) {
    console.error("Error in getAllUsers: ", err);
    res.status(500).json({ message: "Server error" });
  }
};

const updateProfile = async (req, res) => {
  try {
    // Get user_id from URL params instead of token
    const { user_id } = req.params;

    if (!user_id) {
      return res.status(400).json({
        success: false,
        message: "Missing user_id parameter",
      });
    }

    const { user_name, user_email, user_phone, user_address, role_id, avatar } =
      req.body;

    const result = await updateProfileService(user_id, {
      user_name,
      user_email,
      user_phone,
      user_address,
      role_id,
      avatar,
    });

    if (!result.success) {
      res.status(400).json(result);
    } else {
      res.json(result);
    }
  } catch (err) {
    console.error("Error in updateProfile: ", err);
    res.status(500).json({
      success: false,
      message: "Server error",
    });
  }
};

export { getAllUsers, updateProfile };
