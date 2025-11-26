// Validaciones para usuarios
exports.validateUserRegistration = (req, res, next) => {
  const { nombre, email, password } = req.body;
  const errors = [];

  if (!nombre || nombre.trim().length < 2) {
    errors.push('El nombre debe tener al menos 2 caracteres');
  }

  if (!email || !/^\w+([.-]?\w+)*@\w+([.-]?\w+)*(\.\w{2,3})+$/.test(email)) {
    errors.push('Por favor ingresa un email válido');
  }

  if (!password || password.length < 6) {
    errors.push('La contraseña debe tener al menos 6 caracteres');
  }

  if (errors.length > 0) {
    return res.status(400).json({
      success: false,
      message: 'Errores de validación',
      errors
    });
  }

  next();
};

// Validaciones para login
exports.validateLogin = (req, res, next) => {
  const { email, password } = req.body;
  const errors = [];

  if (!email) {
    errors.push('El email es requerido');
  }

  if (!password) {
    errors.push('La contraseña es requerida');
  }

  if (errors.length > 0) {
    return res.status(400).json({
      success: false,
      message: 'Errores de validación',
      errors
    });
  }

  next();
};

// Validaciones para leads
exports.validateLead = (req, res, next) => {
  const { nombre, email, servicio, telefono } = req.body;
  const errors = [];

  if (!nombre || nombre.trim().length < 2) {
    errors.push('El nombre debe tener al menos 2 caracteres');
  }

  if (!email || !/^\w+([.-]?\w+)*@\w+([.-]?\w+)*(\.\w{2,3})+$/.test(email)) {
    errors.push('Por favor ingresa un email válido');
  }

  if (!servicio || servicio.trim().length < 2) {
    errors.push('El servicio debe tener al menos 2 caracteres');
  }

  if (!telefono || telefono.trim().length < 6) {
    errors.push('El teléfono es requerido');
  }

  if (errors.length > 0) {
    return res.status(400).json({
      success: false,
      message: 'Errores de validación',
      errors
    });
  }

  next();
};