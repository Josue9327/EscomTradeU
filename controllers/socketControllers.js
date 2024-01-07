import pool from '../config/databaseConfig.js';
const socketControllers = (io) => {
    io.on('connection', (socket) => {
        // Acceder a la sesión de Express
        //console.log("Usuario conectado");
        socket.on('joinRoom', async (data) => {
            const messages = await getMessagesForRoom(data);
            socket.join(data.roomId);
            socket.emit('messageHistory', messages);
        });
        async function getMessagesForRoom(data) {
            return new Promise((resolve, reject) => {
                pool.query(
                    'SELECT m.message, m.created_at, m.sender_id, m.receiver_id FROM messages m WHERE (m.sender_id = ? AND m.receiver_id = ?) OR (m.sender_id = ? AND m.receiver_id = ?) ORDER BY m.created_at ASC',
                    [data.sender_id, data.receiver_id, data.receiver_id, data.sender_id],
                    (error, results) => {
                        if (error) {
                            console.log(error);
                            reject(error); // Rechaza la promesa si hay un error
                        } else {
                            resolve(results); // Resuelve la promesa con los resultados
                        }
                    }
                );
            });
        }
        socket.on('sendMessage', (data) => {
            // Emitir mensaje a la sala
            io.to(data.room).emit('message', data);
    
            // Guardar mensaje en la base de datos
            saveMessage(data);
        });
        socket.on('disconnect', () => {
            // El socket ya ha salido de todas las salas automáticamente
        });
    });
    function saveMessage(data) {
        pool.query(
            'INSERT INTO messages (sender_id, receiver_id, message) VALUES (?, ?, ?)', 
            [data.sender_id, data.receiver_id, data.message],
            (error, results) => {
                if (error) {
                    console.log(error);
                }
            }
        );
    }
};

export default socketControllers;