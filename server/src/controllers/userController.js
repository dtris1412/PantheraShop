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
    console.error("Error in getAllUser", err);
    res.status(500).json({ mess: "Error fetching user" });
  }
};

const getUserById = async (req, res) => {
  try {
    const { user_id } = req.params;
    const user = await getUserByIdService(user_id);
    res.status(200).json({ user });
  } catch (err) {
    console.err("Error in get user by id");
    res.status(200).json({ mess: "Internal server error" });
  }
};

const getProfile = async (req, res) => {
  try {
    // ⚠️ lấy user_id từ token (req.user) hoặc query
    const user_id = req.user?.user_id || req.query.user_id;

    if (!user_id)
      return res.status(400).json({ message: "Missing user_id or token" });

    const user = await getProfileService(user_id);
    if (!user) return res.status(404).json({ message: "User not found" });

    res.status(200).json(user);
  } catch (err) {
    console.error("Error in getProfile:", err);
    res.status(500).json({ message: "Internal server error" });
  }
};
export { getAllUsers, getUserById, getProfile };
