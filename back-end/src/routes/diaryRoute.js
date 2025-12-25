import express from 'express';
import { diaryController } from '@/controllers/diaryController';
import { authMiddleware } from '@/middlewares/authentication';
import { authorizationMiddleware } from '@/middlewares/authorization';

const Router = express.Router();


Router.get('/', authMiddleware.protect, diaryController.getDiariesByUser);
Router.post('/', authMiddleware.protect, diaryController.createDiary);
// Router.get('/:diaryId', authMiddleware.protect, diaryController.getDiaryById);
Router.patch('/:diaryId', authMiddleware.protect, diaryController.updateDiary);
// Router.delete('/:diaryId', authMiddleware.protect, diaryController.deleteDiary);

export { Router as diaryRoute };
