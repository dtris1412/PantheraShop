import db from "../../shared/models/index.js";
import { Op } from "sequelize";

const getAllBlogs = async () => {
  const blogs = await db.Blog.findAll({
    include: [
      {
        model: db.User,
        attributes: ["user_id", "user_name"],
      },
      {
        model: db.Sport,
        attributes: ["sport_id", "sport_name"],
      },
      {
        model: db.Team,
        attributes: ["team_id", "team_name"],
      },
      {
        model: db.Category,
        attributes: ["category_id", "category_name"],
      },
      {
        model: db.Tournament,
        attributes: ["tournament_id", "tournament_name"],
      },
    ],
  });
  return { success: true, blogs };
};

const getBlogsPaginated = async ({
  search = "",
  sport_id = "",
  category_id = "",
  team_id = "",
  tournament_id = "",
  limit = 9,
  page = 1,
}) => {
  try {
    const offset = (page - 1) * limit;

    // Build where conditions
    const where = {};

    // Search across blog_title and blog_content
    if (search) {
      where[Op.or] = [
        { blog_title: { [Op.substring]: search } },
        { blog_content: { [Op.substring]: search } },
      ];
    }

    // Filter by sport
    if (sport_id) {
      where.sport_id = sport_id;
    }

    // Filter by category
    if (category_id) {
      where.category_id = category_id;
    }

    // Filter by team
    if (team_id) {
      where.team_id = team_id;
    }

    // Filter by tournament
    if (tournament_id) {
      where.tournament_id = tournament_id;
    }

    // Common includes for both count and findAll
    const includes = [
      {
        model: db.User,
        attributes: ["user_id", "user_name"],
      },
      {
        model: db.Sport,
        attributes: ["sport_id", "sport_name"],
      },
      {
        model: db.Team,
        attributes: ["team_id", "team_name"],
      },
      {
        model: db.Category,
        attributes: ["category_id", "category_name"],
      },
      {
        model: db.Tournament,
        attributes: ["tournament_id", "tournament_name"],
      },
    ];

    // Get total count
    const totalCount = await db.Blog.count({
      where,
      include: includes,
      distinct: true,
    });

    // Get paginated blogs
    const blogs = await db.Blog.findAll({
      where,
      include: includes,
      limit: parseInt(limit),
      offset: parseInt(offset),
      order: [["created_at", "DESC"]],
    });

    return {
      success: true,
      blogs,
      pagination: {
        total: totalCount,
        page: parseInt(page),
        limit: parseInt(limit),
        totalPages: Math.ceil(totalCount / limit),
      },
    };
  } catch (err) {
    console.error("Error in getBlogsPaginated:", err);
    return { success: false, message: "Internal server error" };
  }
};

const createBlog = async (
  blog_title,
  blog_content,
  blog_thumbnail,
  user_id,
  sport_id,
  team_id,
  category_id,
  tournament_id
) => {
  try {
    if (!blog_title || !blog_content || !blog_thumbnail || !user_id) {
      return { success: false, message: "Missing required fields" };
    }

    console.log("CreateBlog params:", {
      blog_title,
      blog_content,
      blog_thumbnail,
      user_id,
      sport_id,
      team_id,
      category_id,
      tournament_id,
    });

    const newBlog = await db.Blog.create({
      blog_title,
      blog_content,
      blog_thumbnail,
      user_id,
      sport_id,
      team_id,
      category_id,
      tournament_id,
    });
    return { success: true, blog: newBlog };
  } catch (err) {
    console.error("Error in createBlog:", err);
    return { success: false, message: "Internal server error" };
  }
};

const updateBlog = async (
  blog_id,
  blog_title,
  blog_content,
  blog_thumbnail,
  sport_id,
  team_id,
  category_id,
  tournament_id
) => {
  try {
    if (!blog_id) {
      return { success: false, message: "Blog ID is required" };
    }

    const blog = await db.Blog.findOne({ where: { blog_id } });
    if (!blog) {
      return { success: false, message: "Blog not found" };
    }

    await blog.update({
      blog_title: blog_title || blog.blog_title,
      blog_content: blog_content || blog.blog_content,
      blog_thumbnail: blog_thumbnail || blog.blog_thumbnail,
      sport_id: sport_id || blog.sport_id,
      team_id: team_id || blog.team_id,
      category_id: category_id || blog.category_id,
      tournament_id: tournament_id || blog.tournament_id,
    });

    return { success: true, blog };
  } catch (err) {
    console.error("Error in updateBlog:", err);
    return { success: false, message: "Internal server error" };
  }
};

const getBlogById = async (blog_id) => {
  try {
    if (!blog_id) {
      return { success: false, message: "Blog ID is required" };
    }

    const blog = await db.Blog.findOne({
      where: { blog_id },
      include: [
        {
          model: db.User,
          attributes: ["user_id", "user_name"],
        },
        {
          model: db.Sport,
          attributes: ["sport_id", "sport_name"],
        },
        {
          model: db.Team,
          attributes: ["team_id", "team_name"],
        },
        {
          model: db.Category,
          attributes: ["category_id", "category_name"],
        },
        {
          model: db.Tournament,
          attributes: ["tournament_id", "tournament_name"],
        },
      ],
    });

    if (!blog) {
      return { success: false, message: "Blog not found" };
    }

    return { success: true, blog };
  } catch (err) {
    console.error("Error in getBlogById:", err);
    return { success: false, message: "Internal server error" };
  }
};

const deleteBlog = async (blog_id) => {
  try {
    if (!blog_id) {
      return { success: false, message: "Blog ID is required" };
    }

    const blog = await db.Blog.findOne({ where: { blog_id } });
    if (!blog) {
      return { success: false, message: "Blog not found" };
    }

    await blog.destroy();
    return { success: true, message: "Blog deleted successfully" };
  } catch (err) {
    console.error("Error in deleteBlog:", err);
    return { success: false, message: "Internal server error" };
  }
};

export {
  getAllBlogs,
  getBlogsPaginated,
  createBlog,
  updateBlog,
  getBlogById,
  deleteBlog,
};
