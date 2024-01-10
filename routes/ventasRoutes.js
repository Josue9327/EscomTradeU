import express from 'express';
import loginControllers from '../controllers/loginControllers.js';
import passport  from '../config/passportConfig.js';
import pool from '../config/databaseConfig.js';
import { uploadProfile } from '../config/multerConfig.js';
import ensureAuthenticated from '../controllers/ensureAuthenticated.js';
import moment from 'moment';
import 'moment/locale/es.js'; // Importar localización en español
import 'moment-timezone';
const router = express.Router();
router.get('/ventas', ensureAuthenticated, async (req, res) => {
    const imgname = req.user.user_credential_number + '.jpg';
    const usuarioID = req.user.user_credential_number;
    const query = `
        SELECT 
            pe.PedidoID, 
            pe.FechaHoraPedido, 
            pe.Estado, 
            pe.FechaHoraEntrega,
            pe.LugarEntrega,
            dp.ProductoID, 
            dp.Cantidad, 
            dp.PrecioUnitario,
            p.product_name, 
            p.product_description
        FROM 
            Pedidos pe
        JOIN 
            DetallePedido dp ON pe.PedidoID = dp.PedidoID
        JOIN 
            products p ON dp.ProductoID = p.id
        WHERE 
            p.product_user = ?;
    `;
    pool.query(query,
     [usuarioID], (error, resultados) => {
        if (error) {
            console.error(error);
            return res.status(500).send('Error al recuperar los pedidos.');
        }
        // Agrupar los detalles del pedido por PedidoID
        const pedidosAgrupados = resultados.reduce((acc, item) => {
            // Si el grupo de PedidoID no existe, crearlo
            if (!acc[item.PedidoID]) {
                acc[item.PedidoID] = {
                    PedidoID: item.PedidoID,
                    FechaHoraPedido: moment(item.FechaHoraPedido).format('LLLL'), // Formato de fecha y hora mexicano
                    Estado: item.Estado,
                    InformacionEnvio: item.InformacionEnvio,
                    Productos: [],
                    TotalPedido: 0 // Inicializa el total del pedido
                };
            }
            // Añadir el producto al grupo de PedidoID y sumar al total
            acc[item.PedidoID].Productos.push({
                ProductoID: item.ProductoID,
                Nombre: item.product_name,
                Descripcion: item.product_description,
                Cantidad: item.Cantidad,
                PrecioUnitario: item.PrecioUnitario
            });
            acc[item.PedidoID].TotalPedido += item.Cantidad * parseFloat(item.PrecioUnitario); // Suma al total
    
            return acc;
        }, {});

        const pedidos = Object.values(pedidosAgrupados);
        res.render("ventas", { activePage: 'carrito', img_route: imgname, pedidos });
    });
});
export default router;