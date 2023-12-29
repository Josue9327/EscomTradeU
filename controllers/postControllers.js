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
        (error, results, post_author, file) => {
            if (error) {
                return res.status(500).json({ error });
            }
            res.redirect("/principal");
        }
    );
};
export default {
    post
};