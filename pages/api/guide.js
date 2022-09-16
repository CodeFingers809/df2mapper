import dbConnect from "../../db/dbConnect";
import mission from "../../models/missionSchema";

export default async function handler(req, res) {
  const method = req.method;

  switch (method) {
    case "GET":
      const guides = await mission.find({});
      res.status(200).json(guides);
      break;
    case "POST":
      const temp = req.body;
      let date = new Date();
      if (date.getUTCHours() <= 9)
        temp.expireAt = date.setUTCHours(9, 15, 0, 0);
      else temp.expireAt = date.setUTCHours(33, 15, 0, 0);
      if (temp.guide.length !== 0) {
        const update = await mission.findOneAndUpdate(
          {
            "Mission Building": temp["Mission Building"],
            "Mission City": temp["Mission City"],
            "Mission Type": temp["Mission Type"],
            expireAt: temp.expireAt,
          },
          { guide: temp.guide },
          { new: true, upsert: true }
        );
        res.status(200).json(update);
      }else{
        const update = await mission.findOneAndDelete(
          {
            "Mission Building": temp["Mission Building"],
            "Mission City": temp["Mission City"],
            "Mission Type": temp["Mission Type"],
            expireAt: temp.expireAt,
          }
        );
        res.status(200).json(update);
      }
      break;
    default:
      res.status(405).json({ Error: "Method not allowed" });
      break;
  }
}
