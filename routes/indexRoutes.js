import express from 'express';
import ensureAuthenticated from '../controllers/ensureAuthenticated.js';

const router = express.Router();
router.get('/', (req, res) => {
    res.render("index", {title: "hola"});
});
router.get('/principal', ensureAuthenticated, (req, res) => {
    res.render("principal", { activePage: 'principal' });
    
});
export default router;
