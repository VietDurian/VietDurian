import express from 'express';

const Router = express.Router();

Router.get('/profile', (req, res) => {
    res.status(200).send({ message: 'User profile data' });
});
Router.patch('/profile', (req, res) => {
    res.status(200).send({ message: 'User profile updated' });
});

Router.post('/change-password', (req, res) => {
	res.status(201).send({ message: 'User successfully' });
});

export const userRoute = Router;