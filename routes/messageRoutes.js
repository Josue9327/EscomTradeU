import express from 'express';
import loginControllers from '../controllers/loginControllers.js';
import passport  from '../config/passportConfig.js';
import pool from '../config/databaseConfig.js';
import { uploadProfile } from '../config/multerConfig.js';
import ensureAuthenticated from '../controllers/ensureAuthenticated.js';
const router = express.Router();
router.get('/messages', ensureAuthenticated, (req, res)=>{
    const imgname = req.user.user_credential_number + '.jpg';
    res.render('messages', { activePage: 'principal', img_route: imgname  })
});

export default router;
