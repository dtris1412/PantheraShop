import express from "express";
import { verifyAdmin } from "../../shared/middlewares/adminMiddleware.js";

// Import admin controllers here
// import { getAllProducts, createProduct, updateProduct, deleteProduct } from "../controllers/productController.js";
// import { getAllOrders, updateOrderStatus } from "../controllers/orderController.js";
// import { getAllUsers, updateUser, deleteUser } from "../controllers/userController.js";

const router = express.Router();

const initAdminRoutes = (app) => {
  // Product Management
  // router.get("/api/admin/products", verifyAdmin, getAllProducts);
  // router.post("/api/admin/products", verifyAdmin, createProduct);
  // router.put("/api/admin/products/:product_id", verifyAdmin, updateProduct);
  // router.delete("/api/admin/products/:product_id", verifyAdmin, deleteProduct);

  // Order Management
  // router.get("/api/admin/orders", verifyAdmin, getAllOrders);
  // router.put("/api/admin/orders/:order_id/status", verifyAdmin, updateOrderStatus);

  // User Management
  // router.get("/api/admin/users", verifyAdmin, getAllUsers);
  // router.put("/api/admin/users/:user_id", verifyAdmin, updateUser);
  // router.delete("/api/admin/users/:user_id", verifyAdmin, deleteUser);

  // Banner Management
  // router.get("/api/admin/banners", verifyAdmin, getAllBanners);
  // router.post("/api/admin/banners", verifyAdmin, createBanner);
  // router.put("/api/admin/banners/:banner_id", verifyAdmin, updateBanner);
  // router.delete("/api/admin/banners/:banner_id", verifyAdmin, deleteBanner);

  // Voucher Management
  // router.get("/api/admin/vouchers", verifyAdmin, getAllVouchers);
  // router.post("/api/admin/vouchers", verifyAdmin, createVoucher);
  // router.put("/api/admin/vouchers/:voucher_id", verifyAdmin, updateVoucher);
  // router.delete("/api/admin/vouchers/:voucher_id", verifyAdmin, deleteVoucher);

  // Blog Management
  // router.get("/api/admin/blogs", verifyAdmin, getAllBlogs);
  // router.post("/api/admin/blogs", verifyAdmin, createBlog);
  // router.put("/api/admin/blogs/:blog_id", verifyAdmin, updateBlog);
  // router.delete("/api/admin/blogs/:blog_id", verifyAdmin, deleteBlog);

  return app.use("/", router);
};

export default initAdminRoutes;
