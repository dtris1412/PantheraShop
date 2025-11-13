import {
  getAllBlogs as getAllBlogsService,
  getBlogsPaginated as getBlogsPaginatedService,
  getBlogById as getBlogByIdService,
  createBlog as createBlogService,
  updateBlog as updateBlogService,
  deleteBlog as deleteBlogService,
} from "../../shared/services/blogService.js";

const getAllBlogs = async (req, res) => {
  try {
    const result = await getAllBlogsService();

    if (!result.success) {
      return res.status(400).json(result);
    }
    res.status(200).json(result);
  } catch (err) {
    console.error("Error in getAllBlogs: ", err);
    res.status(500).json({
      success: false,
      message: "Internal Server Error",
      error: err.message,
    });
  }
};

const getBlogsPaginated = async (req, res) => {
  try {
    const {
      search,
      sport_id,
      category_id,
      team_id,
      tournament_id,
      limit,
      page,
    } = req.query;
    const result = await getBlogsPaginatedService({
      search,
      sport_id,
      category_id,
      team_id,
      tournament_id,
      limit,
      page,
    });

    if (!result.success) {
      return res.status(400).json(result);
    }
    res.status(200).json(result);
  } catch (err) {
    console.error("Error in getBlogsPaginated:", err);
    res.status(500).json({
      success: false,
      message: "Internal Server Error",
      error: err.message,
    });
  }
};

const getBlogById = async (req, res) => {
  try {
    const { blog_id } = req.params;
    const blog = await getBlogByIdService(blog_id);

    if (!blog.success) {
      return res.status(400).json(blog);
    }
    res.status(200).json(blog);
  } catch (err) {
    console.error("Error in getBlogById: ", err);
    res.status(500).json({
      success: false,
      message: "Internal Server Error",
      error: err.message,
    });
  }
};

const createBlog = async (req, res) => {
  try {
    const {
      blog_title,
      blog_content,
      blog_thumbnail,
      sport_id,
      team_id,
      category_id,
      tournament_id,
    } = req.body;
    const user_id = req.user.user_id;
    const result = await createBlogService(
      blog_title,
      blog_content,
      blog_thumbnail,
      user_id,
      sport_id,
      team_id,
      category_id,
      tournament_id
    );
    if (!result.success) {
      return res.status(400).json(result);
    }
    res.status(201).json(result);
  } catch (err) {
    console.error("Error in createBlog: ", err);
    res.status(500).json({
      success: false,
      message: "Internal Server Error",
      error: err.message,
    });
  }
};

const updateBlog = async (req, res) => {
  try {
    const { blog_id } = req.params;
    const {
      blog_title,
      blog_content,
      blog_thumbnail,
      sport_id,
      team_id,
      category_id,
      tournament_id,
    } = req.body;
    const user_id = req.user.user_id;
    const result = await updateBlogService(
      blog_id,
      blog_title,
      blog_content,
      blog_thumbnail,
      sport_id,
      team_id,
      category_id,
      tournament_id
    );
    if (!result.success) {
      return res.status(400).json(result);
    }
    res.status(200).json(result);
  } catch (err) {
    console.error("Error in updateBlog: ", err);
    res.status(500).json({
      success: false,
      message: "Internal Server Error",
      error: err.message,
    });
  }
};

const deleteBlog = async (req, res) => {
  try {
    const { blog_id } = req.params;
    const result = await deleteBlogService(blog_id);
    if (!result.success) {
      return res.status(400).json(result);
    }
    res.status(200).json(result);
  } catch (err) {
    console.error("Error in deleteBlog: ", err);
    res.status(500).json({
      success: false,
      message: "Internal Server Error",
      error: err.message,
    });
  }
};
export {
  getAllBlogs,
  getBlogsPaginated,
  getBlogById,
  createBlog,
  updateBlog,
  deleteBlog,
};
