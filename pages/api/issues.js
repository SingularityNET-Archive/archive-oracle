// pages/api/issues.js

import { Octokit } from "@octokit/rest";

export default async function handler(req, res) {
    const octokit = new Octokit({ auth: process.env.GITHUB_TOKEN });

    try {
        const response = await octokit.rest.issues.listForRepo({
            owner: 'SingularityNET-Archive',
            repo: 'archive-oracle',
            state: 'all',
        });

        res.status(200).json(response.data);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
}
