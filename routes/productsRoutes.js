import express from 'express';
import productControllers from '../controllers/productControllers.js';
import pool from '../config/databaseConfig.js';
import moment from 'moment';
import 'moment/locale/es.js'; // Importar localización en español
import 'moment-timezone';
import ensureAuthenticated from '../controllers/ensureAuthenticated.js';
const router = express.Router();
import { uploadProductImage, deleteproductFile } from '../config/multerConfig.js';
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
router.get('/miproducto_borrar/:producto', ensureAuthenticated, (req, res) =>{
    const id = req.params.producto;

    // Primero, obtiene el nombre de la imagen de la base de datos
    pool.query('SELECT product_imagenroute FROM products WHERE product_user = ? AND id = ?', 
        [req.user.user_credential_number, id], (error, results) => {
        if (error) {
            return res.status(500).json({ error });
        }

        // Si no se encuentra el producto, tal vez quieras manejar este caso también
        if (results.length === 0) {
            return res.status(404).json({ message: "Producto no encontrado" });
        }

        const imgname = results[0].product_imagenroute;

        // Ahora borra la entrada de la base de datos
        pool.query('DELETE FROM products WHERE product_user = ? AND id = ?', 
            [req.user.user_credential_number, id], (error, deleteResults) => {
            if (error) {
                return res.status(500).json({ error });
            }
            deleteproductFile(imgname);
            res.redirect("/productos");
        });
    });
});

router.get('/producto_editar/:producto', ensureAuthenticated, (req, res) =>{
    const imgname = req.user.user_credential_number + '.jpg';
    const id = req.params.producto;
    pool.query(
        'SELECT * FROM products WHERE product_user = ? AND id = ?;', 
        [req.user.user_credential_number, id],
        (error, results) => {
            if (error) {
                return res.status(500).json({ error });
            }
            res.render("editproduct", { activePage: 'principal', img_route: imgname, products: results[0]  });
        }
    );
});
router.post('/producto_editar/:producto', ensureAuthenticated, (req, res) =>{
    const imgname = req.user.user_credential_number + '.jpg';
    const product_user = req.user.user_credential_number;
    const { product_name, product_price, product_quantity, product_category, product_description, id} = req.body;
    pool.query(
        'UPDATE products SET product_name = ?, product_quantity = ?, product_description = ?, product_price = ?, product_category = ? WHERE id = ? AND product_user = ?;', 
        [product_name, product_quantity, product_description, product_price, product_category, id, product_user],
        (error, results) => {
            if (error) {
                return res.status(500).json({ error });
            }
            res.redirect("/productos");
        }
    );
});
router.get('/buscarproductos', ensureAuthenticated, (req, res) =>{
    const error_msg = req.flash('error'); // Obtiene el mensaje de error
    const imgname = req.user.user_credential_number + '.jpg';
    const id = req.params.producto;
    res.render("buscadorp", { activePage: 'buscarp', img_route: imgname, error_msg});

});
export default router;
