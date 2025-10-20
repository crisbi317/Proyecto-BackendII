export const requireAdmin = (req, res, next) => {
  if (req.user?.role !== 'admin') {
    return res.status(403).render('error', { error: 'Acceso denegado: solo administradores' });
  }
  next();
};