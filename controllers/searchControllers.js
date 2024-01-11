import pool from '../config/databaseConfig.js';
const search = async (req, res) => {
    const error_msg = req.flash('error'); // Obtiene el mensaje de error
    var imgname;
    // Comprobar si el usuario está en sesión
    if (req.user) {
        imgname = req.user.user_credential_number + '.jpg';
    } else {
        // Define un valor predeterminado o maneja el caso de no sesión
        imgname = 'default.png'; // O cualquier imagen por defecto que tengas
    }
    
    const searchTerm = req.body.term;
    // Utilizar el pool para realizar la consulta
    pool.query(
        'SELECT user_name, user_lastname, user_gender, user_credential_number, user_state FROM users WHERE user_name LIKE ? OR user_lastname LIKE ?', 
        [`%${searchTerm}%`, `%${searchTerm}%`],
        (error, results) => {
            if (error) {
                return res.status(500).json({ error });
            }
            res.render("buscador", { activePage: 'buscar', img_route: imgname, results, error_msg });
        }
    );
};

export default {
    search
};