const router = require("express").Router();

//Controller
const GameController = require("../controllers/GameController");

//middleware
const verifyToken = require("../helpers/verify-token");
const { imageUpload } = require("../helpers/image-upload");


router.post("/create", verifyToken, imageUpload.array("images"),GameController.create);
router.get("/", GameController.getAllGames)
router.get("/mygames", verifyToken, GameController.getAllUserGames)
router.get("/mypurchased", verifyToken, GameController.getAllUserPurchasedGames)
router.get("/:id", GameController.getGameById)
router.delete("/:id", verifyToken, GameController.deleteGameById)
router.patch("/:id", verifyToken, imageUpload.array("images"), GameController.updateGame)
router.patch("/schedule/:id", verifyToken, GameController.schedule)
router.patch("/conclude/:id", verifyToken, GameController.concludeAdoption)

module.exports = router;