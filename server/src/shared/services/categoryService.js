import db from "../../shared/models/index.js";
import { Op } from "sequelize";

const getAllCategories = async () => {
  try {
    const categories = await db.Category.findAll({
      order: [["category_id", "DESC"]], // Sử dụng category_id thay vì created_at
    });

    if (!categories) return { success: false, message: "No categories found" };

    // Thêm số lượng sản phẩm cho mỗi category
    const categoriesWithProductCount = await Promise.all(
      categories.map(async (category) => {
        const productCount = await db.Product.count({
          where: { category_id: category.category_id },
        });

        return {
          ...category.toJSON(),
          product_count: productCount,
        };
      })
    );

    return { success: true, categories: categoriesWithProductCount };
  } catch (error) {
    console.error("Error in getAllCategories:", error);
    return { success: false, message: "Internal server error" };
  }
};

const getCategoryById = async (category_id) => {
  try {
    if (!category_id) {
      return { success: false, message: "Category ID is required" };
    }

    const category = await db.Category.findOne({
      where: { category_id },
    });

    if (!category) {
      return { success: false, message: "Category not found" };
    }

    // Thêm số lượng sản phẩm
    const productCount = await db.Product.count({
      where: { category_id },
    });

    return {
      success: true,
      category: {
        ...category.toJSON(),
        product_count: productCount,
      },
    };
  } catch (error) {
    console.error("Error in getCategoryById:", error);
    return { success: false, message: "Internal server error" };
  }
};

const createCategory = async (categoryData) => {
  try {
    const { category_name, category_description } = categoryData;

    if (!category_name) {
      return { success: false, message: "Category name is required" };
    }

    // Kiểm tra xem category đã tồn tại chưa
    const existingCategory = await db.Category.findOne({
      where: { category_name },
    });

    if (existingCategory) {
      return { success: false, message: "Category already exists" };
    }

    const category = await db.Category.create({
      category_name,
      category_description,
    });

    return {
      success: true,
      category: {
        ...category.toJSON(),
        product_count: 0,
      },
    };
  } catch (error) {
    console.error("Error in createCategory:", error);
    return { success: false, message: "Internal server error" };
  }
};

const updateCategory = async (category_id, categoryData) => {
  try {
    if (!category_id) {
      return { success: false, message: "Category ID is required" };
    }

    const category = await db.Category.findOne({ where: { category_id } });
    if (!category) {
      return { success: false, message: "Category not found" };
    }

    const { category_name, category_description } = categoryData;

    // Kiểm tra tên category trùng (ngoại trừ chính nó)
    if (category_name && category_name !== category.category_name) {
      const existingCategory = await db.Category.findOne({
        where: {
          category_name,
          category_id: { [db.Sequelize.Op.ne]: category_id },
        },
      });

      if (existingCategory) {
        return { success: false, message: "Category name already exists" };
      }
    }

    await category.update({
      category_name: category_name || category.category_name,
      category_description:
        category_description !== undefined
          ? category_description
          : category.category_description,
    });

    // Thêm số lượng sản phẩm
    const productCount = await db.Product.count({
      where: { category_id },
    });

    return {
      success: true,
      category: {
        ...category.toJSON(),
        product_count: productCount,
      },
    };
  } catch (error) {
    console.error("Error in updateCategory:", error);
    return { success: false, message: "Internal server error" };
  }
};

const deleteCategory = async (category_id) => {
  try {
    if (!category_id) {
      return { success: false, message: "Category ID is required" };
    }

    const category = await db.Category.findOne({ where: { category_id } });
    if (!category) {
      return { success: false, message: "Category not found" };
    }

    // Kiểm tra xem có products liên quan không
    const products = await db.Product.findAll({ where: { category_id } });
    if (products.length > 0) {
      return {
        success: false,
        message:
          "Cannot delete category. There are products associated with this category.",
      };
    }

    await category.destroy();
    return { success: true, message: "Category deleted successfully" };
  } catch (error) {
    console.error("Error in deleteCategory:", error);
    return { success: false, message: "Internal server error" };
  }
};

// Get categories with pagination
const getCategoriesPaginated = async (search, limit, page) => {
  try {
    const offset = (page - 1) * limit;
    const where = {};

    // Search by category_name only
    if (search) {
      where.category_name = { [Op.substring]: search };
    }

    // Get total count
    const total = await db.Category.count({ where });

    // Get paginated results
    const categories = await db.Category.findAll({
      where,
      limit,
      offset,
      order: [["category_id", "DESC"]],
    });

    // Add product count for each category
    const categoriesWithProductCount = await Promise.all(
      categories.map(async (category) => {
        const productCount = await db.Product.count({
          where: { category_id: category.category_id },
        });

        return {
          ...category.toJSON(),
          product_count: productCount,
        };
      })
    );

    return {
      success: true,
      categories: categoriesWithProductCount,
      total,
      page,
      totalPages: Math.ceil(total / limit),
    };
  } catch (error) {
    console.error("Error getting paginated categories:", error);
    return { success: false, message: error.message };
  }
};

export {
  getAllCategories,
  getCategoryById,
  getCategoriesPaginated,
  createCategory,
  updateCategory,
  deleteCategory,
};
