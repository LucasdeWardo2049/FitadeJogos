const express = require('express')
const cors = require('cors')

const app = express()

//Config JSON Response
app.use(express.json())

//Solve Cors
app.use(cors({credentials: true, origin: 'http://localhost:3000'}))

//Public folder for images
app.use(express.static('public'))

//Routes
const UserRoutes = require('./routes/UserRoutes')
app.use('/users', UserRoutes)
const GameRoutes = require('./routes/GameRoutes')
app.use('/games', GameRoutes)


app.listen(5000)