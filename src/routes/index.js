const router = require('express').Router();

module.exports = () => {
  router.get('/', (req, res) => {
    res.status(200).send('Homepage')
  })
  router.all('*', (req, res) => {
    res
      .status(404)
      .set({ 'Content-Type': 'text/html' })
      .send('<h1>No Page Found</h1><a href="/">Back</a>')
  });
  
  return router;
};