import {
  getAllUsers as getAllUsersService,
  getUserById as getUserByIdService,
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

const createUser = async (req, res) => {
  try {
  } catch (err) {
    console.err("Error in create user", err);
    res.status(500).json("Internal server error");
  }
};

export { getAllUsers, getUserById };
