import db from "../../shared/models/index.js";

const getAllTournaments = async () => {
  try {
    const tournaments = await db.Tournament.findAll({
      include: [
        {
          model: db.Sport,
          attributes: ["sport_id", "sport_name"],
        },
        {
          model: db.Team,
          attributes: ["team_id", "team_name"],
        },
      ],
      order: [["tournament_id", "DESC"]], // Sử dụng tournament_id thay vì created_at
    });

    if (!tournaments)
      return { success: false, message: "No tournaments found" };
    return { success: true, tournaments };
  } catch (error) {
    console.error("Error in getAllTournaments:", error);
    return { success: false, message: "Internal server error" };
  }
};

const getTournamentById = async (tournament_id) => {
  try {
    if (!tournament_id) {
      return { success: false, message: "Tournament ID is required" };
    }

    const tournament = await db.Tournament.findOne({
      where: { tournament_id },
      include: [
        {
          model: db.Sport,
          attributes: ["sport_id", "sport_name"],
        },
        {
          model: db.Team,
          attributes: ["team_id", "team_name"],
        },
      ],
    });

    if (!tournament) {
      return { success: false, message: "Tournament not found" };
    }

    return { success: true, tournament };
  } catch (error) {
    console.error("Error in getTournamentById:", error);
    return { success: false, message: "Internal server error" };
  }
};

const getTournamentsBySport = async (sport_id) => {
  try {
    if (!sport_id) {
      return { success: false, message: "Sport ID is required" };
    }

    const tournaments = await db.Tournament.findAll({
      where: { sport_id },
      include: [
        {
          model: db.Sport,
          attributes: ["sport_id", "sport_name"],
        },
        {
          model: db.Team,
          attributes: ["team_id", "team_name"],
        },
      ],
      order: [["tournament_name", "ASC"]],
    });

    return { success: true, tournaments };
  } catch (error) {
    console.error("Error in getTournamentsBySport:", error);
    return { success: false, message: "Internal server error" };
  }
};

const createTournament = async (tournamentData) => {
  try {
    const {
      tournament_name,
      tournament_description,
      tournament_icon,
      sport_id,
    } = tournamentData;

    if (!tournament_name) {
      return { success: false, message: "Tournament name is required" };
    }

    if (!sport_id) {
      return { success: false, message: "Sport ID is required" };
    }

    // Kiểm tra xem sport có tồn tại không
    const sport = await db.Sport.findOne({ where: { sport_id } });
    if (!sport) {
      return { success: false, message: "Sport not found" };
    }

    // Kiểm tra xem tournament đã tồn tại chưa trong sport này
    const existingTournament = await db.Tournament.findOne({
      where: {
        tournament_name,
        sport_id,
      },
    });

    if (existingTournament) {
      return {
        success: false,
        message: "Tournament already exists in this sport",
      };
    }

    const tournament = await db.Tournament.create({
      tournament_name,
      tournament_description,
      tournament_icon,
      sport_id,
    });

    // Load tournament with relations
    const createdTournament = await db.Tournament.findOne({
      where: { tournament_id: tournament.tournament_id },
      include: [
        {
          model: db.Sport,
          attributes: ["sport_id", "sport_name"],
        },
      ],
    });

    return { success: true, tournament: createdTournament };
  } catch (error) {
    console.error("Error in createTournament:", error);
    return { success: false, message: "Internal server error" };
  }
};

const updateTournament = async (tournament_id, tournamentData) => {
  try {
    if (!tournament_id) {
      return { success: false, message: "Tournament ID is required" };
    }

    const tournament = await db.Tournament.findOne({
      where: { tournament_id },
    });
    if (!tournament) {
      return { success: false, message: "Tournament not found" };
    }

    const {
      tournament_name,
      tournament_description,
      tournament_icon,
      sport_id,
    } = tournamentData;

    // Nếu có sport_id, kiểm tra xem sport có tồn tại không
    if (sport_id && sport_id !== tournament.sport_id) {
      const sport = await db.Sport.findOne({ where: { sport_id } });
      if (!sport) {
        return { success: false, message: "Sport not found" };
      }
    }

    // Kiểm tra tên tournament trùng (ngoại trừ chính nó)
    if (tournament_name && tournament_name !== tournament.tournament_name) {
      const existingTournament = await db.Tournament.findOne({
        where: {
          tournament_name,
          sport_id: sport_id || tournament.sport_id,
          tournament_id: { [db.Sequelize.Op.ne]: tournament_id },
        },
      });

      if (existingTournament) {
        return {
          success: false,
          message: "Tournament name already exists in this sport",
        };
      }
    }

    await tournament.update({
      tournament_name: tournament_name || tournament.tournament_name,
      tournament_description:
        tournament_description !== undefined
          ? tournament_description
          : tournament.tournament_description,
      tournament_icon:
        tournament_icon !== undefined
          ? tournament_icon
          : tournament.tournament_icon,
      sport_id: sport_id || tournament.sport_id,
    });

    // Load updated tournament with relations
    const updatedTournament = await db.Tournament.findOne({
      where: { tournament_id },
      include: [
        {
          model: db.Sport,
          attributes: ["sport_id", "sport_name"],
        },
      ],
    });

    return { success: true, tournament: updatedTournament };
  } catch (error) {
    console.error("Error in updateTournament:", error);
    return { success: false, message: "Internal server error" };
  }
};

const deleteTournament = async (tournament_id) => {
  try {
    if (!tournament_id) {
      return { success: false, message: "Tournament ID is required" };
    }

    const tournament = await db.Tournament.findOne({
      where: { tournament_id },
    });
    if (!tournament) {
      return { success: false, message: "Tournament not found" };
    }

    // Kiểm tra xem có teams liên quan không
    const teams = await db.Team.findAll({ where: { tournament_id } });
    if (teams.length > 0) {
      return {
        success: false,
        message:
          "Cannot delete tournament. There are teams associated with this tournament.",
      };
    }

    await tournament.destroy();
    return { success: true, message: "Tournament deleted successfully" };
  } catch (error) {
    console.error("Error in deleteTournament:", error);
    return { success: false, message: "Internal server error" };
  }
};

export {
  getAllTournaments,
  getTournamentById,
  getTournamentsBySport,
  createTournament,
  updateTournament,
  deleteTournament,
};
