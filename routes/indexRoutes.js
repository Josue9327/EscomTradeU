import express from 'express';
import ensureAuthenticated from '../controllers/ensureAuthenticated.js';
import path from 'path';
const __dirname = (process.platform === "win32")
        ? path.resolve()
        : path.dirname(new URL(import.meta.url).pathname);
const router = express.Router();
router.get('/', (req, res) => {
    res.render("index", {title: "hola"});
});
router.get('/principal', ensureAuthenticated, (req, res) => {
    const imgname = req.user.user_credential_number + '.png';
    res.render("principal", { activePage: 'principal', img_route: imgname });
});
router.get('/contact', (req, res) => {
    res.render("contact", { activePage: 'contact' });
    
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
export default router;
