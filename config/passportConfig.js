import passport from "passport";
import bcrypt from "bcrypt";
import pool from './databaseConfig.js';
import { Strategy as LocalStrategy } from 'passport-local';
passport.use(new LocalStrategy(
    function(username, password, done) {
        pool.getConnection((err, connection) => {
            if (err) {
                return done(err);
            }
            connection.query('SELECT id, user_name, user_password FROM users WHERE user_credential_number = ?', [username], (error, results, fields) => {
                connection.release(); // Siempre liberar la conexión
                if (error) {
                    return done(error);
                }

                if (results.length === 0) {
                    return done(null, false, { message: 'Usuario o contraseña incorrectos' }); // Usuario no encontrado
                }

                const user = results[0];
                bcrypt.compare(password, user.user_password, function(err, result) {
                    if (err) {
                        return done(err);
                    }
                    if (result) {
                        return done(null, { id: user.id, name: user.user_name});
                    } else {
                        return done(null, false, { message: 'Usuario o contraseña incorrectos' });
                    }
                });
            });
        });
    }
));

// Serialización del usuario
passport.serializeUser(function(user, done) {
    done(null, user.id);
});
  
  // Deserialización del usuario
passport.deserializeUser(function(id, done) {
    pool.getConnection((err, connection) => {
        if (err) { return done(err); }
        // Seleccionar solo los campos necesarios para la sesión
        connection.query('SELECT id, user_name, user_lastname FROM users WHERE id = ?', [id], (error, results) => {
            connection.release();
            if (error) { return done(error); }
            done(null, results[0]); // Asegúrate de que esto no incluye información sensible
        });
    });
});
export default passport;