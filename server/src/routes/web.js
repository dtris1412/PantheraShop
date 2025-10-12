import express from "express";
import {
  getAllUsers,
  getUserById,
  getProfile,
  updateProfile,
  updatePassword,
} from "../controllers/userController.js";
import { register, login } from "../controllers/authController.js";
import multer from "multer";
import { uploadAvatar } from "../controllers/uploadController.js";
// import verifyToken nếu bạn đã có
import { verifyToken } from "../middlewares/authMiddleware.js";

const router = express.Router();
const upload = multer({ dest: "uploads/" });

const initWebRoutes = (app) => {
  // user APIs
  router.get("/api/users", getAllUsers);
  router.post("/api/register", register);
  router.post("/api/login", login);

  //get profile (protected route)
  router.get("/api/user/profile", verifyToken, getProfile);
  router.get("/api/user/:user_id", getUserById);
  //update profile (protected route)
  router.put("/api/user/profile", verifyToken, updateProfile);
  //updatepassword
  router.put("/api/user/password", verifyToken, updatePassword);
  router.post(
    "/api/user/avatar",
    verifyToken,
    upload.single("avatar"), // phải có dòng này!
    uploadAvatar
  );

  return app.use("/", router);
};

export default initWebRoutes;
