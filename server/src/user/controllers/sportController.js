import { getAllSports as getAllSportService } from "../../shared/services/sportService.js";

const getAllSports = async (req, res) => {
  try {
    const sports = await getAllSportService();
    if (!sports.success) {
      return res.status(400).json(sports);
    }
    res.status(200).json(sports.sports);
  } catch (err) {
    console.error("Error in getAllSports: ", err);
    res.status(500).json({ message: "Server error" });
  }
};

export { getAllSports };
