import path from 'path';
import multer from 'multer';
const __dirname = (process.platform === "win32")
        ? path.resolve()
        : path.dirname(new URL(import.meta.url).pathname);
const storage = multer.diskStorage({
    destination: function (req, file, cb) {
        cb(null, path.join(__dirname, '/private/img_profile'));
    },
    filename: function (req, file, cb) {
        const userId = req.body.credential_number;
        const fileExtension = path.extname(file.originalname);
        cb(null, userId + fileExtension);
    }
});

const upload = multer({ storage: storage });
export default upload;