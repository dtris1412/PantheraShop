import db from "../../shared/models/index.js";
import wishlist from "../../shared/models/wishlist.js";

const createWishlist = async (user_id) => {
  if (!user_id) throw new Error("User ID is required");
  const wishlist = await db.Wishlist.create({
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

const getWishlistItemsPaginated = async ({
  wishlist_id,
  search = "",
  limit = 5,
  page = 1,
  size,
  color,
  sortOrder = "desc",
}) => {
  if (!wishlist_id) throw new Error("Wishlist ID is required");

  const Op = db.Sequelize.Op;
  const offset = (Number(page) - 1) * Number(limit);

  // Xây dựng điều kiện where cho Product (search)
  const productWhere = {};
  if (search) {
    productWhere.product_name = { [Op.substring]: search };
  }

  // Xây dựng điều kiện where cho Variant (size, color)
  const variantWhere = {};
  if (size) {
    variantWhere.variant_size = size;
  }
  if (color) {
    variantWhere.variant_color = color;
  }

  // Include cho count
  const includeForCount = [
    {
      model: db.Variant,
      where: Object.keys(variantWhere).length > 0 ? variantWhere : undefined,
      required: true,
      include: [
        {
          model: db.Product,
          where:
            Object.keys(productWhere).length > 0 ? productWhere : undefined,
          required: true,
        },
      ],
    },
  ];

  // Include cho findAll
  const includeForFindAll = [
    {
      model: db.Variant,
      where: Object.keys(variantWhere).length > 0 ? variantWhere : undefined,
      required: true,
      include: [
        {
          model: db.Product,
          where:
            Object.keys(productWhere).length > 0 ? productWhere : undefined,
          required: true,
        },
      ],
    },
  ];

  // Đếm tổng số items
  const totalItems = await db.WishlistVariant.count({
    where: { wishlist_id },
    include: includeForCount,
    distinct: true,
  });

  // Sắp xếp theo added_at
  const order =
    sortOrder === "asc" ? [["added_at", "ASC"]] : [["added_at", "DESC"]];

  // Lấy danh sách items
  const items = await db.WishlistVariant.findAll({
    where: { wishlist_id },
    include: includeForFindAll,
    limit: Number(limit),
    offset,
    order,
  });

  return {
    success: true,
    items,
    total: totalItems,
  };
};

const removeItemFromWishlist = async (wishlist_id, variant_id) => {
  if (!wishlist_id || !variant_id)
    throw new Error("Wishlist ID and Variant ID are required");
  const remove = await db.WishlistVariant.destroy({
    where: { wishlist_id, variant_id },
  });

  return { success: true, message: "Item removed from wishlist" };
};

const changeVariantInWishlist = async (
  wishlist_id,
  old_variant_id,
  new_variant_id
) => {
  if (!wishlist_id || !old_variant_id || !new_variant_id)
    throw new Error("All IDs are required");
  const item = await db.WishlistVariant.findOne({
    where: { wishlist_id, variant_id: old_variant_id },
  });
  if (!item) {
    return { success: false, message: "Item not found in wishlist" };
  }
  item.variant_id = new_variant_id;
  await item.save();
  return { success: true, item };
};

const getWishlistCount = async (wishlist_id) => {
  if (!wishlist_id) throw new Error("Wishlist ID is required");
  const count = await db.WishlistVariant.count({
    where: { wishlist_id },
  });
  return { success: true, count };
};

export {
  createWishlist,
  addItemToWishList,
  getAllItemsInWishlist,
  getWishListByUserId,
  removeItemFromWishlist,
  changeVariantInWishlist,
  getWishlistCount,
  getWishlistItemsPaginated,
};
