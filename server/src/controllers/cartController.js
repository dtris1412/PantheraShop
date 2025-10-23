import cart from "../models/cart.js";
import {
  getCartByUserId as getCartByUserIdService,
  getCartItems as getCartItemsService,
  addItemToCart as addItemToCartService,
  removeItemFromCart as removeItemFromCartService,
  updateItemQuantity as updateItemQuantityService,
  changeVariantInCart as changeVariantInCartService,
  getCartProductsByCartId as getCartProductsByCartIdService,
  clearCart as clearCartService,
} from "../services/cartService.js";

const getCartByUserId = async (req, res) => {
  try {
    const user_id = req.user.user_id;
    console.log("Fetching cart for user_id:", user_id);
    const cart = await getCartByUserIdService(user_id);
    res.json(cart);
  } catch (error) {
    console.error("Error fetching cart:", error);
    res.status(500).json({ error: "Internal server error" });
  }
};

const getCartItems = async (req, res) => {
  const cart_id = req.params.cart_id;
  if (!cart_id) {
    return res.status(400).json({ message: "Cart ID is required" });
  }
  try {
    console.log("Fetching cart items for cart_id:", cart_id);
    const items = await getCartItemsService(cart_id);
    res.json(items);
  } catch (error) {
    console.error("Error fetching cart items:", error);
    res.status(500).json({ error: "Internal server error" });
  }
};

const addItemToCart = async (req, res) => {
  try {
    const user_id = req.user.user_id;
    const { variant_id, quantity } = req.body; // Đổi product_id thành variant_id

    const cart = await getCartByUserIdService(user_id);
    if (!cart) {
      return res.status(404).json({ message: "Cart not found" });
    }

    const result = await addItemToCartService(
      cart.cart_id,
      variant_id, // Truyền variant_id
      quantity
    );

    if (result && result.success === false) {
      return res.status(400).json({ message: result.message });
    }

    res
      .status(200)
      .json({ message: "Item added to cart successfully", item: result.item });
  } catch (err) {
    console.error("Error adding item to cart: ", err);
    res.status(500).json({ message: "Internal server error" });
  }
};

const removeItemFromCart = async (req, res) => {
  try {
    const user_id = req.user.user_id;
    const { cart_id, variant_id } = req.params; // Lấy từ params

    // Nếu cần kiểm tra cart thuộc user
    const cart = await getCartByUserIdService(user_id);
    if (!cart || cart.cart_id != cart_id) {
      return res.status(404).json({ message: "Cart not found" });
    }

    const result = await removeItemFromCartService(cart_id, variant_id);
    if (result && result.success === false) {
      return res.status(400).json(result);
    }
    res.status(200).json(result);
  } catch (err) {
    console.error("Error removing item from cart: ", err);
    res.status(500).json({ message: "Internal server error" });
  }
};

const updateItemQuantity = async (req, res) => {
  try {
    const user_id = req.user.user_id;
    const { cart_id, variant_id, quantity } = req.body;
    const cart = await getCartByUserIdService(user_id);
    if (!cart || cart.cart_id != cart_id) {
      return res.status(404).json({ message: "Cart not found" });
    }

    const result = await updateItemQuantityService(
      cart_id,
      variant_id,
      quantity
    );
    if (result && result.success === false) {
      return res.status(400).json(result);
    }
    res.status(200).json(result);
  } catch (err) {
    console.error("Error updating item quantity in cart: ", err);
    res.status(500).json({ message: "Internal server error" });
  }
};

const changeVariantInCart = async (req, res) => {
  try {
    const user_id = req.user.user_id;
    const { cart_id, old_variant_id, new_variant_id, quantity } = req.body;
    const cart = await getCartByUserIdService(user_id);
    if (!cart || cart.cart_id != cart_id) {
      return res.status(404).json({ message: "Cart not found" });
    }

    const result = await changeVariantInCartService(
      cart_id,
      old_variant_id,
      new_variant_id,
      quantity
    );
    if (result && result.success === false) {
      return res.status(400).json(result);
    }
    res.status(200).json(result);
  } catch (err) {
    console.error("Error changing variant in cart: ", err);
    res.status(500).json({ message: "Internal server error" });
  }
};

const getCartProductsByCartId = async (req, res) => {
  try {
    const { cart_id } = req.params;
    if (!cart_id) {
      return res.status(400).json({ message: "Cart ID is required" });
    }
    const items = await getCartProductsByCartIdService(cart_id);
    if (!items.success) {
      return res.status(404).json({ message: items.message });
    }
    res.status(200).json(items);
  } catch (err) {
    console.error("Error fetching cart products by cart ID: ", err);
    res.status(500).json({ message: "Internal server error" });
  }
};

const clearCart = async (req, res) => {
  try {
    const { cart_id } = req.params;
    if (!cart_id) {
      return res.status(400).json({ message: "Cart ID is required" });
    }
    const result = await clearCartService(cart_id);
    res.status(200).json(result);
  } catch (err) {
    console.error("Error clearing cart: ", err);
    res.status(500).json({ message: "Internal server error" });
  }
};
export {
  getCartByUserId,
  getCartItems,
  addItemToCart,
  removeItemFromCart,
  changeVariantInCart,
  updateItemQuantity,
  getCartProductsByCartId,
  clearCart,
};
