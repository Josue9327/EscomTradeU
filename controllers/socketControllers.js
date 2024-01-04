const socketControllers = (io) => {
    io.on('connection', (socket) => {
        // Acceder a la sesión de Express
        const session = socket.handshake.session;
        
        console.log("Usuario conectado al socket, ID de sesión:", session.id);

        socket.on('joinRoom', (roomId) => {
            // Aquí puedes usar datos de la sesión para manejar la lógica del chat
            if (session.user) { // Por ejemplo, verificar si el usuario está autenticado
                socket.join(roomId);
                console.log(`Usuario ${session.user.username} se unió a la sala ${roomId}`);
            }
        });

        // Más manejadores de eventos...
    });
};

export default socketControllers;