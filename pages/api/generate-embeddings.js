import { generateEmbeddings } from "../../utils/generateEmbeddings";

export default async function handler(req, res) {
  if (req.method === "POST") {
    try {
      const info = await generateEmbeddings();
      res.status(200).json(info);
    } catch (error) {
      console.error(error);
      res.status(500).send("An error occurred while generating embeddings.");
    }
  } else {
    res.status(405).end(); // Method Not Allowed
  }
}
