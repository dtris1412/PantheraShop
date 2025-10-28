import { getAllBlogs as getAllBlogsService } from "../services/blogService.js";

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

export { getAllBlogs };
