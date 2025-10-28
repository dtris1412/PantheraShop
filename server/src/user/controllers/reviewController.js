import {
  createReview as createReviewService,
  checkReviewExists as checkReviewExistsService,
  getAllReviewsForProduct as getAllReviewsForProductService,
} from "../../shared/services/reviewService.js";

const checkReviewExists = async (req, res) => {
  try {
    const { order_id, variant_id, user_id } = req.query; // Lấy từ query
    const reviewExists = await checkReviewExistsService(
      order_id,
      variant_id,
      user_id
    );
    res.json({ exists: !!reviewExists });
  } catch (err) {
    console.error("Error in checkReviewExists: ", err);
    res.status(500).json({ message: "Internal server error" });
  }
};

const createReview = async (req, res) => {
  try {
    const user_id = req.user.user_id;
    const { order_id, variant_id, rating, comment } = req.body;
    const newReview = await createReviewService(
      order_id,
      variant_id,
      user_id,
      rating,
      comment
    );
    if (!newReview.success) {
      return res.status(400).json(newReview);
    }
    res.status(201).json(newReview);
  } catch (err) {
    console.error("Error in createReview: ", err);
    res.status(500).json({ message: "Internal server error" });
  }
};

const getAllReviewsForProduct = async (req, res) => {
  try {
    const { product_id } = req.params;
    const reviews = await getAllReviewsForProductService(product_id);
    if (!reviews.success) {
      return res.status(400).json(reviews);
    }
    res.status(200).json(reviews);
  } catch (err) {
    console.error("Error in getAllReviewsForProduct: ", err);
    res.status(500).json({ message: "Internal server error" });
  }
};
export { createReview, checkReviewExists, getAllReviewsForProduct };
