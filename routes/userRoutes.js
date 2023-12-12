import express from 'express';
const router = express.Router();
router.get('/', (req, res) => {
    res.send("hola");
});
router.post('/users', (req, res) => {
    // Manejar la solicitud POST para /users
});

// Exportar el router
export default router;
