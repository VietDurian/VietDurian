import express from 'express';
import cors from 'cors';
import swaggerUi from 'swagger-ui-express';
import swaggerSpec from '@/config/swagger';
import { API_v1 } from '@/routes/index';

const app = express();
app.use(cors());
app.use(express.json());

// Swagger Documentation
app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(swaggerSpec));

// Api V1 Routes
app.use('/api/v1', API_v1);

app.listen(3000, () => {
	console.log('Server is running on port 3000');
	console.log('Swagger UI is available at http://localhost:3000/api-docs');
});
