import path from 'path';
import multer from 'multer';
import sharp from 'sharp';

const __dirname = (process.platform === "win32")
        ? path.resolve()
        : path.dirname(new URL(import.meta.url).pathname);
// Middleware para convertir la imagen a JPEG antes de guardarla
function convertToJPEG(req, res, next) {
    if (req.file) {
        // Utilizar Sharp para convertir la imagen a JPEG
        sharp(req.file.path)
            .toFormat('jpeg')
            .jpeg({ quality: 90 }) // Ajustar la calidad según tus preferencias
            .toFile(req.file.path, (err, info) => {
                if (err) {
                    return next(err);
                }
                next();
            });
    } else {
        next();
    }
}
// Configuración para almacenamiento de imágenes de perfil
const profileStorage = multer.diskStorage({
    destination: function (req, file, cb) {
        cb(null, path.join(__dirname, '/private/img_profile'));
    },
    filename: function (req, file, cb) {
        const userId = req.body.credential_number;
        const fileExtension = '.jpg'; // Siempre guardar como JPEG
        cb(null, userId + fileExtension);
    }
});

const uploadProfile = multer({ storage: profileStorage });

// Configuración para almacenamiento de otro tipo de imágenes, por ejemplo, imágenes de publicaciones
const postImageStorage = multer.diskStorage({
    destination: function (req, file, cb) {
        // Guardar en otra carpeta llamada 'img_posts'
        cb(null, path.join(__dirname, '/private/img_posts'));
    },
    filename: function (req, file, cb) {
        // Podrías usar otro criterio para el nombre del archivo aquí, como una marca de tiempo
        const userId = req.user.user_credential_number;
        const timestamp = req.uniqueId;
        const filename = userId + "_" + timestamp;
        const fileExtension = '.jpg'; // Mantener la extensión original del archivo
        cb(null, filename + fileExtension);
    }
});

const uploadPostImage = multer({ storage: postImageStorage });

//Productos

// Configuración para almacenamiento de otro tipo de imágenes, por ejemplo, imágenes de publicaciones
const productImageStorage = multer.diskStorage({
    destination: function (req, file, cb) {
        // Guardar en otra carpeta llamada 'img_posts'
        cb(null, path.join(__dirname, '/private/img_products'));
    },
    filename: function (req, file, cb) {
        // Podrías usar otro criterio para el nombre del archivo aquí, como una marca de tiempo
        const userId = req.user.user_credential_number;
        const timestamp = req.uniqueId;
        const filename = userId + "_" + timestamp;
        const fileExtension = '.jpg'; // Mantener la extensión original del archivo
        cb(null, filename + fileExtension);
    }
});

const uploadProductImage = multer({ storage: productImageStorage });


// Exportar ambas configuraciones de Multer
export { uploadProfile, uploadProductImage, uploadPostImage, convertToJPEG };




