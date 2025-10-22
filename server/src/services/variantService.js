import db from "../models/index.js";

const decreaseVariantStock = async (variant_id, quantity) => {
  if (!variant_id || !quantity) {
    return { success: false, message: "Missing required fields" };
  }
  const variant = await db.Variant.findOne({
    where: { variant_id },
  });
  if (!variant) {
    return { success: false, message: "Variant not found" };
  }
  if (variant.variant_stock < quantity) {
    return { success: false, message: "Insufficient stock" };
  }
  variant.variant_stock -= quantity;
  await variant.save();
  return { success: true, message: "Stock decreased successfully" };
};

export { decreaseVariantStock };
