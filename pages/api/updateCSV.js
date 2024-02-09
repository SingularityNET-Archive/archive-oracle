// File: pages/api/updateCSV.js
import { fetchAndUpdateCSV } from '../../utils/updateCSVInGitHub';

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).send({ message: 'Only POST requests allowed' });
  }

  const { owner, repo, path, branch, summariesToUpdate } = req.body;

  try {
    const updateResponse = await fetchAndUpdateCSV({
      owner,
      repo,
      path,
      branch,
      summariesToUpdate
    });
    res.status(200).json(updateResponse);
  } catch (error) {
    console.error('Error updating CSV in GitHub:', error);
    res.status(500).json({ message: 'Failed to update CSV', error: error.message });
  }
}
