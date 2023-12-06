const User = require("../models/User");
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");

//helpers
const createUserToken = require("../helpers/create-user-token");
const getToken = require("../helpers/get-token");
const getUserByToken = require("../helpers/get-user-by-token");

module.exports = class UserController {
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

    //check if user exist
    const userExists = await User.findOne({ email: email });
    if (userExists) {
      res
        .status(422)
        .json({ message: "Email já cadastrado, informe outro email" });
      return;
    }
    //create password
    const salt = await bcrypt.genSalt(12);
    const passwordHash = await bcrypt.hash(password, salt);

    //create a user
    const user = new User({
      name,
      email,
      phone,
      password: passwordHash,
    });

    try {
      const newUser = await user.save();
      await createUserToken(newUser, req, res);
    } catch (error) {
      res.status(500).json({ message: "Error de servidor" });
    }
  }
  static async login(req, res) {
    const { email, password } = req.body;
    //validations
    if (!email) {
      res.status(422).json({ message: "Email é obrigatório" });
      return;
    }
    if (!password) {
      res.status(422).json({ message: "Senha é obrigatório" });
      return;
    }
    //check if user exist
    const user = await User.findOne({ email: email });
    if (!user) {
      res.status(422).json({ message: "Email não cadastrado" });
      return;
    }
    //check if password match with db password
    const checkPassword = await bcrypt.compare(password, user.password);
    if (!checkPassword) {
      res.status(422).json({ message: "senha Invalida! Tente Novamente" });
      return;
    }

    await createUserToken(user, req, res);
  }

  static async checkUser(req, res) {
    let currentUser;

    if (req.headers.authorization) {
      const token = getToken(req);
      const decoded = jwt.verify(token, "meuscret:qwerpoiugh");
      currentUser = await User.findById(decoded.id);
      currentUser.password = undefined;
    } else {
      currentUser = null;
    }
    res.status(200).send(currentUser);
  }

  static async getUserById(req, res) {
    const id = req.params.id;

    const user = await User.findById(id).select("-password");

    if (!user) {
      res.status(422).json({ message: "Usuário não encontrado" });
      return;
    }

    res.status(200).json({ user });
  }
  static async editUser(req, res) {
    //check if user exists
    const token = getToken(req);
    const user = await getUserByToken(token);
    if (!user) {
      res.status(422).json({ message: "Usuário não encontrado" });
      return;
    }

    const { name, email, phone, password, confirmpassword } = req.body;

    
    const fileReq = req.file
    if (fileReq) {
      user.image = fileReq.filename;
    }

    //validations
    if (!name) {
      res.status(422).json({ message: "Nome é obrigatório" });
      return;
    }
    user.name = name;

    if (!email) {
      res.status(422).json({ message: "Email é obrigatório" });
      return;
    }
    //if have email, check if email has already taker
    const userExist = await User.findOne({ email: email });
    if (user.email !== email && userExist) {
      res.status(422).json({
        message: "Email já cadastrado! Por favor utilize outro email.",
      });
      return;
    }
    user.email = email;

    if (!phone) {
      res.status(422).json({ message: "Telefone é obrigatório" });
      return;
    }
    user.phone = phone;

    if (confirmpassword !== password) {
      res
        .status(422)
        .json({ message: "Senha e confirmação de senha não confere" });
      return;
    } else if (password === confirmpassword && password != null) {
      //creating new Password
      const salt = await bcrypt.genSalt(12);
      const passwordHash = await bcrypt.hash(password, salt);
      user.password = passwordHash;
    }

    try {
      //return update data
      await User.findByIdAndUpdate(
        { _id: user._id },
        { $set: user },
        { new: true }
      );
      res.status(200).json({ message: "Usuário atualizado com sucesso" });
    } catch (err) {
      res.status(500).json({ message: `${err}` });
      return;
    }
  }
  
};