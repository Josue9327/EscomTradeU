document.addEventListener('DOMContentLoaded', function () {
    var menuImage = document.getElementById('menuImage');
    var menuLateral = document.getElementById('menuLateral');
    menuImage.addEventListener('click', function () {
        if (menuLateral.style.width === '250px') {
            menuLateral.style.width = '0';
        } else {
            menuLateral.style.width = '250px';
        }
    });
});