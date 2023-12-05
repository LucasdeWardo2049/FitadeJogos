const Game = require('../models/Game')

// helpers
const getUserByToken = require('../helpers/getUserByToken');
const getToken = require('../helpers/getToken');
const ObjectId = require('mongoose').Types.ObjectId

module.exports = class GameController {
  // cria o game
  static async create(req, res) {
    const name = req.body.name
    const platform = req.body.platform
    const genre = req.body.genre
    const description = req.body.description
    const images = req.files
    const available = true

    // console.log(req.body)
    console.log(images)
    // return

    // validations
    if (!name) {
      res.status(422).json({ message: 'O nome é obrigatório!' })
      return
    }

    if (!platform) {
      res.status(422).json({ message: 'A plataforma é obrigatória!' })
      return
    }

    if (!genre) {
      res.status(422).json({ message: 'O gênero é obrigatório!' })
      return
    }

    if (!images) {
      res.status(422).json({ message: 'A imagem é obrigatória!' })
      return
    }

    // pega o usuario
    const token = getToken(req)
    const user = await getUserByToken(token)

    // cria o jogo
    const game = new Game({
      name: name,
      platform: platform,
      genre: genre,
      description: description,
      available: available,
      images: [],
      user: {
        _id: user._id,
        name: user.name,
        image: user.image,
        phone: user.phone,
      },
    })

    images.map((image) => {
      game.images.push(image.filename)
    })

    try {
      const newGame = await game.save()

      res.status(201).json({
        message: 'Jogo cadastrado com sucesso!',
        newGame: newGame,
      })
    } catch (error) {
      res.status(500).json({ message: error })
    }
  }
  
  // pega todos os games resgistrados
  static async getAll(req, res) {
    const games = await Game.find().sort('-createdAt')

    res.status(200).json({
      games: games,
    })
  }

  // pega todos os usuarios
  static async getAllUserGames(req, res) {
    // pega o usuario
    const token = getToken(req)
    const user = await getUserByToken(token)

    const games = await Game.find({ 'user._id': user._id })

    res.status(200).json({
      games,
    })
  }

  // pega um game específico
  static async getGameById(req, res) {
    const id = req.params.id

    // checa se o id e valido
    if (!ObjectId.isValid(id)) {
      res.status(422).json({ message: 'ID inválido!' })
      return
    }

    // chega se o game existe
    const game = await Game.findOne({ _id: id })

    if (!game) {
      res.status(404).json({ message: 'Jogo não encontrado!' })
      return
    }

    res.status(200).json({
      game: game,
    })
  }

  // remove o jogo
  static async removeGameById(req, res) {
    const id = req.params.id

    // checa se o id e valido
    if (!ObjectId.isValid(id)) {
      res.status(422).json({ message: 'ID inválido!' })
      return
    }

    // Verificar se o usuário registrou este jogo.
    const game = await Game.findOne({ _id: id })

    if (!game) {
      res.status(404).json({ message: 'Jogo não encontrado!' })
      return
    }

    // check if user registered this game
    const token = getToken(req)
    const user = await getUserByToken(token)

    if (game.user._id.toString() != user._id.toString()) {
      res.status(404).json({
        message:
          'Houve um problema em processar sua solicitação, tente novamente mais tarde!',
      })
      return
    }

    await Game.findByIdAndRemove(id)

    res.status(200).json({ message: 'Jogo removido com sucesso!' })
  }

  // atualizacao do jogo
  static async updateGame(req, res) {
    const id = req.params.id

    const name = req.body.name
    const platform = req.body.platform
    const genre = req.body.genre
    const description = req.body.description
    const images = req.files
    const available = req.body.available

    const updateData = {}

    // checa se o game existe
    const game = await Game.findOne({ _id: id })

    if (!game) {
      res.status(404).json({ message: 'Jogo não encontrado!' })
      return
    }

    // checa se o usuario está resgistrado
    const token = getToken(req)
    const user = await getUserByToken(token)

    if (game.user._id.toString() != user._id.toString()) {
      res.status(404).json({
        message:
          'Houve um problema em processar sua solicitação, tente novamente mais tarde!',
      })
      return
    }

    // faz o update dos campos do jogo caso fornecidos
    if (name) {
      updateData.name = name
    }

    if (platform) {
      updateData.platform = platform
    }

    if (genre) {
      updateData.genre = genre
    }

    if (description) {
      updateData.description = description
    }

    if (images) {
      updateData.images = []

      images.map((image) => {
        updateData.images.push(image.filename)
      })
    }

    if (available !== undefined) {
      updateData.available = available
    }

    try {
      const updatedGame = await Game.findByIdAndUpdate(id, updateData, {
        new: true,
      })

      res.status(200).json({
        message: 'Jogo atualizado com sucesso!',
        updatedGame: updatedGame,
      })
    } catch (error) {
      res.status(500).json({ message: error })
    }
  }
}