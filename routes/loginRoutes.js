import express from 'express';
import loginControllers from '../controllers/loginControllers.js';
import passport  from '../config/passportConfig.js';
const router = express.Router();

router.get('/login', (req, res) => {
    const error_msg = req.flash('error'); // Obtiene el mensaje de error
    console.log(error_msg); // Depuración: Ver los mensajes flash
    res.render('login', { error_msg, activePage: 'login' });
});
router.post('/login', passport.authenticate('local', {
    successRedirect: '/inicio',
    failureRedirect: '/login',
    failureFlash: true // Opcional: para mensajes de flash
}));
router.get('/signup', (req, res) => {
    const error_msg = req.flash('error'); // Obtiene el mensaje de error
    console.log(error_msg); // Depuración: Ver los mensajes flash
    res.render('signup', { error_msg, activePage: 'Signup' });
});
// Exportar el router
export default router;
