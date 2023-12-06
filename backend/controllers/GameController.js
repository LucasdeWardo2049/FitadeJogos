const game = require("../models/Game");

//helpers
const getToken = require("../helpers/get-token");
const getUserByToken = require("../helpers/get-user-by-token");
const Game = require("../models/Game");
const ObjectId = require("mongoose").Types.ObjectId;

module.exports = class GameController {
  //create a game
  static async create(req, res) {
    const { name, year, price, description, genre } = req.body;

    const images = req.files;

    const available = true;

    //images uploads

    //validations
    if (!name) {
      res.status(422).json({ message: "Nome é obrigatório" });
      return;
    }
    if (!year) {
      res.status(422).json({ message: "ano é obrigatório" });
      return;
    }
    if (!price) {
      res.status(422).json({ message: "preço é obrigatório" });
      return;
    }
    if (!description) {
      res.status(422).json({ message: "descrição é obrigatório" });
      return;
    }
    if (!genre) {
      res.status(422).json({ message: "genero é obrigatório" });
      return;
    }
    if (images.length === 0) {
      res.status(422).json({ message: "A imagem é obrigatório" });
      return;
    }

    //get game owner
    const token = getToken(req);
    const user = await getUserByToken(token);

    //create a game
    const game = new Game({
      name,
      year,
      description,
      price,
      genre,
      available,
      images: [],
      user: {
        _id: user._id,
        name: user.name,
        email: user.email,
        image: user.image,
        phone: user.phone,
      },
    });

    images.map((img) => {
      game.images.push(img.filename);
    });

    try {
      const newGame = await game.save();
      res.status(201).json({ message: "game cadastrado com sucesso", newGame });
    } catch (err) {
      res.status(500).json({ message: err });
    }
  }
  static async getAllGames(req, res) {
    const games = await Game.find().sort("-createdAt");

    res.status(200).json({ games: games });
  }
  static async getAllUserGames(req, res) {
    //get user from token
    const token = getToken(req);
    const user = await getUserByToken(token);
    const games = await Game.find({ "user._id": user._id }).sort("-createdAt");

    res.status(200).json({ games });
  }
  static async getAllUserPurchasedGames(req, res) {
    //get user from token
    const token = getToken(req);
    const user = await getUserByToken(token);
    const games = await Game.find({ "buyer._id": user._id }).sort("-createdAt");

    res.status(200).json({ games });
  }
  static async getGameById(req, res) {
    const id = req.params.id;
    if (!ObjectId.isValid(id)) {
      res.status(422).json({ message: "ID inválido" });
      return;
    }

    const game = await Game.findById(id);

    if (!game) {
      res.status(404).json({ message: "game não encontrado" });
      return;
    }
    res.status(200).json({ game });
  }
  static async deleteGameById(req, res) {
    const id = req.params.id;
    //check if id is valid
    if (!ObjectId.isValid(id)) {
      res.status(422).json({ message: "ID inválido" });
      return;
    }

    const game = await Game.findById(id);
    //check if game is exist
    if (!game) {
      res.status(404).json({ message: "game não encontrado" });
      return;
    }

    //check if logged in user registered the game
    const token = getToken(req);
    const user = await getUserByToken(token);

    if (game.user._id.toString() !== user._id.toString()) {
      res.status(422).json({ message: "O usuário não é o dono do game" });
      return;
    }

    await Game.findByIdAndRemove(id);

    res.status(200).json({ message: "game removido com sucesso!" });
  }
  static async updateGame(req, res) {
    const id = req.params.id;
    //check if id is valid
    if (!ObjectId.isValid(id)) {
      res.status(422).json({ message: "ID inválido" });
      return;
    }

    const game = await Game.findById(id);
    //check if game is exist
    if (!game) {
      res.status(404).json({ message: "game não encontrado" });
      return;
    }

    const { name, year, price, description, genre, available } = req.body;
    const images = req.files;

    const updateData = {};

    //check if logged in user registered the game
    const token = getToken(req);
    const user = await getUserByToken(token);

    if (game.user._id.toString() !== user._id.toString()) {
      res.status(422).json({ message: "O usuário não é o dono do game" });
      return;
    }

    //validation
    if (!name) {
      res.status(422).json({ message: "Nome é obrigatório" });
      return;
    }
    updateData.name = name;
    if (!year) {
      res.status(422).json({ message: "ano é obrigatório" });
      return;
    }
    updateData.year = year;
    if (!weight) {
      res.status(422).json({ message: "preco é obrigatório" });
      return;
    }
    updateData.price = price;
    if (!description) {
      res.status(422).json({ message: "descricao é obrigatório" });
      return;
    }
    updateData.description = description;
    if (!genre) {
      res.status(422).json({ message: "genero é obrigatório" });
      return;
    }
    updateData.genre = genre;
    if (images.length > 0) {
      updateData.images = [];
      images.map((image) => {
        updateData.images.push(image.filename);
      });
    } 

    await Game.findByIdAndUpdate(id, updateData);

    res.status(200).json({ message: "game atualizado com sucesso!" });
  }
  static async schedule(req, res) {
    const id = req.params.id;
    //check if id is valid
    if (!ObjectId.isValid(id)) {
      res.status(422).json({ message: "ID inválido" });
      return;
    }
    const game = await game.findById(id);
    //check if game is exist
    if (!game) {
      res.status(404).json({ message: "game não encontrado" });
      return;
    }
    //check if logged in user registered the game
    const token = getToken(req);
    const user = await getUserByToken(token);

    if (game.user._id.equals(user._id)) {
      res.status(422).json({ message: "O usuário já é o dono do game" });
      return;
    }

    //check if user has already schedule a visit with this game
    if (game.buyer) {
      if (game.buyer._id.equals(user._id)) {
        res
          .status(422)
          .json({ message: "Você já comprou este game" });
        return;
      }
    }

    //add user to game
    game.buyer = {
      _id: user._id,
      name: user.name,
      image: user.image,
    };

    await Game.findByIdAndUpdate(id, game);

    res
      .status(200)
      .json({
        message: `compra feita com sucesso pelo usuario ${game.user.name}, com o telefone ${game.user.phone}`,
      });
  }
  static async concludeAdoption(req, res){
    const id = req.params.id;
    //check if id is valid
    if (!ObjectId.isValid(id)) {
      res.status(422).json({ message: "ID inválido" });
      return;
    }
    const game = await Game.findById(id);
    //check if game is exist
    if (!game) {
      res.status(404).json({ message: "game não encontrado" });
      return;
    }
    //check if logged in user registered the game
    const token = getToken(req);
    const user = await getUserByToken(token);

    if (game.user._id.toString() !== user._id.toString()) {
      res.status(422).json({ message: "O usuário não é o dono do game" });
      return;
    }

    game.available = false

    await game.findByIdAndUpdate(id, game)

    res.status(200).json({ message: "Parabéns! O ciclo de compra foi finalizado com sucesso!"})
  }
};