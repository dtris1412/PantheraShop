import express from "express";
import multer from "multer";
import { verifyAdmin } from "../../shared/middlewares/adminMiddleware.js";
import {
  uploadAvatarForUser,
  uploadProductImage,
} from "../../admin/controllers/uploadController.js";

const upload = multer({ dest: "uploads/" });

//Import supplier Controllers
import {
  getAllSuppliers,
  createSupplier,
  updateSupplier,
  // cancelTerminalConnection,
  setSupplierConnectionStatus,
} from "../../admin/controllers/supplierController.js";

//Import inventory Controllers
import {
  getAllInventories,
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
} from "../../admin/controllers/productController.js";
import {
  register as adminRegister,
  toggleUserStatus,
} from "../../admin/controllers/authController.js";
import {
  getAllUsers,
  updateProfile,
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
  createCategory,
  updateCategory,
  deleteCategory,

  // Sport routes
  getAllSports,
  getSportById,
  createSport,
  updateSport,
  deleteSport,

  // Tournament routes
  getAllTournaments,
  getTournamentById,
  getTournamentsBySport,
  createTournament,
  updateTournament,
  deleteTournament,

  // Team routes
  getAllTeams,
  getTeamById,
  getTeamsByTournament,
  createTeam,
  updateTeam,
  deleteTeam,
} from "../controllers/categoryController.js";

//Import gallery controllers
import {
  getAllProductImages,
  getProductImageById,
} from "../controllers/product_imageController.js";
const router = express.Router();

const initAdminRoutes = (app) => {
  //Admin Registration
  router.post("/api/admin/register", verifyAdmin, adminRegister);

  //User Management
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

  //Product Management
  router.get("/api/admin/products", verifyAdmin, getAllProducts);
  router.get("/api/admin/products/:id", verifyAdmin, getProductById);
  router.post("/api/admin/products", verifyAdmin, createProduct);
  router.put("/api/admin/products/:id", verifyAdmin, updateProduct);
  router.delete("/api/admin/products/:id", verifyAdmin, deleteProduct);
  router.put("/api/admin/products/:id/lock", verifyAdmin, setProductLockStatus);

  // =============== VARIANT MANAGEMENT ROUTES ===============

  router.get("/api/admin/variants/:id", verifyAdmin, getVariantsById);
  router.post("/api/admin/variants", verifyAdmin, createVariant);
  router.put("/api/admin/variants/:id", verifyAdmin, updateVariant);
  router.delete("/api/admin/variants/:id", verifyAdmin, deleteVariant);

  // =============== INVENTORY MANAGEMENT ROUTES ===============
  router.get("/api/admin/inventory", verifyAdmin, getAllInventories);
  router.get("/api/admin/inventory/:id", verifyAdmin, getVariantsByIdInventory);
  router.post("/api/admin/inventory", verifyAdmin, createVariantInventory);
  router.put("/api/admin/inventory/:id", verifyAdmin, updateVariantInventory);

  // =============== SUPPLIER MANAGEMENT ROUTES ===============
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
    "/api/admin/product-images/:product_id",
    verifyAdmin,
    getProductImageById
  );

  // =============== CATEGORY MANAGEMENT ROUTES ===============

  // Category routes
  router.get("/api/admin/categories", verifyAdmin, getAllCategories);
  router.get("/api/admin/categories/:id", verifyAdmin, getCategoryById);
  router.post("/api/admin/categories", verifyAdmin, createCategory);
  router.put("/api/admin/categories/:id", verifyAdmin, updateCategory);
  router.delete("/api/admin/categories/:id", verifyAdmin, deleteCategory);

  // Sport routes
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

  return app.use("/", router);
};

export default initAdminRoutes;
