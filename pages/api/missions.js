import dbConnect from "../../db/dbConnect";
import mission from "../../models/missionSchema";

export default async function handler(req, res) {
  switch (req.method) {
    case "GET":
      const saved = await mission.find({});
      res.status(200).json(saved);
      break;
    default:
      res.status(404).json({ error: "Incorrect Method" });
  }
}
