const Card = require('../models/card');

const BadRequestError = require('../errors/bad-request-err'); // 400
const ForbiddenError = require('../errors/forbidden-err'); // 403
const NotFoundError = require('../errors/not-found-error'); // 404

module.exports.getCards = (req, res, next) => Card.find({})
  .then((cards) => res.send(cards))
  .catch(next);

module.exports.createCard = (req, res, next) => {
  const { name, link } = req.body;
  const owner = req.user._id;

  Card.create({ name, link, owner })
    .then((card) => res.send({ data: card }))
    .catch((err) => {
      if (err.name === 'ValidationError') {
        throw new BadRequestError('Переданы некорректные данные при создании карточки.');
      }
      next(err);
    })
    .catch(next);
};

module.exports.deleteCard = (req, res, next) => {
  Card.findById(req.params.cardId)
    .then((card) => {
      if (card === null) {
        throw new NotFoundError('Карточка с указанным _id не найдена.');
      }
      if (card.owner.toString() !== req.user._id) {
        Card.deleteOne(card)
          .then(() => res.send({ data: card }));
      } else {
        throw new ForbiddenError('Недостаточно прав для удаления карточки.');
      }
    })
    .catch((err) => {
      if (err.name === 'CastError') {
        throw new BadRequestError('Переданы некорректные данные.');
      }
      next(err);
    })
    .catch(next);
};

module.exports.likeCard = (req, res, next) => {
  Card.findByIdAndUpdate(
    req.params.cardId,
    { $addToSet: { likes: req.user._id } },
    { new: true },
  )
    .then((card) => {
      if (card === null) {
        throw new NotFoundError('Карточка с указанным _id не найдена.');
      } else {
        res.send({ data: card });
      }
    })
    .catch((err) => {
      if (err.name === 'CastError') {
        throw new BadRequestError('Переданы некорректные данные.');
      }
      next(err);
    })
    .catch(next);
};

module.exports.dislikeCard = (req, res, next) => {
  Card.findByIdAndUpdate(
    req.params.cardId,
    { $pull: { likes: req.user._id } },
    { new: true },
  )
    .then((card) => {
      if (card === null) {
        throw new NotFoundError('Карточка с указанным _id не найдена.');
      } else {
        res.send({ data: card });
      }
    })
    .catch((err) => {
      if (err.name === 'CastError') {
        throw new BadRequestError('Переданы некорректные данные.');
      }
      next(err);
    })
    .catch(next);
};
