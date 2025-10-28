import express from "express";
import { verifyToken } from "../../shared/middlewares/authMiddleware.js";

// Import admin controllers here
// import { getAllProducts, createProduct, updateProduct, deleteProduct } from "../controllers/productController.js";
// import { getAllOrders, updateOrderStatus } from "../controllers/orderController.js";
// import { getAllUsers, updateUser, deleteUser } from "../controllers/userController.js";

const router = express.Router();

const initAdminRoutes = (app) => {
  // Product Management
  // router.get("/api/admin/products", verifyToken, getAllProducts);
  // router.post("/api/admin/products", verifyToken, createProduct);
  // router.put("/api/admin/products/:product_id", verifyToken, updateProduct);
  // router.delete("/api/admin/products/:product_id", verifyToken, deleteProduct);

  // Order Management
  // router.get("/api/admin/orders", verifyToken, getAllOrders);
  // router.put("/api/admin/orders/:order_id/status", verifyToken, updateOrderStatus);

  // User Management
  // router.get("/api/admin/users", verifyToken, getAllUsers);
  // router.put("/api/admin/users/:user_id", verifyToken, updateUser);
  // router.delete("/api/admin/users/:user_id", verifyToken, deleteUser);

  // Banner Management
  // router.get("/api/admin/banners", verifyToken, getAllBanners);
  // router.post("/api/admin/banners", verifyToken, createBanner);
  // router.put("/api/admin/banners/:banner_id", verifyToken, updateBanner);
  // router.delete("/api/admin/banners/:banner_id", verifyToken, deleteBanner);

  // Voucher Management
  // router.get("/api/admin/vouchers", verifyToken, getAllVouchers);
  // router.post("/api/admin/vouchers", verifyToken, createVoucher);
  // router.put("/api/admin/vouchers/:voucher_id", verifyToken, updateVoucher);
  // router.delete("/api/admin/vouchers/:voucher_id", verifyToken, deleteVoucher);

  // Blog Management
  // router.get("/api/admin/blogs", verifyToken, getAllBlogs);
  // router.post("/api/admin/blogs", verifyToken, createBlog);
  // router.put("/api/admin/blogs/:blog_id", verifyToken, updateBlog);
  // router.delete("/api/admin/blogs/:blog_id", verifyToken, deleteBlog);

  return app.use("/", router);
};

export default initAdminRoutes;
