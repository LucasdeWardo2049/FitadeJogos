const mongoose = require('../db/conn')
const { Schema } = mongoose


const User = new mongoose.model (
    'User',
    new Schema({
    // Nome do usuário
    name: {
        type: String,
        required: true
    },
    // Email do usuário
    email: {
        type: String,
        required: true
    },
    // Senha do usuário
    password: {
        type: String,
        required: true
    },
    // Imagem do usuário
    image: {
        type: String
    },
    // Telefone do usuário
    phone: {
        type: String,
        required: true
    }
}, { timestamps: true }) ) // Opção para adicionar registros de data de criação e atualização


module.exports = User // Exporta o modelo 'User'