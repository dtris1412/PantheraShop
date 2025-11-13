import db from "../../shared/models/index.js";
import { Op } from "sequelize";

const getProductImagesPaginated = async (search, limit, page) => {
  try {
    const offset = (page - 1) * limit;

    // Build where for Product
    const productWhere = search
      ? { product_name: { [Op.substring]: search } }
      : {};

    // Get total products count
    const totalProducts = await db.Product.count({
      where: productWhere,
    });

    // Get paginated products
    const products = await db.Product.findAll({
      where: productWhere,
      attributes: ["product_id", "product_name", "product_image"],
      limit,
      offset,
      order: [["product_id", "DESC"]],
    });

    // Get all product_ids
    const productIds = products.map((p) => p.product_id);

    // Get all images for these products
    const productImages = await db.Product_Image.findAll({
      where: {
        product_id: productIds,
      },
      include: [
        {
          model: db.Product,
          attributes: ["product_id", "product_name", "product_image"],
        },
      ],
      order: [["product_image_id", "DESC"]],
    });

    const data = productImages.map((img) => ({
      ...img.toJSON(),
      image_url: img.image_url,
    }));

    return {
      success: true,
      data,
      total: totalProducts,
      page,
      totalPages: Math.ceil(totalProducts / limit),
    };
  } catch (error) {
    console.error("Error getting paginated product images:", error);
    return { success: false, message: error.message };
  }
};

const getAllProductImages = async () => {
  const productImages = await db.Product_Image.findAll({
    include: [
      {
        model: db.Product,
        attributes: ["product_id", "product_name", "product_image"],
      },
    ],
    order: [["product_image_id", "ASC"]],
  });
  if (!productImages)
    return { success: false, message: "No product images found" };
  // Map lại cho đồng bộ
  const data = productImages.map((img) => ({
    ...img.toJSON(),
    image_url: img.image_url, // DB đã là image_url
  }));
  return { success: true, data };
};

const getProductImageById = async (product_id) => {
  if (!product_id) {
    return { success: false, message: "Missing product_id" };
  }
  const productImages = await db.Product_Image.findAll({
    where: { product_id },
  });
  if (!productImages) {
    return { success: false, message: "Product image not found" };
  }
  const data = productImages.map((img) => ({
    ...img.toJSON(),
    image_url: img.image_url,
  }));
  return { success: true, data };
};

const createProductImage = async (imageData) => {
  try {
    const { product_id, image_url, order } = imageData;

    if (!product_id || !image_url) {
      return { success: false, message: "Missing required fields" };
    }

    // Check if product exists
    const product = await db.Product.findByPk(product_id);
    if (!product) {
      return { success: false, message: "Product not found" };
    }

    const newImage = await db.Product_Image.create({
      product_id,
      image_url,
      order,
    });

    return {
      success: true,
      data: newImage,
      message: "Product image created successfully",
    };
  } catch (error) {
    console.error("Error creating product image:", error);
    return { success: false, message: error.message };
  }
};

const updateProductImage = async (product_image_id, imageData) => {
  try {
    if (!product_image_id) {
      return { success: false, message: "Missing product_image_id" };
    }

    const { image_url, order } = imageData;

    if (image_url === undefined && order === undefined) {
      return { success: false, message: "No update data provided" };
    }

    const productImage = await db.Product_Image.findByPk(product_image_id);
    if (!productImage) {
      return { success: false, message: "Product image not found" };
    }

    const updateData = {};
    if (image_url !== undefined) updateData.image_url = image_url;
    if (order !== undefined) updateData.order = order;

    await productImage.update(updateData);

    // Lấy lại bản ghi mới nhất từ DB
    const updatedImage = await db.Product_Image.findByPk(product_image_id);

    return {
      success: true,
      data: updatedImage,
      message: "Product image updated successfully",
    };
  } catch (error) {
    console.error("Error updating product image:", error);
    return { success: false, message: error.message };
  }
};

const deleteProductImage = async (product_image_id) => {
  try {
    if (!product_image_id) {
      return { success: false, message: "Missing product_image_id" };
    }

    const productImage = await db.Product_Image.findByPk(product_image_id);
    if (!productImage) {
      return { success: false, message: "Product image not found" };
    }

    await productImage.destroy();

    return { success: true, message: "Product image deleted successfully" };
  } catch (error) {
    console.error("Error deleting product image:", error);
    return { success: false, message: error.message };
  }
};

export {
  getAllProductImages,
  getProductImageById,
  getProductImagesPaginated,
  createProductImage,
  updateProductImage,
  deleteProductImage,
};
