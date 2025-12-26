import express from 'express';

import { authRoute } from '@/routes/authRoute';
import { profileRoute } from '@/routes/profileRoute';
import { productRoute } from '@/routes/productRoute';
import { ratingRoute } from '@/routes/ratingRoute';
import { typeProductRoute } from '@/routes/typeProductRoute';
import { stepRoute } from '@/routes/stepRoute';
import { blogRoute } from '@/routes/blogRoute';
import { postRoute } from '@/routes/postRoute';
import { commentPostRoute } from '@/routes/commentPostRoute';
import { reactionCommentRoute } from '@/routes/reactionCommentRoute';
import { reportPostRoute } from '@/routes/reportPostRoute';
import { diaryRoute } from '@/routes/diaryRoute';
import { favoriteRoute } from '@/routes/favoriteRoute';

const Router = express.Router();

Router.use('/auth', authRoute);
// Router.use('/user', userRoute);
Router.use('/profile', profileRoute);
Router.use('/products', productRoute);
Router.use('/ratings', ratingRoute);
Router.use('/type-product', typeProductRoute);
Router.use('/step', stepRoute);
Router.use('/blog', blogRoute);
Router.use('/post', postRoute);
Router.use('/report', reportPostRoute);
Router.use('/comment', commentPostRoute);
Router.use('/reaction', reactionCommentRoute);
Router.use('/diary', diaryRoute);
Router.use('/favorite', favoriteRoute);

export const API_v1 = Router;