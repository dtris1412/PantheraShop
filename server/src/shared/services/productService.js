import db from "../../shared/models/index.js";

function parseIdFromString(str) {
  if (!str) return null;
  const parts = str.split(":");
  return parseInt(parts[0].trim(), 10);
}

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
      supplier_id,
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
      supplier_id,
      created_at: new Date(),
      updated_at: new Date(),
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
      supplier_id,
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
      supplier_id:
        supplier_id !== undefined ? supplier_id : product.supplier_id,
      product_image:
        product_image !== undefined ? product_image : product.product_image,
      updated_at: new Date(),
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

const generateExcelTemplate = async (supplier_id, teams, categories) => {
  try {
    const ExcelJS = (await import("exceljs")).default;
    const workbook = new ExcelJS.Workbook();
    const sheet = workbook.addWorksheet("Products");

    // Header - Bỏ created_at và updated_at
    sheet.columns = [
      { header: "product_id", key: "product_id", width: 12 },
      { header: "product_name", key: "product_name", width: 30 },
      { header: "product_price", key: "product_price", width: 15 },
      { header: "product_description", key: "product_description", width: 40 },
      { header: "release_date", key: "release_date", width: 18 },
      { header: "product_image", key: "product_image", width: 30 },
      { header: "team_id", key: "team_id", width: 30 },
      { header: "category_id", key: "category_id", width: 30 },
      { header: "is_active", key: "is_active", width: 12 },
      { header: "supplier_id", key: "supplier_id", width: 15 },
    ];

    // Style header row
    sheet.getRow(1).font = { bold: true };
    sheet.getRow(1).fill = {
      type: "pattern",
      pattern: "solid",
      fgColor: { argb: "FFD3D3D3" },
    };

    // Add sample row
    const sampleTeam =
      teams.length > 0 ? `${teams[0].team_id}: ${teams[0].team_name}` : "";
    const sampleCategory =
      categories.length > 0
        ? `${categories[0].category_id}: ${categories[0].category_name}`
        : "";

    sheet.addRow({
      product_id: "",
      product_name: "Áo đấu Manchester City",
      product_price: 1200000,
      product_description: "Áo đấu chính hãng mùa 2025",
      release_date: new Date().toISOString().slice(0, 10),
      product_image: "man-city-2025.jpg",
      team_id: sampleTeam,
      category_id: sampleCategory,
      is_active: 1,
      supplier_id: supplier_id,
    });

    // Sheet hướng dẫn cho Teams
    const teamsSheet = workbook.addWorksheet("TEAM Reference");
    teamsSheet.columns = [
      { header: "TEAM (Chọn format: id: name)", key: "team", width: 50 },
    ];
    teamsSheet.getRow(1).font = { bold: true };
    teamsSheet.getRow(1).fill = {
      type: "pattern",
      pattern: "solid",
      fgColor: { argb: "FF4472C4" },
    };
    teams.forEach((team) => {
      teamsSheet.addRow({ team: `${team.team_id}: ${team.team_name}` });
    });

    // Sheet hướng dẫn cho Categories
    const categoriesSheet = workbook.addWorksheet("CATEGORY Reference");
    categoriesSheet.columns = [
      {
        header: "CATEGORY (Chọn format: id: name)",
        key: "category",
        width: 50,
      },
    ];
    categoriesSheet.getRow(1).font = { bold: true };
    categoriesSheet.getRow(1).fill = {
      type: "pattern",
      pattern: "solid",
      fgColor: { argb: "FF70AD47" },
    };
    categories.forEach((cat) => {
      categoriesSheet.addRow({
        category: `${cat.category_id}: ${cat.category_name}`,
      });
    });

    // Add data validation dropdown cho team_id (column G - vì bỏ created_at và updated_at)
    if (teams.length > 0) {
      const teamList = teams
        .map((t) => `${t.team_id}: ${t.team_name}`)
        .join(",");
      // Nếu danh sách quá dài (>255 ký tự), sử dụng formula tham chiếu đến sheet
      if (teamList.length <= 255) {
        for (let rowNum = 2; rowNum <= 1000; rowNum++) {
          sheet.getCell(`G${rowNum}`).dataValidation = {
            type: "list",
            allowBlank: false,
            formulae: [`"${teamList}"`],
            showErrorMessage: true,
            errorStyle: "error",
            errorTitle: "Invalid Team",
            error: "Vui lòng chọn team từ danh sách (format: id: name)",
          };
        }
      } else {
        // Sử dụng formula tham chiếu đến sheet reference
        const teamSheetRange = `'TEAM Reference'!$A$2:$A$${teams.length + 1}`;
        for (let rowNum = 2; rowNum <= 1000; rowNum++) {
          sheet.getCell(`G${rowNum}`).dataValidation = {
            type: "list",
            allowBlank: false,
            formulae: [teamSheetRange],
            showErrorMessage: true,
            errorStyle: "error",
            errorTitle: "Invalid Team",
            error: "Vui lòng chọn team từ danh sách (format: id: name)",
          };
        }
      }
    }

    // Add data validation dropdown cho category_id (column H)
    if (categories.length > 0) {
      const categoryList = categories
        .map((c) => `${c.category_id}: ${c.category_name}`)
        .join(",");
      if (categoryList.length <= 255) {
        for (let rowNum = 2; rowNum <= 1000; rowNum++) {
          sheet.getCell(`H${rowNum}`).dataValidation = {
            type: "list",
            allowBlank: false,
            formulae: [`"${categoryList}"`],
            showErrorMessage: true,
            errorStyle: "error",
            errorTitle: "Invalid Category",
            error: "Vui lòng chọn category từ danh sách (format: id: name)",
          };
        }
      } else {
        // Sử dụng formula tham chiếu đến sheet reference
        const categorySheetRange = `'CATEGORY Reference'!$A$2:$A$${
          categories.length + 1
        }`;
        for (let rowNum = 2; rowNum <= 1000; rowNum++) {
          sheet.getCell(`H${rowNum}`).dataValidation = {
            type: "list",
            allowBlank: false,
            formulae: [categorySheetRange],
            showErrorMessage: true,
            errorStyle: "error",
            errorTitle: "Invalid Category",
            error: "Vui lòng chọn category từ danh sách (format: id: name)",
          };
        }
      }
    }

    // Add notes
    sheet.getCell("G1").note = {
      texts: [
        { text: "Chọn team từ dropdown hoặc xem sheet 'TEAM Reference'" },
      ],
    };
    sheet.getCell("H1").note = {
      texts: [
        {
          text: "Chọn category từ dropdown hoặc xem sheet 'CATEGORY Reference'",
        },
      ],
    };

    // === SHEET VARIANTS ===
    const variantsSheet = workbook.addWorksheet("Variants");

    // Header cho Variants sheet
    variantsSheet.columns = [
      { header: "product_name", key: "product_name", width: 30 },
      { header: "variant_size", key: "variant_size", width: 15 },
      { header: "variant_color", key: "variant_color", width: 20 },
      { header: "variant_stock", key: "variant_stock", width: 15 },
    ];

    // Style header row
    variantsSheet.getRow(1).font = { bold: true };
    variantsSheet.getRow(1).fill = {
      type: "pattern",
      pattern: "solid",
      fgColor: { argb: "FFA8D8EA" }, // Light blue color
    };

    // Add sample row
    variantsSheet.addRow({
      product_name: "Áo đấu Manchester City",
      variant_size: "M",
      variant_color: "Blue",
      variant_stock: 100,
    });

    // Add notes
    variantsSheet.getCell("A1").note = {
      texts: [
        { text: "Tên sản phẩm phải khớp với product_name ở sheet Products" },
      ],
    };
    variantsSheet.getCell("D1").note = {
      texts: [{ text: "Để trống nếu chỉ tạo variant (không cập nhật stock)" }],
    };

    const buffer = await workbook.xlsx.writeBuffer();
    return buffer;
  } catch (error) {
    console.error("Error generating Excel template:", error);
    throw error;
  }
};

const importProductsFromExcel = async (buffer, uploadedImages) => {
  try {
    const ExcelJS = (await import("exceljs")).default;
    const workbook = new ExcelJS.Workbook();
    await workbook.xlsx.load(buffer);

    const worksheet = workbook.getWorksheet("Products");
    const products = [];
    const errors = [];

    // Create a map of image filenames to URLs
    const imageMap = new Map();
    if (uploadedImages && uploadedImages.length > 0) {
      uploadedImages.forEach((img) => {
        // Extract filename from the original filename or path
        const filename = img.originalname || img.filename;
        imageMap.set(filename, img.path || img.url);
      });
    }

    // Skip header row (row 1)
    for (let i = 2; i <= worksheet.rowCount; i++) {
      const row = worksheet.getRow(i);

      const product_name = row.getCell(2).value;
      const product_price = parseFloat(row.getCell(3).value);
      const product_description = row.getCell(4).value || "";
      const release_date = row.getCell(5).value;
      const product_image = row.getCell(6).value || "";
      const team_id = parseIdFromString(row.getCell(7).value);
      const category_id = parseIdFromString(row.getCell(8).value);
      const is_active = parseInt(row.getCell(9).value) || 1;
      const supplier_id = parseInt(row.getCell(10).value);

      // Log để debug
      console.log(`Row ${i}:`, {
        product_name,
        product_price,
        product_description,
        release_date,
        product_image,
        team_id,
        category_id,
        is_active,
        supplier_id,
      });

      // Validation
      if (
        !product_name ||
        !product_price ||
        !category_id ||
        !team_id ||
        !supplier_id
      ) {
        errors.push({
          row: i,
          message: "Missing required fields",
          data: {
            product_name,
            product_price,
            category_id,
            team_id,
            supplier_id,
          },
        });
        continue;
      }

      products.push({
        product_name,
        product_price,
        product_description,
        release_date,
        product_image,
        team_id,
        category_id,
        is_active,
        supplier_id,
      });
    }

    if (errors.length > 0) {
      return { success: false, errors, message: "Validation errors found" };
    }

    const createdProducts = [];
    const createErrors = [];

    // Create products (without variants for basic import)
    for (const productData of products) {
      try {
        // Tạo sản phẩm với đúng tên field của model
        const product = await db.Product.create({
          product_name: productData.product_name,
          product_description: productData.product_description,
          product_price: productData.product_price,
          release_date: productData.release_date,
          category_id: productData.category_id,
          team_id: productData.team_id,
          supplier_id: productData.supplier_id,
          is_active: productData.is_active,
        });

        // Xử lý ảnh sản phẩm nếu có
        if (productData.product_image) {
          // Loại bỏ đuôi file nếu user nhập (để linh hoạt hơn)
          const imageNameWithoutExt = productData.product_image.replace(
            /\.(jpg|jpeg|png|gif|webp)$/i,
            ""
          );

          // Tìm ảnh trong imageMap (với hoặc không có đuôi)
          let imageUrl = null;
          for (const [filename, url] of imageMap) {
            const filenameWithoutExt = filename.replace(
              /\.(jpg|jpeg|png|gif|webp)$/i,
              ""
            );
            if (
              filenameWithoutExt === imageNameWithoutExt ||
              filename === productData.product_image
            ) {
              imageUrl = url;
              break;
            }
          }

          // Nếu tìm thấy ảnh thì tạo Product_Image
          if (imageUrl) {
            await db.Product_Image.create({
              product_id: product.product_id,
              image_url: imageUrl,
              order: 1,
            });
          }
        }

        createdProducts.push(product);
      } catch (err) {
        console.error("Error creating product:", err);
        createErrors.push({
          product_name: productData.product_name,
          message: err.message,
        });
      }
    }

    return {
      success: true,
      created: createdProducts.length,
      errors: createErrors,
      products: createdProducts,
    };
  } catch (error) {
    console.error("Error importing products from Excel:", error);
    return { success: false, message: error.message };
  }
};

// Import Products + Variants (không cập nhật stock)
const importProductsWithVariants = async (buffer, uploadedImages) => {
  try {
    const { uploadToCloudinary } = await import("./uploadService.js");
    const ExcelJS = (await import("exceljs")).default;
    const workbook = new ExcelJS.Workbook();
    await workbook.xlsx.load(buffer);

    const productsSheet = workbook.getWorksheet("Products");
    const variantsSheet = workbook.getWorksheet("Variants");

    const errors = [];
    const created = { products: 0, variants: 0 };

    // Upload images to Cloudinary and create image map
    const imageMap = new Map();
    if (uploadedImages && uploadedImages.length > 0) {
      console.log(`Uploading ${uploadedImages.length} images to Cloudinary...`);

      for (const img of uploadedImages) {
        try {
          // Upload to Cloudinary
          const cloudinaryUrl = await uploadToCloudinary(img.path, "products");

          const filename = img.originalname || img.filename;
          const filenameWithoutExt = filename.replace(/\.[^/.]+$/, ""); // Bỏ đuôi file

          // Lưu cả hai: có đuôi và không có đuôi
          imageMap.set(filename, cloudinaryUrl);
          imageMap.set(filenameWithoutExt, cloudinaryUrl);

          console.log(`Uploaded ${filename} -> ${cloudinaryUrl}`);
        } catch (err) {
          console.error(`Error uploading image ${img.originalname}:`, err);
        }
      }
    } // Parse products from Products sheet
    const productsData = [];
    for (let i = 2; i <= productsSheet.rowCount; i++) {
      const row = productsSheet.getRow(i);
      const product_name = row.getCell(2).value;

      if (!product_name) continue; // Skip empty rows

      const product_price = parseFloat(row.getCell(3).value);
      const product_description = row.getCell(4).value || "";
      const release_date = row.getCell(5).value;
      const product_image = row.getCell(6).value || "";
      const team_id = parseIdFromString(row.getCell(7).value);
      const category_id = parseIdFromString(row.getCell(8).value);
      const is_active = parseInt(row.getCell(9).value) || 1;
      const supplier_id = parseInt(row.getCell(10).value);

      if (!product_price || !category_id || !team_id || !supplier_id) {
        errors.push({
          row: i,
          sheet: "Products",
          message: "Missing required fields",
        });
        continue;
      }

      productsData.push({
        product_name,
        product_price,
        product_description,
        release_date,
        product_image,
        team_id,
        category_id,
        is_active,
        supplier_id,
      });
    }

    // Parse variants from Variants sheet
    const variantsData = [];
    if (variantsSheet) {
      console.log("Parsing Variants sheet, row count:", variantsSheet.rowCount);
      for (let i = 2; i <= variantsSheet.rowCount; i++) {
        const row = variantsSheet.getRow(i);
        const product_name = row.getCell(1).value;
        const variant_size = row.getCell(2).value;
        const variant_color = row.getCell(3).value;
        const variant_stock = row.getCell(4).value;

        console.log(`Row ${i} RAW values:`, {
          product_name,
          variant_size,
          variant_color,
          variant_stock,
          "cell1 type": typeof product_name,
          "cell2 type": typeof variant_size,
          "cell3 type": typeof variant_color,
        });

        if (!product_name) {
          console.log(`Row ${i}: Skipping - no product_name`);
          continue; // Skip empty rows
        }

        // Cho phép variant_size và variant_color null
        variantsData.push({
          product_name: String(product_name).trim(),
          variant_size: variant_size ? String(variant_size).trim() : null,
          variant_color: variant_color ? String(variant_color).trim() : null,
        });
      }
      console.log(
        `Total variants parsed: ${variantsData.length}`,
        variantsData
      );
    } else {
      console.log("No Variants sheet found in Excel file");
    }

    // Process products
    for (const productData of productsData) {
      try {
        // Check if product exists
        let product = await db.Product.findOne({
          where: {
            product_name: productData.product_name,
            supplier_id: productData.supplier_id,
          },
        });

        // Create product if not exists
        if (!product) {
          // Get image URL from imageMap if available
          let imageUrl = null;
          if (
            productData.product_image &&
            imageMap.has(productData.product_image)
          ) {
            imageUrl = imageMap.get(productData.product_image);
          }

          product = await db.Product.create({
            product_name: productData.product_name,
            product_price: productData.product_price,
            product_description: productData.product_description,
            release_date: productData.release_date,
            product_image: imageUrl, // Lấy URL từ imageMap
            team_id: productData.team_id,
            category_id: productData.category_id,
            is_active: productData.is_active,
            supplier_id: productData.supplier_id,
            created_at: new Date(),
            updated_at: new Date(),
          });
          created.products++;

          // Add product image to Product_Image table if available
          if (imageUrl) {
            await db.Product_Image.create({
              product_id: product.product_id,
              image_url: imageUrl,
              order: 1,
            });
          }
        }

        // Process variants for this product
        const productVariants = variantsData.filter(
          (v) => v.product_name === productData.product_name
        );

        console.log(
          `Processing ${productVariants.length} variants for product: ${productData.product_name}`
        );

        for (const variantData of productVariants) {
          console.log("Creating variant:", {
            product_id: product.product_id,
            variant_size: variantData.variant_size,
            variant_color: variantData.variant_color,
          });

          // Check if variant exists
          const existingVariant = await db.Variant.findOne({
            where: {
              product_id: product.product_id,
              variant_size: variantData.variant_size,
              variant_color: variantData.variant_color,
            },
          });

          // Create variant if not exists (không cập nhật stock)
          if (!existingVariant) {
            const newVariant = await db.Variant.create({
              product_id: product.product_id,
              variant_size: variantData.variant_size,
              variant_color: variantData.variant_color,
              variant_stock: 0, // Mặc định là 0, không lấy từ Excel
            });
            console.log("Variant created successfully:", newVariant.variant_id);
            created.variants++;
          } else {
            console.log("Variant already exists, skipping");
          }
        }
      } catch (err) {
        console.error("Error processing product:", err);
        errors.push({
          product_name: productData.product_name,
          message: err.message,
        });
      }
    }

    return {
      success: true,
      created,
      errors,
      message: `Tạo ${created.products} sản phẩm và ${created.variants} biến thể`,
    };
  } catch (error) {
    console.error("Error importing products with variants:", error);
    return { success: false, message: error.message };
  }
};

// Import Inventory (chỉ cập nhật stock cho variant đã tồn tại)
const importInventoryStock = async (buffer) => {
  try {
    const ExcelJS = (await import("exceljs")).default;
    const workbook = new ExcelJS.Workbook();
    await workbook.xlsx.load(buffer);

    const variantsSheet = workbook.getWorksheet("Variants");

    if (!variantsSheet) {
      return {
        success: false,
        message: "Không tìm thấy sheet 'Variants' trong file Excel",
      };
    }

    const errors = [];
    let updated = 0;

    // Parse variants from Variants sheet
    for (let i = 2; i <= variantsSheet.rowCount; i++) {
      const row = variantsSheet.getRow(i);
      const product_name = row.getCell(1).value;

      if (!product_name) continue; // Skip empty rows

      const variant_size = row.getCell(2).value;
      const variant_color = row.getCell(3).value;
      const variant_stock = parseInt(row.getCell(4).value);

      if (isNaN(variant_stock)) {
        errors.push({
          row: i,
          message: "Giá trị stock không hợp lệ",
          data: { product_name, variant_stock },
        });
        continue;
      }

      try {
        // Find product by name
        const product = await db.Product.findOne({
          where: { product_name: String(product_name).trim() },
        });

        if (!product) {
          errors.push({
            row: i,
            message: `Không tìm thấy sản phẩm '${product_name}'`,
          });
          continue;
        }

        // Build where condition for variant (cho phép null)
        const whereCondition = {
          product_id: product.product_id,
        };

        if (variant_size !== null && variant_size !== undefined) {
          whereCondition.variant_size = String(variant_size).trim();
        } else {
          whereCondition.variant_size = null;
        }

        if (variant_color !== null && variant_color !== undefined) {
          whereCondition.variant_color = String(variant_color).trim();
        } else {
          whereCondition.variant_color = null;
        }

        // Find variant
        const variant = await db.Variant.findOne({
          where: whereCondition,
        });

        if (!variant) {
          errors.push({
            row: i,
            message: `Không tìm thấy biến thể (size: ${
              variant_size || "null"
            }, color: ${
              variant_color || "null"
            }) của sản phẩm '${product_name}'`,
          });
          continue;
        }

        // Update stock
        await variant.update({ variant_stock });
        updated++;
      } catch (err) {
        console.error("Error updating variant stock:", err);
        errors.push({
          row: i,
          message: err.message,
        });
      }
    }

    return {
      success: true,
      updated,
      errors,
      message: `Cập nhật stock cho ${updated} biến thể`,
    };
  } catch (error) {
    console.error("Error importing inventory stock:", error);
    return { success: false, message: error.message };
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
  generateExcelTemplate,
  importProductsFromExcel,
  importProductsWithVariants,
  importInventoryStock,
};
