function asegurarAutenticacion(request, response, next) {
  if (request.session.user) {
    return next(); // Usuario autenticado, continuar
  }
  // Guardamos un mensaje flash (opcional)
  request.flash('varEstiloMensaje', 'danger');
  request.flash('varMensaje', [{ msg: 'Por favor, inicie sesión para continuar.' }]);
  // Redirigir al login
  return response.redirect('/auth/login');
}
module.exports = {asegurarAutenticacion};