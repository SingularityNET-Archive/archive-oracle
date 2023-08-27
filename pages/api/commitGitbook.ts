import type { NextApiRequest, NextApiResponse } from "next";
import { commitToGithub } from "../../utils/githubUtils";

export default async (req: NextApiRequest, res: NextApiResponse) => {
  if (req.method === "POST") {
    const result = await commitToGithub(req.body, process.env.NEXT_PUBLIC_GITHUB_TOKEN!);
    res.status(200).json({ message: result });
  } else {
    res.status(405).end();
  }
};
