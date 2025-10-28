import {
  getAllProducts as getAllProductsService,
  getTopRatedProducts as getTopRatedProductsService,
  getFilteredProducts as getFilteredProductsService,
  getProductBySport as getProductBySportService,
  getProductById as getProductByIdService,
  searchProducts as searchProductsService,
  getRelatedProducts as getRelatedProductsService,
} from "../../shared/services/productService.js";

const getAllProducts = async (req, res) => {
  try {
    const products = await getAllProductsService();
    if (!products) {
      res.status(404).json({ message: "No products found" });
    }
    res.status(200).json(products);
  } catch (err) {
    console.error("Error in getAllProducts: ", err);

    res.status(500).json({ message: "Server error" });
  }
};

const getTopRatedProducts = async (req, res) => {
  try {
    const result = await getTopRatedProductsService(10);
    if (!result.success) {
      return res.status(400).json(result);
    }
    res.status(200).json(result.products);
  } catch (err) {
    console.error("Error in getTopRatedProducts: ", err);
    res.status(500).json({ message: "Server error" });
  }
};

const getFilteredProducts = async (req, res) => {
  try {
    const filters = req.body;
    const result = await getFilteredProductsService(filters);
    if (!result.success) {
      return res.status(400).json(result);
    }
    res.status(200).json(result.products);
  } catch (err) {
    console.log("Error in getFilteredProducts: ", err);
    res.status(500).json({ message: "Server error" });
  }
};

const getProductBySport = async (req, res) => {
  try {
    const { sport_id } = req.params;
    const result = await getProductBySportService(sport_id);
    if (!result.success) {
      return res.status(400).json(result);
    }
    res.status(200).json(result.attributes);
  } catch (err) {
    console.log("Error in getProductBySport: ", err);
    res.status(500).json({ message: "Server error" });
  }
};

const getProductById = async (req, res) => {
  try {
    const { product_id } = req.params;
    const result = await getProductByIdService(product_id);
    if (!result.success) {
      return res.status(400).json(result);
    }
    res.status(200).json(result.product);
  } catch (err) {
    console.error("Error in getProductById: ", err);
    res.status(500).json({ message: "Server error" });
  }
};

const searchProducts = async (req, res) => {
  try {
    const { query } = req.query;
    const products = await searchProductsService(query);
    res.status(200).json(products);
  } catch (err) {
    console.error("Error in searchProducts: ", err);
    res.status(500).json({ message: "Server error" });
  }
};

const getRelatedProducts = async (req, res) => {
  try {
    const { product_id } = req.params;
    const result = await getRelatedProductsService(product_id);
    if (!result.success) {
      return res.status(400).json(result);
    }
    res.status(200).json(result.products);
  } catch (err) {
    console.error("Error in getRelatedProducts: ", err);
    res.status(500).json({ message: "Internal server error" });
  }
};
export {
  getAllProducts,
  getTopRatedProducts,
  getFilteredProducts,
  getProductBySport,
  getProductById,
  searchProducts,
  getRelatedProducts,
};
