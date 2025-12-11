import swaggerJsdoc from 'swagger-jsdoc';

const options = {
  definition: {
    openapi: '3.0.0',
    info: {
      title: 'VietDurian API Documentation',
      version: '1.0.0',
      description: 'API documentation for VietDurian application',
      contact: {
        name: 'Developer',
      },
    },
    servers: [
      {
        url: 'http://localhost:3000/api/v1',
        description: 'Development server',
      },
    ],
    components: {
      securitySchemes: {
        bearerAuth: {
          type: 'http',
          scheme: 'bearer',
          bearerFormat: 'JWT',
        },
      },
    },
    security: [
      {
        bearerAuth: [],
      },
    ],
  },
  // Đường dẫn đến các file chứa annotation swagger
  apis: ['./src/routes/*.js', './src/model/*.js'], 
};

const swaggerSpec = swaggerJsdoc(options);

export default swaggerSpec;
