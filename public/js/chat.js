// chat.js

document.addEventListener('DOMContentLoaded', () => {
    const socket = io();

    socket.on('connect', () => {
        console.log('Conectado al servidor de Socket.IO');
    });

    // Ejemplo: Unirse a una sala específica
    const roomId = 'alguna_sala'; 
    socket.emit('joinRoom', roomId);

    // Ejemplo: Escuchar mensajes de chat
    socket.on('message', (mensaje) => {
        console.log('Nuevo mensaje:', mensaje);
        // Actualizar UI aquí...
    });

    // Enviar mensaje
    const messageForm = document.querySelector('#message-form');
    messageForm.addEventListener('submit', function(e) {
        e.preventDefault();
        const message = this.querySelector('input').value;
        socket.emit('chatMessage', { room: roomId, message: message });
    });
});
