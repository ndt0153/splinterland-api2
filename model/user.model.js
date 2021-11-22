const mongoose = require("mongoose");
const Schema = mongoose.Schema;
const userSchema = new Schema(
  {
    username: { type: String, required: true, unique: true },
    dec: { type: Number },
    erc: { type: Number },
    rating: { type: Number },
    power: { type: Number },
    win: { type: Number },
    lose: { type: Number },
    draw: { type: Number },
    total: { type: Number },
    winrate: { type: Number },
    quest: { type: String },
    lastgame: { type: String },
    lastdec: { type: String },
    lastclaim: { type: String },
    afk: { type: Number },
    group: { type: String, unique: true },
  },
  {
    timestamps: true,
  }
);

module.exports = mongoose.model("User", userSchema, "User");
