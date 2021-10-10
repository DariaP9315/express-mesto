require('dotenv').config();
const express = require('express');
const mongoose = require('mongoose');
const bodyParser = require('body-parser');
const { celebrate, Joi, errors } = require('celebrate');
const cookieParser = require('cookie-parser');
const cors = require('cors');
const { requestLogger, errorLogger } = require('./middlewares/logger');
const usersRouter = require('./routes/users');
const cardsRouter = require('./routes/cards');
const { login, createUser, signOut } = require('./controllers/users');
const error = require('./middlewares/error');
const auth = require('./middlewares/auth');

const NotFoundError = require('./errors/not-found-error'); // 404

const { PORT = 3000 } = process.env;

const app = express();

app.use(cookieParser());
app.use(cors({
  origin: [
    'https://mesto-krasivoe.nomoredomains.club',
    'https://api.mesto-krasivoe.nomoredomains.club',
    'http://mesto-krasivoe.nomoredomains.club',
    'http://api.mesto-krasivoe.nomoredomains.club',
    'http://localhost:3000',
  ],
  methods: ['GET', 'HEAD', 'PUT', 'PATCH', 'POST', 'DELETE'],
  allowedHeaders: ['Authorization', 'Content-Type'],
  credentials: true,
  optionsSuccessStatus: 200,
}));

// Подлключение к БД mestodb
mongoose.connect('mongodb://localhost:27017/mestodb');

app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));

app.get('/crash-test', () => {
  setTimeout(() => {
    throw new Error('Сервер сейчас упадёт');
  }, 0);
});

app.post('/signin', celebrate({
  body: Joi.object().keys({
    email: Joi.string().required().email(),
    password: Joi.string().required().min(8),
  }),
}), login);

app.post('/signup', celebrate({
  body: Joi.object().keys({
    email: Joi.string().required().email(),
    password: Joi.string().required().min(8),
    name: Joi.string().min(2).max(30),
    about: Joi.string().min(2).max(30),
    avatar: Joi.string().pattern(/https?:\/\/(www\.)?[a-zA-Z0-9\-.]{1,}\.[a-z]{1,5}([/a-zA-Z0-9\-._~:/?#[\]@!$&'()*+,;=]*)/),
  }),
}), createUser);

app.delete('/signout', signOut);

// авторизация
app.use(auth);

app.use(usersRouter);
app.use(cardsRouter);

app.use('*', () => {
  throw new NotFoundError('Запрашиваемый ресурс не существует');
});

app.use(errorLogger);
app.use(errors());
app.use(error);

app.listen(PORT, () => {
  // eslint-disable-next-line no-console
  console.log(`Сервер запущен на порту ${PORT}`);
});
