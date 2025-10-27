import db from "../models/index.js";

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
      return {
        ...product.toJSON(),
        average_rating,
      };
    })
  );

  return productsWithRating;
};

const getProductById = async (product_id) => {
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

  // Thêm average_rating vào object trả về
  const average_rating = await getProductRating(product_id);

  return {
    success: true,
    product: {
      ...product.toJSON(),
      average_rating,
    },
  };
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
      variant_id: variantIds, // Lọc theo các variant của sản phẩm
    },
  });

  return ratings?.get("average_rating") || 0;
};

export {
  getAllProducts,
  getProductById,
  getTopRatedProducts,
  getFilteredProducts,
  getProductBySport,
  searchProducts,
  getProductRating,
};
