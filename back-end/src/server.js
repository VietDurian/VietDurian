import express from 'express';
import cors from 'cors';
import API_v1 from '@/routes/index'

const app = express();
app.use(cors());
app.use(express.json());

app.use('/api/v1', API_v1);

app.listen(3000, () => {
	console.log('Server is running on port 3000');
});
