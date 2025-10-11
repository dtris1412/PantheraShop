import {
  getAllUsers as getAllUsersService,
  getUserById as getUserByIdService,
  getProfile as getProfileService,
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

export { getAllUsers, getUserById, getProfile };
