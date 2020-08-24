const mongoose = require('mongoose');

const ProfileSchema = new mongoose.Schema({
    user: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'user'
    },
    website: {
        type: String
    },
    status: {
        type: String,
        required: true
    },
    recipes: [
        {
            title: {
                type: String,
                required: true
            },
            portions: {
                type: Number
            },
            
            nameIngridient: {
                type: String,
                required: true
            },
            countIngridient: {
                type: Number,
                required: true
            },
            unitIngridient: {
                type: String,
                required: true
            },
            note: {
                type: String
            },
            instruction: {
                type: String,
                required: true
            },
            categoryDish: {
                type: String
            },
            cookingHours: {
                type: Number
            },
            cookingMinutes: {
                type: Number
            },                
            miniature: {
                type: String
            },
            publicDate: {
                type: Date
            }
        }
    ]
});

module.exports = Profile = mongoose.model('profile', ProfileSchema);