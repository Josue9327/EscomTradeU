// socket.js
import { Server as SocketIOServer } from 'socket.io';
let io;
export const initSocket = (server) => {
    io = new SocketIOServer(server);
    return io;
};
export const getIO = () => {
    if (!io) {
        throw new Error("Socket.io no ha sido inicializado!");
    }
    return io;
};
