import express from 'express';
import loginControllers from '../controllers/loginControllers.js';
import passport  from '../config/passportConfig.js';
import upload from '../config/multerConfig.js';
const router = express.Router();

router.get('/login', (req, res) => {
    const error_msg = req.flash('error'); // Obtiene el mensaje de error
    res.render('login', { error_msg, activePage: 'login' });
});
router.post('/login', passport.authenticate('local', {
    successRedirect: '/principal',
    failureRedirect: '/login',
    failureFlash: true // Opcional: para mensajes de flash
}));
router.get('/signup', (req, res) => {
    const error_msg = req.flash('error'); // Obtiene el mensaje de error
    res.render('signup', { error_msg, activePage: 'Signup' });
});
router.get('/logout', (req, res) => {
    req.logout(function(err) {
        if (err) { 
            return next(err); 
        }
        // Opcionalmente, destruir la sesión
        req.session.destroy(() => {
            res.redirect('/'); // Redireccionar al usuario después de cerrar sesión
        });
    });
});
router.post('/signup', upload.single('file'), loginControllers.signup);
// Exportar el router
export default router;
