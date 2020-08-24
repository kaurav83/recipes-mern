const express = require('express');
const router = express.Router();
const {check, validationResult} = require('express-validator');
const auth = require('../../middleware/auth');
const Profile = require('../../models/Profile');
const User = require('../../models/User');

// @route  GET api/profile/me
// @desc   Получить профили пользователей
// @access Public
router.get('/me', auth, async (req, res) => {
    try {
        const profile = await Profile.findOne({user: req.user.id}).populate('user', ['name', 'avatar']);
        if (!profile) {
            res.status(400).json({msg: 'Для этого пользователя не создан профиль'});
        }

        res.json(profile);

    } catch(e) {
        console.error(e.message);
        res.status(500).send('Server error')
    }
});

// @route  POST api/profile
// @desc   Создать или обновить профиль пользователя
// @access Private
router.post(
    '/', 
    [
        auth, 
        [
            check('status', 'Status is required').not().isEmpty()
        ]
    ],
    async (req, res) => {
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            return res.status(400).json({errros: errors.array()});
        }

        const { website, status } = req.body;

        const profileFields = {};
        profileFields.user = req.user.id;

        if (website) {
            profileFields.website = website;
        }
        if (status) {
            profileFields.status = status;
        }

        try {
            let profile = await Profile.findOne({user: req.user.id})

            if (profile) {
                // Update
                profile = await Profile
                    .findOneAndUpdate(
                        {user: req.user.id}, 
                        {$set: profileFields},
                        {new: true}
                    )

                return res.json(profile);
            }

            // Create
            profile = new Profile(profileFields);
            await profile.save();
            res.json(profile);
        } catch(e) {
            console.error(e.message);
            res.status(500).send('Server error')
        }
    }
)

// @route  GET api/profile
// @desc   Получить профили всех пользователей
// @access Public
router.get('/', async (req, res) => {
    try {
        const profiles = await Profile
            .find()
            .populate('user', ['name', 'avatar']);

        res.json(profiles);
    } catch (e) {
        console.error(e.message);
        res.status(500).send('Server error')
    }
});

// @route  GET api/profile/user/:user_id
// @desc   Получить профиль конкретного пользователя
// @access Public
router.get('/user/:user_id', async (req, res) => {
    try {
        const profile = await Profile
            .findOne({user: req.params.user_id})
            .populate('user', ['name', 'avatar']);

        if (!profile) {
            return res.status(400).json({msg: "Профиль не найден"});
        }
        res.json(profile);
    } catch (e) {
        console.error(e.message);
        if (err.kind == 'ObjectId') {
            return res.status(400).json({msg: "Профиль не найден"});
        }
        res.status(500).send('Server error')
    }
});

// @route  DELETE api/profile
// @desc   Удаление пользователя, профиль и его посты
// @access Private
router.delete('/', auth, async (req, res) => {
    try {
        // @todo - remove users posts

        //Remove profile
        await Profile.findOneAndRemove({user: req.user.id});
        // Remove user
        await User.findOneAndRemove({_id: req.user.id});

        res.json({msg: 'Пользователь удалён'});
    } catch (e) {
        console.error(e.message);
        res.status(500).send('Server error')
    }
});

// @route  PUT api/profile/recipes
// @desc   Добавление рецептов в профиль
// @access Private
router.put('/recipes', [
    auth,
        [
            check('title', 'Заголовок обязателен').not().isEmpty(),
            check('nameIngridient', 'Называние ингридиента обязателена').not().isEmpty(),
            check('countIngridient', 'Количество ингридиентов обязательно').not().isEmpty(),
            check('unitIngridient', 'единицы измерения ингридиентов обязательно').not().isEmpty(),
            check('instruction', 'Напишите способ приготовления').not().isEmpty(),
        ]
    ], async (req, res) => {
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            return res.status(400).json({errors: errors.array()});
        }

        const {
            title,
            portions,
            nameIngridient,
            countIngridient,
            unitIngridient,
            note,
            instruction,
            categoryDish,
            cookingHours,
            cookingMinutes,
            miniature,
            publicDate
        } = req.body;

        const newExp = {
            title,
            portions,
            nameIngridient,
            countIngridient,
            unitIngridient,
            note,
            instruction,
            categoryDish,
            cookingHours,
            cookingMinutes,
            miniature,
            publicDate
        };

        try {
            const profile = await Profile.findOne({user: req.user.id});

            profile.recipes.unshift(newExp);

            await profile.save();
            res.json(profile);
        } catch(e) {
            console.error(e.message);
            res.status(500).send('Server error')
        }
    }
);

// @route  DELETE api/profile/recipes/:rcp_id
// @desc   удаление рецептов из профиля
// @access Private
router.delete('/recipes/:rcp_id', auth, async (req, res) => {
    try {
        const profile = await Profile.findOne({user: req.user.id});

        // Get remove index
        const removeIndex = profile.recipes
            .map(item => item.id)
            .indexOf(req.params.rcp_id);

        profile.recipes.splice(removeIndex, 1);

        await profile.save();

        res.json(profile);
    } catch(e) {
        console.error(e.message);
        res.status(500).send('Server error')
    }
});

module.exports = router;