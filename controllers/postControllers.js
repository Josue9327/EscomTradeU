import pool from '../config/databaseConfig.js';
const post = async (req, res) => {
    const { postContent } = req.body;
    const timestamp = req.uniqueId;
    const today = new Date();
    const dateToStore = today.toISOString().split('T')[0]; 
    const post_author = req.user.user_credential_number;
    var file;
    console.log(req.file);
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
    const result = await pool.query('SELECT * FROM post WHERE id = ? AND post_author = ?', [postId, post_author]);

    if (result.length === 0) {
        // Si el post no pertenece al usuario actual, devuelve un error
        return res.status(403).json({ error: 'No tienes permisos para borrar este post' });
    }

    // Borrar el post
    pool.query('DELETE FROM post WHERE id = ?', [postId], (error, results) => {
        if (error) {
            console.error('Error al borrar el post:', error);
            return res.status(500).json({ error: 'Error interno del servidor' });
        }

        // Envía una respuesta exitosa
        return res.status(200).json({ message: 'Post borrado exitosamente' });
    });
};
export default {
    post,
    deletePost
};