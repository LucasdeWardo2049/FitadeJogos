const mongoose = require('../db/conn')
const { Schema } = mongoose


const Game = new mongoose.model (
    'Game',
    new Schema({
    // Nome do jogo
    name: {
        type: String,
        required: true
    },
    // Descricao do jogo
    description: {
        type: String,
    },
    // ano do jogo
    year: {
        type: Number,
        required: true
    },
    // preco do jogo
    price: {
        type: Number,
        required: true
    },
    // Imagem do jogo
    image: {
        type: Array,
        required: true
    },
    // disponibilidade do jogo
    available: {
        type: String,
        required: true
    },
    User: Object,
    Buyer: Object,

}, { timestamps: true }) ) // Opção para adicionar registros de data de criação e atualização


module.exports = Game // Exporta o modelo 'Game'