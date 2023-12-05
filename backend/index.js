const express = require('express')
const cors = require('cors')

const app = express()

// Config JSON response
app.use(express.json())

//Solve Cors
app.use(cors({credentials: true, origin: 'https://localhost:3000'}))

//Public folder for images
app.use(express.static('public/'))

//Routes 

app.listen(5000)