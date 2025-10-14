import db from "../models/index.js";

const getAllProducts = async () => {
  const products = await db.Product.findAll({
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
    ],
  });
  if (!products) return [];
  return products;
};

const getProductById = async (product_id) => {
  if (!product_id) {
    return { success: false, message: "Missing product_id" };
  }
  const product = await db.Product.findOne({
    where: { product_id },
    include: [
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
  if (!product) {
    return { success: false, message: "Product not found" };
  }
  return { success: true, product };
};

const getTopRatedProducts = async (limit) => {
  try {
    const products = await db.Product.findAll({
      order: [["product_rating", "DESC"]],
      limit,
      include: [
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
    return { success: true, products };
  } catch (error) {
    console.error("Error in getTopRatedProducts:", error);
    return { success: false, message: "Error fetching top rated products" };
  }
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
};

export {
  getAllProducts,
  getProductById,
  getTopRatedProducts,
  getFilteredProducts,
};
