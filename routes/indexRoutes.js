import express from 'express';
import ensureAuthenticated from '../controllers/ensureAuthenticated.js';
import path from 'path';
const __dirname = (process.platform === "win32")
        ? path.resolve()
        : path.dirname(new URL(import.meta.url).pathname);
const router = express.Router();
router.get('/', (req, res) => {
    var imgname;
    // Comprobar si el usuario está en sesión
    if (req.user) {
        imgname = req.user.user_credential_number + '.png';
    } else {
        // Define un valor predeterminado o maneja el caso de no sesión
        imgname = 'default.png'; // O cualquier imagen por defecto que tengas
    }
    res.render("index", { activePage: 'home', img_route: imgname  });
});
router.get('/principal', ensureAuthenticated, (req, res) => {
    const imgname = req.user.user_credential_number + '.png';
    const posts = [
        {
            author: "Josue",
            authorPhoto: "2023630231.png",
            description: "Juguito pal calor",
            image: "valle.png"
        },
        {
            author: "Autor 2",
            authorPhoto: "2023630231.png",
            description: "Descripción de la publicación 2",
            image: "mk.png"
        },
        {
            author: "Charly",
            authorPhoto: "2022.png",
            description: "Descripción de la publicación 2",
            image: "mk.png"
        },
    ];
    const recent_profiles = [
        {
            profilename: "Josue",
            profilePhoto: "2023630231.png",
        },
        {
            profilename: "Charly",
            profilePhoto: "2022.png",
        },
        {
            profilename: "Emi",
            profilePhoto: "2022.png",
        },
    ];
    res.render("principal", { activePage: 'principal', img_route: imgname, posts, recent_profiles });
});
router.get('/contact', (req, res) => {
    var imgname;
    // Comprobar si el usuario está en sesión
    if (req.user) {
        imgname = req.user.user_credential_number + '.png';
    } else {
        // Define un valor predeterminado o maneja el caso de no sesión
        imgname = 'default.png'; // O cualquier imagen por defecto que tengas
    }
    
    res.render("contact", { activePage: 'contact', img_route: imgname  });
    
});
router.get('/imagen/:nombreImagen', (req, res) => {
    const nombreImagen = req.params.nombreImagen;
    const rutaImagen = path.join(__dirname, 'private/img_profile', nombreImagen);

    res.sendFile(rutaImagen, (err) => {
        if (err) {
            // Manejar el error, por ejemplo, si el archivo no existe
            res.status(404).send('Imagen no encontrada');
        }
    });
});
router.get('/img_product/:nombreImagen', (req, res) => {
    const nombreImagen = req.params.nombreImagen;
    const rutaImagen = path.join(__dirname, 'private/img_products', nombreImagen);

    res.sendFile(rutaImagen, (err) => {
        if (err) {
            // Manejar el error, por ejemplo, si el archivo no existe
            res.status(404).send('Imagen no encontrada');
        }
    });
});
export default router;
