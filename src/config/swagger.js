const swaggerJsdoc = require('swagger-jsdoc');

/**
 * Swagger Configuration
 * 
 * Comprehensive API documentation using OpenAPI 3.0 specification.
 * Access the interactive documentation at: http://localhost:5000/api-docs
 */

const options = {
  definition: {
    openapi: '3.0.0',
    info: {
      title: 'Auth & Payments REST API',
      version: '1.0.0',
      description: 
        'A production-inspired REST API with authentication, role-based access control (RBAC), ' +
        'and Paystack payment integration.\n\n' +
        '## Features\n' +
        '- JWT-based authentication\n' +
        '- Role-based access control (Admin/User)\n' +
        '- Paystack payment integration\n' +
        '- Transaction management\n\n' +
        '## Getting Started\n\n' +
        '1. **Register a new user** using the `/api/auth/register` endpoint\n' +
        '2. **Login** to get your JWT token using `/api/auth/login`\n' +
        '3. **Copy the token** from the response\n' +
        '4. **Click the "Authorize" button** at the top of this page\n' +
        '5. **Paste your token** in the format: `Bearer YOUR_TOKEN_HERE`\n' +
        '6. **Test the protected endpoints** below\n\n' +
        '## Authentication\n\n' +
        'Most endpoints require authentication. Include your JWT token in the Authorization header:\n' +
        '```\n' +
        'Authorization: Bearer YOUR_JWT_TOKEN\n' +
        '```\n\n' +
        '## Roles\n\n' +
        '- **User**: Can register, login, initiate payments, verify payments, and view own transactions\n' +
        '- **Admin**: All user permissions + can view all transactions in the system\n\n' +
        '## Payment Testing\n\n' +
        'When testing payments, use Paystack test mode:\n' +
        '- Amount is in **kobo** (smallest currency unit)\n' +
        '- 5000 kobo = ₦50.00\n' +
        '- Use test cards from Paystack documentation',
      contact: {
        name: 'API Support',
        email: 'support@example.com',
      },
      license: {
        name: 'ISC',
      },
    },
    servers: [
      {
        url: 'http://localhost:5000',
        description: 'Development server',
      },
      {
        url: 'https://api.example.com',
        description: 'Production server',
      },
    ],
    components: {
      securitySchemes: {
        bearerAuth: {
          type: 'http',
          scheme: 'bearer',
          bearerFormat: 'JWT',
          description: 'Enter your JWT token. Format: Bearer YOUR_TOKEN_HERE',
        },
      },
      schemas: {
        User: {
          type: 'object',
          properties: {
            id: {
              type: 'string',
              description: 'User ID',
              example: '507f1f77bcf86cd799439011',
            },
            name: {
              type: 'string',
              description: 'User full name',
              example: 'John Doe',
            },
            email: {
              type: 'string',
              format: 'email',
              description: 'User email address',
              example: 'john@example.com',
            },
            role: {
              type: 'string',
              enum: ['user', 'admin'],
              description: 'User role',
              example: 'user',
            },
            createdAt: {
              type: 'string',
              format: 'date-time',
              description: 'Account creation timestamp',
            },
          },
        },
        Transaction: {
          type: 'object',
          properties: {
            id: {
              type: 'string',
              description: 'Transaction ID',
              example: '507f1f77bcf86cd799439011',
            },
            user: {
              oneOf: [
                { type: 'string' },
                { $ref: '#/components/schemas/User' },
              ],
              description: 'User who made the transaction',
            },
            amount: {
              type: 'number',
              description: 'Transaction amount in kobo',
              example: 5000,
            },
            reference: {
              type: 'string',
              description: 'Unique Paystack transaction reference',
              example: 'PAY-1704110400000-ABC123',
            },
            status: {
              type: 'string',
              enum: ['pending', 'success', 'failed'],
              description: 'Transaction status',
              example: 'success',
            },
            createdAt: {
              type: 'string',
              format: 'date-time',
              description: 'Transaction creation timestamp',
            },
          },
        },
        Error: {
          type: 'object',
          properties: {
            success: {
              type: 'boolean',
              example: false,
            },
            message: {
              type: 'string',
              description: 'Error message',
              example: 'Error description',
            },
            errors: {
              type: 'object',
              description: 'Validation errors (if applicable)',
              additionalProperties: {
                type: 'string',
              },
            },
          },
        },
        Success: {
          type: 'object',
          properties: {
            success: {
              type: 'boolean',
              example: true,
            },
            message: {
              type: 'string',
              description: 'Success message',
            },
          },
        },
      },
    },
    tags: [
      {
        name: 'Health',
        description: 'Server health check endpoint',
      },
      {
        name: 'Authentication',
        description: 'User registration and authentication endpoints',
      },
      {
        name: 'Payments',
        description: 'Payment transaction endpoints',
      },
    ],
  },
  apis: ['./src/routes/*.js', './src/app.js'], // Path to the API files
};

const swaggerSpec = swaggerJsdoc(options);

module.exports = swaggerSpec;
