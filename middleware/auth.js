const jwt = require('jsonwebtoken');
const config = require('config');

module.exports = function(req, res, next) {
    // Получить токен из заголовка
    const token = req.header('x-auth-token');

    // Если нет токена
    if (!token) {
        return res.status(401).json({msg: 'Нет токена, авторизация невозможна'});
    }

    // Проверка токена
    try {
        const decoded = jwt.verify(token, config.get('jwtSecret'));
        req.user = decoded.user;
        next();
    } catch(e) {
        res.status(401).json({msg: 'Не валидный токен'});
    }
}