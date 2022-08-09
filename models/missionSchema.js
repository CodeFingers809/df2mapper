import { Schema, model, models } from "mongoose";

const missionSchema = new Schema({"Mission Type":String,"Mission Building":String,"Mission City":String,"Details":String});

const mission = models.mission || model("mission", missionSchema);

export default mission;