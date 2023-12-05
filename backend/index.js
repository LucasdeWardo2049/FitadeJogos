const express = require('express')
const cors = require('cors')

const app = express()

// Configuração para resposta em JSON
app.use(express.json())

// Solucionar o problema de CORS
app.use(cors({ credentials: true, origin: 'https://localhost:3000' }))

// Pasta pública para imagens
app.use(express.static('public'))

const UserRoutes = require('Routes/UserRoutes')

app.use('/users', UserRoutes)

app.listen(5000) // Inicia o servidor na porta 5000