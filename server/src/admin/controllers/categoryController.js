import {
  getAllCategories as getAllCategoriesService,
  getCategoryById as getCategoryByIdService,
  getCategoriesPaginated as getCategoriesPaginatedService,
  createCategory as createCategoryService,
  updateCategory as updateCategoryService,
  deleteCategory as deleteCategoryService,
} from "../../shared/services/categoryService.js";

import {
  getAllSports as getAllSportsService,
  getSportById as getSportByIdService,
  getSportsPaginated as getSportsPaginatedService,
  createSport as createSportService,
  updateSport as updateSportService,
  deleteSport as deleteSportService,
} from "../../shared/services/sportService.js";

import {
  getAllTournaments as getAllTournamentsService,
  getTournamentById as getTournamentByIdService,
  getTournamentsBySport as getTournamentsBySportService,
  getTournamentsPaginated as getTournamentsPaginatedService,
  createTournament as createTournamentService,
  updateTournament as updateTournamentService,
  deleteTournament as deleteTournamentService,
} from "../../shared/services/tournamentService.js";

import {
  getAllTeams as getAllTeamsService,
  getTeamById as getTeamByIdService,
  getTeamsByTournament as getTeamsByTournamentService,
  getTeamsPaginated as getTeamsPaginatedService,
  createTeam as createTeamService,
  updateTeam as updateTeamService,
  deleteTeam as deleteTeamService,
} from "../../shared/services/teamService.js";

import { uploadToCloudinary } from "../../shared/services/uploadService.js";

// =============== CATEGORY CONTROLLERS ===============

const getAllCategories = async (req, res) => {
  try {
    const result = await getAllCategoriesService();

    if (!result.success) {
      return res.status(400).json(result);
    }

    res.status(200).json(result);
  } catch (error) {
    console.error("Error in getAllCategories controller:", error);
    res.status(500).json({
      success: false,
      message: "Internal Server Error",
      error: error.message,
    });
  }
};

const getCategoriesPaginated = async (req, res) => {
  try {
    const { search, limit = 9, page = 1 } = req.query;
    const result = await getCategoriesPaginatedService(
      search,
      parseInt(limit),
      parseInt(page)
    );
    if (!result.success) {
      return res.status(400).json(result);
    }
    res.status(200).json(result);
  } catch (error) {
    console.error("Error in getCategoriesPaginated controller:", error);
    res.status(500).json({
      success: false,
      message: "Internal Server Error",
      error: error.message,
    });
  }
};

const getCategoryById = async (req, res) => {
  try {
    const { id } = req.params;
    const result = await getCategoryByIdService(id);

    if (!result.success) {
      return res.status(404).json(result);
    }

    res.status(200).json(result);
  } catch (error) {
    console.error("Error in getCategoryById controller:", error);
    res.status(500).json({
      success: false,
      message: "Internal Server Error",
      error: error.message,
    });
  }
};

const createCategory = async (req, res) => {
  try {
    const result = await createCategoryService(req.body);

    if (!result.success) {
      return res.status(400).json(result);
    }

    res.status(201).json(result);
  } catch (error) {
    console.error("Error in createCategory controller:", error);
    res.status(500).json({
      success: false,
      message: "Internal Server Error",
      error: error.message,
    });
  }
};

const updateCategory = async (req, res) => {
  try {
    const { id } = req.params;
    const result = await updateCategoryService(id, req.body);

    if (!result.success) {
      return res.status(400).json(result);
    }

    res.status(200).json(result);
  } catch (error) {
    console.error("Error in updateCategory controller:", error);
    res.status(500).json({
      success: false,
      message: "Internal Server Error",
      error: error.message,
    });
  }
};

const deleteCategory = async (req, res) => {
  try {
    const { id } = req.params;
    const result = await deleteCategoryService(id);

    if (!result.success) {
      return res.status(400).json(result);
    }

    res.status(200).json(result);
  } catch (error) {
    console.error("Error in deleteCategory controller:", error);
    res.status(500).json({
      success: false,
      message: "Internal Server Error",
      error: error.message,
    });
  }
};

// =============== SPORT CONTROLLERS ===============

const getAllSports = async (req, res) => {
  try {
    const result = await getAllSportsService();

    if (!result.success) {
      return res.status(400).json(result);
    }

    res.status(200).json(result);
  } catch (error) {
    console.error("Error in getAllSports controller:", error);
    res.status(500).json({
      success: false,
      message: "Internal Server Error",
      error: error.message,
    });
  }
};

const getSportById = async (req, res) => {
  try {
    const { id } = req.params;
    const result = await getSportByIdService(id);

    if (!result.success) {
      return res.status(404).json(result);
    }

    res.status(200).json(result);
  } catch (error) {
    console.error("Error in getSportById controller:", error);
    res.status(500).json({
      success: false,
      message: "Internal Server Error",
      error: error.message,
    });
  }
};

const getSportsPaginated = async (req, res) => {
  try {
    const { search, limit = 10, page = 1 } = req.query;
    const result = await getSportsPaginatedService(
      search,
      parseInt(limit),
      parseInt(page)
    );
    if (!result.success) {
      return res.status(400).json(result);
    }
    res.status(200).json(result);
  } catch (error) {
    console.error("Error in getSportsPaginated controller:", error);
    res.status(500).json({
      success: false,
      message: "Internal Server Error",
      error: error.message,
    });
  }
};

const createSport = async (req, res) => {
  try {
    let sportData = { ...req.body };

    // Xử lý upload ảnh nếu có
    if (req.file) {
      try {
        const sport_icon = await uploadToCloudinary(req.file.path, "sports");
        sportData.sport_icon = sport_icon;
      } catch (uploadError) {
        console.error("Error uploading sport icon:", uploadError);
        return res.status(400).json({
          success: false,
          message: "Failed to upload sport icon",
        });
      }
    }

    const result = await createSportService(sportData);

    if (!result.success) {
      return res.status(400).json(result);
    }

    res.status(201).json(result);
  } catch (error) {
    console.error("Error in createSport controller:", error);
    res.status(500).json({
      success: false,
      message: "Internal Server Error",
      error: error.message,
    });
  }
};

const updateSport = async (req, res) => {
  try {
    const { id } = req.params;
    let sportData = { ...req.body };

    // Xử lý upload ảnh mới nếu có
    if (req.file) {
      try {
        const sport_icon = await uploadToCloudinary(req.file.path, "sports");
        sportData.sport_icon = sport_icon;
      } catch (uploadError) {
        console.error("Error uploading sport icon:", uploadError);
        return res.status(400).json({
          success: false,
          message: "Failed to upload sport icon",
        });
      }
    }

    const result = await updateSportService(id, sportData);

    if (!result.success) {
      return res.status(400).json(result);
    }

    res.status(200).json(result);
  } catch (error) {
    console.error("Error in updateSport controller:", error);
    res.status(500).json({
      success: false,
      message: "Internal Server Error",
      error: error.message,
    });
  }
};

const deleteSport = async (req, res) => {
  try {
    const { id } = req.params;
    const result = await deleteSportService(id);

    if (!result.success) {
      return res.status(400).json(result);
    }

    res.status(200).json(result);
  } catch (error) {
    console.error("Error in deleteSport controller:", error);
    res.status(500).json({
      success: false,
      message: "Internal Server Error",
      error: error.message,
    });
  }
};

// =============== TOURNAMENT CONTROLLERS ===============

const getAllTournaments = async (req, res) => {
  try {
    const result = await getAllTournamentsService();

    if (!result.success) {
      return res.status(400).json(result);
    }

    res.status(200).json(result);
  } catch (error) {
    console.error("Error in getAllTournaments controller:", error);
    res.status(500).json({
      success: false,
      message: "Internal Server Error",
      error: error.message,
    });
  }
};

const getTournamentById = async (req, res) => {
  try {
    const { id } = req.params;
    const result = await getTournamentByIdService(id);

    if (!result.success) {
      return res.status(404).json(result);
    }

    res.status(200).json(result);
  } catch (error) {
    console.error("Error in getTournamentById controller:", error);
    res.status(500).json({
      success: false,
      message: "Internal Server Error",
      error: error.message,
    });
  }
};

const getTournamentsBySport = async (req, res) => {
  try {
    const { sport_id } = req.params;
    const result = await getTournamentsBySportService(sport_id);

    if (!result.success) {
      return res.status(400).json(result);
    }

    res.status(200).json(result);
  } catch (error) {
    console.error("Error in getTournamentsBySport controller:", error);
    res.status(500).json({
      success: false,
      message: "Internal Server Error",
      error: error.message,
    });
  }
};

const getTournamentsPaginated = async (req, res) => {
  try {
    const { search, sport, limit = 10, page = 1 } = req.query;
    const result = await getTournamentsPaginatedService(
      search,
      sport,
      parseInt(limit),
      parseInt(page)
    );
    if (!result.success) {
      return res.status(400).json(result);
    }
    res.status(200).json(result);
  } catch (error) {
    console.error("Error in getTournamentsPaginated controller:", error);
    res.status(500).json({
      success: false,
      message: "Internal Server Error",
      error: error.message,
    });
  }
};

const createTournament = async (req, res) => {
  try {
    let tournamentData = { ...req.body };

    // Xử lý upload ảnh nếu có
    if (req.file) {
      try {
        const tournament_icon = await uploadToCloudinary(
          req.file.path,
          "tournaments"
        );
        tournamentData.tournament_icon = tournament_icon;
      } catch (uploadError) {
        console.error("Error uploading tournament icon:", uploadError);
        return res.status(400).json({
          success: false,
          message: "Failed to upload tournament icon",
        });
      }
    }

    const result = await createTournamentService(tournamentData);

    if (!result.success) {
      return res.status(400).json(result);
    }

    res.status(201).json(result);
  } catch (error) {
    console.error("Error in createTournament controller:", error);
    res.status(500).json({
      success: false,
      message: "Internal Server Error",
      error: error.message,
    });
  }
};

const updateTournament = async (req, res) => {
  try {
    const { id } = req.params;
    let tournamentData = { ...req.body };

    // Xử lý upload ảnh mới nếu có
    if (req.file) {
      try {
        const tournament_icon = await uploadToCloudinary(
          req.file.path,
          "tournaments"
        );
        tournamentData.tournament_icon = tournament_icon;
      } catch (uploadError) {
        console.error("Error uploading tournament icon:", uploadError);
        return res.status(400).json({
          success: false,
          message: "Failed to upload tournament icon",
        });
      }
    }

    const result = await updateTournamentService(id, tournamentData);

    if (!result.success) {
      return res.status(400).json(result);
    }

    res.status(200).json(result);
  } catch (error) {
    console.error("Error in updateTournament controller:", error);
    res.status(500).json({
      success: false,
      message: "Internal Server Error",
      error: error.message,
    });
  }
};

const deleteTournament = async (req, res) => {
  try {
    const { id } = req.params;
    const result = await deleteTournamentService(id);

    if (!result.success) {
      return res.status(400).json(result);
    }

    res.status(200).json(result);
  } catch (error) {
    console.error("Error in deleteTournament controller:", error);
    res.status(500).json({
      success: false,
      message: "Internal Server Error",
      error: error.message,
    });
  }
};

// =============== TEAM CONTROLLERS ===============

const getAllTeams = async (req, res) => {
  try {
    const result = await getAllTeamsService();

    if (!result.success) {
      return res.status(400).json(result);
    }

    res.status(200).json(result);
  } catch (error) {
    console.error("Error in getAllTeams controller:", error);
    res.status(500).json({
      success: false,
      message: "Internal Server Error",
      error: error.message,
    });
  }
};

const getTeamById = async (req, res) => {
  try {
    const { id } = req.params;
    const result = await getTeamByIdService(id);

    if (!result.success) {
      return res.status(404).json(result);
    }

    res.status(200).json(result);
  } catch (error) {
    console.error("Error in getTeamById controller:", error);
    res.status(500).json({
      success: false,
      message: "Internal Server Error",
      error: error.message,
    });
  }
};

const getTeamsByTournament = async (req, res) => {
  try {
    const { tournament_id } = req.params;
    const result = await getTeamsByTournamentService(tournament_id);

    if (!result.success) {
      return res.status(400).json(result);
    }

    res.status(200).json(result);
  } catch (error) {
    console.error("Error in getTeamsByTournament controller:", error);
    res.status(500).json({
      success: false,
      message: "Internal Server Error",
      error: error.message,
    });
  }
};

const getTeamsPaginated = async (req, res) => {
  try {
    const { search, sport, tournament, limit = 10, page = 1 } = req.query;
    const result = await getTeamsPaginatedService(
      search,
      sport,
      tournament,
      parseInt(limit),
      parseInt(page)
    );
    if (!result.success) {
      return res.status(400).json(result);
    }
    res.status(200).json(result);
  } catch (error) {
    console.error("Error in getTeamsPaginated controller:", error);
    res.status(500).json({
      success: false,
      message: "Internal Server Error",
      error: error.message,
    });
  }
};

const createTeam = async (req, res) => {
  try {
    let teamData = { ...req.body };

    // Xử lý upload ảnh nếu có
    if (req.file) {
      try {
        const team_logo = await uploadToCloudinary(req.file.path, "teams");
        teamData.team_logo = team_logo;
      } catch (uploadError) {
        console.error("Error uploading team logo:", uploadError);
        return res.status(400).json({
          success: false,
          message: "Failed to upload team logo",
        });
      }
    }

    const result = await createTeamService(teamData);

    if (!result.success) {
      return res.status(400).json(result);
    }

    res.status(201).json(result);
  } catch (error) {
    console.error("Error in createTeam controller:", error);
    res.status(500).json({
      success: false,
      message: "Internal Server Error",
      error: error.message,
    });
  }
};

const updateTeam = async (req, res) => {
  try {
    const { id } = req.params;
    let teamData = { ...req.body };

    // Xử lý upload ảnh mới nếu có
    if (req.file) {
      try {
        const team_logo = await uploadToCloudinary(req.file.path, "teams");
        teamData.team_logo = team_logo;
      } catch (uploadError) {
        console.error("Error uploading team logo:", uploadError);
        return res.status(400).json({
          success: false,
          message: "Failed to upload team logo",
        });
      }
    }

    const result = await updateTeamService(id, teamData);

    if (!result.success) {
      return res.status(400).json(result);
    }

    res.status(200).json(result);
  } catch (error) {
    console.error("Error in updateTeam controller:", error);
    res.status(500).json({
      success: false,
      message: "Internal Server Error",
      error: error.message,
    });
  }
};

const deleteTeam = async (req, res) => {
  try {
    const { id } = req.params;
    const result = await deleteTeamService(id);

    if (!result.success) {
      return res.status(400).json(result);
    }

    res.status(200).json(result);
  } catch (error) {
    console.error("Error in deleteTeam controller:", error);
    res.status(500).json({
      success: false,
      message: "Internal Server Error",
      error: error.message,
    });
  }
};

export {
  // Category exports
  getAllCategories,
  getCategoryById,
  getCategoriesPaginated,
  createCategory,
  updateCategory,
  deleteCategory,

  // Sport exports
  getAllSports,
  getSportById,
  getSportsPaginated,
  createSport,
  updateSport,
  deleteSport,

  // Tournament exports
  getAllTournaments,
  getTournamentById,
  getTournamentsBySport,
  getTournamentsPaginated,
  createTournament,
  updateTournament,
  deleteTournament,

  // Team exports
  getAllTeams,
  getTeamById,
  getTeamsByTournament,
  getTeamsPaginated,
  createTeam,
  updateTeam,
  deleteTeam,
};
