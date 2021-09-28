function getToken(authHeader) {
  // Format of authHeader expected: 'Bearer eyJhbGciOiJIUzI1Ni....'
  return authHeader.split(' ')[1];
}

module.exports = (service) => {
  return async (req, res, next) => {
    // Check for token in Authorization header
    const authHeader = req.headers.authorization;
    if (!authHeader) return res.redirect('/');
    
    const token = getToken(authHeader);
    if (!token) return res.redirect('/');
    
    // If token invalid, redirect, else continue
    const { uid } = service.verifyToken(token);
    if (!uid) return res.redirect('/');
    
    res.uid = uid;
    next();
  };
};