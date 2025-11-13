import {
  getAllProducts as getAllProductsService,
  getProductById as getProductByIdService,
  createProduct as createProductService,
  updateProduct as updateProductService,
  deleteProduct as deleteProductService,
  setProductLockStatus as setProductLockStatusService,
  generateExcelTemplate as generateExcelTemplateService,
  importProductsFromExcel as importProductsFromExcelService,
  importProductsWithVariants as importProductsWithVariantsService,
  importInventoryStock as importInventoryStockService,
  getProductsPaginated as getProductsPaginatedService,
} from "../../shared/services/productService.js";
import db from "../../shared/models/index.js";

const getProductsPaginated = async (req, res) => {
  try {
    const {
      search = "",
      limit = 15,
      page = 1,
      category,
      sport,
      tournament,
      team,
      minPrice,
      maxPrice,
    } = req.query;

    console.log("[Controller] getProductsPaginated query params:", {
      search,
      limit,
      page,
      category,
      sport,
      tournament,
      team,
      minPrice,
      maxPrice,
    });

    const result = await getProductsPaginatedService({
      search,
      limit,
      page,
      category,
      sport,
      tournament,
      team,
      minPrice,
      maxPrice,
    });

    console.log("[Controller] Result total:", result.totalProducts);

    res.json(result);
  } catch (err) {
    res.status(500).json({
      success: false,
      message: "Internal Server Error",
      error: err.message,
    });
  }
};

const getAllProducts = async (req, res) => {
  try {
    const result = await getAllProductsService();

    if (!result) {
      return res.status(400).json(result);
    }

    res.status(200).json(result);
  } catch (err) {
    console.error("Error in getAllProducts: ", err);
    console.error("Error stack: ", err.stack);
    console.error("Error message: ", err.message);
    res.status(500).json({
      success: false,
      message: "Internal Server Error",
      error: err.message, // Thêm dòng này để debug
    });
  }
};

const getProductById = async (req, res) => {
  try {
    const { id } = req.params;
    const result = await getProductByIdService(id);

    if (!result.success) {
      return res.status(404).json(result);
    }

    res.status(200).json(result);
  } catch (error) {
    console.error("Error in getProductById controller:", error);
    res.status(500).json({
      success: false,
      message: "Internal Server Error",
      error: error.message,
    });
  }
};

const createProduct = async (req, res) => {
  try {
    const result = await createProductService(req.body);

    if (!result.success) {
      return res.status(400).json(result);
    }

    res.status(201).json(result);
  } catch (error) {
    console.error("Error in createProduct controller:", error);
    res.status(500).json({
      success: false,
      message: "Internal Server Error",
      error: error.message,
    });
  }
};

const updateProduct = async (req, res) => {
  try {
    const { id } = req.params;
    const result = await updateProductService(id, req.body);

    if (!result.success) {
      return res.status(400).json(result);
    }

    res.status(200).json(result);
  } catch (error) {
    console.error("Error in updateProduct controller:", error);
    res.status(500).json({
      success: false,
      message: "Internal Server Error",
      error: error.message,
    });
  }
};

const deleteProduct = async (req, res) => {
  try {
    const { id } = req.params;
    const result = await deleteProductService(id);

    if (!result.success) {
      return res.status(400).json(result);
    }

    res.status(200).json(result);
  } catch (error) {
    console.error("Error in deleteProduct controller:", error);
    res.status(500).json({
      success: false,
      message: "Internal Server Error",
      error: error.message,
    });
  }
};

const setProductLockStatus = async (req, res) => {
  try {
    const { id } = req.params;
    const { is_active } = req.body;
    const result = await setProductLockStatusService(id, is_active);

    if (!result.success) {
      return res.status(400).json(result);
    }

    res.status(200).json(result);
  } catch (err) {
    console.error("Error in setProductLockStatus controller: ", err);
    res.status(500).json({
      success: false,
      message: "Internal Server Error",
      error: err.message,
    });
  }
};

const downloadExcelTemplate = async (req, res) => {
  try {
    const { supplier_id, teams } = req.body;

    // Validate input
    if (!supplier_id) {
      return res
        .status(400)
        .json({ success: false, message: "supplier_id is required" });
    }
    if (!teams || !Array.isArray(teams) || teams.length === 0) {
      return res
        .status(400)
        .json({ success: false, message: "teams array is required" });
    }

    // Lấy categories từ database
    const categories = await db.Category.findAll({
      attributes: ["category_id", "category_name"],
    });

    // Gọi service để tạo Excel template
    const buffer = await generateExcelTemplateService(
      supplier_id,
      teams,
      categories
    );

    // Trả về file Excel
    res.setHeader(
      "Content-Type",
      "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet"
    );
    res.setHeader(
      "Content-Disposition",
      `attachment; filename=product_template_supplier_${supplier_id}.xlsx`
    );
    res.send(buffer);
  } catch (err) {
    console.error("Error in downloadExcelTemplate controller:", err);
    res.status(500).json({
      success: false,
      message: "Lỗi tạo template",
      error: err.message,
    });
  }
};

const importProductsFromExcel = async (req, res) => {
  try {
    // Sửa: kiểm tra đúng field
    if (!req.files || !req.files.excel || req.files.excel.length === 0) {
      return res.status(400).json({
        success: false,
        message: "Excel file is required",
      });
    }

    // Lấy file Excel
    const excelFile = req.files.excel[0];

    // Get uploaded images from request (if any)
    const uploadedImages = req.files.images || [];

    // Read the Excel file buffer
    const fs = await import("fs/promises");
    const buffer = await fs.readFile(excelFile.path);

    const result = await importProductsFromExcelService(buffer, uploadedImages);

    // Clean up uploaded file
    await fs.unlink(excelFile.path);

    if (!result.success) {
      return res.status(400).json(result);
    }

    res.status(201).json(result);
  } catch (error) {
    console.error("Error in importProductsFromExcel controller:", error);
    res.status(500).json({
      success: false,
      message: "Internal Server Error",
      error: error.message,
    });
  }
};

const importProductsWithVariants = async (req, res) => {
  try {
    // Sửa: kiểm tra đúng field như importProductsFromExcel
    if (!req.files || !req.files.excel || req.files.excel.length === 0) {
      return res.status(400).json({
        success: false,
        message: "Excel file is required",
      });
    }

    // Lấy file Excel
    const excelFile = req.files.excel[0];

    // Get uploaded images from request (if any)
    const uploadedImages = req.files.images || [];

    // Read the Excel file buffer
    const fs = await import("fs/promises");
    const buffer = await fs.readFile(excelFile.path);

    const result = await importProductsWithVariantsService(
      buffer,
      uploadedImages
    );

    // Clean up uploaded files
    await fs.unlink(excelFile.path);
    for (const img of uploadedImages) {
      try {
        if (img.path && !img.path.startsWith("http")) {
          // Không xóa nếu đã upload lên cloud
          await fs.unlink(img.path);
        }
      } catch (err) {
        console.error("Error deleting image:", err);
      }
    }

    if (!result.success) {
      return res.status(400).json(result);
    }

    res.status(201).json(result);
  } catch (error) {
    console.error("Error in importProductsWithVariants controller:", error);
    res.status(500).json({
      success: false,
      message: "Internal Server Error",
      error: error.message,
    });
  }
};

const importInventoryStock = async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({
        success: false,
        message: "No file uploaded",
      });
    }

    const excelFile = req.file;

    // Read the Excel file buffer
    const fs = await import("fs/promises");
    const buffer = await fs.readFile(excelFile.path);

    const result = await importInventoryStockService(buffer);

    // Clean up uploaded file
    await fs.unlink(excelFile.path);

    if (!result.success) {
      return res.status(400).json(result);
    }

    res.status(200).json(result);
  } catch (error) {
    console.error("Error in importInventoryStock controller:", error);
    res.status(500).json({
      success: false,
      message: "Internal Server Error",
      error: error.message,
    });
  }
};

export {
  getAllProducts,
  getProductById,
  createProduct,
  updateProduct,
  deleteProduct,
  setProductLockStatus,
  downloadExcelTemplate,
  importProductsFromExcel,
  importProductsWithVariants,
  importInventoryStock,
  getProductsPaginated,
};
