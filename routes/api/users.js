const express = require('express');
const router = express.Router();
const {check, validationResult} = require('express-validator');
const gravatar = require('gravatar');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const config = require('config');
const User = require('../../models/User');

// @route   POST api/users
// @desc    Register user
// @access  Public
router.post('/', [
    check('name', 'Напишите своё имя').not().isEmpty(),
    check('email', 'Укажите валидный email').isEmail(),
    check('password', 'Введите пароль, не менее 6 символов').isLength({min: 6})
], async(req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        return res.status(400).json({errors: errors.array()});
    }

    const {name, email, password} = req.body;

    try {
        // Если пользователь существует
        let user = await User.findOne({email});
        
        if (user) {
            return res.status(400).json({errors: [{msg: 'Пользователь уже существует'}]});
        }
        // Получить аватар пользователя
        const avatar = gravatar.url(email, {
            s: '200',
            r: 'pg',
            d: 'mm'
        });

        user = new User({
            email,
            name,
            avatar,
            password
        });
        // Шифрование пароля
        const salt = await bcrypt.genSalt(10);

        user.password = await bcrypt.hash(password, salt);

        await user.save();
        // Получить jwt
        const payload = {
            user: {
                id: user.id
            }
        };

        jwt.sign(
            payload, 
            config.get("jwtSecret"),
            {expiresIn: 400000},
            (err, token) => {
                if (err) {
                    throw err;
                } else {
                    res.json({token});
                }
            }
        );
    } catch(e) {
        console.error(e.message);
        res.status(500).send('Server error')
    }
    
});

module.exports = router;