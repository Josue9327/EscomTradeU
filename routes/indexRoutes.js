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
    const imgname = req.user.user_credential_number;
    console.log(imgname);
    const img_route = path.join(__dirname, 'private/img_profile', imgname.toString()+'.png');
    res.render("principal", { activePage: 'principal',  img_route });
    
    
});
router.get('/contact', (req, res) => {
    res.render("contact", { activePage: 'contact' });
    
});
export default router;
