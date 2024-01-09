const error404 =(req, res, next) => {
    var imgname;
    // Comprobar si el usuario está en sesión
    if (req.user) {
        imgname = req.user.user_credential_number + '.jpg';
    } else {
        // Define un valor predeterminado o maneja el caso de no sesión
        imgname = 'user_img_default'; // O cualquier imagen por defecto que tengas
    }
    res.status(404).render('404', { img_route: imgname } );
};
const error500 =(err, req, res, next) => {
    var imgname;
    // Comprobar si el usuario está en sesión
    if (req.user) {
        imgname = req.user.user_credential_number + '.jpg';
    } else {
        // Define un valor predeterminado o maneja el caso de no sesión
        imgname = 'user_img_default'; // O cualquier imagen por defecto que tengas
    }
    res.status(500).render('500', { img_route: imgname, err } );
};
export default {
    error404,
    error500
};