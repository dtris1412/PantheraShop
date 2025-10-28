import cloudinary from "../../shared/config/cloudinary.js";

/**
 * Upload file lên Cloudinary
 * @param {string} filePath - Đường dẫn file trên server (hoặc buffer nếu dùng multer)
 * @param {string} folder - Tên folder trên Cloudinary (ví dụ: 'avatars', 'products', 'posts')
 * @returns {Promise<string>} - Trả về URL ảnh đã upload
 */
const uploadToCloudinary = async function (filePath, folder = "uploads") {
  try {
    const result = await cloudinary.uploader.upload(filePath, {
      folder,
    });
    return result.secure_url;
  } catch (err) {
    throw new Error("Upload failed: " + err.message);
  }
};
export { uploadToCloudinary };
