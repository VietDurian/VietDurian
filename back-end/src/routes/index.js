import express from 'express';

import { authRoute } from '@/routes/authRoute';
import { userRoute } from '@/routes/userRoute';

const Router = express.Router();
Router.use('/auth', authRoute);
Router.use('/user', userRoute);

export const API_v1 = Router;
