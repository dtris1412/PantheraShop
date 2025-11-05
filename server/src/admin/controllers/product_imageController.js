import {
  getAllProductImages as getAllProductImagesService,
  getProductImageById as getProductImageByIdService,
  createProductImage as createProductImageService,
  updateProductImage as updateProductImageService,
  deleteProductImage as deleteProductImageService,
} from "../../shared/services/product_imageService.js";

const getAllProductImages = async (req, res) => {
  try {
    const images = await getAllProductImagesService();
    if (!images.success) {
      return res.status(400).json(images);
    }
    res.status(200).json(images);
  } catch (err) {
    console.error("Error in getAllProductImages: ", err);
    res.status(500).json({
      success: false,
      message: "Internal Server Error",
      error: err.message,
    });
  }
};

const getProductImageById = async (req, res) => {
  try {
    const { product_id } = req.params;
    const image = await getProductImageByIdService(product_id);
    if (!image.success) {
      return res.status(404).json(image);
    }
    res.status(200).json(image);
  } catch (err) {
    console.error("Error in getProductImageById: ", err);
    res.status(500).json({
      success: false,
      message: "Internal Server Error",
      error: err.message,
    });
  }
};

const createProductImage = async (req, res) => {
  try {
    const result = await createProductImageService(req.body);
    if (!result.success) {
      return res.status(400).json(result);
    }
    res.status(201).json(result);
  } catch (err) {
    console.error("Error in createProductImage: ", err);
    res.status(500).json({
      success: false,
      message: "Internal Server Error",
      error: err.message,
    });
  }
};

const updateProductImage = async (req, res) => {
  try {
    const { product_image_id } = req.params;
    const result = await updateProductImageService(product_image_id, req.body);
    if (!result.success) {
      return res.status(400).json(result);
    }
    res.status(200).json(result);
  } catch (err) {
    console.error("Error in updateProductImage: ", err);
    res.status(500).json({
      success: false,
      message: "Internal Server Error",
      error: err.message,
    });
  }
};

const deleteProductImage = async (req, res) => {
  try {
    const { product_image_id } = req.params;
    const result = await deleteProductImageService(product_image_id);
    if (!result.success) {
      return res.status(400).json(result);
    }
    res.status(200).json(result);
  } catch (err) {
    console.error("Error in deleteProductImage: ", err);
    res.status(500).json({
      success: false,
      message: "Internal Server Error",
      error: err.message,
    });
  }
};

export {
  getAllProductImages,
  getProductImageById,
  createProductImage,
  updateProductImage,
  deleteProductImage,
};
