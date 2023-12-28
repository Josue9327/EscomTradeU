import { getIO, initSocket } from './config/socketioConfig.js';
io.on('connection', (socket) => {
    console.log("Cliente conectado al socket");
    
    socket.on('disconnect', () => {
        console.log("Cliente desconectado");
    });
});
io.on('error', (error) => {
    console.error('Error en la inicialización de Socket.IO:', error);
});