import express from 'express';
import loginControllers from '../controllers/loginControllers.js';
import passport  from '../config/passportConfig.js';
import pool from '../config/databaseConfig.js';
import { uploadProfile } from '../config/multerConfig.js';
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
router.get('/logout', (req, res, next) => {
    const id_user = req.user.id;
    req.logout(function(err) {
        if (err) { 
            return next(err); 
        }
        pool.query(
            'UPDATE users SET user_state = ? WHERE id = ?;', 
            [0, id_user],
            (error, results) => {
                if (error) {
                    return res.status(500).json({ error }); // Modificado para usar return
                }

                // Opcionalmente, destruir la sesión
                req.session.destroy(() => {
                    res.redirect('/'); // Redireccionar al usuario después de cerrar sesión
                });
            }
        );
    });
});

router.post('/signup', uploadProfile.single('imageUpload'), loginControllers.signup);
// Exportar el router
export default router;
