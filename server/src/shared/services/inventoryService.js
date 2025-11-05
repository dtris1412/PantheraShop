import db from "../models/index.js";

const getAllInventory = async () => {
  try {
    const products = await db.Variant.findAll({
      include: [
        {
          model: db.Product,
          as: "Product",
          required: false,
        },
      ],
      order: [["product_id", "ASC"]],
    });
    return { success: true, products };
  } catch (err) {
    console.error("Error in getAllInventories: ", err);
    return { success: false, message: "Internal server error" };
  }
};
const createVariant = async (
  variant_size,
  variant_color,
  variant_stock,
  product_id
) => {
  if (!product_id) {
    return { success: false, message: "Missing required fields" };
  }
  const newVariant = await db.Variant.create({
    variant_size: variant_size || "Standard",
    variant_color: variant_color || "Default",
    variant_stock: variant_stock || 0,
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

const updateVariant = async (
  variant_id,
  variant_size,
  variant_color,
  variant_stock
) => {
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
  variant.variant_stock =
    variant_stock !== undefined ? variant_stock : variant.variant_stock;

  await variant.save();
  return { success: true, variant };
};

export { getAllInventory, createVariant, getVariantsById, updateVariant };
