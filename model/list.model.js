const mongoose = require("mongoose");
const Schema = mongoose.Schema;
const autoIncrement = require("mongoose-auto-increment");
autoIncrement.initialize(mongoose);
const listSchema = new Schema({
  name: { type: String, required: true, unique: true },
  list: [{ type: Schema.Types.Object, ref: "User" }],
});
listSchema.plugin(autoIncrement.plugin, {
  model: "List",
  field: "id",
});
module.exports = mongoose.model("List", listSchema, "List");
