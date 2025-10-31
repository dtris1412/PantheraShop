import db from "../../shared/models/index.js";

const getAllSports = async () => {
  try {
    const sports = await db.Sport.findAll({
      include: [
        {
          model: db.Tournament,
          include: [
            {
              model: db.Team,
              attributes: ["team_id", "team_name"],
            },
          ],
        },
      ],
      order: [["sport_id", "DESC"]], // Sử dụng sport_id thay vì created_at
    });

    if (!sports) return { success: false, message: "No sports found" };
    return { success: true, sports };
  } catch (error) {
    console.error("Error in getAllSports:", error);
    return { success: false, message: "Internal server error" };
  }
};

const getSportById = async (sport_id) => {
  try {
    if (!sport_id) {
      return { success: false, message: "Sport ID is required" };
    }

    const sport = await db.Sport.findOne({
      where: { sport_id },
      include: [
        {
          model: db.Tournament,
          include: [
            {
              model: db.Team,
              attributes: ["team_id", "team_name"],
            },
          ],
        },
      ],
    });

    if (!sport) {
      return { success: false, message: "Sport not found" };
    }

    return { success: true, sport };
  } catch (error) {
    console.error("Error in getSportById:", error);
    return { success: false, message: "Internal server error" };
  }
};

const createSport = async (sportData) => {
  try {
    const {
      sport_name,
      sport_description,
      sport_icon,
      has_teams,
      has_tournaments,
    } = sportData;

    if (!sport_name) {
      return { success: false, message: "Sport name is required" };
    }

    // Kiểm tra xem môn thể thao đã tồn tại chưa
    const existingSport = await db.Sport.findOne({
      where: { sport_name },
    });

    if (existingSport) {
      return { success: false, message: "Sport already exists" };
    }

    const sport = await db.Sport.create({
      sport_name,
      sport_description,
      sport_icon,
      has_teams: has_teams || false,
      has_tournaments: has_tournaments || false,
    });

    return { success: true, sport };
  } catch (error) {
    console.error("Error in createSport:", error);
    return { success: false, message: "Internal server error" };
  }
};

const updateSport = async (sport_id, sportData) => {
  try {
    if (!sport_id) {
      return { success: false, message: "Sport ID is required" };
    }

    const sport = await db.Sport.findOne({ where: { sport_id } });
    if (!sport) {
      return { success: false, message: "Sport not found" };
    }

    const {
      sport_name,
      sport_description,
      sport_icon,
      has_teams,
      has_tournaments,
    } = sportData;

    // Kiểm tra tên môn thể thao trùng (ngoại trừ chính nó)
    if (sport_name && sport_name !== sport.sport_name) {
      const existingSport = await db.Sport.findOne({
        where: {
          sport_name,
          sport_id: { [db.Sequelize.Op.ne]: sport_id },
        },
      });

      if (existingSport) {
        return { success: false, message: "Sport name already exists" };
      }
    }

    await sport.update({
      sport_name: sport_name || sport.sport_name,
      sport_description:
        sport_description !== undefined
          ? sport_description
          : sport.sport_description,
      sport_icon: sport_icon !== undefined ? sport_icon : sport.sport_icon,
      has_teams: has_teams !== undefined ? has_teams : sport.has_teams,
      has_tournaments:
        has_tournaments !== undefined ? has_tournaments : sport.has_tournaments,
    });

    return { success: true, sport };
  } catch (error) {
    console.error("Error in updateSport:", error);
    return { success: false, message: "Internal server error" };
  }
};

const deleteSport = async (sport_id) => {
  try {
    if (!sport_id) {
      return { success: false, message: "Sport ID is required" };
    }

    const sport = await db.Sport.findOne({ where: { sport_id } });
    if (!sport) {
      return { success: false, message: "Sport not found" };
    }

    // Kiểm tra xem có tournaments liên quan không
    const tournaments = await db.Tournament.findAll({ where: { sport_id } });
    if (tournaments.length > 0) {
      return {
        success: false,
        message:
          "Cannot delete sport. There are tournaments associated with this sport.",
      };
    }

    await sport.destroy();
    return { success: true, message: "Sport deleted successfully" };
  } catch (error) {
    console.error("Error in deleteSport:", error);
    return { success: false, message: "Internal server error" };
  }
};

export { getAllSports, getSportById, createSport, updateSport, deleteSport };
