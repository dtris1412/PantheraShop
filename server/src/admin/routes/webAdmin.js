import express from "express";
import multer from "multer";
import { verifyAdmin } from "../../shared/middlewares/adminMiddleware.js";
import {
  uploadAvatarForUser,
  uploadProductImage,
  uploadGalleryImage,
  uploadExcelImages,
  uploadBlogImage,
} from "../../admin/controllers/uploadController.js";

const upload = multer({ dest: "uploads/" });

//Import Dashboard Controllers
import {
  getDashboardStats,
  getUserStatsByMonth,
  getOrderStatsByMonth,
  getProductStatsByMonth,
  getRevenueStatsByMonth,
  getMonthlySales,
  getRecentOrders,
} from "../../admin/controllers/dashboardController.js";

//Import Payment Controllers
import { getMethodByOrderId } from "../../admin/controllers/paymentController.js";
//Import Blog Controllers
import {
  getAllBlogs,
  getBlogsPaginated,
  createBlog,
  updateBlog,
  deleteBlog,
  getBlogById,
} from "../../admin/controllers/blogController.js";

//Import Report Controllers
import {
  createReport,
  getAllReports,
  getReportById,
  getReportsPaginated,
  deleteReport,
  exportReportToExcel,
} from "../../admin/controllers/reportController.js";

//Import voucher Controllers
import {
  createVoucher,
  updateVoucher,
  getAllVouchers,
  getVouchersPaginated,
} from "../../admin/controllers/voucherController.js";

//Import order Controllers

import {
  getAllOrders,
  getStatusOrder,
  getOrderHistoryByUserId,
  getOrdersPaginated,
  approveOrder,
} from "../../admin/controllers/orderController.js";

//Import supplier Controllers
import {
  getAllSuppliers,
  getSuppliersPaginated,
  createSupplier,
  updateSupplier,
  // cancelTerminalConnection,
  setSupplierConnectionStatus,
} from "../../admin/controllers/supplierController.js";

//Import inventory Controllers
import {
  getAllInventories,
  getInventoryPaginated,
  createVariantInventory,
  getVariantsByIdInventory,
  updateVariantInventory,
} from "../../admin/controllers/inventoryController.js";

import {
  getAllProducts,
  getProductById,
  createProduct,
  updateProduct,
  deleteProduct,
  setProductLockStatus,
  downloadExcelTemplate,
  importProductsFromExcel,
  importProductsWithVariants,
  importInventoryStock,
  getProductsPaginated,
} from "../../admin/controllers/productController.js";
import {
  register as adminRegister,
  toggleUserStatus,
} from "../../admin/controllers/authController.js";
import {
  getAllUsers,
  updateProfile,
  getUsersPaginated,
} from "../../admin/controllers/userController.js";

//import variant controllers
import {
  createVariant,
  getVariantsById,
  updateVariant,
  deleteVariant,
} from "../../admin/controllers/variantController.js";

// Import category controllers
import {
  // Category routes
  getAllCategories,
  getCategoryById,
  getCategoriesPaginated,
  createCategory,
  updateCategory,
  deleteCategory,

  // Sport routes
  getAllSports,
  getSportById,
  getSportsPaginated,
  createSport,
  updateSport,
  deleteSport,

  // Tournament routes
  getAllTournaments,
  getTournamentById,
  getTournamentsBySport,
  getTournamentsPaginated,
  createTournament,
  updateTournament,
  deleteTournament,

  // Team routes
  getAllTeams,
  getTeamById,
  getTeamsByTournament,
  getTeamsPaginated,
  createTeam,
  updateTeam,
  deleteTeam,
} from "../controllers/categoryController.js";

//Import gallery controllers
import {
  getAllProductImages,
  getProductImageById,
  getProductImagesPaginated,
  createProductImage,
  updateProductImage,
  deleteProductImage,
} from "../controllers/product_imageController.js";
const router = express.Router();

const initAdminRoutes = (app) => {
  //Admin Registration
  router.post("/api/admin/register", verifyAdmin, adminRegister);

  //User Management
  router.get("/api/admin/users/paginated", verifyAdmin, getUsersPaginated);
  router.get("/api/admin/users", verifyAdmin, getAllUsers);
  router.patch(
    "/api/admin/users/status/:user_id",
    verifyAdmin,
    toggleUserStatus
  );
  router.put("/api/admin/users/profile/:user_id", verifyAdmin, updateProfile);

  // Upload Avatar for User
  router.post(
    "/api/admin/upload-avatar",
    verifyAdmin,
    upload.single("avatar"),
    uploadAvatarForUser
  );

  // Upload Product Image
  router.post(
    "/api/admin/upload-product-image",
    verifyAdmin,
    upload.single("image"),
    uploadProductImage
  );

  // Upload Gallery Image (cho product gallery)
  router.post(
    "/api/admin/upload-gallery-image",
    verifyAdmin,
    upload.single("image"),
    uploadGalleryImage
  );

  // Upload Excel Images (bulk upload cho Excel import)
  router.post(
    "/api/admin/products/upload-excel-images",
    verifyAdmin,
    upload.array("images", 50),
    uploadExcelImages
  );

  //Product Management
  router.get(
    "/api/admin/products/paginated",
    verifyAdmin,
    getProductsPaginated
  );
  router.get("/api/admin/products", verifyAdmin, getAllProducts);
  router.get("/api/admin/products/:id", verifyAdmin, getProductById);
  router.post("/api/admin/products", verifyAdmin, createProduct);
  router.put("/api/admin/products/:id", verifyAdmin, updateProduct);
  router.delete("/api/admin/products/:id", verifyAdmin, deleteProduct);
  router.put("/api/admin/products/:id/lock", verifyAdmin, setProductLockStatus);

  // Excel Import Routes
  router.post(
    "/api/admin/products/excel/template",
    verifyAdmin,
    downloadExcelTemplate
  );
  router.post(
    "/api/admin/products/excel/import",
    verifyAdmin,
    upload.fields([
      { name: "excel", maxCount: 1 },
      { name: "images", maxCount: 50 },
    ]),
    importProductsFromExcel
  );

  // Import Products with Variants (không cập nhật stock)
  router.post(
    "/api/admin/products/excel/import-with-variants",
    verifyAdmin,
    upload.fields([
      { name: "excel", maxCount: 1 },
      { name: "images", maxCount: 50 },
    ]),
    importProductsWithVariants
  );

  // Import Inventory Stock (chỉ cập nhật stock cho variant có sẵn)
  router.post(
    "/api/admin/inventory/excel/import-stock",
    verifyAdmin,
    upload.single("excel"),
    importInventoryStock
  );

  // =============== VARIANT MANAGEMENT ROUTES ===============

  router.get("/api/admin/variants/:id", verifyAdmin, getVariantsById);
  router.post("/api/admin/variants", verifyAdmin, createVariant);
  router.put("/api/admin/variants/:id", verifyAdmin, updateVariant);
  router.delete("/api/admin/variants/:id", verifyAdmin, deleteVariant);

  // =============== INVENTORY MANAGEMENT ROUTES ===============
  router.get(
    "/api/admin/inventory/paginated",
    verifyAdmin,
    getInventoryPaginated
  );
  router.get("/api/admin/inventory", verifyAdmin, getAllInventories);
  router.get("/api/admin/inventory/:id", verifyAdmin, getVariantsByIdInventory);
  router.post("/api/admin/inventory", verifyAdmin, createVariantInventory);
  router.put("/api/admin/inventory/:id", verifyAdmin, updateVariantInventory);

  // =============== SUPPLIER MANAGEMENT ROUTES ===============
  router.get(
    "/api/admin/suppliers/paginated",
    verifyAdmin,
    getSuppliersPaginated
  );
  router.get("/api/admin/suppliers", verifyAdmin, getAllSuppliers);
  router.post("/api/admin/suppliers", verifyAdmin, createSupplier);
  router.put("/api/admin/suppliers/:supplier_id", verifyAdmin, updateSupplier);
  // router.patch(
  //   "/api/admin/suppliers/:supplier_id/cancel-connection",
  //   verifyAdmin,
  //   cancelTerminalConnection
  // );
  router.patch(
    "/api/admin/suppliers/:supplier_id/connection-status",
    verifyAdmin,
    setSupplierConnectionStatus
  );
  // =============== PRODUCT IMAGES ROUTES ===============
  router.get(
    "/api/admin/product-images/paginated",
    verifyAdmin,
    getProductImagesPaginated
  );
  router.get("/api/admin/product-images", verifyAdmin, getAllProductImages);
  router.get(
    "/api/admin/product-images/:product_id",
    verifyAdmin,
    getProductImageById
  );
  router.post("/api/admin/product-images", verifyAdmin, createProductImage);
  router.put(
    "/api/admin/product-images/:product_image_id",
    verifyAdmin,
    updateProductImage
  );
  router.delete(
    "/api/admin/product-images/:product_image_id",
    verifyAdmin,
    deleteProductImage
  );

  // =============== CATEGORY MANAGEMENT ROUTES ===============

  // Category routes
  router.get(
    "/api/admin/categories/paginated",
    verifyAdmin,
    getCategoriesPaginated
  );
  router.get("/api/admin/categories", verifyAdmin, getAllCategories);
  router.get("/api/admin/categories/:id", verifyAdmin, getCategoryById);
  router.post("/api/admin/categories", verifyAdmin, createCategory);
  router.put("/api/admin/categories/:id", verifyAdmin, updateCategory);
  router.delete("/api/admin/categories/:id", verifyAdmin, deleteCategory);

  // Sport routes
  router.get("/api/admin/sports/paginated", verifyAdmin, getSportsPaginated);
  router.get("/api/admin/sports", verifyAdmin, getAllSports);
  router.get("/api/admin/sports/:id", verifyAdmin, getSportById);
  router.post(
    "/api/admin/sports",
    verifyAdmin,
    upload.single("sport_icon"),
    createSport
  );
  router.put(
    "/api/admin/sports/:id",
    verifyAdmin,
    upload.single("sport_icon"),
    updateSport
  );
  router.delete("/api/admin/sports/:id", verifyAdmin, deleteSport);

  // Tournament routes
  router.get(
    "/api/admin/tournaments/paginated",
    verifyAdmin,
    getTournamentsPaginated
  );
  router.get("/api/admin/tournaments", verifyAdmin, getAllTournaments);
  router.get("/api/admin/tournaments/:id", verifyAdmin, getTournamentById);
  router.get(
    "/api/admin/sports/:sport_id/tournaments",
    verifyAdmin,
    getTournamentsBySport
  );
  router.post(
    "/api/admin/tournaments",
    verifyAdmin,
    upload.single("tournament_icon"),
    createTournament
  );
  router.put(
    "/api/admin/tournaments/:id",
    verifyAdmin,
    upload.single("tournament_icon"),
    updateTournament
  );
  router.delete("/api/admin/tournaments/:id", verifyAdmin, deleteTournament);

  // Team routes
  router.get("/api/admin/teams/paginated", verifyAdmin, getTeamsPaginated);
  router.get("/api/admin/teams", verifyAdmin, getAllTeams);
  router.get("/api/admin/teams/:id", verifyAdmin, getTeamById);
  router.get(
    "/api/admin/tournaments/:tournament_id/teams",
    verifyAdmin,
    getTeamsByTournament
  );
  router.post(
    "/api/admin/teams",
    verifyAdmin,
    upload.single("team_logo"),
    createTeam
  );
  router.put(
    "/api/admin/teams/:id",
    verifyAdmin,
    upload.single("team_logo"),
    updateTeam
  );
  router.delete("/api/admin/teams/:id", verifyAdmin, deleteTeam);

  // =============== ORDER MANAGEMENT ROUTES ===============
  router.get("/api/admin/orders/paginated", verifyAdmin, getOrdersPaginated);
  router.get("/api/admin/orders", verifyAdmin, getAllOrders);
  router.get("/api/admin/orders/status", verifyAdmin, getStatusOrder);
  router.get(
    "/api/admin/orders/history/:user_id",
    verifyAdmin,
    getOrderHistoryByUserId
  );
  router.post("/api/admin/orders/:order_id/approve", verifyAdmin, approveOrder);

  // =============== VOUCHER MANAGEMENT ROUTES ===============
  router.get(
    "/api/admin/vouchers/paginated",
    verifyAdmin,
    getVouchersPaginated
  );
  router.get("/api/admin/vouchers", verifyAdmin, getAllVouchers);
  router.post("/api/admin/vouchers", verifyAdmin, createVoucher);
  router.put("/api/admin/vouchers/:voucher_id", verifyAdmin, updateVoucher);

  // =============== BLOG MANAGEMENT ROUTES ===============
  router.get("/api/admin/blogs/paginated", verifyAdmin, getBlogsPaginated);
  router.get("/api/admin/blogs", verifyAdmin, getAllBlogs);
  router.get("/api/admin/blogs/:blog_id", verifyAdmin, getBlogById);
  router.post("/api/admin/blogs", verifyAdmin, createBlog);
  router.put("/api/admin/blogs/:blog_id", verifyAdmin, updateBlog);
  router.delete("/api/admin/blogs/:blog_id", verifyAdmin, deleteBlog);
  router.post(
    "/api/admin/upload-blog-image",
    verifyAdmin,
    upload.single("image"),
    uploadBlogImage
  );

  // =============== REPORT MANAGEMENT ROUTES ===============
  router.get("/api/admin/reports/paginated", verifyAdmin, getReportsPaginated);
  router.get("/api/admin/reports", verifyAdmin, getAllReports);
  router.get("/api/admin/reports/:report_id", verifyAdmin, getReportById);
  router.post("/api/admin/reports", verifyAdmin, createReport);
  router.delete("/api/admin/reports/:report_id", verifyAdmin, deleteReport);
  router.get(
    "/api/admin/reports/:report_id/export-excel",
    verifyAdmin,
    exportReportToExcel
  );
  // =============== PAYMENT MANAGEMENT ROUTES ===============
  router.get(
    "/api/admin/payments/method/:order_id",
    verifyAdmin,
    getMethodByOrderId
  );

  // =============== DASHBOARD ROUTES ===============
  router.get("/api/admin/dashboard/stats", verifyAdmin, getDashboardStats);
  router.get("/api/admin/dashboard/users", verifyAdmin, getUserStatsByMonth);
  router.get("/api/admin/dashboard/orders", verifyAdmin, getOrderStatsByMonth);
  router.get(
    "/api/admin/dashboard/products",
    verifyAdmin,
    getProductStatsByMonth
  );
  router.get(
    "/api/admin/dashboard/monthly-sales",
    verifyAdmin,
    getMonthlySales
  );
  router.get(
    "/api/admin/dashboard/revenue",
    verifyAdmin,
    getRevenueStatsByMonth
  );
  router.get(
    "/api/admin/dashboard/recent-orders",
    verifyAdmin,
    getRecentOrders
  );

  return app.use("/", router);
};

export default initAdminRoutes;
