import pool from '../config/databaseConfig.js';
import { deletepostFile } from '../config/multerConfig.js';
const post = async (req, res) => {
    const { postContent } = req.body;
    const timestamp = req.uniqueId;
    const today = new Date();
    const dateToStore = today.toISOString().split('T')[0]; 
    const post_author = req.user.user_credential_number;
    var file;
    if(req.file){
        const filename = post_author + "_" + timestamp;
        const fileExtension = '.jpg'; // Mantener la extensión original del archivo
        file = filename + fileExtension;
    }else{
        file = 'NULL';
    }

    pool.query(
        'INSERT INTO post (post_description, post_author, post_img) VALUES (?, ?, ?)', 
        [postContent, post_author, file],
        (error, results) => {
            if (error) {
                return res.status(500).json({ error });
            }
            res.redirect("/principal");
        }
    );
    
};
const deletePost = async (req, res) => {
    const postId = req.params.postId;
    const post_author = req.user.user_credential_number;

    // Verificar si el post pertenece al usuario actual antes de permitir el borrado
    const result = pool.query('SELECT post_img FROM post WHERE id = ? AND post_author = ?',
     [postId, post_author], (error, results) =>{
        if (result.length === 0) {
            return res.status(403).json({ error: 'No tienes permisos para borrar este post' });
        }
        const img = results[0].post_img;
        // Borrar el post
        pool.query('DELETE FROM post WHERE id = ? AND post_author = ?', [postId, post_author], (error, results) => {
            if (error) {
                console.error('Error al borrar el post:', error);
                return res.status(500).json({ error: 'Error interno del servidor' });
            }
            // Envía una respuesta exitosa
            deletepostFile(img);
            res.redirect("/mispost");
        });
    });
};
export default {
    post,
    deletePost
};