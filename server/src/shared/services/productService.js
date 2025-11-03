import db from "../../shared/models/index.js";

const getAllProducts = async () => {
  const products = await db.Product.findAll({
    include: [
      {
        model: db.Category,
        attributes: ["category_id", "category_name"],
      },
      {
        model: db.Product_Image,
        attributes: ["product_image_id", "image_url", "order"],
      },
      {
        model: db.Team,
        include: [
          {
            model: db.Tournament,
            include: [
              {
                model: db.Sport,
                attributes: ["sport_id", "sport_name"],
              },
            ],
          },
        ],
      },
    ],
  });

  if (!products) return [];

  // Tính rating cho từng sản phẩm
  const productsWithRating = await Promise.all(
    products.map(async (product) => {
      const average_rating = await getProductRating(product.product_id);
      const stock = await getProductStock(product.product_id);
      return {
        ...product.toJSON(),
        average_rating,
        stock,
      };
    })
  );

  return productsWithRating;
};

const getProductById = async (product_id) => {
  try {
    if (!product_id) {
      return { success: false, message: "Missing product_id" };
    }

    const product = await db.Product.findOne({
      where: { product_id },
      include: [
        {
          model: db.Category,
          attributes: ["category_id", "category_name"],
        },
        {
          model: db.Product_Image,
          attributes: ["product_image_id", "image_url", "order"],
        },
        {
          model: db.Team,
          include: [
            {
              model: db.Tournament,
              include: [
                {
                  model: db.Sport,
                  attributes: ["sport_id", "sport_name"],
                },
              ],
            },
          ],
        },
        {
          model: db.Variant,
        },
      ],
    });

    if (!product) {
      return { success: false, message: "Product not found" };
    }

    // Thêm average_rating vào object trả về với error handling
    let average_rating = 0;
    try {
      average_rating = await getProductRating(product_id);
    } catch (ratingError) {
      console.error("Error getting product rating:", ratingError);
      // Tiếp tục với rating = 0 thay vì crash
    }

    // Thêm stock với error handling
    let stock = 0;
    try {
      stock = await getProductStock(product_id);
    } catch (stockError) {
      console.error("Error getting product stock:", stockError);
      // Tiếp tục với stock = 0 thay vì crash
    }

    return {
      success: true,
      product: {
        ...product.toJSON(),
        average_rating,
        stock,
      },
    };
  } catch (error) {
    console.error("Error in getProductById service:", error);
    return {
      success: false,
      message: "Error fetching product details",
      error: error.message,
    };
  }
};

const getTopRatedProducts = async () => {
  // Lấy tất cả sản phẩm (hoặc giới hạn số lượng nếu cần)
  const products = await db.Product.findAll({
    include: [
      {
        model: db.Category,
        attributes: ["category_id", "category_name"],
      },
      {
        model: db.Product_Image,
        attributes: ["product_image_id", "image_url", "order"],
      },
      {
        model: db.Team,
        include: [
          {
            model: db.Tournament,
            include: [
              {
                model: db.Sport,
                attributes: ["sport_id", "sport_name"],
              },
            ],
          },
        ],
      },
    ],
  });

  // Gắn rating cho từng sản phẩm
  const productsWithRating = await Promise.all(
    products.map(async (product) => {
      const average_rating = await getProductRating(product.product_id);
      return {
        ...product.toJSON(),
        average_rating: Number(average_rating) || 0,
      };
    })
  );

  // Sắp xếp theo rating giảm dần
  productsWithRating.sort((a, b) => b.average_rating - a.average_rating);

  // Trả về top 10 sản phẩm
  return productsWithRating.slice(0, 10);
};

const getFilteredProducts = async (filters) => {
  const {
    sport_id,
    tournament_id,
    team_id,
    category_id,
    minPrice,
    maxPrice,
    newest,
  } = filters;

  // Xây dựng include động
  const include = [];
  if (team_id || tournament_id || sport_id) {
    const teamInclude = {
      model: db.Team,
      required: !!team_id || !!tournament_id || !!sport_id,
      where: team_id ? { team_id } : undefined,
      include: [],
    };
    if (tournament_id || sport_id) {
      const tournamentInclude = {
        model: db.Tournament,
        required: !!tournament_id || !!sport_id,
        where: tournament_id ? { tournament_id } : undefined,
        include: [],
      };
      if (sport_id) {
        tournamentInclude.include.push({
          model: db.Sport,
          required: true,
          where: { sport_id },
        });
      }
      teamInclude.include.push(tournamentInclude);
    }
    include.push(teamInclude);
  }
  if (category_id) {
    include.push({
      model: db.Category,
      required: true,
      where: { category_id },
    });
  }

  // Điều kiện where cho Product
  const where = {};
  if (minPrice !== undefined)
    where.product_price = {
      ...where.product_price,
      [db.Sequelize.Op.gte]: minPrice,
    };
  if (maxPrice !== undefined)
    where.product_price = {
      ...where.product_price,
      [db.Sequelize.Op.lte]: maxPrice,
    };

  // Sắp xếp mới nhất
  const order = newest ? [["release_date", "DESC"]] : [];

  const products = await db.Product.findAll({
    where,
    include,
    order,
  });
  return products;
};

const getProductBySport = async (sport_id) => {
  if (!sport_id) {
    return { success: false, message: "Missing sport_id" };
  }
  const products = await db.Product.findAll({
    include: [
      {
        model: db.Team,
        include: [
          {
            model: db.Tournament,
            include: [
              {
                model: db.Sport,
                where: { sport_id },
                attributes: ["sport_id", "sport_name"],
              },
            ],
          },
        ],
      },
    ],
  });
  if (!products || products.length === 0) {
    return { success: false, message: "No products found for this Sport ID" };
  }
  return { success: true, attributes: products.map((p) => p.sport_id) };
};

const searchProducts = async (keyword) => {
  if (!keyword || typeof keyword !== "string") return [];
  const Op = db.Sequelize.Op;
  const products = await db.Product.findAll({
    where: {
      product_name: {
        [Op.substring]: keyword,
      },
    },
    limit: 20, // giới hạn kết quả trả về
    attributes: [
      "product_id",
      "product_name",
      "product_image",
      "product_price",
    ],
  });
  return products;
};

const getProductRating = async (product_id) => {
  try {
    const variants = await db.Variant.findAll({
      where: { product_id },
      attributes: ["variant_id"],
    });

    const variantIds = variants.map((v) => v.variant_id);

    if (variantIds.length === 0) return 0;

    const ratings = await db.OrderProductReview.findOne({
      attributes: [
        [db.Sequelize.fn("AVG", db.Sequelize.col("rating")), "average_rating"],
      ],
      where: {
        variant_id: variantIds,
      },
    });

    const avgRating = ratings?.get("average_rating");
    return avgRating ? parseFloat(avgRating) : 0;
  } catch (error) {
    console.error("Error in getProductRating:", error);
    return 0; // Trả về 0 thay vì crash
  }
};

const getRelatedProducts = async (product_id) => {
  const product = await db.Product.findByPk(product_id, {
    include: [
      {
        model: db.Team,
        required: true,
        include: [
          {
            model: db.Tournament,
            required: true,
            include: [
              {
                model: db.Sport,
                required: true,
                attributes: ["sport_id"],
              },
            ],
          },
        ],
      },
    ],
  });
  if (!product) return [];

  // Lấy tất cả sport_id liên quan
  let sportIds = [];
  if (product.Team) {
    const teams = Array.isArray(product.Team) ? product.Team : [product.Team];
    teams.forEach((team) => {
      if (team.Tournament) {
        const tournaments = Array.isArray(team.Tournament)
          ? team.Tournament
          : [team.Tournament];
        tournaments.forEach((tournament) => {
          if (tournament.Sport) {
            const sports = Array.isArray(tournament.Sport)
              ? tournament.Sport
              : [tournament.Sport];
            sports.forEach((sport) => {
              if (sport.sport_id) sportIds.push(sport.sport_id);
            });
          }
        });
      }
    });
  }
  sportIds = [...new Set(sportIds)]; // loại bỏ trùng lặp

  if (!sportIds.length) return { success: true, products: [] };

  // Lấy các sản phẩm liên quan cùng sport_id
  const { Op } = db.Sequelize;
  const related = await db.Product.findAll({
    include: [
      {
        model: db.Team,
        required: true,
        include: [
          {
            model: db.Tournament,
            required: true,
            include: [
              {
                model: db.Sport,
                required: true,
                where: { sport_id: { [Op.in]: sportIds } },
              },
            ],
          },
        ],
      },
    ],
    where: {
      product_id: { [Op.ne]: product_id },
    },
    limit: 15,
  });

  return { success: true, products: related };
};

const getProductStock = async (product_id) => {
  const stock = await db.Variant.sum("variant_stock", {
    where: { product_id },
  });
  return stock || 0;
};

const createProduct = async (productData) => {
  try {
    const {
      product_name,
      product_description,
      product_price,
      category_id,
      team_id,
      product_image,
      variants = [],
      images = [],
    } = productData;

    if (!product_name) {
      return { success: false, message: "Product name is required" };
    }

    if (!product_price) {
      return { success: false, message: "Product price is required" };
    }

    if (!category_id) {
      return { success: false, message: "Category ID is required" };
    }

    // Kiểm tra category tồn tại
    const category = await db.Category.findOne({ where: { category_id } });
    if (!category) {
      return { success: false, message: "Category not found" };
    }

    // Kiểm tra team tồn tại (nếu có)
    if (team_id) {
      const team = await db.Team.findOne({ where: { team_id } });
      if (!team) {
        return { success: false, message: "Team not found" };
      }
    }

    // Tạo sản phẩm
    const product = await db.Product.create({
      product_name,
      product_description,
      product_price,
      category_id,
      team_id: team_id || null,
      product_image,
    });

    // Tạo variants nếu có
    if (variants && variants.length > 0) {
      const variantPromises = variants.map((variant) =>
        db.Variant.create({
          ...variant,
          product_id: product.product_id,
        })
      );
      await Promise.all(variantPromises);
    }

    // Tạo product images nếu có
    if (images && images.length > 0) {
      const imagePromises = images.map((image, index) =>
        db.Product_Image.create({
          product_id: product.product_id,
          image_url: image.image_url,
          order: image.order || index + 1,
        })
      );
      await Promise.all(imagePromises);
    }

    // Load product với relations
    const createdProduct = await db.Product.findOne({
      where: { product_id: product.product_id },
      include: [
        {
          model: db.Category,
          attributes: ["category_id", "category_name"],
        },
        {
          model: db.Team,
          include: [
            {
              model: db.Tournament,
              include: [
                {
                  model: db.Sport,
                  attributes: ["sport_id", "sport_name"],
                },
              ],
            },
          ],
        },
        {
          model: db.Variant,
        },
        {
          model: db.Product_Image,
        },
      ],
    });

    return { success: true, product: createdProduct };
  } catch (error) {
    console.error("Error in createProduct:", error);
    return { success: false, message: "Internal server error" };
  }
};

const updateProduct = async (product_id, productData) => {
  try {
    if (!product_id) {
      return { success: false, message: "Product ID is required" };
    }

    const product = await db.Product.findOne({ where: { product_id } });
    if (!product) {
      return { success: false, message: "Product not found" };
    }

    const {
      product_name,
      product_description,
      product_price,
      category_id,
      team_id,
      product_image,
      variants,
      images,
    } = productData;

    // Kiểm tra category tồn tại (nếu có thay đổi)
    if (category_id && category_id !== product.category_id) {
      const category = await db.Category.findOne({ where: { category_id } });
      if (!category) {
        return { success: false, message: "Category not found" };
      }
    }

    // Kiểm tra team tồn tại (nếu có thay đổi)
    if (team_id && team_id !== product.team_id) {
      const team = await db.Team.findOne({ where: { team_id } });
      if (!team) {
        return { success: false, message: "Team not found" };
      }
    }

    // Cập nhật sản phẩm
    await product.update({
      product_name: product_name || product.product_name,
      product_description:
        product_description !== undefined
          ? product_description
          : product.product_description,
      product_price: product_price || product.product_price,
      category_id: category_id || product.category_id,
      team_id: team_id !== undefined ? team_id : product.team_id,
      product_image:
        product_image !== undefined ? product_image : product.product_image,
    });

    // Cập nhật variants nếu có
    if (variants) {
      // Xóa các variants cũ
      await db.Variant.destroy({ where: { product_id } });

      // Tạo variants mới
      if (variants.length > 0) {
        const variantPromises = variants.map((variant) =>
          db.Variant.create({
            ...variant,
            product_id,
          })
        );
        await Promise.all(variantPromises);
      }
    }

    // Cập nhật images nếu có
    if (images) {
      // Xóa images cũ
      await db.Product_Image.destroy({ where: { product_id } });

      // Tạo images mới
      if (images.length > 0) {
        const imagePromises = images.map((image, index) =>
          db.Product_Image.create({
            product_id,
            image_url: image.image_url,
            order: image.order || index + 1,
          })
        );
        await Promise.all(imagePromises);
      }
    }

    // Load updated product với relations
    const updatedProduct = await db.Product.findOne({
      where: { product_id },
      include: [
        {
          model: db.Category,
          attributes: ["category_id", "category_name"],
        },
        {
          model: db.Team,
          include: [
            {
              model: db.Tournament,
              include: [
                {
                  model: db.Sport,
                  attributes: ["sport_id", "sport_name"],
                },
              ],
            },
          ],
        },
        {
          model: db.Variant,
        },
        {
          model: db.Product_Image,
        },
      ],
    });

    return { success: true, product: updatedProduct };
  } catch (error) {
    console.error("Error in updateProduct:", error);
    return { success: false, message: "Internal server error" };
  }
};

const deleteProduct = async (product_id) => {
  try {
    if (!product_id) {
      return { success: false, message: "Product ID is required" };
    }

    const product = await db.Product.findOne({ where: { product_id } });
    if (!product) {
      return { success: false, message: "Product not found" };
    }

    // Xóa các bảng liên quan
    await db.Variant.destroy({ where: { product_id } });
    await db.Product_Image.destroy({ where: { product_id } });

    // Xóa sản phẩm
    await product.destroy();

    return { success: true, message: "Product deleted successfully" };
  } catch (error) {
    console.error("Error in deleteProduct:", error);
    return { success: false, message: "Internal server error" };
  }
};

const setProductLockStatus = async (product_id, is_active) => {
  try {
    if (!product_id) {
      return { success: false, message: "Product ID is required" };
    }

    const product = await db.Product.findOne({ where: { product_id } });
    if (!product) {
      return { success: false, message: "Product not found" };
    }

    await product.update({ is_active });
    return { success: true, product };
  } catch (err) {
    console.error("Error in setProductLockStatus:", err);
    return { success: false, message: "Internal server error" };
  }
};

export {
  getAllProducts,
  getProductById,
  getTopRatedProducts,
  getFilteredProducts,
  getProductBySport,
  searchProducts,
  getProductRating,
  getRelatedProducts,
  createProduct,
  updateProduct,
  deleteProduct,
  setProductLockStatus,
};
