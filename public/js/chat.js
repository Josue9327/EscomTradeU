// Conectar al servidor utilizando Socket.IO
const socket = io();

// Manejar eventos y enviar mensajes a través de socket
socket.on('message', (data) => {
    // Lógica para manejar mensajes del servidor
});

// Enviar un mensaje al servidor
socket.emit('chat message', 'Hola, servidor!');