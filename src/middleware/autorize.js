// Middleware para verificar que el usuario es administrador
export const requireAdmin = (req, res, next) => {
  if (!req.user) {
    return res.status(401).json({ 
      status: 'error',
      error: 'No autenticado' 
    });
  }
  
  if (req.user.role !== 'admin') {
    return res.status(403).json({ 
      status: 'error',
      error: 'Acceso denegado: solo administradores' 
    });
  }
  
  next();
};

// Middleware para verificar que el usuario es un usuario regular (no admin)
export const requireUser = (req, res, next) => {
  if (!req.user) {
    return res.status(401).json({ 
      status: 'error',
      error: 'No autenticado' 
    });
  }
  
  if (req.user.role !== 'user') {
    return res.status(403).json({ 
      status: 'error',
      error: 'Acceso denegado: solo usuarios regulares' 
    });
  }
  
  next();
};

// Middleware para verificar que el usuario está autenticado (cualquier rol)
export const requireAuth = (req, res, next) => {
  if (!req.user) {
    return res.status(401).json({ 
      status: 'error',
      error: 'No autenticado' 
    });
  }
  
  next();
};