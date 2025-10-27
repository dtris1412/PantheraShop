import db from "../models/index.js";

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

export { createReview, checkReviewExists };
