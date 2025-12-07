import express from 'express';

const Router = express.Router();

Router.post('/register', (req, res) => {
	res.status(201).send({ message: 'User successfully' });
});
Router.post('/login', (req, res) => {
	res.status(201).send({ message: 'User successfully' });
});
Router.post('/google-login', (req, res) => {
	res.status(201).send({ message: 'User successfully' });
});
Router.post('/logout', (req, res) => {
	res.status(201).send({ message: 'User successfully' });
});
Router.post('/forgot-password', (req, res) => {
	res.status(201).send({ message: 'User successfully' });
});
Router.post('/reset-password', (req, res) => {
	res.status(201).send({ message: 'User successfully' });
});

export const authRoute = Router;
