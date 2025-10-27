import {
  createReview as createReviewService,
  checkReviewExists as checkReviewExistsService,
} from "../services/reviewService.js";

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

export { createReview, checkReviewExists };
