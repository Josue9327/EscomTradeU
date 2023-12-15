import bcrypt from "bcrypt";
import pool from '../config/databaseConfig.js';
import path from 'path';
const __dirname = (process.platform === "win32")
        ? path.resolve()
        : path.dirname(new URL(import.meta.url).pathname);
const saltRounds = 10;
function hashPassword(password) {
    return bcrypt.hash(password, saltRounds);
}
const signup = async (req, res) => {
    try {
        const { name, lastname, credential_number, password, date, gender } = req.body;
        const hash = await hashPassword(password);
        pool.getConnection((err, connection) => {
            if (err) {
                console.error('Error al obtener la conexión:', err);
                return; // Importante retornar para evitar ejecutar el resto del código
            }
            connection.query('INSERT INTO users (user_name, user_lastname, user_credential_number, user_password, user_date, user_gender) VALUES (?, ?, ?, ?, ?, ?)',
                [name, lastname, credential_number, hash, date, gender], (error, results) => {
                    if (error) {
                        // Manejo de error al intentar guardar en la base de datos
                        res.status(500).send(error);
                    } else {
                        // El usuario se ha registrado exitosamente, ahora crea una sesión para él
                        const insertedId = results.insertId;
                        const newUser = {
                            id: insertedId,
                            name: name,
                            lastname: lastname,
                        };
                        req.login(newUser, (err) => { // Passport expone este método en req
                            if (err) {
                                res.status(500).send('Error al iniciar sesión');
                            } else {
                                res.redirect('/ruta-privada'); // Redirigir al usuario a una parte segura del sitio
                            }
                        });
                    }
                }
            );
        });
        

    } catch (err) {
        console.error(err);
        res.status(500).send('Error al procesar la solicitud');
    }
};

export default {
    signup
};