import {
  register as registerService,
  login as loginService,
} from "../services/authService.js";
import { createCart as createCartService } from "../services/cartService.js";

const register = async (req, res) => {
  try {
    console.log("📥 Request body:", req.body);
    const { user_name, user_email, user_password } = req.body;
    const result = await registerService(user_name, user_email, user_password);

    // chỉ tạo giỏ hàng nếu user được tạo thành công
    if (result.success && result.user) {
      console.log("✅ New user created:", result.user.user_id);
      await createCartService(result.user.user_id);
    }

    res.status(200).json(result);
  } catch (err) {
    console.error("❌ Error in create user:", err.message);
    console.error(err.stack);
    res.status(500).json({ success: false, message: "Internal server error" });
  }
};

const login = async (req, res) => {
  try {
    console.log("📥 req.body:", req.body);
    const { user_email, user_password } = req.body;
    const result = await loginService(user_email, user_password);
    if (!result)
      return res.status(400).json({ mess: "Invalid email or password" });
    res.status(200).json(result);
  } catch (err) {
    console.log("Error in login", err);
    res.status(500).json({ success: false, message: "Internal server error" });
  }
};
export { register, login };
