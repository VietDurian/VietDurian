//Vo Lam Thuy Vi
import express from 'express';
import { serviceProviderProfileController } from '@/controllers/serviceProviderProfileController.js';
import { authMiddleware } from '@/middlewares/authentication.js';
import { authorizationMiddleware } from '@/middlewares/authorization.js';

const Router = express.Router();

/**
 * @swagger
 * /capability-profile:
 *   post:
 *     summary: Create capability profile for service provider
 *     tags:
 *       - ServiceProviderProfile
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               user_id:
 *                 type: string
 *                 description: User ID
 *                 example: 69429eee21eeba96cd1c3f6f
 *               business_name:
 *                 type: string
 *                 description: Business name
 *                 example: "Number One"
 *               services:
 *                 type: string
 *                 description: Services provided
 *                 example: "Phun thuốc, diệt côn trùng, thu hoạch sầu riêng"
 *               service_areas:
 *                 type: string
 *                 description: Service areas
 *                 example: "TP. Hồ Chí Minh, TP. Cần Thơ"
 *               experience_year:
 *                 type: integer
 *                 description: Years of experience
 *                 example: 5
 *               contact_phone:
 *                 type: string
 *                 description: Contact phone
 *                 example: "0909123456"
 *               description:
 *                 type: string
 *                 description: Description
 *                 example: "Chuyên cung cấp dịch vụ nông nghiệp uy tín hàng đầu"
 *     responses:
 *       201:
 *         description: Capability profile created successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 user_id:
 *                   type: string
 *                   description: User ID
 *                 business_name:
 *                   type: string
 *                   description: Business name
 *                 services:
 *                   type: string
 *                   description: Services provided
 *                 service_areas:
 *                   type: string
 *                   description: Service areas
 *                 experience_year:
 *                   type: integer
 *                   description: Years of experience
 *                 contact_phone:
 *                   type: string
 *                   description: Contact phone
 *                 description:
 *                   type: string
 *                   description: Description
 *                 created_at:
 *                   type: string
 *                   format: date-time
 *                   description: Creation timestamp
 *                 updated_at:
 *                   type: string
 *                   format: date-time
 *                   description: Update timestamp
 *
 *   get:
 *     summary: View capability profile of a service provider
 *     description: Anyone can view a service provider's capability profile by user_id. If no user_id is provided, returns the profile of the authenticated user.
 *     tags:
 *       - ServiceProviderProfile
 *     parameters:
 *       - in: query
 *         name: user_id
 *         schema:
 *           type: string
 *         required: false
 *         description: User ID of the service provider to view
 *     responses:
 *       200:
 *         description: Capability profile retrieved successfully
 *         content:
 *           application/json:
 *             schema:
 *             type: object
 *             properties:
 *               user_id:
 *                 type: string
 *                 description: User ID
 *               business_name:
 *                 type: string
 *                 description: Business name
 *               services:
 *                 type: string
 *                 description: Services provided
 *               service_areas:
 *                 type: string
 *                 description: Service areas
 *               experience_year:
 *                 type: integer
 *                 description: Years of experience
 *               contact_phone:
 *                 type: string
 *                 description: Contact phone
 *               description:
 *                 type: string
 *                 description: Description
 *
 *   put:
 *     summary: Update capability profile for service provider
 *     tags:
 *       - ServiceProviderProfile
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               user_id:
 *                 type: string
 *                 description: User ID
 *                 example: 69429eee21eeba96cd1c3f6f
 *               business_name:
 *                 type: string
 *                 description: Business name
 *                 example: "Number One"
 *               services:
 *                 type: string
 *                 description: Services provided
 *                 example: "Phun thuốc, diệt côn trùng, thu hoạch sầu riêng"
 *               service_areas:
 *                 type: string
 *                 description: Service areas
 *                 example: "TP. Hồ Chí Minh, TP. Cần Thơ"
 *               experience_year:
 *                 type: integer
 *                 description: Years of experience
 *                 example: 5
 *               contact_phone:
 *                 type: string
 *                 description: Contact phone
 *                 example: "0909123456"
 *               description:
 *                 type: string
 *                 description: Description
 *                 example: "Chuyên cung cấp dịch vụ nông nghiệp uy tín hàng đầu"
 *     responses:
 *       200:
 *         description: Capability profile updated successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 user_id:
 *                   type: string
 *                   description: User ID
 *                   example: 69429eee21eeba96cd1c3f6f
 *                 business_name:
 *                   type: string
 *                   description: Business name
 *                 services:
 *                   type: string
 *                   description: Services provided
 *                 service_areas:
 *                   type: string
 *                   description: Service areas
 *                 experience_year:
 *                   type: integer
 *                   description: Years of experience
 *                 contact_phone:
 *                   type: string
 *                   description: Contact phone
 *                 description:
 *                   type: string
 *                   description: Description
 *                 created_at:
 *                   type: string
 *                   format: date-time
 *                   description: Creation timestamp
 *                 updated_at:
 *                   type: string
 *                   format: date-time
 *                   description: Update timestamp
 *       401:
 *         description: Unauthorized
 *       403:
 *         description: Forbidden
 */

Router.post(
	'/',
	authMiddleware.protect,
	authorizationMiddleware.hasRole('serviceProvider'),
	serviceProviderProfileController.addCapabilityProfile,
);

Router.get(
	'/',
	authMiddleware.protect,
	serviceProviderProfileController.getCapabilityProfile,
);

Router.put(
	'/',
	authMiddleware.protect,
	authorizationMiddleware.hasRole('serviceProvider'),
	serviceProviderProfileController.updateCapabilityProfile,
);

export const serviceProviderProfileRoute = Router;
