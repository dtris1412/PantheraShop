import express from "express";
import {
  getAllUsers,
  getUserById,
  getProfile,
} from "../controllers/userController.js";
import { register, login } from "../controllers/authController.js";
// import verifyToken nếu bạn đã có
import { verifyToken } from "../middlewares/authMiddleware.js";

const router = express.Router();

const initWebRoutes = (app) => {
  // user APIs
  router.get("/api/users", getAllUsers);
  router.post("/api/register", register);
  router.post("/api/login", login);

  //get profile (protected route)
  router.get("/api/user/profile", verifyToken, getProfile);
  router.get("/api/user/:user_id", getUserById);

  return app.use("/", router);
};

export default initWebRoutes;
