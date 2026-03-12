// Proof upload service for handling file uploads to Cloudinary
import { cloudinary } from "@/config/cloudinary.js";
import fs from "fs";
import path from "path";
import os from "os";

/**
 * Upload proof file to Cloudinary
 * @param {File|string} file - File object from multipart or base64 string
 * @param {string} proofType - Type of proof (cccd_front, cccd_back, certificate, degree, other)
 * @returns {Promise<Object>} - { url, publicId, proofType, uploadedAt }
 */
export const uploadProofFile = async (file, proofType) => {
    try {
        let uploadPath = file.path;
        let isTemp = false;

        // If file is a base64 string, save it temporarily
        if (typeof file === "string" && file.startsWith("data:")) {
            const tempDir = path.join(os.tmpdir(), "vietdurian-proofs");
            if (!fs.existsSync(tempDir)) {
                fs.mkdirSync(tempDir, { recursive: true });
            }

            const base64Data = file.replace(/^data:image\/\w+;base64,/, "");
            uploadPath = path.join(tempDir, `proof-${Date.now()}.jpg`);
            fs.writeFileSync(uploadPath, Buffer.from(base64Data, "base64"));
            isTemp = true;
        }

        // Upload to Cloudinary
        const result = await cloudinary.uploader.upload(uploadPath, {
            folder: `vietdurian/proofs/${proofType}`,
            resource_type: "auto",
            use_filename: false,
            quality: "auto",
            fetch_format: "auto",
            flags: "lossy",
        });

        // Clean up temp file if created
        if (isTemp && fs.existsSync(uploadPath)) {
            fs.unlinkSync(uploadPath);
        }

        return {
            url: result.secure_url,
            publicId: result.public_id,
            proofType,
            uploadedAt: new Date(),
        };
    } catch (error) {
        console.error("Error uploading proof file:", error);
        throw new Error(`Failed to upload proof: ${error.message}`);
    }
};

/**
 * Delete proof file from Cloudinary
 * @param {string} publicId - Public ID of the file to delete
 */
export const deleteProofFile = async (publicId) => {
    try {
        await cloudinary.uploader.destroy(publicId);
    } catch (error) {
        console.error("Error deleting proof file:", error);
        throw new Error(`Failed to delete proof: ${error.message}`);
    }
};

/**
 * Upload multiple proofs at once
 * @param {Array} files - Array of file objects
 * @param {string} proofType - Proof type for all files
 * @returns {Promise<Array>} - Array of uploaded proof objects
 */
export const uploadMultipleProofs = async (files, proofType) => {
    try {
        const uploadPromises = files.map((file) =>
            uploadProofFile(file, proofType),
        );
        return await Promise.all(uploadPromises);
    } catch (error) {
        console.error("Error uploading multiple proofs:", error);
        throw error;
    }
};

export const proofUploadService = {
    uploadProofFile,
    deleteProofFile,
    uploadMultipleProofs,
};
