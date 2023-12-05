const Game = require("../models/Game");

// helpers
const getUserByToken = require("../helpers/getUserByToken");
const getToken = require("../helpers/getToken");
const ObjectId = require("mongoose").Types.ObjectId;

module.exports = class GameController {
  // cria um game
  static async create(req, res) {
    const name = req.body.name;
    const year = req.body.year;
    const description = req.body.description;
    const price = req.body.price;
    const images = req.files;
    const available = true;

    // console.log(req.body)
    console.log(images);
    // return

    // validations
    if (!name) {
      res.status(422).json({ message: "O nome é obrigatório!" });
      return;
    }

    if (!year) {
      res.status(422).json({ message: "O ano é obrigatório!" });
      return;
    }

    if (!price) {
      res.status(422).json({ message: "O preço é obrigatório!" });
      return;
    }

    if (!images) {
      res.status(422).json({ message: "A imagem é obrigatória!" });
      return;
    }

    if (!available) {
      res.status(422).json({ message: "O status é obrigatório!" });
      return;
    }

    // pega um usuario
    const token = getToken(req);
    const user = await getUserByToken(token);

    // criar jogo
    const game = new Game({
      name: name,
      year: year,
      description: description,
      price: price,
      images: [],
      available: available,
      user: {
        _id: user._id,
        name: user.name,
        image: user.image,
        phone: user.phone,
      },
    });

    images.map((image) => {
      Game.images.push(image.filename);
    });

    try {
      const newGame = await Game.save();

      res.status(201).json({
        message: "Game cadastrado com sucesso!",
        newGame: newGame,
      });
    } catch (error) {
      res.status(500).json({ message: error });
    }
  }

  // pega todos os games resgistrados
  static async getAll(req, res) {
    const Games = await Game.find().sort("-createdAt");

    res.status(200).json({
      Games: Games,
    });
  }

  // todos os games do usuario
  static async getAllUserGames(req, res) {
    // pega um usuario
    const token = getToken(req);
    const user = await getUserByToken(token);

    const Games = await Game.find({ "user._id": user._id });

    res.status(200).json({
      Games,
    });
  }

  // pega todos os alugueis do usuario
  static async getAllUserrents(req, res) {
    // pega o usuario
    const token = getToken(req);
    const user = await getUserByToken(token);

    const Games = await Game.find({ "Buyer._id": user._id });

    res.status(200).json({
      Games,
    });
  }

  // pega um game especifico
  static async getGameById(req, res) {
    const id = req.params.id;

    // checa se e valido
    if (!ObjectId.isValid(id)) {
      res.status(422).json({ message: "ID inválido!" });
      return;
    }

    // checa se o game existe
    const Game = await Game.findOne({ _id: id });

    if (!Game) {
      res.status(404).json({ message: "Game não encontrado!" });
      return;
    }

    res.status(200).json({
      Game: Game,
    });
  }

  // remove o game
  static async removeGameById(req, res) {
    const id = req.params.id;

    // checa se o id e valido
    if (!ObjectId.isValid(id)) {
      res.status(422).json({ message: "ID inválido!" });
      return;
    }

    // checa se o game exitse
    const Game = await Game.findOne({ _id: id });

    if (!Game) {
      res.status(404).json({ message: "Game não encontrado!" });
      return;
    }

    // checa se o usuario ja registrou o game
    const token = getToken(req);
    const user = await getUserByToken(token);

    if (Game.user._id.toString() != user._id.toString()) {
      res.status(404).json({
        message:
          "Houve um problema em processar sua solicitação, tente novamente mais tarde!",
      });
      return;
    }

    await Game.findByIdAndRemove(id);

    res.status(200).json({ message: "Game removido com sucesso!" });
  }

  // atualiza o game
  static async updateGame(req, res) {
    const id = req.params.id;

    const name = req.body.name;
    const year = req.body.year;
    const description = req.body.description;
    const price = req.body.price;
    const images = req.files;
    const available = req.body.available;

    const updateData = {};

    // checa se o game existe
    const Game = await Game.findOne({ _id: id });

    if (!Game) {
      res.status(404).json({ message: "Game não encontrado!" });
      return;
    }

    // checa se o usuario já registrou o game
    const token = getToken(req);
    const user = await getUserByToken(token);

    if (Game.user._id.toString() != user._id.toString()) {
      res.status(404).json({
        message:
          "Houve um problema em processar sua solicitação, tente novamente mais tarde!",
      });
      return;
    }

    // validations
    if (!name) {
      res.status(422).json({ message: "O nome é obrigatório!" });
      return;
    } else {
      updateData.name = name;
    }

    if (!year) {
      res.status(422).json({ message: "O ano é obrigatória!" });
      return;
    } else {
      updateData.age = age;
    }

    if (!price) {
      res.status(422).json({ message: "O peso é obrigatório!" });
      return;
    } else {
      updateData.price = price;
    }

    if (images.length > 0) {
      updateData.images = [];
      images.map((image) => {
        updateData.images.push(image.filename);
      });
    }

    if (!available) {
      res.status(422).json({ message: "O status é obrigatório!" });
      return;
    } else {
      updateData.available = available;
    }

    updateData.description = description;

    await Game.findByIdAndUpdate(id, updateData);

    res
      .status(200)
      .json({ Game: Game, message: "Game atualizado com sucesso!" });
  }

  // agenda um aluguel
  static async schedule(req, res) {
    const id = req.params.id;

    // checa se o game existe
    const Game = await Game.findOne({ _id: id });

    // checa se possui
    const token = getToken(req);
    const user = await getUserByToken(token);

    console.log(Game);

    if (Game.user._id.equals(user._id)) {
      res.status(422).json({
        message: "Você não pode rentr o seu próprio Game!",
      });
      return;
    }

    // checa se já alugou
    if (Game.Buyer) {
      if (Game.Buyer._id.equals(user._id)) {
        res.status(422).json({
          message: "Você já alugou esse Game!",
        });
        return;
      }
    }

    // adiciona usuario ao game
    Game.Buyer = {
      _id: user._id,
      name: user.name,
      image: user.image,
    };

    console.log(Game);

    await Game.findByIdAndUpdate(Game._id, Game);

    res.status(200).json({
      message: `O aluguel foi agendada com sucesso, entre em contato com ${Game.user.name} no telefone: ${Game.user.phone}`,
    });
  }

  // conclui o aluguel de um jogo
  static async concluderent(req, res) {
    const id = req.params.id;

    // checa se existe
    const Game = await Game.findOne({ _id: id });

    Game.available = false;

    await Game.findByIdAndUpdate(Game._id, Game);

    res.status(200).json({
      Game: Game,
      message: `Parabéns! O ciclo de aluguel foi finalizado com sucesso!`,
    });
  }
};
