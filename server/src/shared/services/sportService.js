import db from "../../shared/models/index.js";

const getAllSports = async () => {
  const sports = await db.Sport.findAll();
  if (!sports) return { success: false, message: "No sports found" };
  return { success: true, sports };
};
export { getAllSports };
