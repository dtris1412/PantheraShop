import db from "../../shared/models/index.js";

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
export { getAllBlogs };
