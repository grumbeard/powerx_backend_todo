function getToken(authHeader) {
  // Format of authHeader expected: 'Bearer eyJhbGciOiJIUzI1Ni....'
  return authHeader.split(' ')[1];
}

module.exports = (service) => {
  return async (req, res, next) => {
    // Check for token in Authorization header
    const authHeader = req.headers.authorization;
    if (!authHeader) return res.redirect(401, '/');
    
    const token = getToken(authHeader);
    if (!token) return res.redirect(401, '/');
    
    // If token invalid, redirect, else continue
    const { uid } = service.verifyToken(token);
    if (!uid) return res.redirect(401, '/');
    
    res.uid = uid;
    next();
  };
};