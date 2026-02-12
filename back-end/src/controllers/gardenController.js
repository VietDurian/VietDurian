import { gardenService } from "@/services/gardenService.js";

// View Map - Get all gardens with coordinates
const viewMap = async (req, res, next) => {
  try {
    const gardens = await gardenService.getAllGardens();

    res.status(200).json({
      code: 200,
      success: true,
      message: "Gardens retrieved successfully for map view",
      data: gardens,
    });
  } catch (error) {
    next(error);
  }
};

// Admin: batch geocode gardens missing coordinates (cache lat/lng by location)
const geocodeGardens = async (req, res, next) => {
  try {
    const limit = req.query?.limit;
    const result = await gardenService.geocodeAllMissingGardens({ limit });

    res.status(200).json({
      code: 200,
      success: true,
      message: "Garden geocoding completed",
      data: result,
    });
  } catch (error) {
    next(error);
  }
};

// Get user's gardens
const getUserGardens = async (req, res, next) => {
  try {
    const userId = req.params.user_id;

    if (!userId) {
      return res.status(401).json({
        code: 401,
        message: "User not authenticated",
      });
    }

    const gardens = await gardenService.getGardensByUser(userId);

    res.status(200).json({
      code: 200,
      success: true,
      message: "User gardens retrieved successfully",
      data: gardens,
    });
  } catch (error) {
    next(error);
  }
};

// Get garden details
const getGardenDetails = async (req, res, next) => {
  try {
    const { garden_id } = req.params;

    if (!garden_id) {
      return res.status(400).json({
        code: 400,
        message: "Garden ID is required",
      });
    }

    const garden = await gardenService.getGardenById(garden_id);

    res.status(200).json({
      code: 200,
      success: true,
      message: "Garden details retrieved successfully",
      data: garden,
    });
  } catch (error) {
    next(error);
  }
};

// Register Garden Records - Create new garden
const registerGarden = async (req, res, next) => {
  try {
    const userId = req.user?.id || req.user?._id;
    const gardenData = req.body;

    if (!userId) {
      return res.status(401).json({
        code: 401,
        message: "User not authenticated",
      });
    }

    const newGarden = await gardenService.createGarden(userId, gardenData);

    res.status(201).json({
      code: 201,
      success: true,
      message: "Garden record created successfully",
      data: newGarden,
    });
  } catch (error) {
    next(error);
  }
};

// Edit Garden Records - Update existing garden
const editGarden = async (req, res, next) => {
  try {
    const { garden_id } = req.params;
    const updateData = req.body;

    if (!garden_id) {
      return res.status(400).json({
        code: 400,
        message: "Garden ID is required",
      });
    }

    const updatedGarden = await gardenService.updateGarden(
      garden_id,
      updateData
    );

    res.status(200).json({
      code: 200,
      success: true,
      message: "Garden record updated successfully",
      data: updatedGarden,
    });
  } catch (error) {
    next(error);
  }
};

// Delete garden record
const deleteGarden = async (req, res, next) => {
  try {
    const { garden_id } = req.params;

    if (!garden_id) {
      return res.status(400).json({
        code: 400,
        message: "Garden ID is required",
      });
    }

    const deletedGarden = await gardenService.deleteGarden(garden_id);

    res.status(200).json({
      code: 200,
      success: true,
      message: "Garden record deleted successfully",
      data: deletedGarden,
    });
  } catch (error) {
    next(error);
  }
};

export const gardenController = {
  viewMap,
  geocodeGardens,
  getUserGardens,
  getGardenDetails,
  registerGarden,
  editGarden,
  deleteGarden,
};
