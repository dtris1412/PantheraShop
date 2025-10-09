import { register as registerService } from "../services/authService.js";
import { createCart as createCartService } from "../services/cartService.js";

const register = async (req, res) => {
  try {
    console.log("📥 Request body:", req.body);

    const result = await registerService(
      req.body.user_name,
      req.body.user_email,
      req.body.user_password,
      req.body.user_phone,
      req.body.role_id,
      req.body.avatar
    );

    // ✅ chỉ tạo giỏ hàng nếu user được tạo thành công
    if (result.success && result.user) {
      console.log("✅ New user created:", result.user.user_id);
      await createCartService(result.user.user_id);
    }

    res.status(200).json(result);
  } catch (err) {
    console.error("❌ Error in create user:", err.message);
    console.error(err.stack);
    res.status(500).json({ mess: "Internal fetching user" });
  }
};

export { register };
