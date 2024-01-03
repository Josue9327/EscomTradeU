import express from 'express';
import ensureAuthenticated from '../controllers/ensureAuthenticated.js';
import path from 'path';
import pool from '../config/databaseConfig.js';
import moment from 'moment';
import 'moment/locale/es.js'; // Importar localización en español
import 'moment-timezone';
moment.locale('es');
const __dirname = (process.platform === "win32")
        ? path.resolve()
        : path.dirname(new URL(import.meta.url).pathname);
const router = express.Router();
router.get('/', (req, res) => {
    var imgname;
    // Comprobar si el usuario está en sesión
    if (req.user) {
        imgname = req.user.user_credential_number + '.jpg';
    } else {
        // Define un valor predeterminado o maneja el caso de no sesión
        imgname = 'default.png'; // O cualquier imagen por defecto que tengas
    }
    res.redirect('/principal');
});
router.get('/principal', ensureAuthenticated, (req, res) => {
    const imgname = req.user.user_credential_number + '.jpg';
    pool.query(
        'SELECT post.*, users.user_name AS autor, users.user_lastname AS autor_lastname FROM post INNER JOIN users ON post.post_author = users.user_credential_number ORDER BY post.post_date DESC;', 
        (error, results) => {
            const recent_profiles = [
                {
                    profilename: "Josue",
                    profilePhoto: "2023630231.jpg",
                },
                {
                    profilename: "Charly",
                    profilePhoto: "2022.png",
                },
                {
                    profilename: "Emi",
                    profilePhoto: "2022.png",
                },
            ];
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
            res.render("principal", { activePage: 'principal', img_route: imgname, posts: formattedResults, recent_profiles });
        }
    );
});
router.get('/contact', (req, res) => {
    var imgname;
    // Comprobar si el usuario está en sesión
    if (req.user) {
        imgname = req.user.user_credential_number + '.jpg';
    } else {
        // Define un valor predeterminado o maneja el caso de no sesión
        imgname = 'default.png'; // O cualquier imagen por defecto que tengas
    }
    
    res.render("contact", { activePage: 'contact', img_route: imgname  });
    
});
router.get('/imagen/:nombreImagen', (req, res) => {
    const nombreImagen = req.params.nombreImagen;
    const rutaImagen = path.join(__dirname, 'private/img_profile', nombreImagen);

    res.sendFile(rutaImagen, (err) => {
        if (err) {
            // Manejar el error, por ejemplo, si el archivo no existe
            res.status(404).send('Imagen no encontrada');
        }
    });
});
router.get('/img_product/:nombreImagen', (req, res) => {
    const nombreImagen = req.params.nombreImagen;
    const rutaImagen = path.join(__dirname, 'private/img_products', nombreImagen);

    res.sendFile(rutaImagen, (err) => {
        if (err) {
            // Manejar el error, por ejemplo, si el archivo no existe
            res.status(404).send('Imagen no encontrada');
        }
    });
});
router.get('/img_posts/:nombreImagen', (req, res) => {
    const nombreImagen = req.params.nombreImagen;
    const rutaImagen = path.join(__dirname, 'private/img_posts', nombreImagen);

    res.sendFile(rutaImagen, (err) => {
        if (err) {
            // Manejar el error, por ejemplo, si el archivo no existe
            res.status(404).send('Imagen no encontrada');
        }
    });
});
export default router;
