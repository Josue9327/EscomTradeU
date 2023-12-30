// statusMenu.js
document.addEventListener('DOMContentLoaded', () => {
    const userStatus = document.querySelector('#status-menu');
    if (userStatus) {
        userStatus.addEventListener('click', toggleStatusMenu);
    }
});

function toggleStatusMenu() {
    const statusMenu = document.querySelector('.status-menu');
    if (statusMenu) {
        statusMenu.classList.toggle('hidden');
    }
}