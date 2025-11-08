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

const uploadProductImage = async (req, res) => {
  if (!req.file) {
    return res.status(400).json({ message: "No file uploaded" });
  }

  try {
    const imageUrl = await uploadToCloudinary(req.file.path, "products");

    // Trả về URL để frontend sử dụng
    res.json({
      success: true,
      imageUrl,
      message: "Product image uploaded successfully",
    });
  } catch (err) {
    res.status(500).json({
      success: false,
      message: err.message,
    });
  }
};

const uploadGalleryImage = async (req, res) => {
  if (!req.file) {
    return res.status(400).json({ message: "No file uploaded" });
  }
  try {
    const imageUrl = await uploadToCloudinary(req.file.path, "galleries");
    res.json({
      success: true,
      imageUrl,
      message: "Gallery image uploaded successfully",
    });
  } catch (err) {
    res.status(500).json({
      success: false,
      message: err.message,
    });
  }
};

const uploadExcelImages = async (req, res) => {
  try {
    const files = req.files;
    if (!files || files.length === 0) {
      return res
        .status(400)
        .json({ success: false, message: "No images uploaded" });
    }

    // Upload tất cả ảnh lên Cloudinary
    const uploadPromises = files.map(async (file) => {
      const imageUrl = await uploadToCloudinary(file.path, "products");
      return {
        filename: file.originalname,
        url: imageUrl,
      };
    });

    const images = await Promise.all(uploadPromises);

    res.json({
      success: true,
      images,
      message: "Images uploaded successfully",
    });
  } catch (err) {
    console.error("Error uploading excel images:", err);
    res.status(500).json({
      success: false,
      message: err.message,
    });
  }
};

export {
  uploadAvatarForUser,
  uploadProductImage,
  uploadGalleryImage,
  uploadExcelImages,
};
