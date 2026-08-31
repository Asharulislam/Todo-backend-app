import swaggerJSDoc from 'swagger-jsdoc';

const spec = swaggerJSDoc({
  definition: {
    openapi: '3.0.0',
    info: {
      title: 'Todo API',
      version: '1.0.0',
      description: 'Auth + todos REST API',
    },
    servers: [{ url: 'http://localhost:3000/api' }],
    components: {
      securitySchemes: {
        bearerAuth: { type: 'http', scheme: 'bearer', bearerFormat: 'JWT' },
      },
    },
  },
  // Files scanned for @openapi doc comments.
  // .ts for `npm run dev` (tsx), .js for the built app in dist/.
  apis: [
    './src/routes/*.ts',
    './src/controllers/*.ts',
    './dist/routes/*.js',
    './dist/controllers/*.js',
  ],
});

export default spec;
