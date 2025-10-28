import { getAllUsers as getAllUsersService } from "../../shared/services/userService.js";

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

export { getAllUsers };
