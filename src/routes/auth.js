const router = require('express').Router();

module.exports = (service) => {
  router.post('/login', async (req, res, next) => {
    const { email, password } = req.body;
    try {
      const token = await service.login({ email, password });
      token
        ? res.status(200).send({ token: token })
        : res.status(401).send('Failed to login');
    }
    catch (error) { next(error) }
  })
  
  router.post('/register', async (req, res, next) => {
    const { email, password } = req.body;
    try {
      const token = await service.register({ email, password });
      // Status Code 200 chosen because User created but resource Location not available
      token
        ? res.status(200).send({ token: token })
        : res.status(401).send('Failed to register: email already in use');
    }
    catch (error) { next(error) }
  })
  
  return router;
}