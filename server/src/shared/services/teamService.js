import db from "../../shared/models/index.js";

const getAllTeams = async () => {
  try {
    const teams = await db.Team.findAll({
      include: [
        {
          model: db.Tournament,
          attributes: ["tournament_id", "tournament_name"],
          include: [
            {
              model: db.Sport,
              attributes: ["sport_id", "sport_name"],
            },
          ],
        },
      ],
      order: [["team_id", "DESC"]], // Sử dụng team_id thay vì created_at
    });

    if (!teams) return { success: false, message: "No teams found" };

    // Thêm số lượng sản phẩm cho mỗi team
    const teamsWithProductCount = await Promise.all(
      teams.map(async (team) => {
        const productCount = await db.Product.count({
          where: { team_id: team.team_id },
        });

        return {
          ...team.toJSON(),
          product_count: productCount,
        };
      })
    );

    return { success: true, teams: teamsWithProductCount };
  } catch (error) {
    console.error("Error in getAllTeams:", error);
    return { success: false, message: "Internal server error" };
  }
};

const getTeamById = async (team_id) => {
  try {
    if (!team_id) {
      return { success: false, message: "Team ID is required" };
    }

    const team = await db.Team.findOne({
      where: { team_id },
      include: [
        {
          model: db.Tournament,
          attributes: ["tournament_id", "tournament_name"],
          include: [
            {
              model: db.Sport,
              attributes: ["sport_id", "sport_name"],
            },
          ],
        },
      ],
    });

    if (!team) {
      return { success: false, message: "Team not found" };
    }

    // Thêm số lượng sản phẩm
    const productCount = await db.Product.count({
      where: { team_id },
    });

    return {
      success: true,
      team: {
        ...team.toJSON(),
        product_count: productCount,
      },
    };
  } catch (error) {
    console.error("Error in getTeamById:", error);
    return { success: false, message: "Internal server error" };
  }
};

const getTeamsByTournament = async (tournament_id) => {
  try {
    if (!tournament_id) {
      return { success: false, message: "Tournament ID is required" };
    }

    const teams = await db.Team.findAll({
      where: { tournament_id },
      include: [
        {
          model: db.Tournament,
          attributes: ["tournament_id", "tournament_name"],
          include: [
            {
              model: db.Sport,
              attributes: ["sport_id", "sport_name"],
            },
          ],
        },
      ],
      order: [["team_name", "ASC"]],
    });

    // Thêm số lượng sản phẩm cho mỗi team
    const teamsWithProductCount = await Promise.all(
      teams.map(async (team) => {
        const productCount = await db.Product.count({
          where: { team_id: team.team_id },
        });

        return {
          ...team.toJSON(),
          product_count: productCount,
        };
      })
    );

    return { success: true, teams: teamsWithProductCount };
  } catch (error) {
    console.error("Error in getTeamsByTournament:", error);
    return { success: false, message: "Internal server error" };
  }
};

const createTeam = async (teamData) => {
  try {
    const { team_name, team_description, team_logo, tournament_id } = teamData;

    if (!team_name) {
      return { success: false, message: "Team name is required" };
    }

    if (!tournament_id) {
      return { success: false, message: "Tournament ID is required" };
    }

    // Kiểm tra xem tournament có tồn tại không
    const tournament = await db.Tournament.findOne({
      where: { tournament_id },
    });
    if (!tournament) {
      return { success: false, message: "Tournament not found" };
    }

    // Kiểm tra xem team đã tồn tại chưa trong tournament này
    const existingTeam = await db.Team.findOne({
      where: {
        team_name,
        tournament_id,
      },
    });

    if (existingTeam) {
      return {
        success: false,
        message: "Team already exists in this tournament",
      };
    }

    const team = await db.Team.create({
      team_name,
      team_description,
      team_logo,
      tournament_id,
    });

    // Load team with relations
    const createdTeam = await db.Team.findOne({
      where: { team_id: team.team_id },
      include: [
        {
          model: db.Tournament,
          attributes: ["tournament_id", "tournament_name"],
          include: [
            {
              model: db.Sport,
              attributes: ["sport_id", "sport_name"],
            },
          ],
        },
      ],
    });

    return {
      success: true,
      team: {
        ...createdTeam.toJSON(),
        product_count: 0,
      },
    };
  } catch (error) {
    console.error("Error in createTeam:", error);
    return { success: false, message: "Internal server error" };
  }
};

const updateTeam = async (team_id, teamData) => {
  try {
    if (!team_id) {
      return { success: false, message: "Team ID is required" };
    }

    const team = await db.Team.findOne({ where: { team_id } });
    if (!team) {
      return { success: false, message: "Team not found" };
    }

    const { team_name, team_description, team_logo, tournament_id } = teamData;

    // Nếu có tournament_id, kiểm tra xem tournament có tồn tại không
    if (tournament_id && tournament_id !== team.tournament_id) {
      const tournament = await db.Tournament.findOne({
        where: { tournament_id },
      });
      if (!tournament) {
        return { success: false, message: "Tournament not found" };
      }
    }

    // Kiểm tra tên team trùng (ngoại trừ chính nó)
    if (team_name && team_name !== team.team_name) {
      const existingTeam = await db.Team.findOne({
        where: {
          team_name,
          tournament_id: tournament_id || team.tournament_id,
          team_id: { [db.Sequelize.Op.ne]: team_id },
        },
      });

      if (existingTeam) {
        return {
          success: false,
          message: "Team name already exists in this tournament",
        };
      }
    }

    await team.update({
      team_name: team_name || team.team_name,
      team_description:
        team_description !== undefined
          ? team_description
          : team.team_description,
      team_logo: team_logo !== undefined ? team_logo : team.team_logo,
      tournament_id: tournament_id || team.tournament_id,
    });

    // Load updated team with relations
    const updatedTeam = await db.Team.findOne({
      where: { team_id },
      include: [
        {
          model: db.Tournament,
          attributes: ["tournament_id", "tournament_name"],
          include: [
            {
              model: db.Sport,
              attributes: ["sport_id", "sport_name"],
            },
          ],
        },
      ],
    });

    // Thêm số lượng sản phẩm
    const productCount = await db.Product.count({
      where: { team_id },
    });

    return {
      success: true,
      team: {
        ...updatedTeam.toJSON(),
        product_count: productCount,
      },
    };
  } catch (error) {
    console.error("Error in updateTeam:", error);
    return { success: false, message: "Internal server error" };
  }
};

const deleteTeam = async (team_id) => {
  try {
    if (!team_id) {
      return { success: false, message: "Team ID is required" };
    }

    const team = await db.Team.findOne({ where: { team_id } });
    if (!team) {
      return { success: false, message: "Team not found" };
    }

    // Kiểm tra xem có products liên quan không
    const products = await db.Product.findAll({ where: { team_id } });
    if (products.length > 0) {
      return {
        success: false,
        message:
          "Cannot delete team. There are products associated with this team.",
      };
    }

    await team.destroy();
    return { success: true, message: "Team deleted successfully" };
  } catch (error) {
    console.error("Error in deleteTeam:", error);
    return { success: false, message: "Internal server error" };
  }
};

export {
  getAllTeams,
  getTeamById,
  getTeamsByTournament,
  createTeam,
  updateTeam,
  deleteTeam,
};
