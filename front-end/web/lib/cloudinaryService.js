// Cloudinary upload helper for frontend
import { axiosInstance } from './axios';

/**
 * Upload proof file and get Cloudinary URL
 * @param {File} file - File to upload
 * @param {string} proofType - Type of proof (cccd_front, cccd_back, certificate, degree, other)
 * @returns {Promise<{url: string, proofType: string, uploadedAt: string}>}
 */
export const uploadProofToCloudinary = async (file, proofType) => {
    try {
        // Convert file to base64
        const fileAsBase64 = await new Promise((resolve, reject) => {
            const reader = new FileReader();
            reader.onload = () => resolve(reader.result);
            reader.onerror = reject;
            reader.readAsDataURL(file);
        });

        // Send to backend API which handles Cloudinary upload
        const response = await axiosInstance.post('/permission/upload-proof', {
            file: fileAsBase64,
            proofType,
        });

        if (response?.data?.code === 200 && response?.data?.data) {
            return {
                type: proofType,
                url: response.data.data.url,
                uploadedAt: response.data.data.uploadedAt || new Date().toISOString(),
            };
        }

        throw new Error(response?.data?.message || 'Upload failed');
    } catch (error) {
        console.error('Error uploading proof:', error);
        throw error;
    }
};

/**
 * Upload multiple proof files
 * @param {Object} files - Object with proofType as key and File as value
 * @returns {Promise<Array>} - Array of uploaded proof objects
 */
export const uploadMultipleProofs = async (files) => {
    try {
        const uploadPromises = Object.entries(files).map(([proofType, file]) => {
            if (!file) return null;
            return uploadProofToCloudinary(file, proofType);
        });

        const results = await Promise.all(uploadPromises);
        return results.filter(Boolean);
    } catch (error) {
        console.error('Error uploading multiple proofs:', error);
        throw error;
    }
};

export const cloudinaryService = {
    uploadProofToCloudinary,
    uploadMultipleProofs,
};
