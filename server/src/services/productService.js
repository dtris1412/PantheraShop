import db from "../models/index.js";

const getAllProducts = async () => {
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

export { getAllProducts, getProductById, getTopRatedProducts };
