import {
  getAllUsers as getAllUsersService,
  getUserById as getUserByIdService,
  getProfile as getProfileService,
  updateProfile as updateProfileService,
  updatePassword as updatePasswordService,
  updateAvatar as updateAvatarService,
} from "../services/userService.js";

const getAllUsers = async (req, res) => {
  try {
    const users = await getAllUsersService();
    res.status(200).json(users);
  } catch (err) {
    console.error("Error in getAllUsers:", err);
    res.status(500).json({ mess: "Error fetching user" });
  }
};

const getUserById = async (req, res) => {
  try {
    const { user_id } = req.params;
    const user = await getUserByIdService(user_id);
    if (!user) {
      console.warn(`User not found with user_id: ${user_id}`);
      return res.status(404).json({ message: "User not found" });
    }
    res.status(200).json({ user });
  } catch (err) {
    console.error("Error in getUserById:", err);
    res.status(500).json({ message: "Internal server error" });
  }
};

const getProfile = async (req, res) => {
  try {
    const user_id = req.user?.user_id;
    if (!user_id) {
      console.warn(
        "Unauthorized access to getProfile: missing user_id in token"
      );
      return res.status(401).json({ message: "Unauthorized" });
    }

    const user = await getProfileService(user_id);
    if (!user) {
      console.warn(`User not found in getProfile with user_id: ${user_id}`);
      return res.status(404).json({ message: "User not found" });
    }

    res.json(user);
  } catch (error) {
    console.error("Error in getProfile:", error);
    res.status(500).json({ message: "Server error" });
  }
};

const updateProfile = async (req, res) => {
  try {
    const user_id = req.user?.user_id;
    if (!user_id) {
      console.warn(
        "Unauthorized access to updateProfile: missing user_id in token"
      );
      return res.status(401).json({ message: "Unauthorized" });
    }
    const { user_name, user_email, user_phone, user_address } = req.body;
    const result = await updateProfileService(user_id, {
      user_name,
      user_email,
      user_phone,
      user_address,
    });
    if (!result.success) {
      res.status(400).json(result);
    } else {
      res.json(result);
    }
  } catch (err) {
    console.error("Error in updateProfile: ", err);
    res.status(500).json({ message: "Server error" });
  }
};

const updatePassword = async (req, res) => {
  try {
    const user_id = req.user?.user_id;
    if (!user_id) {
      console.warn("Unauthorized access to updatePassword: missing user_id");
      return res.status(401).json({ message: "Unauthorized" });
    }
    const { current_password, new_password } = req.body;
    const result = await updatePasswordService(
      user_id,
      current_password,
      new_password
    );
    if (!result.success) {
      res.status(400).json(result);
    } else {
      res.json(result);
    }
  } catch (err) {
    console.error("Error in updatePassword: ", err);
    res.status(500).json({ message: "Server error" });
  }
};

// const updateAvatar = async (req, res) => {
//   try {
//     const user_id = req.user?.user_id;
//     if (!user_id) {
//       console.warn("Unauthorized access to updateAvatar: missing user_id");
//       return res.status(401).json({ message: "Unauthorized" });
//     }
//     const { avatar_url } = req.body;
//     const result = await updateAvatarService(user_id, avatar_url);
//     if (!result.success) {
//       res.status(400).json(result);
//     } else {
//       res.json(result);
//     }
//   } catch (err) {
//     console.error("Error in updateAvatar: ", err);
//     res.status(500).json({ message: "Server error" });
//   }
// };

export {
  getAllUsers,
  getUserById,
  getProfile,
  updateProfile,
  updatePassword,
  // updateAvatar,
};
