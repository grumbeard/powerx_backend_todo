const router = require('express').Router();

module.exports = (service) => {
  router.post('/login', async (req, res, next) => {
    const { email, password } = req.body;
    const token = await service.login({ email, password });
    token
      ? res.status(200).send({ token: token })
      : res.status(401).send('Failed to login');
  })
  
  router.post('/register', async (req, res, next) => {
    const { email, password } = req.body;
    const token = await service.register({ email, password });
    // Status Code 201 chosen because User created
    token
      ? res.status(200).send({ token: token })
      : res.status(401).send('Failed to register: email already in use');
  })
  
  return router;
}