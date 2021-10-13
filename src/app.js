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
      validateApiSpec: true,
      validateRequests: true,
      validateResponses: true
    })
  );
  
  app.use(router);
  
  app.use((error, req, res, next) => {
    handleError(error, res);
  });
  
  return app;
}