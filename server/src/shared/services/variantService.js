import db from "../../shared/models/index.js";

const createVariant = async (variant_size, variant_color, product_id) => {
  if (!product_id) {
    return { success: false, message: "Missing required fields" };
  }
  const newVariant = await db.Variant.create({
    variant_size: variant_size || "Standard",
    variant_color: variant_color || "Default",
    variant_stock: 0,
    product_id,
  });
  return { success: true, variant: newVariant };
};

const getVariantsById = async (product_id) => {
  if (!product_id) {
    return { success: false, message: "Missing required fields" };
  }
  const variants = await db.Variant.findAll({
    where: { product_id },
  });
  return { success: true, variants };
};

const updateVariant = async (variant_id, variant_size, variant_color) => {
  if (!variant_id) {
    return { success: false, message: "Missing required fields" };
  }
  const variant = await db.Variant.findOne({
    where: { variant_id },
  });
  if (!variant) {
    return { success: false, message: "Variant not found" };
  }

  variant.variant_size = variant_size || variant.variant_size;
  variant.variant_color = variant_color || variant.variant_color;

  await variant.save();
  return { success: true, variant };
};

const deleteVariant = async (variant_id) => {
  if (!variant_id) {
    return { success: false, message: "Missing required fields" };
  }
  const variant = await db.Variant.findOne({
    where: { variant_id },
  });
  if (!variant) {
    return { success: false, message: "Variant not found" };
  }
  await variant.destroy();
  return { success: true, message: "Variant deleted successfully" };
};

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

const getAllVariantsByProductId = async (product_id) => {
  if (!product_id) {
    return { success: false, message: "Missing required fields" };
  }
  const variants = await db.Variant.findAll({
    where: { product_id },
  });
  return { success: true, variants };
};
export {
  decreaseVariantStock,
  createVariant,
  getVariantsById,
  updateVariant,
  deleteVariant,
  getAllVariantsByProductId,
};
