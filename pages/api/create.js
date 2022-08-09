// Next.js API route support: https://nextjs.org/docs/api-routes/introduction
import dbConnect from "../../db/dbConnect";
import mapBlock from "../../models/mapBlockSchema";

export default async function handler(req, res) {
  switch (req.method) {
    case "GET":
      const saved = await mapBlock.find({});
      res.status(200).json(saved);
      break;
    default:
      res.status(404).json({ error: "Incorrect Method" });
  }
}
