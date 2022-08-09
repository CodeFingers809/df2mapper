import { Schema, model, models } from "mongoose";

const mapBlockSchema = new Schema({
  x: Number,
  y: Number,
  bldgs: [String],
  city: String,
  level: Number,
});

const mapBlock = models.mapBlock || model("mapBlock", mapBlockSchema);

export default mapBlock;
