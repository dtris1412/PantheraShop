import express from "express";
import {
  getAllUsers,
  getUserById,
  getProfile,
  updateProfile,
  updatePassword,
} from "../controllers/userController.js";
import { register, login } from "../controllers/authController.js";
import multer from "multer";
import { uploadAvatar } from "../controllers/uploadController.js";
// import verifyToken nếu bạn đã có
import { verifyToken } from "../middlewares/authMiddleware.js";
//product
import {
  getAllProducts,
  getTopRatedProducts,
  getFilteredProducts,
  getProductBySport,
  getProductById,
  searchProducts,
} from "../controllers/productController.js";
import { getAllSports } from "../controllers/sportController.js";

import {
  getCartByUserId,
  getCartItems,
  addItemToCart,
  removeItemFromCart,
  updateItemQuantity,
  changeVariantInCart,
} from "../controllers/cartController.js";

// Product_Images
import {
  getAllProductImages,
  getProductImageById,
} from "../controllers/product_imageController.js";
const router = express.Router();
const upload = multer({ dest: "uploads/" });

const initWebRoutes = (app) => {
  // user APIs
  router.get("/api/users", getAllUsers);
  router.post("/api/register", register);
  router.post("/api/login", login);

  //get profile (protected route)
  router.get("/api/user/profile", verifyToken, getProfile);
  router.get("/api/user/:user_id", getUserById);
  //update profile (protected route)
  router.put("/api/user/profile", verifyToken, updateProfile);
  //updatepassword
  router.put("/api/user/password", verifyToken, updatePassword);
  router.post(
    "/api/user/avatar",
    verifyToken,
    upload.single("avatar"), // phải có dòng này!
    uploadAvatar
  );

  //product APIs
  router.get("/api/products", getAllProducts);
  router.get("/api/products/top-rated", getTopRatedProducts);
  router.post("/api/products/filter", getFilteredProducts);
  router.get("/api/products/:product_id", getProductById);

  router.get("/api/products/sport/:sport_id", getProductBySport);

  router.get("/api/products/search", searchProducts);

  //sport APIs

  router.get("/api/sports", getAllSports);

  //cart APIs
  router.get("/api/cart/:user_id", verifyToken, getCartByUserId);
  router.get("/api/cart/items/:cart_id", verifyToken, getCartItems);
  router.post("/api/cart/add", verifyToken, addItemToCart);
  router.put("/api/cart/update", verifyToken, updateItemQuantity);
  router.put("/api/cart/change-variant", verifyToken, changeVariantInCart);
  router.delete(
    "/api/cart/remove/:cart_id/:variant_id",
    verifyToken,
    removeItemFromCart
  );

  // Product_Images APIs
  router.get("/api/product-images", getAllProductImages);
  router.get("/api/product-images/:product_id", getProductImageById);

  return app.use("/", router);
};

export default initWebRoutes;
