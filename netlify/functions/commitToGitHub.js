// netlify/functions/commitToGitHub.js
import { Octokit } from "@octokit/rest";

export const handler = async (event, context) => {
  try {
    const { owner, repo, filePath, content, commitMessage } = JSON.parse(event.body);

    const octokit = new Octokit({
      auth: process.env.GITHUB_TOKEN,
    });

    const { data } = await octokit.repos.createOrUpdateFileContents({
      owner,
      repo,
      path: filePath,
      message: commitMessage,
      content: Buffer.from(JSON.stringify(content, null, 2)).toString('base64'),
    });

    return {
      statusCode: 200,
      body: JSON.stringify({ message: 'Data committed to GitHub successfully' }),
    };
  } catch (error) {
    console.error('Error in commitToGitHub function:', error);
    return {
      statusCode: 500,
      body: JSON.stringify({ error: 'Failed to commit data to GitHub' }),
    };
  }
};