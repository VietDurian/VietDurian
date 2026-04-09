import { aiService } from "@/services/aiService.js";

const DISEASE_INFO = {
  Fruit_Rot: {
    viName: "Bệnh thối trái",
    enName: "Fruit Rot",
    solutions: ["Bao trái", "Thu hoạch đúng thời điểm", "Thu gom trái bệnh"],
  },
  Leaf_Algal: {
    viName: "Bệnh đốm lá do tảo ký sinh",
    enName: "Algal Leaf Spot",
    solutions: ["Tỉa cành cho ánh sáng xuyên tán"],
  },
  Leaf_Blight: {
    viName: "Bệnh cháy lá",
    enName: "Leaf Blight",
    solutions: [
      "Tỉa cành tạo tán cho vườn thông thoáng và giảm ẩm",
      "Không bón quá nhiều đạm",
      "Cắt bỏ lá bệnh và tiêu hủy",
      "Trồng với mật độ hợp lý",
      "Bón phân hữu cơ hoai mục + vi sinh",
      "Vệ sinh vườn định kỳ"
    ],
  },
  Leaf_Colletotrichum: {
    viName: "Bệnh thán thư trên lá",
    enName: "Leaf Anthracnose",
    solutions: [
      "Bón phân cân đối NPK + trung vi lượng",
      "Giảm độ ẩm vườn",
      "Tỉa bỏ cành bệnh",
      "Không để lá bệnh tồn tại trong vườn"
    ],
  },
  Leaf_Healthy: {
    viName: "Lá khỏe mạnh",
    enName: "Healthy Leaf",
    solutions: [
      "Tiếp tục duy trì chế độ tưới và bón phân cân đối như hiện tại",
      "Theo dõi định kỳ 3-7 ngày/lần để phát hiện sớm dấu hiệu bất thường",
      "Giữ vườn thông thoáng, vệ sinh lá rụng và cắt tỉa cành già yếu",
      "Hạn chế phun thuốc khi không có triệu chứng bệnh để tránh ảnh hưởng sinh trưởng"
    ],
  },
  Leaf_Phomopsis: {
    viName: "Bệnh đốm lá Phomopsis",
    enName: "Phomopsis Leaf Spot",
    solutions: ["Trồng cây giống sạch bệnh", "Tránh tưới nước lên tán lá buổi tối", "Tăng cường Kali và Canxi để tăng sức đề kháng của cây", "Thu gom lá bệnh đem đốt", "Khử trùng dụng cụ cắt tỉa"],
  },
  Leaf_Rhizoctonia: {
    viName: "Bệnh cháy lá do nấm Rhizoctonia",
    enName: "Rhizoctonia Leaf Blight",
    solutions: ["Không trồng quá dày", "Kiểm soát độ ẩm đất", "Loại bỏ lá bệnh"],
  },
  Mealybug_Infestation: {
    viName: "Bệnh gây hại của rệp sáp",
    enName: "Mealybug Infestation",
    solutions: ["Kiểm soát kiến", "Cắt bỏ cành bị nặng", "Rửa bằng nước áp lực cao"],
  },
  Pink_Disease: {
    viName: "Bệnh nấm hồng",
    enName: "Pink Disease",
    solutions: ["Tỉa cành tạo thông thoáng", "Cắt bỏ cành bệnh"],
  },
  Sooty_Mold: {
    viName: "Bệnh mốc bồ hóng",
    enName: "Sooty Mold",
    solutions: ["Kiểm soát rệp, bọ trĩ", "Rửa lá bằng nước"],
  },
  Stem_Cracking_Gummosis: {
    viName: "Bệnh nứt thân chảy nhựa",
    enName: "Stem Cracking and Gummosis",
    solutions: ["Tránh ngập úng", "Bón phân cân đối", "Cạo sạch vết bệnh"],
  },
  Thrips_Disease: {
    viName: "Bệnh do bọ trĩ gây hại",
    enName: "Thrips Damage",
    solutions: ["Vệ sinh vườn", "Bẫy dính xanh"],
  },
  Yellow_Leaf: {
    viName: "Bệnh vàng lá",
    enName: "Yellow Leaf",
    solutions: [
      "Bón phân hữu cơ + vi sinh",
      "Bổ sung Mg, Zn, Fe",
      "Cải tạo đất thoát nước tốt",
      "Tỉa cành yếu"
    ],
  },
};

const DISEASE_SOLUTIONS_EN = {
  Fruit_Rot: [
    "Bag the fruits.",
    "Harvest at the proper maturity stage.",
    "Collect and destroy infected fruits.",
  ],
  Leaf_Algal: [
    "Prune branches to improve light penetration and airflow.",
  ],
  Leaf_Blight: [
    "Prune canopy to improve airflow and reduce humidity.",
    "Avoid over-applying nitrogen fertilizer.",
    "Remove and destroy infected leaves.",
    "Use proper planting density.",
    "Apply decomposed organic fertilizer with beneficial microbes.",
    "Sanitize the orchard regularly.",
  ],
  Leaf_Colletotrichum: [
    "Apply balanced NPK with secondary and micronutrients.",
    "Reduce orchard humidity.",
    "Prune diseased branches.",
    "Do not leave infected leaves in the orchard.",
  ],
  Leaf_Healthy: [
    "Maintain the current balanced irrigation and fertilization plan.",
    "Monitor every 3-7 days for early abnormal signs.",
    "Keep the orchard ventilated, clean fallen leaves, and prune old branches.",
    "Limit spraying when no disease symptoms are present.",
  ],
  Leaf_Phomopsis: [
    "Use disease-free seedlings.",
    "Avoid wetting the canopy in the evening.",
    "Increase potassium and calcium to improve plant resistance.",
    "Collect and burn infected leaves.",
    "Disinfect pruning tools.",
  ],
  Leaf_Rhizoctonia: [
    "Avoid planting too densely.",
    "Control soil moisture.",
    "Remove diseased leaves.",
  ],
  Mealybug_Infestation: [
    "Control ant populations.",
    "Prune heavily infested branches.",
    "Wash affected parts with high-pressure water.",
  ],
  Pink_Disease: [
    "Prune branches to improve ventilation.",
    "Remove infected branches.",
  ],
  Sooty_Mold: [
    "Control aphids and thrips.",
    "Wash leaves with clean water.",
  ],
  Stem_Cracking_Gummosis: [
    "Avoid waterlogging.",
    "Apply balanced fertilization.",
    "Scrape and clean infected lesions.",
  ],
  Thrips_Disease: [
    "Sanitize the orchard.",
    "Use blue sticky traps.",
  ],
  Yellow_Leaf: [
    "Apply organic fertilizer and beneficial microbes.",
    "Supplement Mg, Zn, and Fe.",
    "Improve soil drainage.",
    "Prune weak branches.",
  ],
};

const toEnglishLabel = (classKey) => {
  const raw = String(classKey || "").trim();
  if (!raw) return "Unknown";

  return raw
    .split("_")
    .filter(Boolean)
    .map((word) => word.charAt(0).toUpperCase() + word.slice(1).toLowerCase())
    .join(" ");
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
      class_name_en: itemInfo?.enName || toEnglishLabel(classNameEn),
      class_name_vi: itemInfo?.viName || classNameEn,
    };
  });

  return {
    ...aiResult,
    predicted_class_en: info?.enName || toEnglishLabel(predictedClassEn),
    predicted_class_vi: info?.viName || predictedClassEn,
    solutions_vi: info?.solutions || [],
    solutions_en: DISEASE_SOLUTIONS_EN[predictedClassEn] || [],
    solutions: info?.solutions || [],
    top_k: localizedTopK,
  };
};

const predict = async (req, res, next) => {
  const debugAIGuard = String(process.env.DEBUG_AI_GUARD || "false").toLowerCase() === "true";
  const bypassOnQuota = String(process.env.AI_GUARD_BYPASS_ON_QUOTA || "false").toLowerCase() === "true";

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

    let guardResult;
    try {
      guardResult = await aiService.guardDurianImage({
        buffer: file.buffer,
        mimetype: file.mimetype,
        filename: file.originalname || "image",
      });
    } catch (guardError) {
      if (debugAIGuard) {
        console.error("[AIGuard]", {
          status: guardError?.status,
          code: guardError?.code,
          message: guardError?.message,
          detail: guardError?.detail || null,
          retryAfterSeconds: guardError?.retryAfterSeconds || null,
        });
      }

      if (guardError?.code === "GUARD_NOT_CONFIGURED") {
        return res.status(500).json({
          code: 500,
          success: false,
          message:
            guardError?.message ||
            "He thong dang thieu cau hinh AI guard. Vui long kiem tra GEMINI_GUARD_API_KEY.",
          data: debugAIGuard
            ? {
              detail: guardError?.detail || null,
            }
            : undefined,
        });
      }

      if (guardError?.code === "GUARD_PROVIDER_ERROR") {
        if (guardError?.status === 429 && bypassOnQuota) {
          guardResult = {
            provider: "gemini",
            isDurianRelated: true,
            confidence: null,
            reason: "Guard bypassed due to Gemini quota (AI_GUARD_BYPASS_ON_QUOTA=true).",
            bypassed: true,
            retryAfterSeconds: guardError?.retryAfterSeconds || null,
          };
        } else if (guardError?.status === 429) {
          return res.status(429).json({
            code: 429,
            success: false,
            message: "Gemini da het quota tam thoi. Vui long thu lai sau.",
            data: {
              retryAfterSeconds: guardError?.retryAfterSeconds || null,
            },
          });
        } else {
          return res.status(502).json({
            code: 502,
            success: false,
            message: "Khong the kiem tra anh voi AI guard luc nay. Vui long thu lai sau.",
            data: debugAIGuard
              ? {
                providerStatus: guardError?.status || null,
                providerCode: guardError?.code || null,
                retryAfterSeconds: guardError?.retryAfterSeconds || null,
                detail: guardError?.detail || null,
              }
              : undefined,
          });
        }
      }

      if (!guardResult?.bypassed) {
        throw guardError;
      }
    }

    if (!guardResult?.isDurianRelated) {
      return res.status(422).json({
        code: 422,
        success: false,
        message: "Ảnh bạn tải lên chưa phải ảnh sầu riêng. Vui lòng chọn ảnh liên quan đến sầu riêng để hệ thống chẩn đoán chính xác hơn.",
        data: {
          guard: guardResult,
        },
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
      data: {
        ...localized,
        guard: guardResult,
      },
    });
  } catch (error) {
    next(error);
  }
};

export const aiController = {
  predict,
};
