import db from "../../shared/models/index.js";
import { getNameById } from "./userService.js";
const checkReviewExists = async (order_id, variant_id, user_id) => {
  const existingReview = await db.OrderProductReview.findOne({
    where: {
      order_id,
      variant_id,
      user_id,
    },
  });
  return existingReview;
};

const createReview = async (order_id, variant_id, user_id, rating, comment) => {
  if (!order_id || !variant_id || !user_id || !rating) {
    return { success: false, message: "Missing required fields" };
  }
  const newReview = await db.OrderProductReview.create({
    order_id,
    variant_id,
    user_id,
    rating,
    comment,
    created_at: new Date(),
  });
  return { success: true, data: newReview };
};

const getAllReviewsForProduct = async (product_id) => {
  const variants = await db.Variant.findAll({
    where: { product_id },
    attributes: ["variant_id"],
  });
  const variantIds = variants.map((variant) => variant.variant_id);
  if (!variantIds.length)
    return { success: false, message: "No variants found" };

  const reviews = await db.OrderProductReview.findAll({
    where: { variant_id: variantIds },
    raw: true,
  });
  if (!reviews) return { success: false, message: "No reviews found" };

  // Lấy user_name cho từng review
  const reviewsWithUserName = await Promise.all(
    reviews.map(async (review) => {
      const user_name = await getNameById(review.user_id);
      return {
        ...review,
        user_name,
      };
    })
  );

  return { success: true, reviews: reviewsWithUserName };
};
export { createReview, checkReviewExists, getAllReviewsForProduct };
