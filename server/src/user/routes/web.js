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
import { verifyToken } from "../../shared/middlewares/authMiddleware.js";
//import variant controller
import { getVariantsByProductId } from "../controllers/variantController.js";

//product
import {
  getAllProducts,
  getTopRatedProducts,
  getFilteredProducts,
  getProductBySport,
  getProductById,
  searchProducts,
  getRelatedProducts,
} from "../controllers/productController.js";
import { getAllSports } from "../controllers/sportController.js";

import {
  getCartByUserId,
  getCartItems,
  addItemToCart,
  removeItemFromCart,
  updateItemQuantity,
  changeVariantInCart,
  getCartProductsByCartId,
  clearCart,
  getCartCount,
} from "../controllers/cartController.js";

// Product_Images
import {
  getAllProductImages,
  getProductImageById,
} from "../controllers/product_imageController.js";

//Payment APIs
import {
  createMomoPayment,
  createPayment,
  momoIpnHandler,
} from "../controllers/paymentController.js";
import { createVnpayPaymentController } from "../controllers/paymentController.js";

import { getAllBanners } from "../controllers/bannerController.js";

import {
  getAllVouchers,
  decreaseVoucherStock,
} from "../controllers/voucherController.js";

//Order APIs
import {
  createOrder,
  getStatusOrder,
  getOrderHistoryByUserId,
} from "../controllers/orderController.js";

//Blog APIs
import { getAllBlogs } from "../controllers/blogController.js";
const router = express.Router();
const upload = multer({ dest: "uploads/" });

import {
  addItemToWishList,
  getAllItemsInWishlist,
  getWishListByUserId,
  removeItemFromWishlist,
  changeVariantInWishlist,
  getWishlistCount,
} from "../controllers/wishlistController.js";

import {
  createReview,
  checkReviewExists,
  getAllReviewsForProduct,
} from "../controllers/reviewController.js";

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
    upload.single("avatar"),
    uploadAvatar
  );

  //product APIs
  router.get("/api/products", getAllProducts);
  router.get("/api/products/top-rated", getTopRatedProducts);
  router.post("/api/products/filter", getFilteredProducts);
  router.get("/api/products/:product_id", getProductById);
  router.get("/api/products/related/:product_id", getRelatedProducts);
  router.get("/api/products/sport/:sport_id", getProductBySport);

  router.get("/api/products/search", searchProducts);

  //sport APIs

  router.get("/api/sports", getAllSports);

  //cart APIs
  router.get("/api/cart/:user_id", verifyToken, getCartByUserId);
  router.get("/api/cart/items/:cart_id", verifyToken, getCartItems);
  router.get(
    "/api/cart/products/:cart_id",
    verifyToken,
    getCartProductsByCartId
  );
  router.get("/api/cart/count/:cart_id", verifyToken, getCartCount);
  router.post("/api/cart/add", verifyToken, addItemToCart);
  router.put("/api/cart/update", verifyToken, updateItemQuantity);
  router.put("/api/cart/change-variant", verifyToken, changeVariantInCart);
  router.delete(
    "/api/cart/remove/:cart_id/:variant_id",
    verifyToken,
    removeItemFromCart
  );
  router.delete("/api/cart/clear/:cart_id", verifyToken, clearCart);

  // Product_Images APIs
  router.get("/api/product-images", getAllProductImages);
  router.get("/api/product-images/:product_id", getProductImageById);

  // Banner APIs
  router.get("/api/banners", getAllBanners);

  //Voucher APIs
  router.get("/api/vouchers", getAllVouchers);
  router.post("/api/vouchers/decrease-stock", decreaseVoucherStock);

  //Payment APIs
  router.post("/api/payment/momo", createMomoPayment);
  router.post("/api/payment", createPayment);

  router.post("/api/payment/momo/ipn", momoIpnHandler);
  router.post("/api/payment/vnpay", createVnpayPaymentController);

  //Order APIs
  router.post("/api/order", createOrder);
  router.get("/api/order/:order_id", getStatusOrder);
  router.get("/api/orders/user/:user_id", verifyToken, getOrderHistoryByUserId);

  //Blog APIs
  router.get("/api/blogs", getAllBlogs);

  //Wishlist APIs
  router.get("/api/wishlist/add", verifyToken, addItemToWishList);
  router.post("/api/wishlist/add/:wishlist_id", verifyToken, addItemToWishList);
  router.get("/api/wishlist/:user_id", verifyToken, getWishListByUserId);
  router.get(
    "/api/wishlist/wishlist-items/:wishlist_id",
    verifyToken,
    getAllItemsInWishlist
  );
  router.delete(
    "/api/wishlist/remove/:wishlist_id/:variant_id",
    verifyToken,
    removeItemFromWishlist
  );

  router.put(
    "/api/wishlist/change-variant/:wishlist_id/:old_variant_id",
    verifyToken,
    changeVariantInWishlist
  );

  router.get("/api/wishlist/count/:wishlist_id", verifyToken, getWishlistCount);

  // Review APIs
  router.post("/api/review", verifyToken, createReview);
  router.get("/api/review/check", verifyToken, checkReviewExists);
  router.get("/api/review/product/:product_id", getAllReviewsForProduct);

  //variant apis
  router.get("/api/variants/product/:product_id", getVariantsByProductId);
  return app.use("/", router);
};

export default initWebRoutes;
