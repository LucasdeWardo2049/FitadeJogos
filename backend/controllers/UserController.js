const User = require("../models/User");
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");

//helpers
const createUserToken = require("../helpers/create-user-token");
const getToken = require("../helpers/get-token");
const getUserByToken = require("../helpers/get-user-by-token");

class UserController {
  static async register(req, res) {
    const { name, email, phone, password, confirmpassword } = req.body;
    //validations
    if (!name) {
      res.status(422).json({ message: "Nome é obrigatório" });
      return;
    }
    if (!email) {
      res.status(422).json({ message: "Email é obrigatório" });
      return;
    }
    if (!phone) {
      res.status(422).json({ message: "Telefone é obrigatório" });
      return;
    }
    if (!password) {
      res.status(422).json({ message: "Senha é obrigatório" });
      return;
    }
    if (!confirmpassword) {
      res.status(422).json({ message: "A confirmação de senha é obrigatório" });
      return;
    }
    if (confirmpassword !== password) {
      res
        .status(422)
        .json({ message: "Senha e confirmação de senha não confere" });
      return;
    }
  }
}

module.exports = UserController;