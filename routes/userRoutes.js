import express from 'express';
const router = express.Router();
import ensureAuthenticated from '../controllers/ensureAuthenticated.js';
import searchControllers from '../controllers/searchControllers.js';
import pool from '../config/databaseConfig.js';
import moment from 'moment';
import 'moment/locale/es.js'; // Importar localización en español
import 'moment-timezone';
router.post('/users', (req, res) => {
    // Manejar la solicitud POST para /users
});
router.get('/perfil', ensureAuthenticated,(req, res) => {
    var imgname;
    const perfilId = req.user.user_credential_number;
    // Comprobar si el usuario está en sesión
    if (req.user) {
        imgname = req.user.user_credential_number + '.jpg';
    } else {
        // Define un valor predeterminado o maneja el caso de no sesión
        imgname = 'default.png'; // O cualquier imagen por defecto que tengas
    }
    pool.query(
        'SELECT user_name, user_lastname,user_state, user_gender, DATE_FORMAT(user_date, \'%d-%m-%Y\') AS fecha_nacimiento, user_credential_number FROM users WHERE user_credential_number = ?', 
        [perfilId],
        (error, results) => {
            if (error) {
                return res.status(500).json({ error });
            }
            if(results.length > 0){ 
                res.render("perfil", { activePage: 'perfil', img_route: imgname, perfil:results[0]  });
            }else{
                req.flash('error', 'Usuario no encontrado');
                res.redirect('/buscar');
            }
            
        }
    );
    
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
router.get('/mispost', ensureAuthenticated, (req, res) => {
    const imgname = req.user.user_credential_number + '.jpg';
    pool.query(
        'SELECT post.*, users.user_name AS autor, users.user_lastname AS autor_lastname FROM post INNER JOIN users ON post.post_author = users.user_credential_number WHERE post.post_author = ? ORDER BY post.post_date DESC;', 
        [req.user.user_credential_number],
        (error, results) => {
            if (error) {
                return res.status(500).json({ error });
            }
            // Formatear las fechas de cada post
            const formattedResults = results.map(post => {
                // Suponiendo que 'post_date' es tu columna TIMESTAMP
                const formattedDate = moment(post.post_date).tz('America/Mexico_City').format('LLLL');
                // Retornar un nuevo objeto con la fecha formateada
                return {
                    ...post,
                    post_date: formattedDate
                };
            });
            res.render("myposts", { activePage: 'principal', img_route: imgname, posts: formattedResults });
        }
    );
});
router.get('/perfil/:userId',ensureAuthenticated, (req, res) => {
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
        'SELECT user_name, user_lastname,user_state, user_gender, user_credential_number, DATE_FORMAT(user_date, \'%d-%m-%Y\') AS fecha_nacimiento FROM users WHERE user_credential_number = ?', 
        [perfilId],
        (error, results) => {
            if (error) {
                return res.status(500).json({ error });
            }
            if(results.length > 0){ 
                res.render("profile", { activePage: '', img_route: imgname, perfil: results[0]});
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
