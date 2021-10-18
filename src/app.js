const express = require('express');
const logger = require('morgan');
const OpenApiValidator = require('express-openapi-validator');
const { handleError } = require('./middlewares/errors');

module.exports = (router) => {
  const app = express();
  app.use(express.json());
  app.use(logger('common'));
  
  app.use(
    OpenApiValidator.middleware({
      apiSpec: './src/api-docs/openapi-specs.yml',
      ignorePaths: /api-docs/,
      validateApiSpec: true,
      validateRequests: true,
      validateResponses: true
    })
  );
  
  app.use(function(req, res, next) {
    const allowedOrigins = ['http://grumbeard-powerx-todo.herokuapp.com', 'http://localhost:3000', 'http://localhost:3030'];
    const origin = req.headers.origin;
    if (allowedOrigins.includes(origin)) res.setHeader('Access-Control-Allow-Origin', origin);
    res.header('Access-Control-Allow-Methods', 'GET, POST, PATCH, DELETE, OPTIONS');
    res.header('Access-Control-Allow-Headers', 'Origin, X-Requested-With, Content-Type, Accept, Authorization');
    next();
  });
  
  app.use(router);
  
  app.use((error, req, res, next) => {
    handleError(error, res);
  });
  
  return app;
}