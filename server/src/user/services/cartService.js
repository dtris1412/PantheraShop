import db from "../../shared/models/index.js";

const createCart = async (user_id) => {
  console.log("Creating cart for user_id:", user_id);
  if (!user_id) throw new Error("User ID is required to create a cart");

  const newCart = await db.Cart.create({
    user_id: user_id,
  });

  console.log("Cart created successfully:", newCart.cart_id);
  return newCart;
};

const getCartByUserId = async (user_id) => {
  if (!user_id) throw new Error("User ID is required to get a cart");
  const cart = await db.Cart.findOne({
    where: { user_id },
  });
  return cart;
};

const getCartItems = async (cart_id) => {
  if (!cart_id) throw new Error("Cart ID is required to get cart items");
  const items = await db.CartProduct.findAll({
    where: { cart_id },
    include: [
      {
        model: db.Variant,
        include: [{ model: db.Product }],
      },
    ],
  });
  return items;
};

const addItemToCart = async (cart_id, variant_id, quantity) => {
  if (!cart_id || !variant_id || !quantity)
    throw new Error("All fields are required");

  // Kiểm tra đã có sản phẩm này trong giỏ chưa
  const existingItem = await db.CartProduct.findOne({
    where: { cart_id, variant_id },
  });

  if (existingItem) {
    // Nếu đã có, cộng dồn số lượng
    existingItem.quantity += quantity;
    await existingItem.save();
    return {
      message: "Cập nhật số lượng sản phẩm trong giỏ hàng",
      item: existingItem,
    };
  } else {
    // Nếu chưa có, thêm mới
    const newItem = await db.CartProduct.create({
      cart_id,
      variant_id,
      quantity,
    });
    return { message: "Thêm vào giỏ hàng thành công", item: newItem };
  }
};

const removeItemFromCart = async (cart_id, variant_id) => {
  if (!cart_id || !variant_id)
    throw new Error("Cart ID and Variant ID are required");
  await db.CartProduct.destroy({
    where: { cart_id, variant_id },
  });
  return { message: "Xóa sản phẩm khỏi giỏ hàng thành công" };
};

const updateItemQuantity = async (cart_id, variant_id, quantity) => {
  if (!cart_id || !variant_id || !quantity)
    throw new Error("All fields are required");
  const item = await db.CartProduct.findOne({
    where: { cart_id, variant_id },
  });
  if (!item) throw new Error("Item not found in cart");
  item.quantity = quantity;
  await item.save();
  return { message: "Cập nhật số lượng thành công", item };
};

const changeVariantInCart = async (
  cart_id,
  old_variant_id,
  new_variant_id,
  quantity
) => {
  if (!cart_id || !old_variant_id || !new_variant_id || !quantity)
    throw new Error("All fields are required");
  const item = await db.CartProduct.findOne({
    where: { cart_id, variant_id: old_variant_id },
  });
  if (!item) throw new Error("Item not found in cart");
  item.variant_id = new_variant_id;
  item.quantity = quantity;
  await item.save();
  return { message: "Thay đổi biến thể thành công", item };
};

const getCartProductsByCartId = async (cart_id) => {
  if (!cart_id) throw new Error("Cart ID is required");
  const items = await db.CartProduct.findAll({ where: { cart_id } });
  if (!items) {
    throw new Error("No items found in cart");
  }

  return items;
};

const clearCart = async (cart_id) => {
  if (!cart_id) throw new Error("Cart ID is required");
  await db.CartProduct.destroy({
    where: { cart_id },
  });
  return { message: "Đã xóa tất cả sản phẩm trong giỏ hàng" };
};
const getCartCount = async (cart_id) => {
  if (!cart_id) throw new Error("Cart ID is required");
  const count = await db.CartProduct.count({
    where: { cart_id },
  });
  return count;
};
export {
  createCart,
  getCartByUserId,
  getCartItems,
  getCartProductsByCartId,
  addItemToCart,
  removeItemFromCart,
  updateItemQuantity,
  changeVariantInCart,
  clearCart,
  getCartCount,
};
