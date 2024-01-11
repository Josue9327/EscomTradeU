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
            pe.InformacionEnvio,
            pe.TotalPedido,
            dp.ProductoID, 
            dp.Cantidad, 
            dp.PrecioUnitario,
            p.product_name, 
            p.product_description,
            p.product_imagenroute,
            u.user_name AS NombreUsuario,
            u.user_lastname AS ApellidoUsuario
        FROM 
            Pedidos pe
        JOIN 
            DetallePedido dp ON pe.PedidoID = dp.PedidoID
        JOIN 
            products p ON dp.ProductoID = p.id
        JOIN
            users u ON pe.UsuarioID = u.id    
        WHERE 
            p.product_user = ?
        ORDER BY 
            pe.FechaHoraPedido ASC;    ;
    `;
    pool.query(query,
     [usuarioID], (error, resultados) => {
        if (error) {
            console.error(error);
            return res.status(500).send('Error al recuperar los pedidos.');
        }
        console.log(resultados);
        // Agrupar los detalles del pedido por PedidoID
        const pedidosAgrupados = resultados.reduce((acc, item) => {
            // Si el grupo de PedidoID no existe, crearlo
            if (!acc[item.PedidoID]) {
                acc[item.PedidoID] = {
                    PedidoID: item.PedidoID,
                    FechaHoraPedido: moment(item.FechaHoraPedido).format('LLLL'),
                    FechaHoraEntrega: moment(item.FechaHoraEntrega).format('LLLL'), // Agregar fecha y hora de entrega
                    LugarEntrega: item.LugarEntrega,                             // Agregar lugar de entrega
                    MetodoPago: item.InformacionEnvio,
                    Estado: item.Estado,
                    NombreUsuario: item.NombreUsuario,
                    TotalPedido: item.TotalPedido,
                    ApellidoUsuario: item.ApellidoUsuario,
                    Productos: [],
                };
            }
            // Añadir el producto al grupo de PedidoID y sumar al total
            acc[item.PedidoID].Productos.push({
                ProductoID: item.ProductoID,
                Nombre: item.product_name,
                Descripcion: item.product_description,
                Cantidad: item.Cantidad,
                PrecioUnitario: item.PrecioUnitario,
                imagen: item.product_imagenroute
            });
            return acc;
        }, {});

        const pedidos = Object.values(pedidosAgrupados);
        res.render("ventas", { activePage: 'carrito', img_route: imgname, pedidos });
    });
});

router.get('/compras', ensureAuthenticated, async (req, res) => {
    const imgname = req.user.user_credential_number + '.jpg';
    const usuarioID = req.user.id;
    const query = `
        SELECT 
        pe.PedidoID, 
        pe.FechaHoraPedido, 
        pe.Estado, 
        pe.FechaHoraEntrega,
        pe.LugarEntrega,
        pe.TotalPedido,
        pe.InformacionEnvio,
        dp.ProductoID, 
        dp.Cantidad, 
        dp.PrecioUnitario,
        p.product_name, 
        p.product_description,
        p.product_imagenroute,
        v.user_name AS NombreVendedor,
        v.user_lastname AS ApellidoVendedor
    FROM 
        Pedidos pe
    JOIN 
        DetallePedido dp ON pe.PedidoID = dp.PedidoID
    JOIN 
        products p ON dp.ProductoID = p.id
    JOIN
        users v ON p.product_user = v.user_credential_number
    WHERE 
        pe.UsuarioID = ?;
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
                    FechaHoraPedido: moment(item.FechaHoraPedido).format('LLLL'),
                    FechaHoraEntrega: moment(item.FechaHoraEntrega).format('LLLL'),
                    LugarEntrega: item.LugarEntrega,
                    MetodoPago: item.InformacionEnvio,
                    Estado: item.Estado,
                    TotalPedido: item.TotalPedido,
                    Vendedores: {}
                };
            }
            // Identificador único para cada vendedor en un pedido
            const vendedorID = item.NombreVendedor + item.ApellidoVendedor;
            
            // Si el grupo de VendedorID no existe dentro del PedidoID, crearlo
            if (!acc[item.PedidoID].Vendedores[vendedorID]) {
                acc[item.PedidoID].Vendedores[vendedorID] = {
                    NombreUsuario: item.NombreVendedor,
                    ApellidoUsuario: item.ApellidoVendedor,
                    Productos: [],
                    TotalVendedor: 0
                };
            }
        
            // Añadir el producto al grupo de VendedorID dentro del PedidoID
            acc[item.PedidoID].Vendedores[vendedorID].Productos.push({
                ProductoID: item.ProductoID,
                Nombre: item.product_name,
                Descripcion: item.product_description,
                Cantidad: item.Cantidad,
                PrecioUnitario: item.PrecioUnitario,
                imagen: item.product_imagenroute
            });
            acc[item.PedidoID].Vendedores[vendedorID].TotalVendedor += item.Cantidad * item.PrecioUnitario;
            return acc;
        }, {});
        const pedidos = Object.values(pedidosAgrupados);
        res.render("Compras", { activePage: 'carrito', img_route: imgname, pedidos });
    });
});
export default router;