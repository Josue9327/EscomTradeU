import express from 'express';
import productControllers from '../controllers/productControllers.js';
import pool from '../config/databaseConfig.js';
import moment from 'moment';
import 'moment/locale/es.js'; // Importar localización en español
import 'moment-timezone';
import ensureAuthenticated from '../controllers/ensureAuthenticated.js';
const router = express.Router();
import { uploadProductImage } from '../config/multerConfig.js';
function generateUniqueId(req, res, next) {
    req.uniqueId = Math.floor(Date.now() / 1000).toString();
    next();
}
router.get('/productos', ensureAuthenticated, (req, res)=>{
    const imgname = req.user.user_credential_number + '.jpg';
    pool.query(
        'SELECT * FROM products WHERE product_user = ? ORDER BY product_added DESC;', 
        [req.user.user_credential_number],
        (error, results) => {
            if (error) {
                return res.status(500).json({ error });
            }
            // Formatear las fechas de cada post
            const formattedResults = results.map(products => {
                // Suponiendo que 'post_date' es tu columna TIMESTAMP
                const formattedDate = moment(products.product_added).tz('America/Mexico_City').format('LLLL');
                // Retornar un nuevo objeto con la fecha formateada
                return {
                    ...products,
                    product_added: formattedDate
                };
            });
            console.log(formattedResults)
            res.render("myproducts", { activePage: 'principal', img_route: imgname, products: formattedResults  });
        }
    );
});
router.get('/addproduct', ensureAuthenticated, (req, res) =>{
    var imgname;
    imgname = req.user.user_credential_number + '.jpg';
    res.render("addproduct", { activePage: 'principal', img_route: imgname  });
});
router.post('/addproduct', generateUniqueId, uploadProductImage.single('imageUpload'), productControllers.post);

export default router;
