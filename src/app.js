const express = require('express');
const logger = require('morgan');
const { handleError } = require('./middlewares/errors');

module.exports = (router) => {
  const app = express();
  app.use(express.json());
  app.use(logger('common'));
  
  app.use(router);
  
  app.use((error, req, res, next) => {
    handleError(error, res);
  });
  
  return app;
}