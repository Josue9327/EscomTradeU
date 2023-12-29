import pool from '../config/databaseConfig.js';
const post = async (req, res) => {
    const { postContent } = req.body;
    const timestamp = req.uniqueId;
    const today = new Date();
    const dateToStore = today.toISOString().split('T')[0]; 
    const post_author = req.user.user_credential_number;
    const filename = post_author + "_" + timestamp;
    const fileExtension = '.jpg'; // Mantener la extensión original del archivo
    const file = filename + fileExtension;
    pool.query(
        'INSERT INTO post (post_description, post_date, post_author, post_img) VALUES (?, ?, ?, ?)', 
        [postContent, dateToStore, post_author, file],
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