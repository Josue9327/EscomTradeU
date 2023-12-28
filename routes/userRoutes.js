import express from 'express';
const router = express.Router();
import ensureAuthenticated from '../controllers/ensureAuthenticated.js';
import searchControllers from '../controllers/searchControllers.js';
import pool from '../config/databaseConfig.js';
router.get('/', (req, res) => {
    res.send("hola");
});
router.post('/users', (req, res) => {
    // Manejar la solicitud POST para /users
});
router.get('/perfil', ensureAuthenticated,(req, res) => {
    var imgname;
    // Comprobar si el usuario está en sesión
    if (req.user) {
        imgname = req.user.user_credential_number + '.jpg';
    } else {
        // Define un valor predeterminado o maneja el caso de no sesión
        imgname = 'default.png'; // O cualquier imagen por defecto que tengas
    }
    
    res.render("perfil", { activePage: 'perfil', img_route: imgname  });
    
});
router.get('/buscar', ensureAuthenticated,(req, res) => {
    const error_msg = req.flash('error'); // Obtiene el mensaje de error
    var imgname;
    // Comprobar si el usuario está en sesión
    if (req.user) {
        imgname = req.user.user_credential_number + '.jpg';
    } else {
        // Define un valor predeterminado o maneja el caso de no sesión
        imgname = 'default.png'; // O cualquier imagen por defecto que tengas
    }
    
    res.render("buscador", { activePage: 'buscar', img_route: imgname, error_msg});
    
});
router.get('/perfil/:userId',(req, res) => {
    var imgname;
    const perfilId = req.params.userId;
    // Comprobar si el usuario está en sesión
    if (req.user) {
        imgname = req.user.user_credential_number + '.jpg';
    } else {
        // Define un valor predeterminado o maneja el caso de no sesión
        imgname = 'default.png'; // O cualquier imagen por defecto que tengas
    }
    pool.query(
        'SELECT user_name, user_lastname, user_gender, user_credential_number FROM users WHERE user_credential_number = ?', 
        [perfilId],
        (error, results) => {
            if (error) {
                return res.status(500).json({ error });
            }
            if(results.length > 0){ 
                res.render("profile", { activePage: 'perfil', img_route: imgname, results: results[0]});
            }else{
                req.flash('error', 'Usuario no encontrado');
                res.redirect('/buscar');
            }
            
        }
    );

    
});
router.post('/buscar', searchControllers.search);
// Exportar el router
export default router;
