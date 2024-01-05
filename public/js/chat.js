// chat.js

document.addEventListener('DOMContentLoaded', () => {
    const socket = io();
    const sender_id = document.getElementById('user_id').value;
    const receiver_id = document.getElementById('user_contact').value;
    const roomId = [sender_id, receiver_id].sort().join('_');
    const data = {
        sender_id,
        receiver_id,
        roomId
    }
    socket.on('connect', () => {
        console.log('Conectado al servidor de Socket.IO');
        socket.emit('joinRoom', data);
    });
    socket.on('message', (data) => {
        displayMessage(data)
    });

    const messageForm = document.querySelector('#message-form');
    messageForm.addEventListener('submit', function(e) {
        e.preventDefault();
        const message = document.querySelector('#message').value;
        socket.emit('sendMessage', { room: roomId, message: message,  sender_id, receiver_id});
    });
    socket.on('messageHistory', (data) => {
        if(data){
            data.forEach((data) => {
                console.log(data);
                displayMessage(data);
            });
        }
    });
    function displayMessage(data) {
        const sender = data.sender_id;
        const messageDiv = document.createElement('div');
        messageDiv.classList.add('message');
        console.log(sender);
        console.log(sender_id);
        if (sender_id == sender) { // Asumiendo que 'userId' es el ID del usuario actual
            messageDiv.classList.add('sender');
        } else {
            messageDiv.classList.add('receiver');
        }
        messageDiv.textContent = data.message;
        document.querySelector('#messageContainer').appendChild(messageDiv);
    }
});
