import db from "../models/index.js";
import { Op } from "sequelize";

const getInventoryPaginated = async (search, limit, page) => {
  try {
    const offset = (page - 1) * limit;

    // Build where for Product
    const productWhere = search
      ? { product_name: { [Op.substring]: search } }
      : {};

    // Get total products count (with search filter)
    const totalProducts = await db.Product.count({
      where: productWhere,
    });

    // Get total variants count (with search filter)
    const totalVariants = await db.Variant.count({
      include: [
        {
          model: db.Product,
          as: "Product",
          where: productWhere,
          attributes: [],
        },
      ],
    });

    // Get paginated products with their variants
    const products = await db.Product.findAll({
      where: productWhere,
      attributes: [
        "product_id",
        "product_name",
        "product_description",
        "product_price",
        "product_image",
        "created_at",
        "is_active",
      ],
      include: [
        {
          model: db.Variant,
          as: "Variants",
          required: false, // LEFT JOIN - lấy cả sản phẩm không có variant
          attributes: [
            "variant_id",
            "variant_size",
            "variant_color",
            "variant_stock",
            "created_at",
            "updated_at",
          ],
        },
      ],
      limit,
      offset,
      order: [
        ["product_id", "DESC"],
        [{ model: db.Variant, as: "Variants" }, "variant_id", "DESC"],
      ],
    });

    // Transform data to match frontend expectation
    const result = [];
    products.forEach((product) => {
      const productData = product.toJSON();

      if (productData.Variants && productData.Variants.length > 0) {
        // Sản phẩm có variants - tạo record cho mỗi variant
        productData.Variants.forEach((variant) => {
          result.push({
            variant_id: variant.variant_id,
            variant_size: variant.variant_size,
            variant_color: variant.variant_color,
            variant_stock: variant.variant_stock,
            product_id: productData.product_id,
            created_at: variant.created_at,
            updated_at: variant.updated_at,
            Product: {
              product_id: productData.product_id,
              product_name: productData.product_name,
              product_description: productData.product_description,
              product_price: productData.product_price,
              product_image: productData.product_image,
              created_at: productData.created_at,
              is_active: productData.is_active,
            },
          });
        });
      } else {
        // Sản phẩm chưa có variant - tạo record với variant null
        result.push({
          variant_id: null,
          variant_size: null,
          variant_color: null,
          variant_stock: 0,
          product_id: productData.product_id,
          created_at: null,
          updated_at: null,
          Product: {
            product_id: productData.product_id,
            product_name: productData.product_name,
            product_description: productData.product_description,
            product_price: productData.product_price,
            product_image: productData.product_image,
            created_at: productData.created_at,
            is_active: productData.is_active,
          },
        });
      }
    });

    return {
      success: true,
      products: result,
      total: totalProducts,
      totalVariants: totalVariants,
      page,
      totalPages: Math.ceil(totalProducts / limit),
    };
  } catch (err) {
    console.error("Error in getInventoryPaginated: ", err);
    return { success: false, message: "Internal server error" };
  }
};

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
    created_at: new Date(),
    updated_at: new Date(),
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
  variant.updated_at = new Date();

  await variant.save();
  return { success: true, variant };
};

export {
  getAllInventory,
  getInventoryPaginated,
  createVariant,
  getVariantsById,
  updateVariant,
};
