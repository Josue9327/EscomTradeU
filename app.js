import express from "express";
import path from "path";
import cors from "cors";
import helmet from "helmet";
import morgan from "morgan";
import session from "express-session";
import passport from "./config/passportConfig.js";
import indexRoutes from './routes/indexRoutes.js';
import userRoutes from './routes/userRoutes.js';
import loginRoutes from './routes/loginRoutes.js';
import errorController from './controllers/errorControllers.js';
import flash from "connect-flash";

const __dirname = (process.platform === "win32")
        ? path.resolve()
        : path.dirname(new URL(import.meta.url).pathname);
const app = express();
const PORT = process.env.PORT || 3000;

// Configuración de express-session
app.use(session({
    secret: 'perrita_putrefacta', // Reemplaza 'tu_secreto' con una cadena secreta real
    resave: false,
    saveUninitialized: false
}));
// Inicializaciones
app.use(flash());
app.use(passport.initialize());
app.use(passport.session());
app.use(cors());
app.use(helmet());
app.use(morgan("dev"));
app.set("views", path.join(__dirname, "views"));
app.set("view engine", "pug");
app.use(express.static(path.join(__dirname, "public")));
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use((req, res, next) => {
    // Pasar el estado de autenticación a todas las vistas
    res.locals.isAuthenticated = req.isAuthenticated();
    next();
});
//Rutas
app.use('/',indexRoutes);
app.use('/users',userRoutes);
app.use('/',loginRoutes);
app.get('/numero-sesiones', (req, res) => {
    const sessionStore = req.sessionStore;
    sessionStore.all((error, sessions) => {
        if (error) {
            res.status(500).send('Error al obtener sesiones');
        } else {
            res.send(`Número de sesiones activas: ${Object.keys(sessions).length}`);
        }
    });
});
// Middleware para capturar Error 404
app.use(errorController.error404);
app.listen(PORT, () => {
    console.log("Jalando");
})