const mongoose = require('../db/conn')
const { Schema } = mongoose


const Game = mongoose.model(
    "Game",
    new Schema(
      {
        name: {
          type: String,
          required: true,
        },
        year: {
          type: Number,
          required: true,
        },
        description: {
          type: String,
          required: true,
        },
        price: {
          type: Number,
          required: true,
        },
        genre: {
          type: String,
          required: true,
        },
        images: {
          type: Array,
          required: true,
        },
        available: {
          type: Boolean
        },
        user: Object,
        buyer: Object,
      },
      { timestamps: true }
    )
  );

module.exports = Game // Exporta o modelo 'Game'