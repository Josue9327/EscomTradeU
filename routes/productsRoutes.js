import express from 'express';
import productControllers from '../controllers/productControllers.js';
import pool from '../config/databaseConfig.js';
import moment from 'moment';
import 'moment/locale/es.js'; // Importar localización en español
import 'moment-timezone';
import ensureAuthenticated from '../controllers/ensureAuthenticated.js';
const router = express.Router();
import { uploadProductImage, deleteproductFile } from '../config/multerConfig.js';
import { cp } from 'fs';
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
    pool.query('SELECT product_imagenroute FROM products WHERE product_user = ? AND id = ?', 
        [req.user.user_credential_number, id], (error, results) => {
        if (error) {
            return res.status(500).json({ error });
        }
        if (results.length === 0) {
            return res.status(404).json({ message: "Producto no encontrado" });
        }

        const imgname = results[0].product_imagenroute;
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
router.post('/buscarp', ensureAuthenticated, (req, res) =>{
    const error_msg = req.flash('error'); // Obtiene el mensaje de error
    var imgname;
    // Comprobar si el usuario está en sesión
    if (req.user) {
        imgname = req.user.user_credential_number + '.jpg';
    } else {
        // Define un valor predeterminado o maneja el caso de no sesión
        imgname = 'default.png'; // O cualquier imagen por defecto que tengas
    }
    const id = req.user.id;
    const searchTerm = req.body.term;
    const sqlQuery = `
    SELECT p.*, 
        u.user_name, 
        u.user_lastname
    FROM products p 
    JOIN users u ON p.product_user = u.user_credential_number 
    WHERE p.product_name LIKE ? 
    OR p.product_category LIKE ? 
    OR p.product_description LIKE ?;
    `;
    // Utilizar el pool para realizar la consulta
    pool.query(sqlQuery, 
        [`%${searchTerm}%`, `%${searchTerm}%`, `%${searchTerm}%`],
        (error, results) => {
            if (error) {
                return res.status(500).json({ error });
            }
            const formattedResults = results.map(products => {
                // Suponiendo que 'post_date' es tu columna TIMESTAMP
                const formattedDate = moment(products.product_added).tz('America/Mexico_City').format('LLLL');
                // Retornar un nuevo objeto con la fecha formateada
                return {
                    ...products,
                    product_added: formattedDate
                };
            });
            res.render("buscadorp", { activePage: 'buscarp', img_route: imgname, products: formattedResults, error_msg });
        }
    );
}); 
router.get('/categoria/:categoria', ensureAuthenticated, (req, res) =>{
    const error_msg = req.flash('error'); // Obtiene el mensaje de error
    const imgname = req.user.user_credential_number + '.jpg';
    const categoria = req.params.categoria;
    const id = req.user.id;
    const sqlQuery = `SELECT p.*, u.user_name, u.user_lastname FROM products p JOIN users u ON p.product_user = u.user_credential_number WHERE p.product_category = ?`;
    pool.query(sqlQuery,
        [categoria],
        (error, results) => {
            if (error) {
                return res.status(500).json({ error });
            }
            const formattedResults = results.map(products => {
                // Suponiendo que 'post_date' es tu columna TIMESTAMP
                const formattedDate = moment(products.product_added).tz('America/Mexico_City').format('LLLL');
                // Retornar un nuevo objeto con la fecha formateada
                return {
                    ...products,
                    product_added: formattedDate
                };
            });
            res.render("buscadorp", { activePage: 'buscarp', img_route: imgname, products: formattedResults, error_msg });
        }
    );
});
router.get('/producto/:productoID', ensureAuthenticated, (req, res)=>{
    const imgname = req.user.user_credential_number + '.jpg';
    const productoID = req.params.productoID;
    pool.query(
        'SELECT p.*, u.user_name, u.user_lastname FROM products p JOIN users u ON p.product_user = u.user_credential_number WHERE p.id = ?', 
        [productoID],
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
            res.render("productos", { activePage: 'buscarp', img_route: imgname, product: formattedResults[0]  });
        }
    );
});
export default router;
