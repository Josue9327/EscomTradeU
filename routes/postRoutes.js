import express from 'express';
const router = express.Router();
import ensureAuthenticated from '../controllers/ensureAuthenticated.js';
import postControllers from '../controllers/postControllers.js';
import pool from '../config/databaseConfig.js';
import { uploadPostImage } from '../config/multerConfig.js';
function generateUniqueId(req, res, next) {
    req.uniqueId = Math.floor(Date.now() / 1000).toString();
    next();
}
router.post('/publicar', generateUniqueId, uploadPostImage.single('imageUpload'),postControllers.post);
router.delete('/borrar/:postId', ensureAuthenticated, postControllers.deletePost);
export default router;
