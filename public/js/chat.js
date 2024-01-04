// chat.js

document.addEventListener('DOMContentLoaded', () => {
    const socket = io();
    const userid = document.getElementById('user_id').value;
    const user_contact = document.getElementById('user_contact').value;
    const roomId = [userid, user_contact].sort().join('_');
    const data = {
        userid,
        user_contact,
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
        socket.emit('sendMessage', { room: roomId, message: message,  userid, user_contact});
    });
    socket.on('messageHistory', (data) => {
        console.log(data);
        if(data){
            data.forEach((data) => {
                displayMessage(data);
            });
        }
    });
    function displayMessage(data) {
        console.log(data);
        const messageDiv = document.createElement('div');
        messageDiv.classList.add('message');
        if (userid === data.senderId) { // Asumiendo que 'userId' es el ID del usuario actual
            messageDiv.classList.add('sender');
        } else {
            messageDiv.classList.add('receiver');
        }
        messageDiv.textContent = data.message;
        document.querySelector('#messageContainer').appendChild(messageDiv);
    }
});
