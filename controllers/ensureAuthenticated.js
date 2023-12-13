function ensureAuthenticated(req, res, next) {
    if (req.isAuthenticated()) {
        return next();
    }
    // Redirigir al usuario a la página de login si no está autenticado
    req.flash('error', 'Logeate para tener acceso a la página');
    res.redirect('/login');
}

export default ensureAuthenticated;