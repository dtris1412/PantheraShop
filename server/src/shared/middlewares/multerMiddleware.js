import multer from "multer";
import { uploadAvatar } from "../controllers/uploadController.js";

const upload = multer({ dest: "uploads/" }); // hoặc cấu hình riêng

router.post(
  "/api/user/avatar",
  verifyToken,
  upload.single("avatar"), // "avatar" phải trùng với tên field ở client
  uploadAvatar
);
