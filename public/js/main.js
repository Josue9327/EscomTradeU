document.addEventListener('DOMContentLoaded', function () {
    var menuImage = document.getElementById('menuImage');
    var menuLateral = document.getElementById('menuLateral');
    menuImage.addEventListener('click', function () {
        if(menuLateral.style.display == 'block'){
            menuLateral.style.display = 'none';
        }else{
            menuLateral.style.display = 'block';
        }
    });
});