const router = require('express').Router()

const GameController = require('../controllers/GameController')

// middlewares
const verifyToken = require('../helpers/verifyToken')
const { imageUpload } = require('../helpers/imageUpload')

router.post(
  '/create',
  verifyToken,
  imageUpload.array('images'),
  GameController.create,
)
router.get('/', GameController.getAll)
router.get('/myGames', GameController.getAllUserGames)
router.get('/myadoptions', verifyToken, GameController.getAllUserAdoptions)
router.get('/:id', GameController.getGameById)
router.delete('/:id', verifyToken, GameController.removeGameById)
router.put(
  '/:id',
  verifyToken,
  imageUpload.array('images'),
  GameController.updateGame,
)
router.put('/schedule/:id', verifyToken, GameController.schedule)
router.put('/conclude/:id', verifyToken, GameController.concludeAdoption)

module.exports = router