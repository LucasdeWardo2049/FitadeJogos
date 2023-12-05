const router = require('express').Router();

const UserController = require('../controllers/UserController');

// middlewares
const verifyToken = require("../helpers/verifyToken");
const {imageUpload} = require("../helpers/imageUpload");

router.post("/register", UserController.register);
router.post("/login", UserController.login);
router.post("/checkuser", UserController.checkUser);
router.get("/:id, UserController.getUserById");
router.put(
    "/edit/:id",
    verifyToken,
    imageUpload.single("image"),
    UserController.edit.User
);


module.exports = router;