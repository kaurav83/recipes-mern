const express = require('express');
const router = express.Router();
const auth = require('../../middleware/auth');
const User = require('../../models/User');
const jwt = require('jsonwebtoken');
const bcrypt = require('bcryptjs');
const config = require('config');
const {check, validationResult} = require('express-validator');

// @route  GET api/auth
// @desc   Auth route
// @access Public
router.get('/', auth, async(req, res) => {
    try {
        const user = await User.findById(req.user.id).select('-password');
        res.json(user);
    } catch(e) {
        console.error(e.message);
        res.status(500).send('Server error')
    }
});

// @route  POST api/auth
// @desc   Auth user and get token
// @access Public
router.post(
    '/',
    [
        check('email', 'Поле email - обязательно для заполенния').isEmail(),
        check('password', 'Введите пароль').exists()
    ],
    async (req, res) => {
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            return res.status(400).json({errors: errors.array()});
        }

        const {email, password} = req.body;

        try {
            let user = await User.findOne({email});

            if (!user) {
                return res.status(400).json({errors: [{msg: 'Пользователь не найден'}]});
            }

            const isMatch = await bcrypt.compare(password, user.password);

            if (!isMatch) {
                return res.status(400).json({errors: [{msg: 'Неверный пароль'}]});
            }

            const payload = {
                user: {
                    id: user.id
                }
            };

            jwt.sign(
                payload,
                config.get('jwtSecret'),
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
    }
)

module.exports = router;