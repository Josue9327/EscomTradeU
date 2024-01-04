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
router.get('/principal', ensureAuthenticated, async (req, res) => {
    try {
        const userId = req.user.user_credential_number;
        const imgname = userId + '.jpg';

        const posts = await getPosts(pool);
        const messages = await getMessagesFromNonContacts(pool, userId);

        const formattedPosts = posts.map(post => {
            const formattedDate = moment(post.post_date).tz('America/Mexico_City').format('LLLL');
            return { ...post, post_date: formattedDate };
        });

        const hasMessagesFromNonContacts = messages;

        res.render("principal", {
            activePage: 'principal',
            img_route: imgname,
            posts: formattedPosts,
            hasMessagesFromNonContacts: hasMessagesFromNonContacts
        });
    } catch (error) {
        console.error('Error en la ruta /principal:', error);
        res.status(500).json({ error: 'Error interno del servidor' });
    }
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
function getPosts(pool) {
    return new Promise((resolve, reject) => {
        pool.query(
            'SELECT post.*, users.user_name AS autor, users.user_lastname AS autor_lastname FROM post INNER JOIN users ON post.post_author = users.user_credential_number ORDER BY post.post_date DESC;',
            (error, results) => {
                if (error) {
                    reject(error);
                } else {
                    resolve(results);
                }
            }
        );
    });
}

function getMessagesFromNonContacts(pool, userId) {
    return new Promise((resolve, reject) => {
        pool.query(
            'SELECT m1.*, u.user_name, u.user_lastname, u.user_credential_number FROM messages m1 ' +
            'INNER JOIN ( ' +
            'SELECT sender_id, MAX(created_at) as max_date ' +
            'FROM messages ' +
            'WHERE receiver_id = ? ' +
            'GROUP BY sender_id ' +
            ') m2 ON m1.sender_id = m2.sender_id AND m1.created_at = m2.max_date ' +
            'LEFT JOIN contacts c ON m1.sender_id = c.contact_id AND c.contact_user = ? ' +
            'INNER JOIN users u ON m1.sender_id = u.user_credential_number ' +
            'WHERE m1.receiver_id = ? AND c.contact_id IS NULL ' +
            'ORDER BY m1.created_at DESC;',
            [userId, userId, userId],
            (error, results) => {
                if (error) {
                    reject(error);
                } else {
                    resolve(results);
                }
            }
        );
    });
}

export default router;
