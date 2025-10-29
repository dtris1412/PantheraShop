import { uploadToCloudinary } from "../../shared/services/uploadService.js";

const uploadAvatarForUser = async (req, res) => {
  if (!req.file) {
    return res.status(400).json({ message: "No file uploaded" });
  }

  try {
    const avatar_url = await uploadToCloudinary(req.file.path, "avatars");

    // Trả về URL để frontend sử dụng
    res.json({
      success: true,
      avatar_url,
      message: "Avatar uploaded successfully",
    });
  } catch (err) {
    res.status(500).json({
      success: false,
      message: err.message,
    });
  }
};

export { uploadAvatarForUser };
