import {
  addItemToWishList as addItemToWishListService,
  getAllItemsInWishlist as getAllItemsInWishlistService,
  getWishListByUserId as getWishListByUserIdService,
  removeItemFromWishlist as removeItemFromWishlistService,
} from "../services/wishlistService.js";

const addItemToWishList = async (req, res) => {
  try {
    const wishlist_id = req.params.wishlist_id;
    const { variant_id } = req.body;
    const result = await addItemToWishListService(wishlist_id, variant_id);
    if (!result.success) {
      return res.status(400).json(result);
    }
    res.status(200).json(result);
  } catch (err) {
    console.error("Error in fetching wishlist items: ", err);
    res.status(500).json({ message: "Internal server error" });
  }
};

const getWishListByUserId = async (req, res) => {
  try {
    const user_id = req.params.user_id || req.user?.user_id;
    if (!user_id) {
      throw new Error("User ID is required");
    }
    const result = await getWishListByUserIdService(user_id);
    if (!result.success) {
      return res.status(400).json(result);
    }
    res.status(200).json(result);
  } catch (err) {
    console.error("Error in fetching wishlist by user ID: ", err);
    res.status(500).json({ message: "Internal server error" });
  }
};

const getAllItemsInWishlist = async (req, res) => {
  try {
    const wishlist_id = req.params.wishlist_id;
    console.log("Wishlist ID: ", wishlist_id);

    const result = await getAllItemsInWishlistService(wishlist_id);
    if (!result.success) {
      return res.status(400).json(result);
    }
    res.status(200).json(result);
  } catch (err) {
    console.error("Error in fetching wishlist items: ", err);
    res.status(500).json({ message: "Internal server error" });
  }
};

const removeItemFromWishlist = async (req, res) => {
  try {
    const wishlist_id = req.params.wishlist_id;
    const variant_id = req.params.variant_id;
    const result = await removeItemFromWishlistService(wishlist_id, variant_id);
    if (!result.success) {
      return res.status(400).json(result);
    }
    res.status(200).json(result);
  } catch (err) {
    console.error("Error in removing item from wishlist: ", err);
    res.status(500).json({ message: "Internal server error" });
  }
};
export {
  addItemToWishList,
  getAllItemsInWishlist,
  getWishListByUserId,
  removeItemFromWishlist,
};
