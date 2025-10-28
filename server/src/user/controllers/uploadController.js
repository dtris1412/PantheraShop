import { uploadToCloudinary } from "../../shared/services/uploadService.js";
import { updateAvatar } from "../../shared/services/userService.js";

const uploadAvatar = async (req, res) => {
  if (!req.file) {
    return res.status(400).json({ message: "No file uploaded" });
  }

  try {
    const avatar_url = await uploadToCloudinary(req.file.path, "avatars");
    const user_id = req.user?.user_id;
    if (!user_id) return res.status(401).json({ message: "Unauthorized" });

    const updatedUser = await updateAvatar(user_id, avatar_url);

    res.json({ avatar_url, user: updatedUser });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

export { uploadAvatar };
