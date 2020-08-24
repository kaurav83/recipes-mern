const express = require('express');
const connectDB = require('./config/db');
const app = express();

// подключение базы данных
connectDB();

// инициализация промежуточных обработчиков
app.use(express.json({extended: false}));

app.get('/', (req, res) => res.send('API runnign'));

// определение маршрутов
app.use('/api/users', require('./routes/api/users'));
app.use('/api/profile', require('./routes/api/profile'));
app.use('/api/auth', require('./routes/api/auth'));
app.use('/api/recipes', require('./routes/api/recipes'));

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`Server started on port ${PORT}`));

