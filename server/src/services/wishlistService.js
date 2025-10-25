import db from "../models/index.js";
import wishlist from "../models/wishlist.js";

const createWishlist = async (user_id) => {
  if (!user_id) throw new Error("User ID is required");
  const wishlist = await db.WishList.create({
    user_id,
    created_at: new Date(),
  });
  return { success: true, wishlist };
};

const addItemToWishList = async (wishlist_id, variant_id) => {
  if (!wishlist_id || !variant_id)
    throw new Error("Wishlist ID and Variant ID are required");
  const existingItem = await db.WishlistVariant.findOne({
    where: { wishlist_id, variant_id },
  });
  if (existingItem) {
    return { success: false, message: "Item already exists in wishlist" };
  }
  const item = await db.WishlistVariant.create({
    wishlist_id,
    variant_id,
    added_at: new Date(),
  });
  return { success: true, item };
};

const getWishListByUserId = async (user_id) => {
  if (!user_id) throw new Error("User ID is required");
  const wishlist = await db.Wishlist.findOne({
    where: { user_id },
  });
  return wishlist;
};
const getAllItemsInWishlist = async (wishlist_id) => {
  if (!wishlist_id) throw new Error("Wishlist ID is required");
  const items = await db.WishlistVariant.findAll({
    where: { wishlist_id },
    include: [
      {
        model: db.Variant,
        include: [
          {
            model: db.Product,
          },
        ],
      },
    ],
  });
  return { success: true, items };
};

const removeItemFromWishlist = async (wishlist_id, variant_id) => {
  if (!wishlist_id || !variant_id)
    throw new Error("Wishlist ID and Variant ID are required");
  const remove = await db.WishlistVariant.destroy({
    where: { wishlist_id, variant_id },
  });

  return { success: true, message: "Item removed from wishlist" };
};

export {
  createWishlist,
  addItemToWishList,
  getAllItemsInWishlist,
  getWishListByUserId,
  removeItemFromWishlist,
};
