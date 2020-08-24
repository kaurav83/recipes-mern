const express = require('express');
const router = express.Router();
const {check, validationResult} = require('express-validator');
const auth = require('../../middleware/auth');
const Recipe = require('../../models/Recipe');
const Profile = require('../../models/Profile');
const User = require('../../models/User');

// @route  POST api/recipes
// @desc   Create a recipe
// @access Private
router.post('/', [auth, [
    check('text', 'Текст обязятелен').not().isEmpty()
]], async (req, res) => {
    const errors = validationResult(req);
    
    if (!errors.isEmpty()) {
        return res.status(400).json({errors: errors.array()});
    }

    try {
        const user = await User.findById(req.user.id).select('-password');

        const newRecipe = new Recipe({
            text: req.body.text,
            name: user.name,
            avatar: user.avatar,
            user: req.user.id
        });

        const recipe = await newRecipe.save();

        res.json(recipe);

    } catch(e) {
        console.error(e.message);
        res.status(500).send('Server error');
    }

    
});

// // @route   GET api/recipes
// // @desc    Get all recipes
// // @access  Private
// router.get('/', auth, async (req, res) => {
//     try {
//         const allRecipes = await Recipe.find().sort({date: -1});
//         res.json(allRecipes);
//     } catch(e) {
//         console.error(e.message);
//         res.status(500).send('Server error');
//     }
// });

// @route   GET api/recipes
// @desc    Get all recipes
// @access  Public
router.get('/', async (req, res) => {
    try {
        const allRecipes = await Recipe.find().sort({date: -1});
        res.json(allRecipes);
    } catch(e) {
        console.error(e.message);
        res.status(500).send('Server error');
    }
});

// // @route   GET api/recipes/:id
// // @desc    Get single recipe by id
// // @access  Private
// router.get('/:id', auth, async (req, res) => {
//     try {
//         const singularRecipe = await Recipe.findById(req.params.id);

//         if (!singularRecipe) {
//             return res.status(404).json({msg: "Нет такого рецепта"});
//         }

//         res.json(singularRecipe);

//     } catch(e) {
//         console.error(e.message);
//         if (e.kind === 'ObjectId') {
//             return res.status(404).json({msg: "Нет такого рецепта"});
//         }
//         res.status(500).send('Server error');
//     }
// });

// @route   GET api/recipes/:id
// @desc    Get single recipe by id
// @access  Public
router.get('/:id', async (req, res) => {
    try {
        const singularRecipe = await Recipe.findById(req.params.id);

        if (!singularRecipe) {
            return res.status(404).json({msg: "Нет такого рецепта"});
        }

        res.json(singularRecipe);

    } catch(e) {
        console.error(e.message);
        if (e.kind === 'ObjectId') {
            return res.status(404).json({msg: "Нет такого рецепта"});
        }
        res.status(500).send('Server error');
    }
});

// @route   DELETE api/recipe/:id
// @desc    Remove post by id
// @access  Private
router.delete('/:id', auth, async (req, res) => {
    try {
        const recipe = await Recipe.findById(req.params.id);

        if (!recipe) {
            return res.status(404).json({msg: 'Рецепт не найден'})
        }

        // Проверяем является ли пользователь создателем рецепта
        if (recipe.user.toString() !== req.user.id) {
            return res.status(401).json({msg: 'Пользователь не авторизован'});
        } 

        await recipe.remove();

        res.json({msg: 'Рецепт удалён'});

    } catch(e) {
        console.error(e.message);
        if (e.kind === 'ObjectId') {
            return res.status(404).json({msg: "Нет такого рецепта"});
        }
        res.status(500).send('Server error');
    }
});

// @route  PUT api/recipes/like/:id
// @desc   Like a post
// @access Private
router.put('/unlike/:id', auth, async (req, res) => {
    try {
        const recipe = await Recipe.findById(req.params.id);

        // Проверяем если рецепт уже был лайкнут
        const isNotLiked = recipe.likes.filter(like => like.user.toString() === req.user.id).length === 0;
        if (isNotLiked) {
            return res.status(400).json({msg: "Рецепт еще не лайкали"});
        }

        const removeIndex = recipe.likes
            .map(like => like.user.toString())
            .indexOf(req.user.id);

        recipe.likes.splice(removeIndex, 1);

        await recipe.save();

        res.json(recipe.likes);
        
    } catch(e) {
        console.error(e.message);
        res.status(500).send('Server error');
    }
});

// @route  PUT api/recipes/like/:id
// @desc   Like a post
// @access Private
router.put('/like/:id', auth, async (req, res) => {
    try {
        const recipe = await Recipe.findById(req.params.id);

        // Проверяем если рецепт уже был лайкнут
        const isLiked = recipe.likes.filter(like => like.user.toString() === req.user.id).length > 0;
        if (isLiked) {
            return res.status(400).json({msg: "Вы уже оценили этот рецепт"});
        }

        recipe.likes.unshift({user: req.user.id});

        await recipe.save();

        res.json(recipe.likes);
        
    } catch(e) {
        console.error(e.message);
        res.status(500).send('Server error');
    }
});

// @route  POST api/recipes/comment/:id
// @desc   Comment on a recipe
// @access Private
router.post('/comment/:id', [auth, [
    check('text', 'Текст обязятелен').not().isEmpty()
]], async (req, res) => {
    const errors = validationResult(req);
    
    if (!errors.isEmpty()) {
        return res.status(400).json({errors: errors.array()});
    }

    try {
        const user = await User.findById(req.user.id).select('-password');
        const recipe = await Recipe.findById(req.params.id);

        const newComment = {
            text: req.body.text,
            name: user.name,
            avatar: user.avatar,
            user: req.user.id
        };

        recipe.comments.unshift(newComment);

        await recipe.save();

        res.json(recipe.comments);

    } catch(e) {
        console.error(e.message);
        res.status(500).send('Server error');
    }    
});

// @route  DELETE api/recipes/comment/:id/:comment_id
// @desc   Delete comment a recipe
// @access Private
router.delete('/comment/:id/:comment_id', auth, async (req, res) => {
    try {
        const recipe = await Recipe.findById(req.params.id);

        const comment = recipe.comments
            .find(comment => comment.id === req.params.comment_id);
        
        if (!comment) {
            return res.status(404).json({msg: "Нет такого комментария"});
        }

        if (comment.user.toString() !== req.user.id) {
            return res.status(401).json({msg: "Пользователь не авторизован"})
        }

        const removeIndex = recipe.comments
            .map(comment => comment.user.toString())
            .indexOf(req.user.id);

        recipe.comments.splice(removeIndex, 1);

        await recipe.save();

        res.json(recipe.comments);
 
    } catch(e) {
        console.error(e.message);
        res.status(500).send('Server error');
    }
});

module.exports = router;
