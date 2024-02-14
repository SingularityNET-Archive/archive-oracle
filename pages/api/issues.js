// pages/api/issues.js

import { Octokit } from "@octokit/rest";

export default async function handler(req, res) {
    const octokit = new Octokit({ auth: process.env.GITHUB_TOKEN });

    try {
        const allIssuesAndPRs = await octokit.paginate(octokit.rest.issues.listForRepo, {
            owner: 'SingularityNET-Archive',
            repo: 'archive-oracle',
            state: 'all',
            per_page: 100, // Adjust per_page to your needs
        });

        // Filter out pull requests from the issues
        const issuesOnly = allIssuesAndPRs.filter(issue => !issue.pull_request);

        res.status(200).json(issuesOnly);
    } catch (error) {
        console.error("Failed to fetch issues:", error);
        res.status(500).json({ error: error.message });
    }
}
