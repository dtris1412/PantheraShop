import express from "express";
import multer from "multer";
import { verifyAdmin } from "../../shared/middlewares/adminMiddleware.js";
import { uploadAvatarForUser } from "../../admin/controllers/uploadController.js";
// Import admin controllers here

const upload = multer({ dest: "uploads/" });
import {
  register as adminRegister,
  toggleUserStatus,
} from "../../admin/controllers/authController.js";
import {
  getAllUsers,
  updateProfile,
} from "../../admin/controllers/userController.js";
const router = express.Router();

const initAdminRoutes = (app) => {
  //Admin Registration
  router.post("/api/admin/register", verifyAdmin, adminRegister);
  //User Management
  router.get("/api/admin/users", verifyAdmin, getAllUsers);
  router.patch(
    "/api/admin/users/status/:user_id",
    verifyAdmin,
    toggleUserStatus
  );
  router.put("/api/admin/users/profile/:user_id", verifyAdmin, updateProfile);
  // Upload Avatar for User
  router.post(
    "/api/admin/upload-avatar",
    verifyAdmin,
    upload.single("avatar"),
    uploadAvatarForUser
  );
  //
  return app.use("/", router);
};

export default initAdminRoutes;
