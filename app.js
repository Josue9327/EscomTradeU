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
import { createServer } from 'http';
import { getIO, initSocket } from './config/socketioConfig.js';
import sharedsession from "express-socket.io-session";

const __dirname = (process.platform === "win32")
        ? path.resolve()
        : path.dirname(new URL(import.meta.url).pathname);
const app = express();
const PORT = process.env.PORT || 5000;

// Configuración de express-session
const expressSession = session({
    secret: 'perrita_putrefacta', // Reemplaza 'tu_secreto' con una cadena secreta real
    resave: false,
    saveUninitialized: false
});
app.use(expressSession);
// Inicializaciones
app.use(flash());
app.use(passport.initialize());
app.use(passport.session());
app.use(cors());
app.use(helmet.contentSecurityPolicy({
    directives: {
        defaultSrc: ["'self'"],
        scriptSrc: [
            "'self'",
            "https://code.jquery.com/jquery-3.3.1.slim.min.js",
            "https://cdn.jsdelivr.net/npm/@popperjs/core@2.0.7/dist/umd/popper.min.js"],  
        // otras directivas...
    }
}));
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

const server = createServer(app);
initSocket(server);
const io = getIO();
io.use(sharedsession(expressSession, {
    autoSave: true
}));
io.on('connection', (socket) => {
    console.log("Cliente conectado al socket");
    
    socket.on('disconnect', () => {
        console.log("Cliente desconectado");
    });
});
io.on('error', (error) => {
    console.error('Error en la inicialización de Socket.IO:', error);
});
server.listen(PORT, () => {
    //const algo = path.join(__dirname, '/private/img_profile');
    console.log("Jalando");
    //console.log(algo);
    
})