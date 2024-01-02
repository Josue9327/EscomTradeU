import pool from '../config/databaseConfig.js';
const post = async (req, res) => {
    const { product_name, product_price, product_quantity, product_category, product_description } = req.body;
    const timestamp = req.uniqueId;
    const today = new Date();
    const dateToStore = today.toISOString().split('T')[0]; 
    const product_user = req.user.user_credential_number;
    var file;
    console.log(req.file);
    if(req.file){
        const filename = product_user + "_" + timestamp;
        const fileExtension = '.jpg'; // Mantener la extensión original del archivo
        file = filename + fileExtension;
    }else{
        file = 'NULL';
    }

    pool.query(
        'INSERT INTO products (product_name, product_quantity, product_price, product_category, product_description, product_added, product_imagenroute, product_user) VALUES (?, ?, ?, ?, ?, ?, ?, ?)', 
        [product_name, product_quantity, product_price, product_category, product_description, dateToStore, file, product_user],
        (error, results, post_author, file) => {
            if (error) {
                return res.status(500).json({ error });
            }
            res.redirect("/productos");
        }
    );
};
export default {
    post
};