import {
  register as registerService,
  updateStatusUser,
} from "../../shared/services/authService.js";
import { createCart as createCartService } from "../../shared/services/cartService.js";
import { createWishlist as createWishlistService } from "../../shared/services/wishlistService.js";

const register = async (req, res) => {
  try {
    console.log("📥 Admin Register Request body:", req.body);
    const {
      user_name,
      user_email,
      user_password,
      user_phone,
      role_id,
      user_address,
      avatar,
    } = req.body;

    // Gọi registerService với đầy đủ tham số
    const result = await registerService(
      user_name,
      user_email,
      user_password,
      user_phone || null,
      role_id || 2, // Default là customer nếu không chỉ định
      avatar || null, // Pass avatar from request
      user_address || null
    );

    // Chỉ tạo cart và wishlist nếu user được tạo thành công
    if (result.success && result.user) {
      console.log("✅ New user created by admin:", result.user.user_id);

      try {
        await createCartService(result.user.user_id);
        await createWishlistService(result.user.user_id);
        console.log(
          "✅ Cart and wishlist created for user:",
          result.user.user_id
        );
      } catch (serviceError) {
        console.error(
          "⚠️ Failed to create cart/wishlist:",
          serviceError.message
        );
        // Không fail toàn bộ request nếu tạo cart/wishlist lỗi
      }
    }

    // Không trả về token cho admin-created users (bảo mật)
    const { token, ...responseData } = result;

    res.status(result.success ? 201 : 400).json({
      success: result.success,
      message: result.success
        ? "Tài khoản đã được tạo thành công"
        : result.message,
      user: result.success ? result.user : undefined,
    });
  } catch (err) {
    console.error("❌ Error in admin create user:", err.message);
    console.error(err.stack);
    res.status(500).json({
      success: false,
      message: "Lỗi server khi tạo tài khoản",
    });
  }
};

// Unified function for lock/unlock user
const toggleUserStatus = async (req, res) => {
  try {
    const user_id = req.params.user_id;
    const { shouldLock } = req.body; // true to lock, false to unlock, undefined to toggle

    const result = await updateStatusUser(user_id, shouldLock);

    if (!result.success) {
      return res.status(400).json(result);
    }

    res.status(200).json(result);
  } catch (err) {
    console.error("Error in updating user status: ", err);
    res.status(500).json({
      success: false,
      message: "Lỗi server khi cập nhật trạng thái người dùng",
    });
  }
};
export { register, toggleUserStatus };
