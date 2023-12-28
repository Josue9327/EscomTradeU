const error404 =(req, res, next) => {
    res.status(404).send('404 No Encontrado');
};
export default {
    error404
};