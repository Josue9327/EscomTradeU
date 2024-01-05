import express from 'express';
const router = express.Router();
import ensureAuthenticated from '../controllers/ensureAuthenticated.js';
import postControllers from '../controllers/postControllers.js';
import pool from '../config/databaseConfig.js';
import { uploadPostImage } from '../config/multerConfig.js';
function generateUniqueId(req, res, next) {
    req.uniqueId = Math.floor(Date.now() / 1000).toString();
    next();
}
router.post('/publicar', generateUniqueId, uploadPostImage.single('imageUpload'),postControllers.post);
router.get('/borrar_post/:postId', ensureAuthenticated, postControllers.deletePost);
router.get('/editar_post/:postId', ensureAuthenticated, (req, res)=>{
    const imgname = req.user.user_credential_number + '.jpg';
    const postId = req.params.postId;
    const post_author = req.user.user_credential_number;
    // Comprobar si el usuario está en sesión
        
    pool.query('SELECT * FROM post WHERE id = ? AND post_author = ?', [postId, post_author], (error, results) => {
        if (error) {
            console.error('Error al borrar el post:', error);
            return res.status(500).json({ error: 'Error interno del servidor' });
        }

        // Envía una respuesta exitosa
        res.render('editpost', { img_route: imgname, post: results[0] });
    });
});
router.post('/editar_post/:postId', ensureAuthenticated, (req, res)=>{
    const postId = req.params.postId;
    const post_description = req.body.postContent;
    const post_author = req.user.user_credential_number;
    // Comprobar si el usuario está en sesión
        
    pool.query('UPDATE post SET post_description = ? WHERE post_author = ? AND id = ?;',
     [post_description, post_author, postId], (error, results) => {
        if (error) {
            console.error('Error al borrar el post:', error);
            return res.status(500).json({ error: 'Error interno del servidor' });
        }

        // Envía una respuesta exitosa
        res.redirect("/mispost");
    });
});
export default router;
