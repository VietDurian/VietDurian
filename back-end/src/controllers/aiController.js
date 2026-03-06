import { aiService } from "@/services/aiService.js";

const DISEASE_INFO = {
  Fruit_Rot: {
    viName: "Bệnh thối trái",
    solutions: ["Không để trái chạm đất", "Bao trái"],
  },
  Leaf_Algal: {
    viName: "Bệnh đốm lá do tảo ký sinh",
    solutions: ["Tỉa cành cho ánh sáng xuyên tán"],
  },
  Leaf_Blight: {
    viName: "Bệnh cháy lá",
    solutions: [
      "Tỉa cành tạo tán cho vườn thông thoáng",
      "Không tưới nước lên lá vào chiều tối",
      "Thu gom lá bệnh đem tiêu hủy",
    ],
  },
  Leaf_Colletotrichum: {
    viName: "Bệnh thán thư trên lá",
    solutions: [
      "Tỉa cành giảm ẩm độ",
      "Không trồng quá dày",
      "Thu gom lá bệnh",
    ],
  },
  Leaf_Healthy: {
    viName: "Lá khỏe mạnh",
    solutions: ["Tiếp tục theo dõi và chăm sóc định kỳ"],
  },
  Leaf_Phomopsis: {
    viName: "Bệnh đốm lá Phomopsis",
    solutions: ["Cắt bỏ lá bị bệnh", "Bón phân hữu cơ + vi sinh"],
  },
  Leaf_Rhizoctonia: {
    viName: "Bệnh cháy lá do nấm Rhizoctonia",
    solutions: ["Thoát nước tốt", "Không để lá rụng tích tụ"],
  },
  Mealybug_Infestation: {
    viName: "Bệnh gây hại của rệp sáp",
    solutions: ["Nấm xanh (Metarhizium)"],
  },
  Pink_Disease: {
    viName: "Bệnh nấm hồng",
    solutions: ["Cắt bỏ cành bệnh", "Bôi vôi + thuốc đồng"],
  },
  Sooty_Mold: {
    viName: "Bệnh mốc bồ hóng",
    solutions: ["Rửa lá bằng nước", "Kiểm soát côn trùng gây mật"],
  },
  Stem_Cracking_Gummosis: {
    viName: "Bệnh nứt thân chảy nhựa",
    solutions: ["Thoát nước tốt", "Không làm tổn thương thân"],
  },
  Thrips_Disease: {
    viName: "Bệnh do bọ trĩ gây hại",
    solutions: ["Beauveria bassiana"],
  },
  Yellow_Leaf: {
    viName: "Bệnh vàng lá",
    solutions: [
      "Bón hữu cơ + humic",
      "Bổ sung Mg, Zn, Fe",
      "Kiểm tra pH đất (5.5–6.5)",
    ],
  },
};

const localizeAiResult = (aiResult) => {
  if (!aiResult || typeof aiResult !== "object") return aiResult;

  const predictedClassEn = aiResult.predicted_class;
  const info = DISEASE_INFO[predictedClassEn];

  const topK = Array.isArray(aiResult.top_k) ? aiResult.top_k : [];
  const localizedTopK = topK.map((item) => {
    const classNameEn = item?.class_name;
    const itemInfo = DISEASE_INFO[classNameEn];
    return {
      ...item,
      class_name_en: classNameEn,
      class_name_vi: itemInfo?.viName || classNameEn,
    };
  });

  return {
    ...aiResult,
    predicted_class_en: predictedClassEn,
    predicted_class_vi: info?.viName || predictedClassEn,
    solutions: info?.solutions || [],
    top_k: localizedTopK,
  };
};

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

    const localized = localizeAiResult(aiResult);

    return res.status(200).json({
      code: 200,
      success: true,
      message: "AI prediction success",
      data: localized,
    });
  } catch (error) {
    next(error);
  }
};

export const aiController = {
  predict,
};
