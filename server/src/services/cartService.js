import db from "../models/index.js";

const createCart = async (user_id) => {
  console.log("Creating cart for user_id:", user_id);
  if (!user_id) throw new Error("User ID is required to create a cart");

  const newCart = await db.Cart.create({
    user_id: user_id,
  });

  console.log("Cart created successfully:", newCart.cart_id);
  return newCart;
};

export { createCart };
