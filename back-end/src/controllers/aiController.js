import { aiService } from "@/services/aiService.js";

const predict = async (req, res, next) => {
  try {
    const file = req.file;

    if (!file) {
      return res.status(400).json({
        code: 400,
        success: false,
        message: "Missing image file (field name must be 'image')",
      });
    }

    if (!file.mimetype?.startsWith("image/")) {
      return res.status(400).json({
        code: 400,
        success: false,
        message: "Only image uploads are supported",
      });
    }

    const aiResult = await aiService.predictDisease({
      buffer: file.buffer,
      filename: file.originalname || "image",
      mimetype: file.mimetype,
    });

    return res.status(200).json({
      code: 200,
      success: true,
      message: "AI prediction success",
      data: aiResult,
    });
  } catch (error) {
    next(error);
  }
};

export const aiController = {
  predict,
};
