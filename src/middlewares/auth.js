function getToken(authHeader) {
  // Format of authHeader expected: 'Bearer eyJhbGciOiJIUzI1Ni....'
  return authHeader.split(' ')[1];
}

module.exports = (service) => {
  return async (req, res, next) => {
    try {
      // Check for token in Authorization header
      const authHeader = req.headers.authorization;
      if (!authHeader) throw new Error('no valid token');
      
      const token = getToken(authHeader);
      if (!token) throw new Error('no valid token');
      
      // If token invalid, redirect, else continue
      const { uid } = service.verifyToken(token);
      if (!uid) throw new Error('no valid token');
      
      res.uid = uid;
      next();
    } 
    catch (error) {
      // Handle known errors
      const JWT_ERRORS = ['TokenExpiredError', 'JsonWebTokenError', 'NotBeforeError'];
      if (error.message === 'no valid token') return res.redirect(401, '/');
      if (JWT_ERRORS.includes(error.name)) return res.redirect(401, '/');

      next(error);
    }
  };
};