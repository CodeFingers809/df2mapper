import { Schema, model, models } from "mongoose";

const missionSchema = new Schema({
  "Mission Building":String,
  "Mission City" : String,
  "Mission Type":String,
  guide:String,
  expireAt:Date
});
missionSchema.index({ "expireAt": 1 }, { expireAfterSeconds: 0 })
const mission = models.mission || model("mission", missionSchema);

export default mission;