import {
  getAllProductImages as getAllProductImagesService,
  getProductImageById as getProductImageByIdService,
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

export { getAllProductImages, getProductImageById };
