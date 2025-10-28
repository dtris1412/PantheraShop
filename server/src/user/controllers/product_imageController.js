import {
  getAllProductImages as getAllProductImagesService,
  getProductImageById as getProductImageByIdService,
} from "../services/product_imageService.js";

const getAllProductImages = async (req, res) => {
  try {
    const productImages = await getAllProductImagesService();
    if (!productImages.success) {
      return res.status(400).json({ message: productImages.message });
    }
    res.status(200).json(productImages);
  } catch (err) {
    console.error("Error fetching product images: ", err);
    res.status(500).json({ message: "Internal server error" });
  }
};

const getProductImageById = async (req, res) => {
  try {
    const { product_id } = req.params;
    if (!product_id) {
      return res.status(400).json({ message: "product_id is required" });
    }
    const productImage = await getProductImageByIdService(product_id);
    if (!productImage.success) {
      return res.status(404).json({ message: productImage.message });
    }
    res.status(200).json(productImage);
  } catch (err) {
    console.error("Error fetching product image by ID: ", err);
    res.status(500).json({ message: "Internal server error" });
  }
};
export { getAllProductImages, getProductImageById };
