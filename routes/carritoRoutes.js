import express from 'express';
import loginControllers from '../controllers/loginControllers.js';
import passport  from '../config/passportConfig.js';
import pool from '../config/databaseConfig.js';
import { uploadProfile } from '../config/multerConfig.js';
import ensureAuthenticated from '../controllers/ensureAuthenticated.js';
const router = express.Router();
router.get('/carrito', ensureAuthenticated, async (req, res) => {
    try {
        const error_msg = req.flash('error');
        const imgname = req.user.user_credential_number + '.jpg';
        const id = req.user.id;
        // Obtener el CarritoID existente o crear uno nuevo si es necesario
        let carritoID;
        let results = await pool.promise().query(
            'SELECT CarritoID FROM Carrito WHERE UsuarioID = ? AND Estado = "Pendiente"', 
            [id]
        );
        
        if (results[0].length > 0) {
            carritoID = results[0][0].CarritoID;
        } else {
            results = await pool.promise().query(
                'INSERT INTO Carrito (UsuarioID, FechaCreacion, Estado) VALUES (?, NOW(), "Pendiente")',
                [id]
            );
            carritoID = results[0].insertId;
        }

        // Consultar los productos en el carrito
        results = await pool.promise().query(
            `SELECT p.product_name, p.product_description, p.id, p.product_imagenroute, cd.Cantidad, cd.PrecioUnitario, u.user_name, u.user_lastname
             FROM carrito_detalle cd
             JOIN products p ON cd.ProductoID = p.id
             JOIN users u ON p.product_user = u.user_credential_number
             WHERE cd.CarritoID = ?`,
            [carritoID]
        );
        req.session.carritoID = carritoID;
        res.render("carrito", { activePage: 'carrito', img_route: imgname, products: results[0], error_msg });
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: err });
    }
});
router.get('/delete_carrito/:product_id', ensureAuthenticated, async (req, res) => {
    const error_msg = req.flash('error'); // Obtiene el mensaje de error
    const imgname = req.user.user_credential_number + '.jpg';
    const carritoID = req.session.carritoID;
    const productoID = req.params.product_id;
    pool.query(
        'DELETE FROM carrito_detalle WHERE CarritoID = ? AND ProductoID = ?', 
        [carritoID, productoID], 
        (error, results) => {
            if (error) {
                // Manejar el error
                return res.status(500).json({ error });
            }
            res.redirect('/carrito');
        }
    );
});
router.post('/comprar', ensureAuthenticated, async (req, res) => {
    try {
        const fechaEntrega = req.body.fechaEntrega;
        const horaEntrega = req.body.horaEntrega;
        const fechaHoraEntrega = fechaEntrega + ' ' + horaEntrega;
        const lugarEntrega = req.body.lugarEntrega;
        const usuarioID = req.user.id; // Asegúrate de obtener el ID del usuario correctamente
        const carritoID = req.session.carritoID; // Obtener el ID del carrito desde la sesión
        console.log(fechaHoraEntrega);
        console.log(lugarEntrega);
        if (!carritoID) {
            return res.status(400).send('No hay un carrito activo.');
        }
        obtenerDetallesCarrito(carritoID, (error, detallesCarrito) => {
            if (error) {
                console.error(error);
                return res.status(500).send('Error al obtener los detalles del carrito.');
            }
            if (detallesCarrito && detallesCarrito.length > 0) {
                crearPedidoConDetalles(usuarioID, detallesCarrito, fechaHoraEntrega, lugarEntrega, (error, pedidoID) => {
                    if (error) {
                        console.error(error);
                        return res.status(500).send('Error al crear el pedido.');
                    }
                    // Aquí iría el código para actualizar el estado del carrito y responder a la solicitud
                });
            } else {
                res.status(400).send('El carrito está vacío.');
            }
        });
        pool.query(
            'UPDATE Carrito SET Estado = "Completado" WHERE CarritoID = ?;', 
            [carritoID], 
            (error, results) => {
                if (error) {
                    // Manejar el error
                    return res.status(500).json({ error });
                }
            }
        );

        // Después, obtén los detalles del carrito para enviar las notificaciones
        //const detallesCarrito = await obtenerDetallesCarrito(carritoID);

        // Envía las notificaciones a los usuarios vendedores
        //detallesCarrito.forEach(detalle => {
        //    enviarNotificacion(detalle.vendedorID, `El producto ${detalle.productoID} ha sido comprado. Fecha y hora de entrega: ...`);
        //});

        // Limpia el carritoID de la sesión
        req.session.carritoID = null;
        actualizarInventario(carritoID);
        res.redirect('/Carrito');
    } catch (error) {
        console.error(error);
        res.status(500).send('Error al finalizar la compra.');
    }
});

router.post('/agregar-al-carrito', ensureAuthenticated, (req, res) => {
    const productoID = req.body.productoID;
    const cantidad = req.body.cantidad;
    const precio = req.body.precio;
    const usuarioID = req.user.id;


    pool.query(
        'SELECT CarritoID FROM Carrito WHERE UsuarioID = ? AND Estado = "Pendiente"', 
        [usuarioID], 
        (error, results) => {
            if (error) {
                return res.status(500).json({ error });
            }
            let carritoID;
            if (results.length > 0) {
                carritoID = results[0].CarritoID;
                agregarProducto();
            } else {
                pool.query(
                    'INSERT INTO Carrito (UsuarioID, FechaCreacion, Estado) VALUES (?, NOW(), "Pendiente")', 
                    [usuarioID], 
                    (error, results) => {
                        if (error) {
                            return res.status(500).json({ error });
                        }
                        carritoID = results.insertId;
                        agregarProducto();
                    }
                );
            }

            function agregarProducto() {
                pool.query(
                    'INSERT INTO Carrito_Detalle (CarritoID, ProductoID, Cantidad, PrecioUnitario) VALUES (?, ?, ?, ?)', 
                    [carritoID, productoID, cantidad, precio], 
                    (error, results) => {
                        if (error) {
                            return res.status(500).json({ error });
                        }
                        res.redirect("/carrito");
                    }
                );
            }
        }
    );
});
async function actualizarInventario(carritoID) {
    pool.query('SELECT ProductoID, Cantidad FROM Carrito_Detalle WHERE CarritoID = ?', [carritoID], (err, results) =>{
        if(err){
            console.log(err);
        }
        for (const detalle of results) {
            pool.query('UPDATE Products SET product_quantity = product_quantity - ? WHERE id = ?', [detalle.Cantidad, detalle.ProductoID]);
        }
    });
}
function obtenerDetallesCarrito(carritoID, callback) {
    pool.query('SELECT * FROM Carrito_Detalle WHERE CarritoID = ?', [carritoID], (error, resultados) => {
        if (error) {
            return callback(error, null);
        }
        callback(null, resultados);
    });
}

function crearPedidoConDetalles(usuarioID, detallesCarrito, fechaHoraEntrega, lugarEntrega, callback) {
    const totalPedido = detallesCarrito.reduce((total, item) => total + (item.PrecioUnitario * item.Cantidad), 0);
    const detallesPedido = JSON.stringify(detallesCarrito);
    pool.query(
        'INSERT INTO Pedidos (UsuarioID, DetallesPedido, TotalPedido, Estado, InformacionEnvio, InformacionPago, FechaHoraEntrega, LugarEntrega) VALUES (?, ?, ?, "Pendiente", ?, ?, ?, ?)',
        [usuarioID, detallesPedido, totalPedido, 'Efectivo', 'Información de envío aquí', fechaHoraEntrega, lugarEntrega],
        (err, results) => {
            if (err) {
                return callback(err, null);
            }
            const pedidoID = results.insertId;
            detallesCarrito.forEach(product => {
                console.log(product);
                pool.query('INSERT INTO DetallePedido (PedidoID, ProductoID, Cantidad, PrecioUnitario) VALUES (?, ?, ?, ?)',
                    [pedidoID, product.ProductoID, product.Cantidad, product.PrecioUnitario],
                    (error, results) => {
                        if (error) {
                        }
                    });
            });

            callback(null, pedidoID);
        }
    );
}

export default router;
