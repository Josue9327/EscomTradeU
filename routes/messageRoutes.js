import express from 'express';
import loginControllers from '../controllers/loginControllers.js';
import passport  from '../config/passportConfig.js';
import pool from '../config/databaseConfig.js';
import { uploadProfile } from '../config/multerConfig.js';
import ensureAuthenticated from '../controllers/ensureAuthenticated.js';
const router = express.Router();
router.get('/messages/:user_id', ensureAuthenticated, async (req, res) => {
    try {
        const userId = req.params.user_id; // ID del contacto específico
        const id = req.user.user_credential_number; // ID del usuario en sesión
        const imgname = req.user.user_credential_number + '.jpg';

        // Obtener la lista de contactos
        const contactsResults = await queryPromise(pool, 
            'SELECT u.user_name, u.user_credential_number, u.user_lastname, u.user_state FROM users u JOIN contacts c ON u.user_credential_number = c.contact_id WHERE c.contact_user = ?', 
            [id]);

        // Obtener los mensajes con el contacto específico
        let messagesResults = [];
        if (contactsResults.length > 0) {
            messagesResults = await queryPromise(pool, 
                'SELECT m.message, m.created_at FROM messages m WHERE (m.sender_id = ? AND m.receiver_id = ?) OR (m.sender_id = ? AND m.receiver_id = ?) ORDER BY m.created_at ASC',
                [id, userId, userId, id]);
        }

        // Obtener detalles del contacto específico
        const contactInfo = await queryPromise(pool, 
            'SELECT user_name, user_lastname, user_state FROM users WHERE user_credential_number = ?', 
            [userId]);

        res.render("messages", {
            activePage: 'principal',
            img_route: imgname,
            contacts: contactsResults,
            messages: messagesResults,
            userchat: userId,
            userid: id,
            contactDetails: contactInfo.length > 0 ? contactInfo[0] : null
        });

    } catch (error) {
        console.error('Error al obtener los datos: ', error);
        res.status(500).json({ error });
    }
});

// Función de ayuda para ejecutar consultas con promesas
function queryPromise(pool, query, params) {
    return new Promise((resolve, reject) => {
        pool.query(query, params, (error, results) => {
            if (error) {
                reject(error);
            } else {
                resolve(results);
            }
        });
    });
}

export default router;
