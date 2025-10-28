import db from "../../shared/models/index.js";

const getAllProductImages = async () => {
  const productImages = await db.Product_Image.findAll();
  if (!productImages)
    return { success: false, message: "No product images found" };
  return { success: true, data: productImages };
};

const getProductImageById = async (product_id) => {
  if (!product_id) {
    return { success: false, message: "Missing product_id" };
  }
  const productImages = await db.Product_Image.findAll({
    where: {
      product_id: product_id,
    },
  });
  if (!productImages) {
    return { success: false, message: "Product image not found" };
  }
  return { success: true, data: productImages };
};
export { getAllProductImages, getProductImageById };
