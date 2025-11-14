import {
  getAllBlogs as getAllBlogsService,
  getBlogsPaginated as getBlogsPaginatedService,
} from "../../shared/services/blogService.js";

const getAllBlogs = async (req, res) => {
  try {
    const blogs = await getAllBlogsService();
    if (!blogs.success) {
      return res.status(400).json(blogs);
    }
    res.status(200).json({ success: true, data: blogs });
  } catch (err) {
    console.error("Error in getAllBlogs controller: ", err);
    res.status(500).json({ success: false, message: "Internal server error" });
  }
};

const getBlogsPaginated = async (req, res) => {
  try {
    const {
      search = "",
      sport_id = "",
      category_id = "",
      team_id = "",
      tournament_id = "",
      limit = 10,
      page = 1,
    } = req.query;

    const result = await getBlogsPaginatedService({
      search,
      sport_id,
      category_id,
      team_id,
      tournament_id,
      limit: parseInt(limit),
      page: parseInt(page),
    });

    if (!result.success) {
      return res.status(400).json(result);
    }

    res.status(200).json(result);
  } catch (err) {
    console.error("Error in getBlogsPaginated controller: ", err);
    res.status(500).json({ success: false, message: "Internal server error" });
  }
};

export { getAllBlogs, getBlogsPaginated };
