import path from 'path';
import multer from 'multer';
import sharp from 'sharp';

const __dirname = (process.platform === "win32")
        ? path.resolve()
        : path.dirname(new URL(import.meta.url).pathname);

const storage = multer.diskStorage({
    destination: function (req, file, cb) {
        cb(null, path.join(__dirname, '/private/img_profile'));
    },
    filename: function (req, file, cb) {
        const userId = req.body.credential_number;
        const fileExtension = '.jpg'; // Siempre guardar como JPEG
        cb(null, userId + fileExtension);
    }
});

const upload = multer({ storage: storage });

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

export { upload, convertToJPEG };
